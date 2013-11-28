#  mobile-button [![Build Status](https://secure.travis-ci.org/peutetre/mobile-button.png?branch=master)](https://travis-ci.org/peutetre/mobile-button)

[![SauceLabs Status](https://saucelabs.com/browser-matrix/mobile-button.svg)](https://saucelabs.com/u/mobile-button)

A module of buttons for the mobile web (⚠  touch events only ⚠)...

## Getting Started

### Install

```
$ npm install mobile-button --save
```

### Usage and API

Require `mobile-button`

```javascript
var MButtons = require('mobile-button');
```

### Common API

All buttons have the following methods:

* setEl(el:DOMElement): set the button dom element
* setF(el:DOMElement): set the callback function
* bind(): attach all events handlers
* unbind(): remove all events handlers

All common options:

* el:DOMElement, the button dom element
* f:function, the callback function
* activeCls:String, the css active class

The callback function can return a promise. If so, the button will wait until it's
fulfilled to return to an inactive state.

#### Default Buttons

Default Buttons are contained only in non scrollable elements.

##### Touchstart Button

A touchstart button triggers his callback on touchstart.

It accepts a delay option.

```javascript
var btn = new MButtons.Touchstart({
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

This button accepts a activeBorder option in px.

```javascript
var btn = new MButtons.Touchend({
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

run the <a href="http://peutetre.github.io/mobile-button/test/">tests</a

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
