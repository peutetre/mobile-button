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

Buttons contained in a Y scrollable element (on ios 5+ with -webkit-overflow-scrolling:touch;).

##### Touchend Button

This touchend button will get canceled if the fingermove more than __tolerance__
pixels in the Y axis. It extends the default touchend button.

This button accepts a __tolerance__ option in px.

```javascript

var ScrollableBtn = require('mobile-button').ScrollableY;

var btn = new ScrollableBtn.Touchend({
    el: myElement,
    f: function () {
        alert('...');
    },
    tolerance: 5 // in px
});

btn.bind();
```

#### Scrollable X Buttons

Buttons contained in a X scrollable element  (on ios 5+ with -webkit-overflow-scrolling:touch;).

##### Touchend Button

This touchend button will get canceled if the fingermove more than __tolerance__
pixels in the X axis. It extends the default touchend button.

This button accepts a __tolerance__ option in px.

```javascript

var ScrollableBtn = require('mobile-button').ScrollableX;

var btn = new ScrollableBtn.Touchend({
    el: myElement,
    f: function () {
        alert('...');
    },
    tolerance: 5 // in px
});

btn.bind();
```

### Build

to build examples and tests

```
npm install
npm run build
```

### Examples

Check the <a href="http://peutetre.github.io/mobile-button/example/">examples</a>.

Design taken from [@Noxdzine](http://twitter.com/noxdzine/) <a href="http://dribbble.com/shots/533278-Orange-Ui-kit-Free-PSD)">Orange UI kit</a>


![button example 0](https://raw.github.com/peutetre/mobile-button/master/example/images/0.png)
![button example 1](https://raw.github.com/peutetre/mobile-button/master/example/images/1.png)
![button example 2](https://raw.github.com/peutetre/mobile-button/master/example/images/2.png)
![button example 3](https://raw.github.com/peutetre/mobile-button/master/example/images/3.png)

### Tests

run the <a href="http://peutetre.github.io/mobile-button/test/">tests</a>

## ChangeLog

#### v0.1.2 02-13-2014

* fix buttons when f the callback button function returns rejected promises.

#### v0.1.1 01-20-2014

* Touchend buttons: remove active class on `touchend`

#### v0.1.0 01-16-2014

* upgrade q to 1.0.0

#### v0.0.4 12-16-2013

* back to iscroll, 5.0.9 supports commonjs

#### v0.0.3 12-05-2013

* using iscroll-browserify for scrollable views

#### v0.0.2 12-03-2013

* preventDefault some `touchmove` for chrome on android
* fix ie tests

#### v0.0.1 12-03-2013

* initial release

## References

* Handling touchevents on scroll (or why the 0.0.3 will include iscroll for scrollables...): https://docs.google.com/document/d/12k_LL_Ot9GjF8zGWP9eI_3IMbSizD72susba0frg44Y

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
