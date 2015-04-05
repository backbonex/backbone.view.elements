Backbone.View.Elements
======================

Backbone.View extension for convenient work with elements, css classes and selectors. Inspired by [i-bem.js](http://bem.info/articles/bem-js-main-terms/)

[![Build Status](https://travis-ci.org/backbonex/backbone.view.elements.svg)](https://travis-ci.org/backbonex/backbone.view.elements)
[![Coverage Status](https://img.shields.io/coveralls/backbonex/backbone.view.elements.svg)](https://coveralls.io/r/backbonex/backbone.view.elements?branch=master)

How to avoid CSS selectors duplication and cache elements
---------------------------------------------------------
It's very common situation when we need to use the same selector in different parts of our view. Considering selectors
can be complex it's not a good practice to mention them more than once. Using Backbone.View.Elements you can adjust 
selectors in one place like this:
```js
_selectors: function () {
	return {
		elemName: '.block__elem-name'
	};
}
```
then in the code you can get the selector using the `_selector` method
```js
this._selector('elemName'); // returns '.block__elem-name'
```
but the more often situation is when you need to retrive an element by the selector
```js
this._elem('elemName'); // returns jQuery collection found by '.block__elem-name'
```
Furthermore the `_elem` method caches the results so you need not to save elements to properties of views. Another 
advantage is when an HTML template is changed you have to change JS in only one place.

How to avoid CSS classes duplication and manipulate them easily
---------------------------------------------------------------
The same situation with CSS selectors - we don't want to duplicate them. Classes are placed inside `_classes` method:
```js
_classes: function () {
	return {
		className: '.block__elem_some_class'
	};
}
```
then in the code you can get the class using the `_class` method
```js
this._class('className'); // returns 'block__elem_some_class'
```
or selector for the class
```js
this._selector('className'); // returns '.block__elem_some_class'
```
or elements collection
```js
this._elem('className'); // returns jQuery collection found by '.block__elem_some_class'
```
But more often we need to do some manipulations with classes like adding a class to an element. The `_addClass` method
exists for this reason
```js
this._addClass('className', 'elemName'); // add the 'block__elem_some_class' to elements found by '.block__elem-name'
```
See also `_removeClass`, `_hasClass`, `_toggleClass` and some others bellow.
### [You also can read a tutorial in my blog >>>](http://jifeon.blogspot.ru/2015/02/how-to-refactor-spaghetti.html)

Table of Contents
-----------------

- [Installation](#installation)
- [Inclusion](#inclusion)
    - [Using globals](#using-globals)
    - [Using RequireJS](#using-amd-loader-for-example-requirejs)
- [Protected API](#protected-api)
    - [Properties](#properties)
      - [_$window](#_$window)
      - [_$document](#_$document)
      - [_$body](#_$body)
      - [_data](#_data)
    - [Methods](#methods)
      - [_classes](#_classes)
      - [_class](#_class)
      - [_hasClass](#_hasclass)
      - [_addClass](#_addclass)
      - [_removeClass](#_removeclass)
      - [_toggleClass](#_toggleclass)
      - [_selectors](#_selectors)
      - [_selector](#_selector)
      - [_hasDescribedSelector](#_hasdescribedselector)
      - [_elem](#_elem)
      - [_findElem](#_findelem)
      - [_dropElemCache](#_dropelemcache)
      - [_getElemData](#_getelemdata)

TOC generated with [DocToc](https://github.com/thlorenz/doctoc)

Installation
------------
To install latest version just type:
```bash
bower install backbone.view.elements --save
```
If you do not have bower:
```bash
npm install -g bower
```

Inclusion
---------
You have two ways to include the script
### Using globals
- Add script tag with Backbone.View.Elements right after Backbone like this:
```html
<script src="path/to/backbone.js"></script>
<script src="path/to/Backbone.View.Elements.js"></script>
```
- Inherit your view from `Backbone.ElementsView`
```js
var MyView = Backbone.ElementsView.extend({
    // yout view prototype here
});
```
### Using AMD loader, for example [RequireJS](requirejs.org)
- Add info about jQuery and Backbone locations to the [shim](http://requirejs.org/docs/api.html#config-shim)
```js
requirejs.config({
    paths: {
        backbone: 'path/to/backbone',
        jquery: 'path/to/jquery'
    },
    shim: {
        jquery: {
            exports: 'jQuery'
        }
    }
});
```
- Describe your view depending on Backbone.View.Elements and extend it:
```js
require(['path/to/Backbone.View.Elements'], function (ElementsView) {
    var MyView = ElementsView.extend({
        // your view prototype here
    });
});
```

Protected API
-------------
You can use following properties and methods inside your child classes
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

#### _data
- *type* `{Object}`

Data attributes of `this.$el`

### Methods
#### _classes 
- *returns* `{Object.<string>}`

Place here CSS classes used in a View. Method should return an object, which keys are readable class names and values are CSS classes. You can extend this method in child classes.

Consider your declaration is:
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
this._selector('activeItem'); // returns dot + the class
```
or even elements with the class
```js
this._elem('activeItem');
```
Please note the `_elem` method caches results, so if you dynamically set the class to
different elements use `_findElem` instead

#### _class
- *arguments:*
    - `{String}`  **`name`** Key from `_classes`
    - `{...string|object}`  **`[placeholders]`** values for placeholders, see examples
- *returns* `{String}` CSS class
- *throws* `{Error}` if the name does not match any key in `_classes` or value for the key is empty

Returns CSS class by its name. Classes are described in `_classes`.
Suppose we have classes described like this: 
```js
_classes: function(){
    return {
        activeItem: 'item_active_yes',
        itemOfType: 'item_type_%s',
        namedItem: 'item-%(name)s'
    };
}
```
Then in code we can get the class this way:
```js
this._class('activeItem');                  // item_active_yes
this._class('itemOfType', 'apple');         // item_type_apple
this._class('namedItem', {name: 'note'});   // item-note
```

#### _hasClass
- *arguments*
    - `{String|Array.<String>}`  **`cls`** class name, if you want to use placeholders pass the array (see examples)
    - `{String|Array.<String>|jQuery}`  **`[elem=this.$el]`** element name, checks the root element if not specified
- *returns* `{Boolean}`

Checks the element has CSS class described in `_classes`. 
Example: checking `Backbone.View.$el` has a class specified in `_classes` as `active`
```js
this._hasClass('active')
```
Checking some child element has a class specified in `_classes`. For retrieving
element the `_elem` method is used
```js
this._hasClass('active', 'someItem')
```
Usage with placeholders
```js
this._hasClass(['namedItem', 'itsName'], 'elemName')
```

#### _addClass
- *arguments:*
    - `{String|Array.<String>}`  **`cls`** class name, if you want to use placeholders pass the array (see examples)
    - `{String|Array.<String>|jQuery}`  **`[elem=this.$el]`** element name, adds to the root element if not specified
- *returns* `{jQuery}`

Add CSS class described in `_classes` to element.
For example if we want to add the class specified in `_classes` as `active` to `Backbone.View.$el`:
```js
this._addClass('active')
```
Adding a class specified in `_classes` to some child element. For retrieving
element the `_elem` method is used
```js
this._addClass('active', 'someItem')
```
Usage with placeholders
```js
this._addClass(['namedItem', 'itsName'], 'elemName')
```

#### _removeClass
- *arguments:*
    - `{String|Array.<String>}`  **`cls`** class name, if you want to use placeholders pass the array (see examples)
    - `{String|Array.<String>|jQuery}`  **`[elem=this.$el]`** element name, removes from the root element if not specified
- *returns* `{jQuery}`

Remove CSS class described in `_classes` from an element. To remove class from from the `Backbone.View.$el`
```js
this._removeClass('active')
```
Removing a class specified in `_classes` from some child element. For retrieving an element the `_elem` method is used
```js
this._removeClass('active', 'someItem')
```
Usage with placeholders
```js
this._removeClass(['namedItem', 'itsName'], 'elemName')
```

#### _toggleClass
- *arguments:*
    - `{String|Array.<String>}`  **`cls`** class name, if you want to use placeholders pass the array (see examples)
    - `{String|Array.<String>|jQuery}`  **`[elem=this.$el]`** element name, toggles to the root element if not specified
    - `{Boolean}`  **`[toggle]`** flag to add or remove the class
- *returns* `{jQuery}`

Toggles CSS class described in `_classes` on element. Example: toggling a class specified in `_classes` as `active` on `Backbone.View.$el`
```js
this._toggleClass('active', true);
```
Toggling a class specified in `_classes` on some child element. For retrieving element the `_elem` method is used
```js
this._toggleClass('active', 'someItem', false)
```
Usage with placeholders
```js
this._toggleClass(['namedItem', 'itsName'], 'elemName', true)
```

#### _selectors
- *returns* `{Object.<string>}`

Place here selectors used in a View. Method should return an object, which keys are readable selector names
and values are CSS selector. You can extend this method in child classes.

Routine use:
```js
_selectors: function(){
    return {
        firstLevelItem: '.list>.item'
    };
}
```
Then you can get the selector this way:
```js
this._selector('firstLevelItem')
```
or elements selected by it
```js
this._elem('firstLevelItem')
```
Using with placeholders
```js
_selectors: function(){
    return {
        itemById: '.item[data-id=%s]',
        namedItem: '.item-%(name)s'
    };
}
```
then in code
```js
this._selector('itemById', 3);           // .item[data-id=3]
this._elem('namedItem', {name: 'note'}); // finds child elements by .item-note selector
```

#### _selector
- *arguments:*
    - `{string}`  **`name`** Key from `_selectors`
    - `{...string|object}`  **`[placeholders]`** values for placeholders, see examples
- *returns* `{String}` CSS selector
- *throws* `{Error}` if the name does not match any key in `_selectors` and `_classes`

Returns CSS selector by its name. Selectors are described in `_selectors`

Example: suppose we have selectors described like this:
```js
_selectors: function(){
    return {
        firstLevelItem: '.list>.item',
        itemById: '.item[data-id=%s]',
        namedItem: '.item-%(name)s'
    };
}
```
Then in code we can get the class this way:
```js
this._selector('firstLevelItem')             // .list>.item
this._selector('itemById', 'apple')          // .item[data-id=apple]
this._selector('namedItem', {name: 'note'})  // .item-note
```
Using at `Backbone.View#events`
```js
events: function(){
    var events = {};
    events['click ' + this._selector('firstLevelItem')] = this._onItemClick;
    return events;
}
```

#### _hasDescribedSelector
- *arguments:*
    - `{String}`  **`name`** Selector name
- *returns* `{Boolean}`

Returns true if selector with the name is descried in `_classes` or `_selectors`

#### _elem
- *arguments:*
    - `{string}`  **`name`** The name of searching element
    - `{...string|object}`  **`[placeholders]`** values for placeholders, see examples
- *returns* `{jQuery}`

Returns jQuery or Zepto collection of elements by the name described in
`_selectors` or `_classes`. Caches th results so you don't need to
remember them to properties. Use `_dropElemCache` to clean caches

```js
var Page = ElementsView.extend({
    _classes: function () {
        return {
            popup: 'my-class-for-popups'
        };
    },

    _selectors: function () {
        return {
            popupByName: '.popup[data-name=%s]'
        };
    },
    
    initialize: function () {
        ElementsView.prototype.initialize.apply(this, arguments);

        this._elem('popupByName', 'greeting').show();
        var $allPopups = this._elem('popup');
    }
});
```

#### _findElem
- *arguments:*
    - `{string}`  **`name`**
    - `{...string|object}`  **`[placeholders]`**
- *returns* `{jQuery}`

Finds element without using cache

```js
var SomeElement = ElementsView.extend({
    _classes: function () {
        return {
            activeDropdown: 'dropdown_active'
        };
    },

    _selectors: function () {
        return {
            dropdownByN: '.dropdown:eq(%s)'
        };
    },

    initialize: function () {
        ElementsView.prototype.initialize.apply(this, arguments);

        this._addClass('activeDropdown', ['dropdownByN', 2]);
        var $activeDropdown = this._elem('activeDropdown'); // caches activeDropdown
        this._removeClass('activeDropdown', ['dropdownByN', 2]);
        this._addClass('activeDropdown', ['dropdownByN', 3]);
        // how to get active dropdown? _elem returns dropdown with number 2 because of the cache
        $activeDropdown = this._findElem('activeDropdown'); // ignores the caches
    }
});
```

#### _dropElemCache
- *arguments:*
    - `{String}`  **`[name]`** The name of the element whose cache will be cleaned up. If it's absent the whole cache
will be dropped

Clears the cache for `ElementsView._elem`

#### _getElemData
- *arguments:*
    - `{String}`  **`name`** The name of the searching element
    - `{String}`  **`[attr]`** The attribute name, if it's absent all attributes will be returned as object
- *returns* `{*|Object}`

Returns the data attribute value by the name of element described in `_selectors` or
`_classes` and the name of attribute itself. If you need data attributes of the root
element just use the `_data` property
