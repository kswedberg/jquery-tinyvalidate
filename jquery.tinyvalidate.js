/*
 * jQuery TinyValidate plugin
 * @desc A (Relatively) Tiny jQuery Validation Plugin
 * @version 1.3  (04/18/2009)
 * @requires jQuery v1.3+
 * @author Karl Swedberg
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

;(function($) { 

$.tinyvalidate = {
  version: '1.3',
  callCounter: -1,
  maxnum: 0,
  rules: {}
};

$.fn.tinyvalidate = function(options) {
  var errorCount = 0;
  $.tinyvalidate.callCounter++;
  var idSuffix = $.tinyvalidate.callCounter ? '_' + $.tinyvalidate.callCounter : '';

  var rules = $.tinyvalidate.rules;
  if (isEmpty(rules)) {
    return log('you must have at least one rule. see jquery.tinyvalidate.rules.js', 'alert');
  }

  return this.each(function(index) {
    var $form = $(this),
        $allFields = $([]);
    idSuffix += (index ? '-' + index : '');
    
    // merge defaults, per-call options, and per-selector (form) options
    var opts = $.extend(true, {}, $.fn.tinyvalidate.defaults, options || {}, $.metadata ? $form.metadata() : $.meta ? $form.data() : {});
    var summaryItems = [],
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

    //set up summary
    if (opts.summary) {
      var summary = opts.summary,
          $errorSummary = $(summary.wrapper).hide();
      $(summary.insertTo == 'form' ? $form[0] : summary.insertTo)[summary.insertType]($errorSummary);

      if (summary.lineItems) {
        var itemWrapperSplitTag = splitTag(summary.lineItems.wrapper),
            lineItemDivider = itemWrapperSplitTag[1] + itemWrapperSplitTag[0],
            itemErrorSplitTag = summary.lineItems.errorElement ? splitTag(summary.lineItems.errorElement) : ['',''];
      }
    }

    // initialize: loop through elements with class that matches each rule's class
    $.each(rules, function(ruleName, ruleInfo) {
      $('.' + ruleInfo.ruleClass, $form).each(function() {
        var $field = $(this);
        var thisRule = $field.data('rule') || [];
        thisRule.push(rules[ruleName]);
        var elType = setElementType(this.nodeName) || 'inputs';
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
      if (inline.errorElement) {
        $allFields
        .bind('addNotice', function(event, num) {
            var $thisField = $(this),
                ruleText = $thisField.data('rule')[num].text;
            var $thisNotice = $(inline.errorElement);
            $thisNotice.html(ruleText);
            $thisNotice
            [$(this).data('insertion')](this)
            .hide()
            [inline.errorAnimate.effect](inline.errorAnimate.speed);
          
            $thisField.bind('removeNotice', function() {
              $thisNotice.remove();
            });
        });
      }

      $allFields
      .bind('toggleErrorClass', function(event) {
        var $thisField = $(this);

        var $thisContainer = ($thisField.find(':checkbox, :radio').length) ? $thisField : $thisField.parents(inline.containerTag + ':first');
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
          var fullSummary = summary.lineItems
              ? preMessage +  itemWrapperSplitTag[0] + summaryItems.join(lineItemDivider) + itemWrapperSplitTag[1] + summary.postMessage
              : preMessage + summary.postMessage;
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
          var fieldLabel = $field.data('elementType') == 'containers'
              ? $field.children(':first').text()
              : $field.prev().text().replace(/(\*|:)$/,'');
          if (summary.lineItems.linkify) {
            fieldLabel = '<a href="#' + ($field.data('elementType') == 'containers' ? $field.find('input')[0].id : field.id) + '">' + fieldLabel + '</a>';
          }
          summaryItems.push(fieldLabel + ' ' + itemErrorSplitTag[0] + therule.text + itemErrorSplitTag[1]);
        });
      }
      
    }
    
    $allFields.bind('validate', function(event) {
      var thisField = this,
          $thisField = $(this).trigger('removeNotice');
      var thisRule = $thisField.data('rule'), trl = thisRule.length;
      for (var i=0; i < trl; i++) {
        var arg = thisRule[i].check == 'element' ? $thisField : $thisField.val();
        if (!thisRule[i].rule(arg) && !$thisField.is(':hidden')) {
          if ($thisField.is('.required') && thisRule[i].ruleClass != 'required' && !$thisField.val()) {continue;}
          $thisField
          .data('error', 'true')
          .trigger('addNotice', [i]);
          $form.trigger('lineItemBuilder', [this, thisRule[i]]);
          errorCount++;
        } else {
          $thisField
          .removeData('error');
        }
      }
      $thisField.trigger('toggleErrorClass');
    });

    // bind to user interactions
    
    $form.bind('submit.tv', function() {
      errorCount = 0;
      summaryItems = [];
      $allFields.trigger('validate');
      $form.trigger('displaySummary', [errorCount]);
      if (errorCount) {
        return false;
      } else if (opts.submitOverride) {
        $form.tinyvalidate('removeErrors');
        opts.submitOverride(opts);
        return false;
      }
    });
    
    if (opts.otherEvents) {
      if (typeof opts.otherEvents == 'string') {
        var evts = opts.otherEvents.replace(/,\s+/g,',').split(',');
      }
      for (var i = evts.length - 1; i >= 0; i--){
        $allFields.bind(evts[i] + '.tv', function(event) {
          if (event.type == 'click' && !/(radio|checkbox)/i.test(event.target.type)) {return;}
          $(this).trigger('validate');
        });
      }
    }
  }); //end return this.each
}; // end $.fn.tinyvalidate

/** ===plugin defaults
************************************************************
************************************************************/
$.fn.tinyvalidate.defaults = {
  otherEvents: 'blur',
  submitOverride: null  // if you want to override submit when no validation errors,
                        // use an anonymous function:
                        // function() { /* do something */ }
};

$.fn.tinyvalidate.defaults.inline = {
  insertType: 'after',
  errorElement: '<span class="error-message"></span>',
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
  preMessage: 'There was a problem processing your request. <br>Please correct the {num} highlighted {field|fields} and try again.<ul>',
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
$.tinyvalidate.inputs = {
  append: 'insertAfter',
  appendTo: 'insertAfterafter',
  prepend: 'insertBefore',
  prependTo: 'insertBefore',
  after: 'insertAfter',
  insertAfter: 'insertAfter',
  before: 'insertBefore',
  insertBefore: 'insertBefore'
};
$.tinyvalidate.containers = {
  append: 'appendTo',
  appendTo: 'appendTo',
  prepend: 'prependTo',
  prependTo: 'prependTo',
  after: 'appendTo',
  insertAfter: 'appendTo',
  before: 'insertBefore',
  insertBefore: 'insertBefore'
};

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
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
    return false;
  }
  return true;
}
function log(obj) {
  if (window.console && window.console.log) {
    window.console.log(obj);
  } else if (arguments[1] == 'alert') {
    alert(obj);
  }
}
function pluralize(word, number) {
  return word.replace(/\{([^\|]+)\|([^}]+)\}/g, function(fullmatch, singular, plural) {
    return (number*1 == 1) ? singular : plural;
  });
}
})(jQuery);
