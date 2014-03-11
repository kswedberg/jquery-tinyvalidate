/*!
 * jQuery TinyValidate plugin v1.6.3
 *
 * Date: Tue Mar 11 16:13:58 2014 EDT
 * Requires: jQuery v1.4+
 *
 * Copyright 2011, Karl Swedberg
 * Dual licensed under the MIT and GPL licenses (just like jQuery):
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * A (relatively) tiny validation plugin
 *
 *
*/

(function($) {
'use strict';
var inp = document.createElement('input');
$.each(['required', 'pattern'], function(index, attr) {
  $.support[attr] = (attr in inp);
});

$.tinyvalidate = {
  version: '1.6.3',
  callCounter: -1,
  maxnum: 0,
  rules: {}
};
var ins = {};
ins.inputs = {};
ins.containers = {};

$.fn.tinyvalidate = function(options) {
  var errorCount = 0;
  $.tinyvalidate.callCounter++;
  var idSuffix = $.tinyvalidate.callCounter ? '_' + $.tinyvalidate.callCounter : '';

  var rules = $.tinyvalidate.rules;
  if (isEmpty(rules)) {
    return log('you must have at least one rule. see jquery.tinyvalidate.rules.js', 'alert');
  }


  var requireds = this.find('*[required]').addClass('required').prop({required: false});

  return this.each(function(index) {
    var $form = $(this),
        $allFields = $([]),

        // merge defaults, per-call options, and per-selector (form) options
        opts = $.extend(true, {}, $.fn.tinyvalidate.defaults, options || {}, $.metadata ? $form.metadata() : $.meta ? $form.data() : {}),
        summaryItems = [],
        errorCount = 0,
        summary = opts.summary,
        $errorSummary = summary && $(summary.wrapper).hide(),
        inline = opts.inline,
        evts = (typeof opts.otherEvents === 'string') ?
                opts.otherEvents.split(/\s*,\s*/) :
                opts.otherEvents || [];

    idSuffix += (index ? '-' + index : '');
    // special case: $('someform').tinyvalidate('removeErrors')
    // immediately removes all error class and notices from the form
    if (options === 'removeErrors') {
      $.each(rules, function(ruleName, ruleInfo) {
        $form.find('.' + ruleInfo.ruleClass).each(function() {
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

    //set up summary
    if (summary) {
      $(summary.insertTo === 'form' ? $form[0] : summary.insertTo)[summary.insertType]($errorSummary);

      if (summary.lineItems) {
        var itemWrapperSplitTag = splitTag(summary.lineItems.wrapper),
            lineItemDivider = itemWrapperSplitTag[1] + itemWrapperSplitTag[0],
            itemErrorSplitTag = summary.lineItems.errorElement ? splitTag(summary.lineItems.errorElement) : ['',''];
      }
    }

    // initialize: loop through elements with class that matches each rule's class
    $.each(rules, function(ruleName, ruleInfo) {
      var ruleSelector = '.' + ruleInfo.ruleClass;
      $form.find(ruleSelector).each(function() {
        var elType = setElementType(this.nodeName) || 'inputs',
            $field = $(this),
            thisRule = $field.data('rule') || [],
            tmpRule = rules[ruleName],
            pattern = this.pattern;

        if (pattern) {
          tmpRule = $.extend({}, tmpRule, {
            rule: function(r) {
              var re = new RegExp(pattern);
              return re.test(r);
            },
            text: 'Field value is invalid.'
          });
        }
        // skip the rule if it's on a div that wraps an input with same class
        if ( this.nodeName === 'DIV' && $field.has(ruleSelector).length ) {
          return;
        }


        // otherwise, add it to the list
        thisRule.push(tmpRule);
        $field
        .data('rule', thisRule)
        .data('ruleName', ruleName)
        .data('elementType', elType);
        $allFields = $allFields.add($field);
        if (inline) {
          $field.data('insertion', ins[elType][inline.insertType]);
        }
      });
    });

    if (inline) {
      if (inline.errorElement) {

        $allFields
        .bind('addNotice', function(event, num) {

            var $thisField = $(this),
                ruleText = $.isFunction($thisField.data('rule')[num].text) ? $thisField.data('rule')[num].text.call(this, 'inline', $thisField) : $thisField.data('rule')[num].text;

            var $thisNotice = $(inline.errorElement);
            $thisNotice.html(ruleText);
            $thisNotice
            [$(this).data('insertion')](this)
            .hide();
            $thisNotice[inline.errorAnimate.effect](inline.errorAnimate.speed);

            $thisField.bind('removeNotice', function() {
              $thisNotice.remove();
            });
        });
      }

      $allFields
      .bind('toggleErrorClass', function(event) {
        var $thisContainer, $selectContainer,
            $thisField = $(this);

        $selectContainer = $thisField.is('select') && $thisField.closest('div.select');

        if ($selectContainer && $selectContainer.length) {
          $thisContainer = $selectContainer;
        } else {
          $thisContainer = ($thisField.find('input[type="checkbox"], input[type="radio"]').length) ? $thisField : $thisField.closest(inline.containerTag);
        }
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
          var preMessage = summary.preMessage.replace(/\{num\}/g, errors);
          preMessage = pluralize(preMessage, errors);
          var fullSummary = summary.lineItems ?
               preMessage +  itemWrapperSplitTag[0] + summaryItems.join(lineItemDivider) + itemWrapperSplitTag[1] + summary.postMessage :
              preMessage + summary.postMessage;
          $errorSummary.html(fullSummary)
          [summary.messageAnimate.effect](summary.messageAnimate.speed);
        }
      });
      $form.bind('hideSummary', function() {
        $errorSummary.hide();
      });

      if (summary.lineItems) {

        $form.bind('lineItemBuilder', function(event, field, therule) {
          var $field = $(field);
          var $fieldLabel = $('<div></div>').html(
            $field.data('elementType') === 'containers' ?
              $field.children().eq(0).html() :
              $field.prev().clone().html()
          );
          $fieldLabel.children().remove();
          var fieldLabel = $fieldLabel.text().replace(/[\*:\s]+$/,''),
              ruleText = $.isFunction(therule.text) ? therule.text.call(this) : therule.text;

          if (summary.lineItems.linkify) {
            fieldLabel = '<a href="#' + ($field.data('elementType') === 'containers' ? $field.find('input')[0].id : field.id) + '">' + fieldLabel + '</a>';
          }

          summaryItems.push(fieldLabel + ' ' + itemErrorSplitTag[0] + ruleText + itemErrorSplitTag[1]);
        });
      }

    }

    $allFields.bind('validate.tv', function(event) {
      var thisField = this,
          $thisField = $(this).trigger('removeNotice');

      var thisRule = $thisField.data('rule'), trl = thisRule.length;
      $thisField.removeData('error');
      for (var i=0; i < trl; i++) {
        if ( thisRule[i].elem ) {
          thisRule[i].elem($thisField);
        }
        var arg = thisRule[i].check === 'element' ? $thisField : $thisField.val();
        if ( !thisRule[i].rule(arg) &&
             ( !opts.ignoreHidden || !$thisField.is(':hidden') ) &&
             ( !opts.ignoreDisabled || !thisField.disabled )
        ) {
          if ($thisField.is('.required') && thisRule[i].ruleClass !== 'required' && !$thisField.val()) {continue;}
          $thisField
          .data('error', 'true')
          .trigger('addNotice', [i]);
          $form.trigger('lineItemBuilder', [this, thisRule[i]]);
          errorCount++;
        }
      }
      $thisField.trigger('toggleErrorClass');
    });

    // bind to user interactions

    $form.bind('submit.tv', function(event) {
      errorCount = 0;
      summaryItems = [];
      $allFields.trigger('validate.tv');
      $form.trigger('displaySummary', [errorCount]);
      if (errorCount) {
        opts.submitError.call($form[0], errorCount);
        return false;
      } else if (opts.submitOverride) {
        $form.tinyvalidate('removeErrors');
        opts.submitOverride.call($form[0], opts);
        return false;
      }
    });

    $.each(evts, function(index, evt) {
      $allFields.bind(evt + '.tv', function(event) {
        var ignoreKeys = [9, 16, 17, 18, 91];
        if (event.type === 'click' && !(/^(?:radio|checkbox)$/i).test(event.target.type)) {return;}
        if (event.type.indexOf('key') === 0 && $.inArray(event.which, ignoreKeys) > -1) {return;}

        errorCount = 0;
        $(this).trigger('validate.tv', [event]);
        opts.onEvents.call(this, $form);
      });
    });

  }); //end return this.each
}; // end $.fn.tinyvalidate

/** ===plugin defaults
************************************************************
************************************************************/
$.fn.tinyvalidate.defaults = {
  // ignore disabled elements when validating
  ignoreDisabled: true,
  //ignore hidden elements when validating
  ignoreHidden: true,
  // events other than submit to trigger validation
  // triggers validation only on the element receiving the action
  otherEvents: 'blur',
  // called each time one of the events specified by the otherEvents option is triggered.
  // `this` is the form element. Can take one argument, a jQuery object containing the form
  onEvents: $.noop,
  // called after tinyvalidate's error handling
  // `this` is the form element
  // takes one argument: errorCount (the number of errors found)
  submitError: function() {},

  // if you want to override submit when no validation errors,
  // use an anonymous function:
  // function() { /* do something */ }
  submitOverride: null
};


$.fn.tinyvalidate.defaults.inline = {
  insertType: 'after',
  errorElement: '<div class="error-message"></div>',
  errorAnimate: {
    effect: 'fadeIn',
    speed: 400
  },
  containerTag: 'div',
  containerErrorClass: 'error'
};

$.fn.tinyvalidate.defaults.summary = {
  insertTo: 'form',
  insertType: 'append',
  wrapper: '<div class="error-summary"></div>',
  preMessage: 'Please review the {num} highlighted {field|fields} and try again.<ul>',
  postMessage: '</ul>',
  messageAnimate: {
    effect: 'fadeIn',
    speed: 400
  },
  lineItems: { // set to null if you don't want to include details in the summary message
    wrapper: '<li></li>',
    errorElement: '<span class="error-message"></span>',
    linkify: true // create link in summary details to inputs with errors
  }
};

/** PRIVATE safeguards for inline insertion in case plugin user chooses wrong insertion type
    feel free to ignore this part.
************************************************************/
var insertionMap = { after: 'insertAfter', insertAfter: 'insertAfter', before: 'insertBefore', insertBefore: 'insertBefore' };
$.extend(ins.inputs, insertionMap, { append: 'insertAfter', appendTo: 'insertAfter', prepend: 'insertBefore', prependTo: 'insertBefore' });
$.extend(ins.containers, insertionMap, { append: 'appendTo', appendTo: 'appendTo', prepend: 'prependTo', prependTo: 'prependTo' });

/* other private functions */
function setElementType(tag) {
  if (/(input|textarea|select)/i.test(tag)) {
    return 'inputs';
  } else if (/(div|fieldset|p)/i.test(tag)) {
    return 'containers';
  }
}
function splitTag(element) {
  return element.match(/[^>]+>/g);
}
function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
}
function log() {
  if (window.console && window.console.log) {
    console.log.apply(console, arguments);
  }
}
function pluralize(word, number) {
  return word.replace(/\{([^\|]+)\|([^}]+)\}/g, function(fullmatch, singular, plural) {
    return (number*1 === 1) ? singular : plural;
  });
}
})(jQuery);
