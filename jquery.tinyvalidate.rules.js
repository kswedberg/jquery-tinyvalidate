/*
 * Validation Rules for TinyValidate Plugin
 *
*/
(function($) {

$.tinyvalidate.rules.required = {
  ruleClass: 'required',
  rule: function(r) {
    return (/\S+/).test(r);
  },
  text: 'This field is required'
};

$.tinyvalidate.rules.email = {
  ruleClass: 'email',
  rule: function(r) {
    return (/^\S+[@]\w+(\.[a-zA-Z0-9]{2,4}){1,4}/).test(r) || r == '';
  },
  text: 'Invalid Email Format',
  check: 'value'
};

$.tinyvalidate.rules.url = {
  ruleClass: 'url',
  rule: function(r) {
    return (/^http(s?)\/\/:/).test(r);
  },
  text: 'Invalid URL Format',
  check: 'value'
};

$.tinyvalidate.rules.zip = {
  ruleClass: 'zip',
  rule: function(r) {
    return (/^\d{5}(-\d{4})?$/).test(r);
  },
  text: 'Invalid Zip Code Format',
  check: 'value'
};

$.tinyvalidate.rules.date = {
  ruleClass: 'date',
  rule: function(r) {
    // var thisYear = new Date().getFullYear();
    return (/(0\d|1[0-2])\/([0-2]\d|3[0-1])\/[1-2]\d{3}/).test(r);
    // && (+r.slice(-4) < +thisYear-10);
  },
  text: 'Invalid Date Format',
  check: 'value'
};

$.tinyvalidate.rules.phone = {
  ruleClass: 'phone',
  rule: function(r) {
    return (/\(?\d{3}\)?[\. -]?\d{3}[\. -]?\d{4}/).test(r) || r == '';
  },
  text: 'Invalid Format ',
  check: 'value'
};


$.tinyvalidate.rules.ssn = {
  ruleClass: 'ssn',
  rule: function(r) {
    return (/\d{3}-\d{2}-\d{4}/).test(r);
  },
  text: 'Invalid Format (xxx-xx-xxxx)',
  check: 'value'
};

$.tinyvalidate.rules.currency = {
  ruleClass: 'currency',
  rule: function(r) {
    return (/^\d+(\.\d\d)?$/).test(r) || r == '';
  },
  text: 'Invalid Currency Format',
  check: 'value'
};

$.tinyvalidate.rules.requiredradio = {
  ruleClass: 'choose-one',
  rule: function(el) {
    if (el.constructor == Object) {
      return el.find(':checked').length;
    }
  },
  text: 'At least one option is required',
  check: 'element'
};

$.tinyvalidate.rules.maxradio = {
  ruleClass: 'max',
  rule: function(el) {
    // this rule requires 2 classes, "max" and "max-n", where n represents the max number
    $.tinyvalidate.maxnum = el[0].className.replace(/.*max-(\d+).*/,'$1');
    return (el.find('input:checked').length <= +$.tinyvalidate.maxnum);
  },
  text: function() {
    return 'No more than ' + this.className.replace(/.*max-(\d+).*/,'$1') + ' options may be selected';
  },
  check: 'element'
};

$.tinyvalidate.rules.equals = {
  ruleClass: 'equals',
  rule: function(el) {
    var previousValue = false;
    $(el).parents('form:first').find('[name=' + el[0].name + ']')
    .each(function(index) {
      if (index && this.value !== previousValue) {
        previousValue = false;
        return false;
      }
      previousValue = this.value;
    });
    return previousValue === false ? false : true;
  },
  text: 'These fields must match',
  check: 'element'
};

})(jQuery);
