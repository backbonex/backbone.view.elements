/**
 * Подменяем и расширяем Backbone.View, добавляя в него милые методы для работы с селекторами, выбором элементов и
 * дата атрибутами
 * @class Backbone.ElementsView
 * @extends Backbone.View
 */
Backbone.ElementsView = Backbone.View.redefine(function (origin) {
    return /**@lends Backbone.View*/{

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
         * @returns {String} css класс
         * @throws {Error} если название елемента нигде не найдено
         * @protected
         */
        _class: function (name) {
            var cl = this._cachedClasses[name];
            if (cl == null) {
                throw new Error('Selector for ' + name + ' does not found');
            }

            return cl;
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
        _selector: function (name) {
            var selector = this._cachedSelectors[name];
            if (selector != null) {
                return selector;
            }

            selector = '.' + this._class(name);
            this._cachedSelectors[name] = selector;

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
         * @returns {jQuery}
         * @protected
         * @example <code class="javascript">
         *     this._elem('table').hide();
         * </code>
         */
        _elem: function (name) {
            var $elem = this._cachedElements[name];
            if ($elem != null) {
                return $elem;
            }

            $elem = this._findElem(name);
            this._cachedElements[name] = $elem;
            return $elem;
        },

        /**
         * Finds element without using cache
         * @param {string} name
         * @returns {jQuery}
         * @protected
         */
        _findElem: function (name) {
            return this.$(this._selector(name));
        },

        /**
         * Replaces element with passed content
         * @param {string} name
         * @param {HTMLElement|jQuery|string} content
         * @protected
         */
        _replaceElem: function (name, content) {
            this._elem(name).replaceWith(content);
            this._dropElemCache(name);
        },

        /**
         * Трет кеш для {@link Backbone.ElementsView._elem}
         * @param {String} [name] имя элемента для которого надо убрать кеш, если не задано - сотрется весь кеш
         * @protected
         */
        _dropElemCache: function (name) {
            if (name != null) {
                delete this._cachedElements[name];
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
            if (attr == null) {
                return data;
            }

            return data[attr];
        },

        /**
         * Совместимость с Backbone.Decorate
         */
        beforeDecorate: function () {
            this._resetCaches();

            if (typeof origin.beforeDecorate == "function") {
                origin.beforeDecorate.apply(this, arguments);
            }
        }
    }
});