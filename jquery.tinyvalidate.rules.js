/*
 * Validation Rules for TinyValidate Plugin
 * 
*/

$.tinyvalidate.rules.required = {
  ruleClass: 'required',
  rule: function(r) {
    return (/\S+/).test(r);
  },
  text: 'required field has no value'
};

$.tinyvalidate.rules.email = {
  ruleClass: 'email',
  rule: function(r) {
    return (/^\S+[@]\w+(\.[a-zA-Z0-9]{2,4}){1,4}/).test(r);
  },
  text: 'incorrect E-mail format',
  check: 'value'
};

$.tinyvalidate.rules.url = {
  ruleClass: 'url',
  rule: function(r) {
    return (/^http(s?)\/\/:/).test(r);
  },
  text: 'incorrect URL format',
  check: 'value'
};

$.tinyvalidate.rules.zip = {
  ruleClass: 'zip',
  rule: function(r) {
    return (/^\d{5}(-\d{4})?$/).test(r);
  },
  text: 'incorrect ZIP code',
  check: 'value'
};

$.tinyvalidate.rules.date = {
  ruleClass: 'date',
  rule: function(r) {
    // var thisYear = new Date().getFullYear();
    return (/(0\d|1[0-2])\/([0-2]\d|3[0-1])\/[1-2]\d{3}/).test(r);
    // && (+r.slice(-4) < +thisYear-10);
  },
  text: 'incorrect date',
  check: 'value'
};

$.tinyvalidate.rules.phone = {
  ruleClass: 'phone',
  rule: function(r) {
    return (/\(?\d{3}\)?[\. -]?\d{3}[\. -]?\d{4}/).test(r) || r == '';
  },
  text: 'phone number is incorrectly formatted ',
  check: 'value'
};


$.tinyvalidate.rules.ssn = {
  ruleClass: 'ssn',
  rule: function(r) {
    return (/\d{3}-\d{2}-\d{4}/).test(r);
  },
  text: 'incorrect social security format (must be xxx-xx-xxxx)',
  check: 'value'
};

$.tinyvalidate.rules.currency = {
  ruleClass: 'currency',
  rule: function(r) {
    return (/^\d+(\.\d\d)?$/).test(r) || r == ''; 
  },
  text: 'incorrect currency format',
  check: 'value'
};

$.tinyvalidate.rules.requiredradio = {
  ruleClass: 'choose-one',
  rule: function(el) {
    if (el.constructor == Object) {
      return el.find(':checked').length;
    }
  },
  text: 'at least one option must be selected',
  check: 'element'
};

$.tinyvalidate.rules.maxradio = {
  ruleClass: 'max',
  rule: function(el) {
    // this rule requires 2 classes, "max" and "max-n", where n represents the max number
    $.tinyvalidate.maxnum = el[0].className.replace(/.*max-(\d+).*/,'$1');
    return (el.find('input:checked').length <= +$.tinyvalidate.maxnum);
  },
  text: 'exceeded the maximum number of items that may be checked',
  check: 'element'
};

$.tinyvalidate.rules.equals = {
  ruleClass: 'equals',
  rule: function(el) {
    var previousValue = false;
    $(el).parents('form:first').find('[name=' + el[0].name + ']')
    .each(function(index) {
      if (index && this.value !== previousValue) { previousValue = false; return false;}
      previousValue = this.value;
    });
    return !previousValue ? false : true;
  },
  text: 'field value doesn\'t match',
  check: 'element'
};
