# jQuery Tiny Validate Plugin

This plugin is not meant for public consumption. Although you are free to use it under the terms of the [MIT license], I will not reply to support requests.

## Options

### General Options

```js
$.fn.tinyvalidate.defaults = {

  // Ignore disabled elements when validating
  ignoreDisabled: true,

  // Ignore hidden elements when validating
  ignoreHidden: true,

  // Events other than submit to trigger validation
  // Triggers validation only on the element receiving the action
  otherEvents: 'blur',

  // Called each time one of the events specified by the otherEvents option is triggered.
  // `this` is the form element. Can take one argument, a jQuery object containing the form
  onEvents: $.noop,

  // Called after tinyvalidate's error handling
  // `this` is the form element
  // Takes one argument: errorCount (the number of errors found)
  submitError: function() {},

  // If you want to override submit when no validation errors,
  // use a function reference or an anonymous function:
  // function() { /* do something */ }
  submitOverride: null
};
```

### Options for "inline" messages

*Set to `null` if you do not want error messages to appear alongside invalid fields*

```js
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
```

### Options for "summary" messages

*Set to `null` if you do NOT want a summary error message to appear*

```js
$.fn.tinyvalidate.defaults.summary = {
  // Determines where the summary message will display.
  // If default 'form' is used, will be the current form;
  // otherwise, if a string is used, will simply use the string as a selector
  // If a function is used, will be the return value of the function. `this` is set to the form.
  insertTo: 'form',
  insertType: 'append',
  wrapper: '<div class="error-summary"></div>',
  preMessage: 'Please review the {num} highlighted {field|fields} and try again.<ul>',
  postMessage: '</ul>',
  messageAnimate: {
    effect: 'fadeIn',
    speed: 400
  },

  // set to null if you don't want to include details in the summary message:
  lineItems: {
    wrapper: '<li></li>',
    errorElement: '<span class="error-message"></span>',
    // create link in summary details to inputs with errors
    linkify: true
  }
};
```

[MIT license]: http://www.opensource.org/licenses/mit-license.php
