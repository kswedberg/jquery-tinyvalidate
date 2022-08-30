// @ts-nocheck
/* globals QUnit: false */

// @ts-ignore
QUnit.module('defaults', {
  beforeEach: function() {

    this.frm = $('form.full').first();
    this.frm.tinyvalidate();
    this.errorSelector = '.error';
  },
  afterEach: function() {
    // $('form.full').first().tinyvalidate('removeErrors');
  }
});

QUnit.test('submits', function(assert) {
  assert.expect(2);
  assert.equal(this.frm.find(this.errorSelector).length, 0, '0 errors before submit');
  this.frm.triggerHandler('submit');

  assert.equal(this.frm.find(this.errorSelector).length, 3, '3 errors after submit');
});

QUnit.test('again', function(assert) {
  assert.expect(2);
  assert.equal(this.frm.find(this.errorSelector).length, 0, '0 errors before submit');
  this.frm.triggerHandler('submit');

  assert.equal(this.frm.find(this.errorSelector).length, 3, '3 errors after submit');
});

QUnit.test('blurs', function(assert) {
  assert.equal(this.frm.find(this.errorSelector).length, 0, '0 errors before blurs');
  this.frm.find('input').trigger('blur');
  this.frm.find('input[type="radio"]').trigger('change');
  assert.equal(this.frm.find(this.errorSelector).length, 2, '2 errors after blurring');
});

QUnit.test('removeErrors', function(assert) {
  assert.expect(3);
  assert.equal(this.frm.find(this.errorSelector).length, 0, '0 errors before submit');

  this.frm.triggerHandler('submit');

  assert.equal(this.frm.find(this.errorSelector).length, 3, '3 errors after submit');
  this.frm.tinyvalidate('removeErrors');
  assert.equal(this.frm.find(this.errorSelector).length, 0, '0 errors after tinyvalidate("removeErrors")');
});

QUnit.module('tinyfields');

QUnit.test('tinyfields', function(assert) {
  assert.expect(1);

  var $tinyfields = $('form.full').first().tinyfields($.tinyvalidate.rules);

  assert.equal($tinyfields.length, 5, '$.fn.tinyfields selects 5 "fields".');
});
