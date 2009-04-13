

/***************************************
   =TinyValidate: A (Relatively) Tiny jQuery Validation Plugin
************************************** */

;(function($) { 

$.tinyvalidate = {
  version: '1.1',
  
  // safeguards for inline insertion in case plugin user chooses wrong insertion type
  elementType: function(tag) {
    if (/(input|textarea|select)/i.test(tag)) {
      return 'inputs';
    } else if (/(div|fieldset|p)/i.test(tag)) {
      return 'containers';
    }
  },
  inputs: {
    append: 'insertAfter',
    appendTo: 'insertAfterafter',
    prepend: 'insertBefore',
    prependTo: 'insertBefore',
    after: 'insertAfter',
    insertAfter: 'insertAfter',
    before: 'insertBefore',
    insertBefore: 'insertBefore'
  },
  containers: {
    append: 'appendTo',
    appendTo: 'appendTo',
    prepend: 'prependTo',
    prependTo: 'prependTo',
    after: 'appendTo',
    insertAfter: 'appendTo',
    before: 'insertBefore',
    insertBefore: 'insertBefore'
  }

};

$.fn.tinyvalidate = function(options) {
  var errCount = 0, timer, currentFieldset = null; 

  var corerules = {
    required:     {
                    ruleClass: 'required',
                    rule: function(r) {
                      return (/\S+/).test(r);
                    },
                    text: '&laquo; required field has no value'
                  },
    email:        {
                    ruleClass: 'email',
                    rule: function(r) {
                      return (/^\S+[@]\w+(\.[a-zA-Z0-9]{2,4}){1,4}/).test(r) || r == '';
                    },
                    text: '&laquo; incorrect E-mail format',
                    check: 'value'
                  },
    requiredzip:  {
                    ruleClass: 'zip',
                    rule: function(r) {
                     return (/^\d{5}(-\d{4})?$/).test(r);
                    },
                    text: '&laquo; incorrect ZIP code',
                    check: 'value'
                  }
  };
  var rules = $.extend(true, {},corerules, $.tinyvalidate.morerules || {});

  return this.each(function() {
    
    var $form = $(this);
    var opts = $.extend(true, {}, $.fn.tinyvalidate.defaults, options || {}, $.metadata ? $form.metadata() : $.meta ? $form.data() : {});
    var lineItems = [],
      errCount = 0;  

    // set up inline options
    var inline = opts.inline;
    if (inline) {
      inline.noticeTag = inline.noticeElement.match(/\w+\b/).join('');
      inline.noticeSelector = inline.noticeTag + '.' + inline.noticeClass;
    }
    //set up summary options
    var summary = opts.summary,
        $errorSummary = $(summary.wrapper).addClass(summary.wrapperClass),
        detailArray = summary.detailElement.match(/[^>]+>/g),
        lineItemDivider = detailArray[1] + detailArray[0];
    $(summary.insertTo == 'form' ? $form[0] : summary.inserTo)[summary.insertType]($errorSummary);

    function validate(evt) {
      lineItems = [];
      errCount = 0;
      // loop through each rule
      $.each(rules, function(rulename, val) {

        // bind/loop elements with class that matches rule's class
        $('.' + val.ruleClass, $form)[evt != 'submit' ? evt : 'each'](function() {
          var $field = $(this);
          
          // if a field is both required and validated against another rule, 
          // ...don't process other rule if empty 
          if (rulename !== 'required' && $field.hasClass('required') && $field.val() == '') {
            return;
          }

          if (inline) {
            var $inlineContainer = (/(radio|checkbox)/).test(rulename) ? $field : $field.parents(inline.containerTag + ':first');
            // start with clean slate
            $inlineContainer.removeClass(inline.containerErrorClass).find(inline.noticeSelector).remove();
          }
          
          // validation test
          var arg = val.check == 'element' ? $field : $field.val();
          if (!val.rule(arg) && !$field.is(':hidden')) {
            errCount++;

            if (inline) {
              var elType = $.tinyvalidate.elementType(this.nodeName);
              var postype = $.tinyvalidate[elType][inline.insertType];

              $(inline.noticeElement).html(val.text).addClass(inline.noticeClass)[postype]($field);
              $inlineContainer.addClass(inline.containerErrorClass);                
            } 


            if (summary.detailElement) {
              var detailText = $field.is('fieldset') ? $field.children(':first').text() : $field.prev().text().replace(/(\*|:)$/,'');
              lineItems.push(detailText + ' ' + val.text);
              // '<' + opts.noticeElement + ' class="' + opts.noticeClass + '">' + detailText + ' ' + val.text + '</' + opts.noticeElement + '>';            
            }
          }       
        });
      });
    }
    var bindSubmit = function(evt) {
      $form.bind('submit.tv', function() {
        validate('submit');
        if (inline && inline.noticeAnimate.effect) {
          $(inline.noticeSelector).hide()[inline.noticeAnimate.effect](inline.noticeAnimate.speed);
        }
        displayMessage();
        if (errCount) {
          return false;
        } else if (opts.submitOverride) {
          opts.submitOverride();
          return false;
        }
      });
      
    };
    
    if (opts.primaryEvent == 'submit') {
      bindSubmit();
    } else {
      validate(opts.primaryEvent);
    }
    if (opts.secondaryEvent && opts.secondaryEvent == 'submit') {
      bindSubmit(opts.secondaryEvent);
    } else if (opts.secondaryEvent) {
      validate(opts.secondaryEvent);
    }
     
    function displayMessage() {
      $errorSummary.hide();
      if (errCount) {
        $errorSummary.html(summary.preNotice +  detailArray[0] + lineItems.join(lineItemDivider) + detailArray[1] + summary.postNotice).show();
      }
    }
    
  }); //end return this.each
}; // end $.fn.tinyvalidate


// plugin defaults

$.fn.tinyvalidate.defaults = {
  primaryEvent: 'blur',
  secondaryEvent: 'submit',
  submitOverride: null  // if you want to override submit handling when no validation errors, use an anonymous function:
                        // function() { /* do something */ }
};


$.fn.tinyvalidate.defaults.inline = {
  insertType: 'after',
  noticeElement: '<span></span>',
  noticeClass: 'notice',
  noticeAnimate: {
    effect: 'fadeIn',
    speed: 400
  },
  containerTag: 'div',
  containerErrorClass: 'error'
};

$.fn.tinyvalidate.defaults.summary = {
  insertTo: 'form',
  insertType: 'append',
  wrapper: '<div id="submiterror"></div>',
  wrapperClass: 'error',
  preNotice: 'There was an error processing your request. <br>Please correct the above highlighted fields and try again.<ul>',
  postNotice: '</ul>',
  detailElement: '<li></li>'
};


/***************************************
   =optional rules to add to the plugin
************************************** */
$.tinyvalidate.maxnum = 0;
$.tinyvalidate.morerules = {
    date:          {
                    ruleClass: 'date',
                    rule: function(r) {
                      // var thisYear = new Date().getFullYear();
                      return (/(0\d|1[0-2])\/([0-2]\d|3[0-1])\/[1-2]\d{3}/).test(r);
                      // && (+r.slice(-4) < +thisYear-10);
                    },
                    text: '&laquo; incorrect date',
                    check: 'value'
                  },
    ssn:          {
                    ruleClass: 'ssn',
                    rule: function(r) {
                      var thisYear = new Date().getFullYear();
                      return (/\d{3}-\d{2}-\d{4}/).test(r);
                    },
                    text: '&laquo; incorrect ssn format (must be xxx-xx-xxxx)',
                    check: 'value'
                  },

    currency:     {
                    ruleClass: 'currency',
                    rule: function(r) {
                      var thisYear = new Date().getFullYear();
                      return (/^\d+(\.\d\d)?$/).test(r) || r == ''; 
                    },
                    text: '&laquo; incorrect currency format',
                    check: 'value'
                  },

  requiredradio:{
                  ruleClass: 'choose-one',
                  rule: function(el) {
                    if (el.constructor == Object) {
                      return el.find(':checked').length;
                    }
                  },
                  text: '&laquo; at least one option must be selected',
                  check: 'element'
                },
  maxradio:     {
                    ruleClass: 'max',
                    rule: function(el) {
                      // this rule requires 2 classes, "max" and "max-n", where n represents the max number
                      $.tinyvalidate.maxnum = el[0].className.replace(/.*max-(\d+).*/,'$1');
                      return (el.find('input:checked').length <= +$.tinyvalidate.maxnum);
                    },
                    text: '&laquo; exceeded the maximum number of items that may be checked',
                    check: 'element'
                },
  phone:        {
                  ruleClass: 'phone',
                  rule: function(r) {
                    return (/\(?\d{3}\)?[\. -]?\d{3}[\. -]?\d{4}/).test(r) || r == '';
                  },
                  text: '&laquo; phone number is incorrectly formatted ',
                  check: 'value'
                }
  
};
 

})(jQuery);
