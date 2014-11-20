/**
 * @fileOverview
 */

/**
 * Подменяем и расширяем Backbone.View, добавляя в него милые методы для работы с селекторами, выбором элементов и
 * дата атрибутами
 */


define([
    'Backbone'
], function (Backbone) {
    "use strict";

    /**
     * @typedef {jQuery|Zepto} $
     * @see {@link Backbone.$}
     */

    /**
     * Regular expression which used to find placeholders inside complex classes and selectors. Matches %s and %(key)s
     * patterns and in the second case places the key to the second pocket.
     * @type {RegExp}
     */
    var placeholder = /%(\((\w*?)\))?s/g;

    /**
     * Very light implementation of what sprintf do for %s and %(key)s replacement.
     * @param {string} str String which will be processed
     * @param {Array.<string>|object.<string>} values Values for placeholders
     * @returns {string}
     * @throws {TypeError} if the first argument is not a string
     * @throws {TypeError} if the second argument is not an array nor object
     * @throws {Error} if suitable replacement is not found in the values
     * @example <code type="javascript">
     * replace('a b %s d', ['c']); // 'a b c d'
     * replace('a b %(key)s d', {key: 'c'}); // 'a b c d'
     * </code>
     */
    function replace (str, values) {
        if (typeof str != 'string') {
            throw new TypeError('Classes and selectors should be strings, check the values in the objects inside _classes and _selectors methods');
        }

        var i = 1;
        if (typeof values[i] == 'object') {
            values = values[i];
        }
        if (!values) {
            throw new TypeError('Selector or class replacement error. Second argument must be an object or an array');
        }

        return str.replace(placeholder, function (match, $1, key) {
            var replacement = key ? values[key] : values[i++];
            if (!replacement) {
                throw new Error('Replacement is undefined during processing selector: ' +
                str + ' for ' + (key ? 'key ' + key : 'position ' + (i - 1)));
            }
            return replacement;
        });
    }

    /**
     * @class ElementsView
     * @extends Backbone.View
     */
    var ElementsView = Backbone.View.extend(/**@lends ElementsView.prototype*/{
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
             * Object to store cached CSS classes gotten from {@link ElementsView._classes}
             * @type {?Object.<string>}
             * @private
             */
            this._cachedClasses = null;

            /**
             * Object to store cached CSS selectors gotten from {@link ElementsView._selectors} and calculated using
             * {@link ElementsView._cachedClasses}
             * @type {?Object.<string>}
             * @private
             */
            this._cachedSelectors = null;

            /**
             * Cached elements, used by {@link ElementsView._elem}
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
            this._resetCaches();
            return originResult;
        },

        /**
         * Reset cached for elements, CSS classes and selectors
         * @private
         */
        _resetCaches: function () {
            this._cachedClasses = null;
            this._cachedSelectors = null;
            this._dropElemCache();
        },

        /**
         * Place here CSS classes used in a View. Method should return an object, which keys are readable class names
         * and values are CSS classes. You can extend this method in child classes.
         * todo: doc about possible placeholders
         * @returns {Object.<string>}
         * @protected
         * @example <code class="javascript">
         * _classes: function(){
         *     return {
         *         activeItem: 'very-long-css-class-for-active-state-for-some-item'
         *     };
         * }
         * </code>
         */
        _classes: function () {
            return {};
        },

        _retrieveClass: function (name) {
            if (!this._cachedClasses) {
                this._cachedClasses = this._classes();
            }
            return this._cachedClasses[name];
        },

        /**
         * Returns CSS class by its name. Classes are specified in {@link ElementsView._classes}
         * @param {String} name Key from {@link ElementsView._classes}
         * @param {...String} [varArg] todo: doc + example
         * @returns {String} CSS class
         * @throws {Error} if a name does not match any key in {@link ElementsView._classes} or value for the key is
         * empty
         * @protected
         */
        _class: function (name, varArg) {
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
         * @param {String|Array.<String>} cls
         * @param {String|Array.<String>|$} [elem=this.$el]
         * @returns {Boolean}
         * @protected
         */
        _hasClass: function (cls, elem) {
            return this._runClassMethod('hasClass', cls, elem);
        },

        /**
         * @param {String|Array.<String>} cls
         * @param {String|Array.<String>|$} [elem=this.$el]
         * @returns {$}
         * @protected
         */
        _addClass: function (cls, elem) {
            return this._runClassMethod('addClass', cls, elem);
        },

        /**
         * @param {String|Array.<String>} cls
         * @param {String|Array.<String>|$} [elem=this.$el]
         * @returns {$}
         * @protected
         */
        _removeClass: function (cls, elem) {
            return this._runClassMethod('removeClass', cls, elem);
        },

        /**
         * @param {String|Array.<String>} cls
         * @param {String|Array.<String>|$} [elem=this.$el]
         * @param {Boolean} [toggle]
         * @returns {$}
         * @protected
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
         * Селекторы используемые во вьюшке описываются здесь. Метод надо переопределять в наследуемых классах
         * @returns {Object.<string>} Ключи - названия элементов, значения - селекторы
         * @protected
         * @example <code class="javascript">
         *      _selectors: function(){
         *          return {
         *              map: '.google-map:first'
         *          };
         *      }
         * </code>
         */
        _selectors: function () {
            return {};
        },

        _retrieveSelector: function (name) {
            if (!this._cachedSelectors) {
                this._cachedSelectors = this._selectors();
            }
            return this._cachedSelectors[name];
        },

        /**
         * Возвращает селектор элемента по его имени, селекторы берутся из {@link ElementsView._selectors} или
         * {@link ElementsView._classes}
         * @param {String} name название элемента
         * @param {...String} [varArg]
         * @returns {String} селектор
         * @protected
         * @example <code class="javascript">
         *      events: function(){
         *          var events = {};
         *          events['click ' + this._selector('map')] = this._clickOnMap;
         *          events['click ' + this._selector('table')] = this._clickOnTable;
         *          return events;
         *      }
         * </code>
         */
        _selector: function (name, varArg) {
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
         * todo: remove or rename
         * @param {String} name
         * @returns {Boolean}
         * @protected
         */
        _hasSelector: function (name) {
            return !!(this._retrieveClass(name) || this._retrieveSelector(name));
        },

        /**
         * Возвращает Backbone.$ коллекцию по имени из {@link ElementsView._selectors} или
         * {@link ElementsView._classes}. Кэширует результаты, для сброса кеша см.
         * {@link ElementsView._dropElemCache}
         * @param {String} name название элемента
         * @param {...String} [varArg]
         * @returns {$}
         * @protected
         * @example <code class="javascript">
         *     this._elem('table').hide();
         * </code>
         */
        _elem: function (name, varArg) {
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
         * @param {String} name
         * @param {...String} [varArg]
         * @returns {string}
         * @private
         */
        _getCacheKey: function (name, varArg) {
            return Array.prototype.join.call(arguments, '|');
        },

        /**
         * Finds element without using cache
         * @param {string} name
         * @param {...String} [varArg]
         * @returns {$}
         * @protected
         */
        _findElem: function (name, varArg) {
            return this.$(this._selector.apply(this, arguments));
        },

        /**
         * Трет кеш для {@link ElementsView._elem}
         * @param {String} [name] имя элемента для которого надо убрать кеш, если не задано - сотрется весь кеш
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
         * Возвращает дата атрибуты для элемента по его имени и имени атрибута
         * @param {String} name имя элемента
         * @param {String} [attr] имя атрибута, если не задано, то вернется объект со всеми дата атрибутами для элемента
         * @returns {*|Object}
         * @protected
         */
        _getElemData: function (name, attr) {
            var data = this._elem(name).data();
            return attr ? data[attr] : data;
        }
    });

    return ElementsView;
});
