/**
 * Extended Backbone View with useful methods for work with CSS selectors and classes, choosing elements and getting
 * data attributes
 * @module ElementsView
 * @requires Backbone
 * @version 1.0.1
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone'], factory);
    } else {
        root.Backbone.ElementsView = factory(root.Backbone);
    }
}(this, function (Backbone) {
    "use strict";

    /**
     * @typedef {jQuery|Zepto} $
     * @see {@link Backbone.$}
     */

    /**
     * Regular expression which used to find placeholders inside complex classes and selectors. Matches %s and %(key)s
     * patterns and in the second case places the key to the second pocket.
     * @type {RegExp}
     * @private
     */
    var placeholder = /%(\((\w*?)\))?s/g;

    /**
     * Very light implementation of what sprintf do for %s and %(key)s replacement.
     * @param {string} str String which will be processed
     * @param {Arguments} values Values for placeholders
     * @returns {string}
     * @throws {TypeError} if the first argument is not a string
     * @throws {TypeError} if the second argument is not an array nor object
     * @throws {Error} if suitable replacement is not found in the values
     * @private
     */
    function replace (str, values) {
        if (typeof str !== 'string') {
            throw new TypeError('Classes and selectors should be strings, check the values in the objects inside _classes and _selectors methods');
        }

        if (typeof values[1] === 'object') {
            values = values[1];
        }
        if (!values) {
            throw new TypeError('Selector or class replacement error. Second argument must be an object or an array');
        }

        var i = 1;
        return str.replace(placeholder, function (match, $1, key) {
            var replacementByKey = typeof key !== 'undefined',
                replacement = replacementByKey ? values[key] : values[i++];
            if (typeof replacement === 'undefined') {
                throw new Error('Replacement is undefined during processing selector: ' +
                str + ' for ' + (replacementByKey ? 'key ' + key : 'position ' + (i - 1)));
            }
            return replacement;
        });
    }

    /**
     * @alias module:ElementsView
     * @class ElementsView
     * @extends Backbone.View
     */
    var ElementsView = Backbone.View.extend(/**@lends ElementsView#*/{
        /**
         * Cached window object wrapped to {@link Backbone.$}
         * @type {$}
         * @protected
         */
        _$window: Backbone.$(window),

        /**
         * Cached document object wrapped to {@link Backbone.$}
         * @type {$}
         * @protected
         */
        _$document: Backbone.$(document),

        /**
         * Cached document.body object wrapped to {@link Backbone.$}
         * @type {$}
         * @protected
         */
        _$body: Backbone.$(document.body),

        /**
         * @constructs
         */
        initialize: function () {
            var originResult = Backbone.View.prototype.initialize.apply(this, arguments);

            /**
             * Object to store cached CSS classes gotten from {@link ElementsView#_classes}
             * @type {?Object.<string>}
             * @private
             */
            this._cachedClasses = null;

            /**
             * Object to store cached CSS selectors gotten from {@link ElementsView#_selectors} and calculated using
             * {@link ElementsView#_cachedClasses}
             * @type {?Object.<string>}
             * @private
             */
            this._cachedSelectors = null;

            /**
             * Cached elements, used by {@link ElementsView#_elem}
             * @type {Object.<$>}
             * @private
             */
            this._cachedElements = {};

            return originResult;
        },

        /**
         * @public
         * @returns {ElementsView}
         * @see {@link Backbone.View#setElement}
         */
        setElement: function () {
            var originResult = Backbone.View.prototype.setElement.apply(this, arguments);

            /**
             * Data attributes of {@link Backbone.View.$el}. Keys are in camelCase, values are expected types, numbers
             * are instances of Number, JSON parsed to objects and so on.
             * @type {Object.<*>}
             * @protected
             */
            this._data = this.$el.data() || {};
            this._dropElemCache();
            return originResult;
        },

        /**
         * Place here CSS classes used in a View. Method should return an object, which keys are readable class names
         * and values are CSS classes. You can extend this method in child classes.
         * @returns {Object.<string>}
         * @protected
         * @example Routine use
         * <code class="javascript">
         * _classes: function(){
         *     return {
         *         activeItem: 'very-long-css-class-for-active-state-for-some-item'
         *     };
         * }
         * </code>
         * Then you can get the class this way:
         * `this._class('activeItem')`
         * or selector for the class
         * `this._selector('activeItem')` // returns dot + class
         * or even elements with the class
         * `this._elem('activeItem')`
         * Please note the {@link ElementsView#_elem} method caches results, so if you dynamically set the class to
         * different elements use {@link ElementsView#_findElem} instead
         * @example Using with placeholders
         * You can use placeholders for class generation
         * <code class="javascript">
         * _classes: function(){
         *     return {
         *         itemOfType: 'item_type_%s',
         *         namedItem: 'item-%(name)s'
         *     };
         * }
         * </code>
         * then in code
         * `this._class('itemOfType', 'apple')` // item_type_apple
         * `this._class('namedItem', {name: 'note'})` // item-note
         * this is work for {@link ElementsView#_selector}, {@link ElementsView#_elem} and other methods
         */
        _classes: function () {
            return {};
        },

        /**
         * Method for lazy retrieving classes from the results of {@link ElementsView#_classes}
         * @param {string} name
         * @returns {string|undefined}
         * @private
         */
        _retrieveClass: function (name) {
            if (!this._cachedClasses) {
                this._cachedClasses = this._classes();
            }
            return this._cachedClasses[name];
        },

        /**
         * Returns CSS class by its name. Classes are described in {@link ElementsView#_classes}
         * @param {String} name Key from {@link ElementsView#_classes}
         * @param {...string|object} [placeholders] values for placeholders, see examples
         * @returns {String} CSS class
         * @throws {Error} if the name does not match any key in {@link ElementsView#_classes} or value for the key is
         * empty
         * @protected
         * @example Suppose we have classes described like this:
         * <code class="javascript">
         * _classes: function(){
         *     return {
         *         activeItem: 'item_active_yes',
         *         itemOfType: 'item_type_%s',
         *         namedItem: 'item-%(name)s'
         *     };
         * }
         * </code>
         * Then in code we can get the class this way:
         * `this._class('activeItem')`                  // item_active_yes
         * `this._class('itemOfType', 'apple')`         // item_type_apple
         * `this._class('namedItem', {name: 'note'})`   // item-note
         * more often it needed for {@link ElementsView#_addClass} and {@link ElementsView#_removeClass} methods
         */
        _class: function (name, placeholders) {
            var cl = this._retrieveClass(name);
            if (!cl) {
                throw new Error('CSS class for `' + name + '` does not found');
            }

            if (arguments.length > 1) {
                cl = replace(cl, arguments);
            }

            return cl;
        },

        /**
         * @param {String} method
         * @param {String|Array.<String>} cls
         * @param {String|Array.<String>|$} [elem=this.$el]
         * @param {Array} [methodArgs]
         * @returns {Boolean|$}
         * @private
         */
        _runClassMethod: function (method, cls, elem, methodArgs) {
            var $el = elem ?
                    Array.isArray(elem) ? this._elem.apply(this, elem) :
                        typeof elem === 'string' ? this._elem(elem) :
                            elem
                    : this.$el,
                builtClass = Array.isArray(cls) ? this._class.apply(this, cls) : this._class(cls);
            if (typeof methodArgs !== 'undefined') {
                methodArgs.unshift(builtClass);
            } else {
                methodArgs = [builtClass];
            }
            return $el[method].apply($el, methodArgs);
        },

        /**
         * Checks the element has CSS class described in {@link ElementsView#_classes} 
         * @param {String|Array.<String>} cls class name, if you want to use placeholders pass the array (see examples)
         * @param {String|Array.<String>|$} [elem=this.$el] element name, checks the root element if not specified
         * @returns {Boolean}
         * @protected
         * @example Checking {@link Backbone.View.$el} has a class specified in {@link ElementsView#_classes}
         * `this._hasClass('active')`
         * @example Checking some child element has a class specified in {@link ElementsView#_classes}. For retrieving
         * element the {@link ElementsView#_elem} method is used
         * `this._hasClass('active', 'someItem')`
         * @example Usage with placeholders
         * `this._hasClass(['namedItem', 'itsName'], 'elemName')`
         */
        _hasClass: function (cls, elem) {
            return this._runClassMethod('hasClass', cls, elem);
        },

        /**
         * Add CSS class described in {@link ElementsView#_classes} to element
         * @param {String|Array.<String>} cls class name, if you want to use placeholders pass the array (see examples)
         * @param {String|Array.<String>|$} [elem=this.$el] element name, adds to the root element if not specified
         * @returns {$}
         * @protected
         * @example Adding a class specified in {@link ElementsView#_classes} to the {@link Backbone.View.$el}
         * `this._addClass('active')`
         * @example Adding a class specified in {@link ElementsView#_classes} to some child element. For retrieving
         * element the {@link ElementsView#_elem} method is used
         * `this._addClass('active', 'someItem')`
         * @example Usage with placeholders
         * `this._addClass(['namedItem', 'itsName'], 'elemName')`
         */
        _addClass: function (cls, elem) {
            return this._runClassMethod('addClass', cls, elem);
        },

        /**
         * Remove CSS class described in {@link ElementsView#_classes} to element
         * @param {String|Array.<String>} cls class name, if you want to use placeholders pass the array (see examples)
         * @param {String|Array.<String>|$} [elem=this.$el] element name, removes from the root element if not specified
         * @returns {$}
         * @protected
         * @example Removing a class specified in {@link ElementsView#_classes} from the {@link Backbone.View.$el}
         * `this._removeClass('active')`
         * @example Removing a class specified in {@link ElementsView#_classes} from some child element. For retrieving
         * element the {@link ElementsView#_elem} method is used
         * `this._removeClass('active', 'someItem')`
         * @example Usage with placeholders
         * `this._removeClass(['namedItem', 'itsName'], 'elemName')`
         */
        _removeClass: function (cls, elem) {
            return this._runClassMethod('removeClass', cls, elem);
        },

        /**
         * Toggle CSS class described in {@link ElementsView#_classes} on element
         * @param {String|Array.<String>} cls class name, if you want to use placeholders pass the array (see examples)
         * @param {String|Array.<String>|$} [elem=this.$el] element name, toggles to the root element if not specified
         * @param {Boolean} [toggle]
         * @returns {$}
         * @protected
         * @example Toggling a class specified in {@link ElementsView#_classes} on the {@link Backbone.View.$el}
         * `this._toggleClass('active', true)`
         * @example Toggling a class specified in {@link ElementsView#_classes} on some child element. For retrieving
         * element the {@link ElementsView#_elem} method is used
         * `this._toggleClass('active', 'someItem', false)`
         * @example Usage with placeholders
         * `this._toggleClass(['namedItem', 'itsName'], 'elemName', true)`
         */
        _toggleClass: function (cls, elem, toggle) {
            if (arguments.length === 2) {
                if (typeof elem === 'boolean') {
                    toggle = elem;
                    elem = undefined;
                }
            }
            return this._runClassMethod('toggleClass', cls, elem, [toggle]);
        },

        /**
         * Place here selectors used in a View. Method should return an object, which keys are readable selector names
         * and values are CSS selector. You can extend this method in child classes.
         * @returns {Object.<string>}
         * @protected
         * @example Routine use
         * <code class="javascript">
         * _selectors: function(){
         *     return {
         *         firstLevelItem: '.list>.item'
         *     };
         * }
         * </code>
         * Then you can get the selector this way:
         * `this._selector('firstLevelItem')`
         * or elements selected by it
         * `this._elem('firstLevelItem')`
         * @example Using with placeholders
         * You can use placeholders for selector generation
         * <code class="javascript">
         * _selectors: function(){
         *     return {
         *         itemById: '.item[data-id=%s]',
         *         namedItem: '.item-%(name)s'
         *     };
         * }
         * </code>
         * then in code
         * `this._selector('itemById', 3)` // .item[data-id=3]
         * `this._elem('namedItem', {name: 'note'})` // finds child elements by .item-note selector
         */
        _selectors: function () {
            return {};
        },

        /**
         * Method for lazy retrieving selectors from the results of {@link ElementsView#_selectors}
         * @param {string} name
         * @returns {string|undefined}
         * @private
         */
        _retrieveSelector: function (name) {
            if (!this._cachedSelectors) {
                this._cachedSelectors = this._selectors();
            }
            return this._cachedSelectors[name];
        },

        /**
         * Returns CSS selector by its name. Selectors are described in {@link ElementsView#_selectors}
         * @param {String} name Key from {@link ElementsView#_selectors}
         * @param {...string|Object} [placeholders] values for placeholders, see examples
         * @returns {String} CSS selector
         * @throws {Error} if the name does not match any key in {@link ElementsView#_selectors} and
         * {@link ElementsView#_classes}
         * @protected
         * @example Suppose we have selectors described like this:
         * <code class="javascript">
         * _selectors: function(){
         *     return {
         *         firstLevelItem: '.list>.item',
         *         itemById: '.item[data-id=%s]',
         *         namedItem: '.item-%(name)s'
         *     };
         * }
         * </code>
         * Then in code we can get the class this way:
         * `this._selector('firstLevelItem')`             // .list>.item
         * `this._selector('itemById', 'apple')`          // .item[data-id=apple]
         * `this._selector('namedItem', {name: 'note'})`  // .item-note
         * more often it needed for {@link ElementsView#_elem} and {@link ElementsView#_findElem} methods
         * @example Using at {@link Backbone.View#events}
         * <code class="javascript">
         * events: function(){
         *     var events = {};
         *     events['click ' + this._selector('firstLevelItem')] = this._onItemClick;
         *     return events;
         * }
         * </code>
         */
        _selector: function (name, placeholders) {
            var cacheKey = this._getCacheKey.apply(this, arguments),
                selector = this._retrieveSelector(cacheKey);

            if (typeof selector === 'undefined') {
                selector = this._cachedSelectors[name];
                if (typeof selector === 'undefined') {
                    selector = '.' + this._class(name);
                    this._cachedSelectors[name] = selector;
                }

                if (arguments.length > 1) {
                    selector = replace(selector, arguments);
                    this._cachedSelectors[cacheKey] = selector;
                }
            }

            return selector;
        },

        /**
         * Returns true if selector with the name is descried in {@link ElementsView#_classes} or
         * {@link ElementsView#_selectors}
         * @param {String} name Selector name
         * @returns {Boolean}
         * @protected
         */
        _hasDescribedSelector: function (name) {
            return !!(this._retrieveClass(name) || this._retrieveSelector(name));
        },

        /**
         * Returns jQuery or Zepto {@link Backbone#$} collection of elements by the name described in
         * {@link ElementsView#_selectors} or {@link ElementsView#_classes}. Caches results so you do not need to
         * remember them to properties. Use {@link ElementsView#_dropElemCache} to clean caches
         * @param {String} name The name of searching element
         * @param {...string|object} [placeholders] values for placeholders, see examples
         * @returns {$}
         * @protected
         * @example <code class="javascript">
         * var Page = ElementsView.extend({
         *     _classes: function () {
         *         return {
         *             popup: 'my-class-for-popups'
         *         };
         *     },
         *
         *     _selectors: function () {
         *         return {
         *             popupByName: '.popup[data-name=%s]'
         *         };
         *     },
         *
         *     initialize: function () {
         *         ElementsView.prototype.initialize.apply(this, arguments);
         *
         *         this._elem('popupByName', 'greeting').show();
         *         var $allPopups = this._elem('popup');
         *     }
         * });
         * </code>
         */
        _elem: function (name, placeholders) {
            var cacheKey = this._getCacheKey.apply(this, arguments),
                $elem = this._cachedElements[cacheKey];

            if ($elem) {
                return $elem;
            }

            $elem = this._findElem.apply(this, arguments);
            this._cachedElements[cacheKey] = $elem;

            return $elem;
        },

        /**
         * Returns unique string for passed arguments
         * @param {String} name
         * @param {...string} [placeholders]
         * @returns {string}
         * @private
         */
        _getCacheKey: function (name, placeholders) {
            return Array.prototype.join.call(arguments, '|');
        },

        /**
         * Finds element without using cache
         * @param {string} name
         * @param {...string|object} [placeholders]
         * @returns {$}
         * @protected
         * @example <code class="javascript">
         * var SomeElement = ElementsView.extend({
         *     _classes: function () {
         *         return {
         *             activeDropdown: 'dropdown_active'
         *         };
         *     },
         *
         *     _selectors: function () {
         *         return {
         *             dropdownByN: '.dropdown:eq(%s)'
         *         };
         *     },
         *
         *     initialize: function () {
         *         ElementsView.prototype.initialize.apply(this, arguments);
         *
         *         this._addClass('activeDropdown', ['dropdownByN', 2]);
         *         var $activeDropdown = this._elem('activeDropdown'); // caches activeDropdown
         *         this._removeClass('activeDropdown', ['dropdownByN', 2]);
         *         this._addClass('activeDropdown', ['dropdownByN', 3]);
         *         // how to get active dropdown? _elem returns dropdown with number 2
         *         $activeDropdown = this._findElem('activeDropdown'); // ignores caches
         *     }
         * });
         * </code>
         */
        _findElem: function (name, placeholders) {
            return this.$(this._selector.apply(this, arguments));
        },

        /**
         * Clears the cache for {@link ElementsView._elem}
         * @param {String} [name] The name of the element whose cache will be cleaned up. If it's absent the whole cache
         * will be dropped
         * @protected
         */
        _dropElemCache: function (name) {
            if (name) {
                delete this._cachedElements[this._getCacheKey.apply(this, arguments)];
            }
            else {
                this._cachedElements = {};
            }
            return this;
        },

        /**
         * Returns the data attribute value by the name of element described in {@link ElementsView#_selectors} or
         * {@link ElementsView#_classes} and the name of attribute itself. If you need data attributes of the root
         * element just use the {@link ElementsView#_data} property
         * @param {String} name The name of the searching element
         * @param {String} [attr] The attribute name, if it's absent all attributes will be returned as object
         * @returns {*|Object}
         * @protected
         */
        _getElemData: function (name, attr) {
            var data = this._elem(name).data();
            return attr ? data[attr] : data;
        }
    });

    return ElementsView;
}));
