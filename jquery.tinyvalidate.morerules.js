/*
 * More (optional) Validation Rules TinyValidate
 * 
*/

$.tinyvalidate.morerules = {};

$.tinyvalidate.morerules.date = {
  ruleClass: 'date',
  rule: function(r) {
    // var thisYear = new Date().getFullYear();
    return (/(0\d|1[0-2])\/([0-2]\d|3[0-1])\/[1-2]\d{3}/).test(r);
    // && (+r.slice(-4) < +thisYear-10);
  },
  text: '&laquo; incorrect date',
  check: 'value'
};

$.tinyvalidate.morerules.phone = {
  ruleClass: 'phone',
  rule: function(r) {
    return (/\(?\d{3}\)?[\. -]?\d{3}[\. -]?\d{4}/).test(r) || r == '';
  },
  text: '&laquo; phone number is incorrectly formatted ',
  check: 'value'
};


$.tinyvalidate.morerules.ssn = {
  ruleClass: 'ssn',
  rule: function(r) {
    return (/\d{3}-\d{2}-\d{4}/).test(r);
  },
  text: '&laquo; incorrect social security format (must be xxx-xx-xxxx)',
  check: 'value'
};

$.tinyvalidate.morerules.currency = {
  ruleClass: 'currency',
  rule: function(r) {
    return (/^\d+(\.\d\d)?$/).test(r) || r == ''; 
  },
  text: '&laquo; incorrect currency format',
  check: 'value'
};

$.tinyvalidate.morerules.requiredradio = {
  ruleClass: 'choose-one',
  rule: function(el) {
    if (el.constructor == Object) {
      return el.find(':checked').length;
    }
  },
  text: '&laquo; at least one option must be selected',
  check: 'element'
};

$.tinyvalidate.morerules.maxradio = {
  ruleClass: 'max',
  rule: function(el) {
    // this rule requires 2 classes, "max" and "max-n", where n represents the max number
    $.tinyvalidate.maxnum = el[0].className.replace(/.*max-(\d+).*/,'$1');
    return (el.find('input:checked').length <= +$.tinyvalidate.maxnum);
  },
  text: '&laquo; exceeded the maximum number of items that may be checked',
  check: 'element'
};
