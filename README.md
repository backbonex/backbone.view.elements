Backbone.View.Elements
======================

Backbone.View extension for convenient work with elements, css classes and selectors

[![Build Status](https://travis-ci.org/backbonex/backbone.view.elements.svg)](https://travis-ci.org/backbonex/backbone.view.elements)
[![Coverage Status](https://img.shields.io/coveralls/backbonex/backbone.view.elements.svg)](https://coveralls.io/r/backbonex/backbone.view.elements?branch=master)

Protected API
---
You can use following properties and methods inside child classes
### Properties
#### _$window 
- *type* `{jQuery}`

Cached `window` object wrapped to [jQuery](http://jquery.com/)/[Zepto](http://zeptojs.com/)

#### _$document
- *type* `{jQuery}`

Cached `document` object wrapped to [jQuery](http://jquery.com/)/[Zepto](http://zeptojs.com/)

#### _$body
- *type* `{jQuery}`

Cached `document.body` object wrapped to [jQuery](http://jquery.com/)/[Zepto](http://zeptojs.com/)

### _data
- *type* `{Object}`

Data attributes of `this.$el`

### Methods
#### _classes 
- *returns* `{Object.<string>}`

Place here CSS classes used in a View. Method should return an object, which keys are readable class names and values are CSS classes. You can extend this method in child classes.
```js
_classes: function(){
    return {
        activeItem: 'very-long-css-class-for-active-state-for-some-item'
    };
}
```
Then you can get the class this way:
```js
this._class('activeItem');
```
or selector for the class
```js
this._selector('activeItem'); // returns dot + class
```
or even elements with the class
```js
this._elem('activeItem');
```
Please note the `_elem` method caches results, so if you dynamically set the class to
different elements use `_findElem` instead
