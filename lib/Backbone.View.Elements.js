define([
    'Backbone',
    'jquery',
    'underscore.string',

    './Backbone.Redefine',
    './Backbone.Properties',
    './Backbone.Decorate'
], function (Backbone, $, _) {
    "use strict";

    /**
     * Подменяем и расширяем Backbone.View, добавляя в него милые методы для работы с селекторами, выбором элементов и
     * дата атрибутами
     * @class Backbone.ElementsView
     * @extends Backbone.View
     */
    Backbone.ElementsView = Backbone.View.redefine(function (origin) {
        return /**@lends Backbone.View*/{

            /**
             * @type {jQuery}
             * @protected
             */
            _$window: $(window),

            /**
             * @type {jQuery}
             * @protected
             */
            _$document: $(document),

            /**
             * @type {jQuery}
             * @protected
             */
            _$body: $(document.body),

            /**
             * @private
             */
            _initProperties: function () {
                origin._initProperties.apply(this, arguments);

                /**
                 * Здесь сохраняются закешированные классы, полученные из
                 * {@link Backbone.ElementsView._classes}
                 * @type {Object.<string, string>}
                 * @private
                 */
                this._cachedClasses = this._classes();

                /**
                 * Здесь сохраняются закешированные селекторы, в том числе полученные из
                 * {@link Backbone.ElementsView._classes}
                 * @type {Object.<string, string>}
                 * @private
                 */
                this._cachedSelectors = this._selectors();

                /**
                 * Кеш для {@link Backbone.ElementsView._elem}
                 * @type {Object.<string, jQuery>}
                 * @private
                 */
                this._cachedElements = {};
            },

            setElement: function () {
                origin.setElement.apply(this, arguments);

                /**
                 * Дата атрибуты {@link Backbone.View.$el} в camelCase
                 * @type {Object.<string, string>}
                 * @protected
                 */
                this._data = this.$el.data() || {};
                this._resetCaches();
                return this;
            },

            /**
             * Сбрасывает кэши клаасов, селекторов и элементов
             * @private
             */
            _resetCaches: function () {
                this._cachedClasses = this._classes();
                this._cachedSelectors = this._selectors();
                this._dropElemCache();
            },

            /**
             * CSS классы используемые во вьюшке складываются сюда. Ключи - имена элементов, значение - названия классов.
             * Свойство можно переопределять в наследуемых классах
             * @returns {Object.<string, string>}
             * @protected
             * @example <code class="javascript">
             *     _classes: function(){
         *         return {
         *             table: 'js-table'
         *         };
         *     }
             * </code>
             */
            _classes: function () {
                return {};
            },

            /**
             * Возвращает css класс элемента по его имени, классы берутся из {@link Backbone.ElementsView._classes}
             * @param {String} name название элемента
             * @param {...String} [varArg]
             * @returns {String} css класс
             * @throws {Error} если название елемента нигде не найдено
             * @protected
             */
            _class: function (name, varArg) {
                var cl = this._cachedClasses[name];
                if (!cl) {
                    throw new Error('Selector for ' + name + ' does not found');
                }

                if (arguments.length > 1) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    args.unshift(cl);
                    cl = _.sprintf.apply(_, args);
                }

                return cl;
            },

            /**
             * @param {String} method
             * @param {String|Array.<String>} cls
             * @param {String|Array.<String>|jQuery} [elem=this.$el]
             * @param {Array} [methodArgs]
             * @returns {Boolean|jQuery}
             * @private
             */
            _runClassMethod: function (method, cls, elem, methodArgs) {
                var $el = elem ?
                        Array.isArray(elem) ? this._elem.apply(this, elem) :
                            typeof elem === 'string' ? this._elem(elem) :
                                elem
                        : this.$el,
                    buildedClass = Array.isArray(cls) ? this._class.apply(this, cls) : this._class(cls);
                if (typeof methodArgs !== 'undefined') {
                    methodArgs.unshift(buildedClass);
                } else {
                    methodArgs = [buildedClass];
                }
                return $el[method].apply($el, methodArgs);
            },

            /**
             * @param {String|Array.<String>} cls
             * @param {String|Array.<String>|jQuery} [elem=this.$el]
             * @returns {Boolean}
             * @protected
             */
            _hasClass: function (cls, elem) {
                return this._runClassMethod('hasClass', cls, elem);
            },

            /**
             * @param {String|Array.<String>} cls
             * @param {String|Array.<String>|jQuery} [elem=this.$el]
             * @returns {jQuery}
             * @protected
             */
            _addClass: function (cls, elem) {
                return this._runClassMethod('addClass', cls, elem);
            },

            /**
             * @param {String|Array.<String>} cls
             * @param {String|Array.<String>|jQuery} [elem=this.$el]
             * @returns {jQuery}
             * @protected
             */
            _removeClass: function (cls, elem) {
                return this._runClassMethod('removeClass', cls, elem);
            },

            /**
             * @param {String|Array.<String>} cls
             * @param {String|Array.<String>|jQuery} [elem=this.$el]
             * @param {Boolean} [toggle]
             * @returns {jQuery}
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
             * @returns {Object.<string, string>} Ключи - названия элементов, значения - селекторы
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

            /**
             * Возвращает селектор элемента по его имени, селекторы берутся из {@link Backbone.ElementsView._selectors} или
             * {@link Backbone.ElementsView._classes}
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
                var args = null,
                    cacheKey = this._getCacheKey.apply(this, arguments),
                    selector = this._cachedSelectors[cacheKey];

                if (typeof selector === 'undefined') {
                    if (typeof this._cachedSelectors[name] === 'undefined') {
                        selector = '.' + this._class(name);
                        this._cachedSelectors[name] = selector;
                    }

                    args = Array.prototype.slice.call(arguments, 1);
                    if (args.length) {
                        args.unshift(this._cachedSelectors[name]);
                        selector = _.sprintf.apply(_, args);
                        this._cachedSelectors[cacheKey] = selector;
                    }
                }
                return selector;
            },

            /**
             * @param {String} name
             * @returns {Boolean}
             * @protected
             */
            _hasSelector: function (name) {
                return !!(this._cachedClasses[name] || this._cachedSelectors[name]);
            },

            /**
             * Возвращает jQuery коллекцию по имени из {@link Backbone.ElementsView._selectors} или
             * {@link Backbone.ElementsView._classes}. Кэширует результаты, для сброса кеша см.
             * {@link Backbone.ElementsView._dropElemCache}
             * @param {String} name название элемента
             * @param {...String} [varArg]
             * @returns {jQuery}
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
             * @returns {jQuery}
             * @protected
             */
            _findElem: function (name, varArg) {
                return this.$(this._selector.apply(this, arguments));
            },

            /**
             * Replaces element with passed content
             * @param {string} name
             * @param {HTMLElement|jQuery|string} content
             * @protected
             */
            _replaceElem: function (name, content) {
                var $el = this._elem(name),
                    focusOnElem = $el[0] == document.activeElement || $el.has(document.activeElement).length;

                this._elem(name).replaceWith(content);
                this._dropElemCache(name);

                if (focusOnElem) {
                    this._fixFocus(this._elem(name));
                }
            },

            /**
             * Sets element innerHTML
             * @param {string} name
             * @param {HTMLElement|jQuery|string} content
             * @protected
             */
            _setElemContent: function (name, content) {
                var $el = this._elem(name),
                    focusInsideElem = $el.has(document.activeElement).length;

                $el.html(content);
                if (focusInsideElem) {
                    this._fixFocus($el);
                }
            },

            /**
             * Emulate focus on passed element (focuses closest focusable element)
             * @param {jQuery} $el
             * @private
             */
            _fixFocus: function ($el) {
                var $focused = $el.closest('[tabindex],a,button:not(:disabled)');
                if ($focused.length) {
                    $focused[0].focus();
                }
            },

            /**
             * Трет кеш для {@link Backbone.ElementsView._elem}
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
                if (!attr) {
                    return data;
                }

                return data[attr];
            }
        };
    });
});
