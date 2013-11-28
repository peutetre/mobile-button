#  mobile-button [![Build Status](https://secure.travis-ci.org/peutetre/mobile-button.png?branch=master)](https://travis-ci.org/peutetre/mobile-button)

[![SauceLabs Status](https://saucelabs.com/browser-matrix/mobile-button.svg)](https://saucelabs.com/u/mobile-button)

A module of buttons for the mobile web (__⚠__  touch events only __⚠__)...

## Getting Started

### Install

```
$ npm install mobile-button --save
```

### Usage and API

Require `mobile-button`

```javascript
var MButton = require('mobile-button');
```

### Common API

All buttons have the following methods:

* __setEl(el:DOMElement)__: set the button dom element
* __setF(el:DOMElement)__: set the callback function
* __bind()__: attach all events handlers
* __unbind()__: remove all events handlers

All common options:

* __el:DOMElement__, the button dom element
* __f:function__, the callback function
* __activeCls:String__, the css active class

The callback function can return a promise. If so, the button will wait until it's
fulfilled to return to an inactive state.

#### Default Buttons

Default Buttons are contained only in non scrollable elements.

##### Touchstart Button

A touchstart button triggers his callback on touchstart.

It accepts a __delay__ option.

```javascript
var btn = new MButton.Touchstart({
    el: myElement,
    f: function () {
        alert('...');
    },
    delay: 500 // in ms
});

btn.bind();
```

##### Touchend Button

A touchend button triggers his callback on touchend if the finger is in the active
zone of the underlying button dom element.

This button accepts a __activeBorder__ option in px.

```javascript
var btn = new MButton.Touchend({
    el: myElement,
    f: function () {
        alert('...');
    },
    activeBorder: 20 // in px
});

btn.bind();
```

#### Scrollable Y Buttons

Buttons contained in a Y scrollable element.

##### Touchend Button

TODO

#### Scrollable X Buttons

Buttons contained in a X scrollable element.

##### Touchend Button

TODO

### Build

to build examples and tests

```
npm install
npm run build
```

### Examples

check the <a href="http://peutetre.github.io/mobile-button/example/">examples</a>

### Tests

run the <a href="http://peutetre.github.io/mobile-button/test/">tests</a>

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
