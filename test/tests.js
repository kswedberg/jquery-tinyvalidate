/* globals test: false, equal: false  */
module('defaults', {
  setup: function() {
    this.frm = $('form').eq(0);
    this.frm.tinyvalidate();
  }
});

test('submit', function() {
  equal(this.frm.find('.error').length, 0, 'Start with no errors');
  this.frm.triggerHandler('submit');
  equal(this.frm.find('.error').length, 3, '3 errors after submit');
});

test('blur', function() {
  this.frm.find(':input').trigger('blur');
  equal(this.frm.find('.error').length, 3, '3 errors after blurring all');
});

test('removeErrors', function() {
  this.frm.triggerHandler('submit');
  equal(this.frm.find('.error').length, 3, '3 errors after submit');
  this.frm.tinyvalidate('removeErrors');
  equal(this.frm.find('.error').length, 0, '0 errors after tinyvalidate("removeErrors")');
});
