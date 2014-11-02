define([
    'underscore',
    'mocha',
    'expect',
    'lib/Backbone.View.Elements'
], function (_, mocha, expect, ElementsView) {
    "use strict";

    /**
    * @class ElementsViewTests
    * @extends ElementsView
    */
    return ElementsView.extend(/**@lends ElementsViewTests*/{
        /**
         * @type {string}
         * @private
         */
        _name: 'ElementsView',

        /**
         * @see {@link Backbone.View._classes}
         * @protected
         * @returns {Object}
         */
        _classes: function () {
            return _.defaults({
                elemFromClass: 'js-test__class-elem',
                simpleClass: 'simple-class',
                complexClass: 'complex-class_%s_%s'
            }, ElementsView.prototype._classes.call(this));
        },

        /**
         * @see {@link Backbone.View._selectors}
         * @protected
         * @returns {Object}
         */
        _selectors: function () {
            return _.defaults({
                testContent: '.js-test-elements_backbone_view',
                elemFromSelector: '.js-test__selector-elem',
                simpleSelector: '.simple-selector',
                complexSelector: '.complex-selector_%s_%s'
            }, ElementsView.prototype._selectors.call(this));
        },

        /**
         * @constructs
         */
        initialize: function () {
            ElementsView.prototype.initialize.apply(this, arguments);
            this._initTests();
        },

        /**
         * @protected
         */
        _initTests: function () {
            this.describe(this._name, function () {
                this._describe();
            });

            mocha.checkLeaks();
            mocha.run();
        },

        /**
         * @param {string} description
         * @param {function} callback
         * @returns {*}
         */
        describe: function (description, callback) {
            return mocha.describe(description, callback.bind(this));
        },


        /**
         * @see {@link expect}
         * @returns {mocha.Matchers}
         */
        it: function (descrition, callback) {
            return mocha.it(descrition, callback.bind(this));
        },

        /**
         * @protected
         */
        _describe: function () {
            this.describe('class method', this._checkClassMethod);
            this.describe('selector method', this._checkSelectorMethod);
            this.describe('elem method', this._checkElemMethod);
            this.describe('hasClass method', this._checkHasClassMethod);
            this.describe('addClass and removeClass methods', this._checkAddAndRemoveClassMethods);
            this.describe('toggleClass method', this._checkToggleClassMethod);
        },

        /**
         * @private
         */
        _checkClassMethod: function () {
            this.it('should work for simple class', function () {
                expect(this._class('simpleClass')).to.be('simple-class');
            });
            this.it('should work for complex class', function () {
                expect(this._class('complexClass', 1, 2)).to.be('complex-class_1_2');
            });
            this.it('should throw an Exception if there is no class', function () {
                expect(function () {
                    this._class('not-exist');
                }).to.throwError();
            });
        },

        /**
         * @private
         */
        _checkSelectorMethod: function () {
            this.it('should work for simple class', function () {
                expect(this._selector('simpleClass')).to.be('.simple-class');
            });
            this.it('should work for complex class', function () {
                expect(this._selector('complexClass', 1, 2)).to.be('.complex-class_1_2');
            });
            this.it('should work for simple selector', function () {
                expect(this._selector('simpleSelector')).to.be('.simple-selector');
            });
            this.it('should work for complex selector', function () {
                expect(this._selector('complexSelector', 1, 2)).to.be('.complex-selector_1_2');
            });
            this.it('should throw an Exception if there is no selector', function () {
                expect(function () {
                    this._selector('not-exist');
                }).to.throwError();
            });
        },

        /**
         * @private
         */
        _checkElemMethod: function () {
            this.it('should work for simple class', function () {
                this._jQueryEq(this._elem('simpleClass'), this.$('.simple-class'));
            });
            this.it('should work for complex class', function () {
                this._jQueryEq(this._elem('complexClass', 1, 2), this.$('.complex-class_1_2'));
            });
            this.it('should work for simple selector', function () {
                this._jQueryEq(this._elem('simpleSelector'), this.$('.simple-selector'));
            });
            this.it('should work for complex selector', function () {
                this._jQueryEq(this._elem('complexSelector', 1, 2), this.$('.complex-selector_1_2'));
            });
            this.it('should throw an Exception if there is no selector', function () {
                expect(function () {
                    this._elem('not-exist');
                }).to.throwError();
            });
        },

        /**
         * @private
         */
        _jQueryEq: function ($el1, $el2) {
            expect($el1.length).to.be($el2.length);
            for (var i = 0; i < $el1.length; i++) {
                expect($el1[i]).to.be($el2[i]);
            }
        },

        /**
         * @private
         */
        _checkHasClassMethod: function () {
            this.it('should work for simple class', function () {
                var simpleClass = 'simpleClass';
                expect(this._hasClass(simpleClass)).to.be(false);
                expect(this._hasClass(simpleClass, simpleClass)).to.be(true);
                expect(this._hasClass(simpleClass, this._elem(simpleClass))).to.be(true);
            });
            this.it('should work for complex class', function () {
                var complexClass = ['complexClass', 1, 2];
                expect(this._hasClass(complexClass)).to.be(false);
                expect(this._hasClass(complexClass, complexClass)).to.be(true);
                expect(this._hasClass(['complexClass', 1, 3], complexClass)).to.be(false);
            });
            this.it('should throw an Exception if there is no class', function () {
                expect(function () {
                    this._hasClass('not-exist');
                }).to.throwError();
            });
        },

        /**
         * @private
         */
        _checkAddAndRemoveClassMethods: function () {
            this.it('should work for simple class', function () {
                var simpleClass = 'simpleClass';
                expect(this._hasClass(simpleClass)).to.be(false);
                this._addClass(simpleClass);
                expect(this._hasClass(simpleClass)).to.be(true);
                this._removeClass(simpleClass);
                expect(this._hasClass(simpleClass)).to.be(false);

                expect(this._hasClass(simpleClass, simpleClass)).to.be(true);
                this._removeClass(simpleClass, simpleClass);
                expect(this._hasClass(simpleClass, simpleClass)).to.be(false);
                this._addClass(simpleClass, simpleClass);
                expect(this._hasClass(simpleClass, this._elem(simpleClass))).to.be(true);
            });
            this.it('should work for complex class', function () {
                var complexClass = ['complexClass', 1, 2],
                    notExistentComplexClass = ['complexClass', 1, 3];
                expect(this._hasClass(complexClass, complexClass)).to.be(true);
                this._removeClass(complexClass, complexClass);
                expect(this._hasClass(complexClass, complexClass)).to.be(false);
                this._addClass(complexClass, complexClass);
                expect(this._hasClass(complexClass, complexClass)).to.be(true);

                expect(this._hasClass(notExistentComplexClass, complexClass)).to.be(false);
                this._addClass(notExistentComplexClass, complexClass);
                expect(this._hasClass(notExistentComplexClass, complexClass)).to.be(true);
                this._removeClass(notExistentComplexClass, complexClass);
                expect(this._hasClass(notExistentComplexClass, complexClass)).to.be(false);
            });
            this.it('should throw an Exception if there is no class', function () {
                expect(function () {
                    this._addClass('not-exist');
                }).to.throwError();
            });
        },

        /**
         * @private
         */
        _checkToggleClassMethod: function () {
            this.it('should work for simple class', function () {
                var simpleClass = 'simpleClass';
                expect(this._hasClass(simpleClass)).to.be(false);
                this._toggleClass(simpleClass);
                expect(this._hasClass(simpleClass)).to.be(true);
                this._toggleClass(simpleClass, true);
                expect(this._hasClass(simpleClass)).to.be(true);
                this._toggleClass(simpleClass);
                expect(this._hasClass(simpleClass)).to.be(false);
                this._toggleClass(simpleClass, false);
                expect(this._hasClass(simpleClass)).to.be(false);
                this._toggleClass(simpleClass, true);
                expect(this._hasClass(simpleClass)).to.be(true);
                this._toggleClass(simpleClass, false);
                expect(this._hasClass(simpleClass)).to.be(false);

                expect(this._hasClass(simpleClass, simpleClass)).to.be(true);
                this._toggleClass(simpleClass, simpleClass);
                expect(this._hasClass(simpleClass, simpleClass)).to.be(false);
                this._toggleClass(simpleClass, simpleClass, false);
                expect(this._hasClass(simpleClass, simpleClass)).to.be(false);
                this._toggleClass(simpleClass, simpleClass);
                expect(this._hasClass(simpleClass, this._elem(simpleClass))).to.be(true);
                this._toggleClass(simpleClass, simpleClass, true);
                expect(this._hasClass(simpleClass, this._elem(simpleClass))).to.be(true);
                this._toggleClass(simpleClass, simpleClass, false);
                expect(this._hasClass(simpleClass, simpleClass)).to.be(false);
                this._toggleClass(simpleClass, simpleClass, true);
                expect(this._hasClass(simpleClass, this._elem(simpleClass))).to.be(true);
            });
            this.it('should work for complex class', function () {
                var complexClass = ['complexClass', 1, 2],
                    notExistentComplexClass = ['complexClass', 1, 3];
                expect(this._hasClass(complexClass, complexClass)).to.be(true);
                this._toggleClass(complexClass, complexClass);
                expect(this._hasClass(complexClass, complexClass)).to.be(false);
                this._toggleClass(complexClass, complexClass);
                expect(this._hasClass(complexClass, complexClass)).to.be(true);

                expect(this._hasClass(notExistentComplexClass, complexClass)).to.be(false);
                this._toggleClass(notExistentComplexClass, complexClass);
                expect(this._hasClass(notExistentComplexClass, complexClass)).to.be(true);
                this._toggleClass(notExistentComplexClass, complexClass);
                expect(this._hasClass(notExistentComplexClass, complexClass)).to.be(false);
            });
            this.it('should throw an Exception if there is no class', function () {
                expect(function () {
                    this._toggleClass('not-exist');
                }).to.throwError();
            });
        }
    });
});
