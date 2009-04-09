

/***************************************
   =Simple jQuery Validation Plugin
************************************** */

;(function($) { 

$.tinyvalidate = {
  version: '1.1'
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
    
    var errCount = 0, 
      errMsg = '',
      $form = $(this);
    
    
    var opts = $.extend(true, {}, $.fn.tinyvalidate.defaults, options || {}, $.metadata ? $form.metadata() : $.meta ? $form.data() : {});
    
    function validate(evt) {
      errMsg = '';
      errCount = 0;
      $.each(rules, function(rulename, val) {

        $('.' + val.ruleClass, $form)[evt != 'submit' ? evt : 'each'](function() {
          var $field = $(this);
          
          var $errElement = (/(radio|checkbox)/).test(rulename) ? $field : $field.parents('div:first');
          
          // if a field is both required and validated against another rule, 
          // ...don't process other rule if empty 
          if (rulename !== 'required' && $field.hasClass('required') && $field.val() == '') {
            return;
          }
         
          $errElement.removeClass(opts.errorClass).find(opts.noticeElement + '.' + opts.noticeClass).remove();
          var arg = val.check == 'element' ? $field : $field.val();
          if (!val.rule(arg) && !$field.is(':hidden')) {
            errCount++;
            var postype = opts.positionType;
            if (opts.positionElement.join().match('inline')) {

              if ( (/(input|select|textarea)/i).test(this.nodeName) ) {
                if (postype == 'append') {
                  postype = 'after';
                } else if (postype == 'prepend') {
                  postype = 'before';
                }
              } else if (this.nodeName.toLowerCase() === 'fieldset' ) {
                if (postype == 'after') {
                  postype = 'append';
                } else if (postype == 'before') {
                  postype = 'prepend';
                }                
              }
              $(this)[postype]('<' + opts.noticeElement + ' class="' + opts.noticeClass + '">' + val.text + '</' + opts.noticeElement + '>');
              $errElement.addClass(opts.errorClass);                
            } 
            if (opts.submitDetails === true) {
              var detailText = $field.is('fieldset') ? $field.children(':first').text() : $field.prev().text().replace(/\*$/,'');
              errMsg += '<' + opts.noticeElement + ' class="' + opts.noticeClass + '">' + detailText + ' ' + val.text + '</' + opts.noticeElement + '>';            
            }
          }       
        });
      });
    }
    var bindSubmit = function(evt) {
      $form.bind('submit.tv', function() {
        validate(evt);
        if (opts.noticeAnimate.effect) {
          $(opts.noticeElement + '.' + opts.noticeClass).hide()[opts.noticeAnimate.effect](opts.noticeAnimate.speed);
        }
        insertMessage();
        if (errCount) {
          return false;
        } else if (opts.submitOverride) {
          opts.submitOverride();
          return false;
        }
      });      
    };
    
    if (opts.primaryEvent == 'submit') {
      bindSubmit(opts.primaryEvent);
    } else {
      validate(opts.primaryEvent);
    }
    if (opts.secondaryEvent && opts.secondaryEvent == 'submit') {
      bindSubmit(opts.secondaryEvent);
    } else if (opts.secondaryEvent) {
      validate(opts.secondaryEvent);
    }
     
    function insertMessage() {
      $('#submiterror').remove();
      if (errCount) {
        var $errorElement = $(opts.wrapper), 
          pel = opts.positionElement;  
        if (pel[0] == 'inline') {pel = pel.slice(1).join();}
        if (pel == 'form') pel = $form[0];
        $errorElement.html(opts.preNotice + errMsg + opts.postNotice);
        $(pel)[opts.positionType]($errorElement);
        $errorElement.addClass(opts.errorClass);
      }
    }
    
  }); //end return this.each
}; // end $.fn.tinyvalidate


// validation defaults

$.fn.tinyvalidate.defaults = {
  primaryEvent: 'blur',
  secondaryEvent: 'submit',
  submitOverride: null
};


$.fn.tinyvalidate.defaults.inline = {
  insertType: 'after',
  inlineElement: '<span></span>',
  inlineClass: 'notice',
  container: function() {
    return $(this).parent();
  },
  containerClass: 'error',
  noticeAnimate: {
    effect: 'fadeIn',
    speed: 400
  }
};

$.fn.tinyvalidate.defaults.summary = {
  insertTo: 'form',
  insertType: 'append',
  wrapper: '<div></div>',
  summaryClass: 'error',
  preNotice: 'There was an error processing your request. <br>Please correct the above highlighted fields and try again.',
  postNotice: '',
  includeDetails: true
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
