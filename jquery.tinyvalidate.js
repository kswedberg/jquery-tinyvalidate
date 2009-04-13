
/***************************************
   =TinyValidate: A (Relatively) Tiny jQuery Validation Plugin
************************************** */
// TODO: if a field is validating on more than one class, and it's a required field with no value, ignore the other one(s).

;(function($) { 

$.tinyvalidate = {
  version: '1.2',
  
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
  },
  summaries: [],
  callCounter: -1
};

$.fn.tinyvalidate = function(options) {
  var errorCount = 0;
  $.tinyvalidate.callCounter++;
  var idSuffix = $.tinyvalidate.callCounter ? '_' + $.tinyvalidate.callCounter : '';

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

  return this.each(function(index) {
    var $form = $(this),
        $allFields = $([]);
    idSuffix += (index ? '-' + index : '');
    
    // merge defaults, per-call options, and per-selector options
    var opts = $.extend(true, {}, $.fn.tinyvalidate.defaults, options || {}, $.metadata ? $form.metadata() : $.meta ? $form.data() : {});
    var lineItems = [],
        errorCount = 0,
        inline = opts.inline;

    // special case: $('someform').tinyvalidate('removeErrors')
    // immediately removes all error class and notices from the form
    if (options == 'removeErrors') {
      $.each(rules, function(ruleName, ruleInfo) {
        $('.' + ruleInfo.ruleClass, $form).each(function() {
          $allFields = $allFields.add($(this));
        });
      });
      $allFields
      .removeData('error')
      .trigger('removeNotice')
      .trigger('toggleErrorClass');
      $form.trigger('hideSummary');
      return this;      
    }

    // set up inline options
    if (inline) {
      inline.noticeTag = inline.noticeElement.match(/\w+\b/).join('');
      inline.noticeSelector = inline.noticeTag + '.' + inline.noticeClass;      
    }
    
    //set up summary options
    if (opts.summary) {
      var summary = opts.summary,
          $errorSummary = $(summary.wrapper).addClass(summary.wrapperClass).hide(),
          detailArray = summary.detailElement.match(/[^>]+>/g),
          lineItemDivider = detailArray[1] + detailArray[0];
      $(summary.insertTo == 'form' ? $form[0] : summary.inserTo)[summary.insertType]($errorSummary);
      $errorSummary.attr('id', function() {
        return this.id + idSuffix;
      });

    }

    
    // initialize: loop through elements with class that matches each rule's class
    $.each(rules, function(ruleName, ruleInfo) {
      $('.' + ruleInfo.ruleClass, $form).each(function() {
        var $field = $(this);
        var thisRule = $field.data('rule') || [];
        thisRule.push(rules[ruleName]);
        var elType = $.tinyvalidate.elementType(this.nodeName) || 'inputs';
        $field
        .data('rule', thisRule)
        .data('ruleName', ruleName)
        .data('elementType', elType);
        $allFields = $allFields.add($field);
        if (inline) {
          $field.data('insertion', $.tinyvalidate[elType][inline.insertType]);
        }
      });
    });

    if (inline) {
      $allFields
      .bind('addNotice', function(event, num) {
          var $thisField = $(this),
              ruleText = $thisField.data('rule')[num].text;
          var $thisNotice = $(inline.noticeElement);
          $thisNotice.html(ruleText);
          $thisNotice.addClass(inline.noticeClass)
          [$(this).data('insertion')](this).hide()
          [inline.noticeAnimate.effect](inline.noticeAnimate.speed);
          
          $thisField.bind('removeNotice', function() {
            $thisNotice.remove();          
          });
      });

      $allFields
      .bind('toggleErrorClass', function(event) {
        var $thisField = $(this);

        var $thisContainer = (/(radio|checkbox)/).test($thisField.data('ruleName')) ? $thisField : $thisField.parents(inline.containerTag + ':first');
        if (!!$thisField.data('error')) {
          $thisContainer.addClass(inline.containerErrorClass);
        } else {
          $thisContainer.removeClass(inline.containerErrorClass);
        }
      });
    }
    if (summary) {
      $form.bind('displaySummary', function(event, errors) {
        $errorSummary.hide();
        if (errors) {
          var preNotice = summary.preNotice.replace(/\{num\}/g, errors).replace(/\{([^\|]+)\|([^}]+)\}/, function(str, singular, plural) {
            return (errors*1 == 1) ? singular : plural;
          });
          var fullSummary = summary.detailElement
              ? preNotice +  detailArray[0] + lineItems.join(lineItemDivider) + detailArray[1] + summary.postNotice
              : preNotice + summary.postNotice;
          $errorSummary.html(fullSummary)
          [summary.noticeAnimate.effect](summary.noticeAnimate.speed);
        }
      });
      $form.bind('hideSummary', function() {
        $errorSummary.hide();
      });
    }
    $allFields.bind('validate', function(event) {
      var thisField = this,
          $thisField = $(this).trigger('removeNotice');
      var thisRule = $thisField.data('rule'), trl = thisRule.length;
      for (var i=0; i < trl; i++) {
        var arg = thisRule[i].check == 'element' ? $thisField : $thisField.val();
        if (!thisRule[i].rule(arg) && !$thisField.is(':hidden')) {
          $thisField
          .data('error', 'true')
          .trigger('addNotice', [i]);
          if (summary && summary.detailElement) {
            var detailText = $thisField.data('elementType') == 'containers'
                ? $thisField.children(':first').text()
                : $thisField.prev().text().replace(/(\*|:)$/,'');
            if (summary.linkify) {
              detailText = '<a href="#' + ($thisField.data('elementType') == 'containers' ? $thisField.find('input')[0].id : thisField.id) + '">' + detailText + '</a>';
            }
            lineItems.push(detailText + ' ' + thisRule[i].text);
          }
          errorCount++;
        } else {
          $thisField
          .removeData('error');
        }
      }
      $thisField.trigger('toggleErrorClass');
    });

    // bind to user interactions
    
    $form.submit(function() {
      errorCount = 0;
      lineItems = [];
      $allFields.trigger('validate');
      $form.trigger('displaySummary', [errorCount]);
      if (errorCount) {
        return false;        
      } else if (opts.submitOverride) {
        $form.tinyvalidate('removeErrors');
        opts.submitOverride();
        return false;
      }

    });
    
    if (typeof opts.otherEvents == 'string') {
      var evts = opts.otherEvents.replace(/,\s+/g,',').split(',');
    }
    for (var i = evts.length - 1; i >= 0; i--){
      $allFields.bind(evts[i], function() {
        $(this).trigger('validate');
      });
    }
    
  }); //end return this.each
}; // end $.fn.tinyvalidate


// plugin defaults

$.fn.tinyvalidate.defaults = {
  otherEvents: 'blur',
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
  preNotice: 'There was a problem processing your request. <br>Please correct the {num} highlighted {field|fields} and try again.<ul>',
  postNotice: '</ul>',
  noticeAnimate: {
    effect: 'fadeIn',
    speed: 400
  },
  detailElement: '<li></li>',
  linkify: true // set to null if you don't want to include details in the summary message
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
