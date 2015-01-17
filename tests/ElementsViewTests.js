/*global describe, it, before, after, beforeEach, afterEach*/

define([
    'underscore',
    'mocha',
    'expect',
    'lib/Backbone.View.Elements'
], function (_, mocha, expect, ElementsView) {
    "use strict";

    function bind (originFn) {
        return function (callback) {
            return originFn(callback.bind(this));
        }
    }

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
                complexClass: 'complex-class_%s_%s',
                classWithPlaceholder: 'class-with-name-%(name)s',
                classWithEmptyPlaceholder: 'class-with-name-%()s',
                insideAlternativeRoot: 'inside-alternative-root'
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
                complexSelector: '.complex-selector_%s_%s',
                selectorWithPlaceholder: '.selector-with-name-%(name)s',
                alternativeRoot: '.alternative-root',
                child: '.child',
                cacheTest: '.cache-test',
                cacheTest2: '.cache-test-2'
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

            if (window.mochaPhantomJS) {
                mochaPhantomJS.run();
            } else {
                mocha.run();
            }
        },

        /**
         * @param {string} description
         * @param {function} [callback]
         * @returns {*}
         */
        describe: function (description, callback) {
            return describe(description, callback ? callback.bind(this) : function () {
                it('Pending suite');
            });
        },

        /**
         * @param {string} description
         * @param {function} [callback]
         * @returns {*}
         */
        it: function (description, callback) {
            return it(description, callback && callback.bind(this));
        },

        before: bind(before),
        beforeEach: bind(beforeEach),
        after: bind(after),
        afterEach: bind(afterEach),

        /**
         * @protected
         */
        _describe: function () {
            this.describe('data property', this._checkDataProperty);
            this.describe('class method', this._checkClassMethod);
            this.describe('selector method', this._checkSelectorMethod);
            this.describe('elem method', this._checkElemMethod);
            this.describe('hasClass method', this._checkHasClassMethod);
            this.describe('addClass and removeClass methods', this._checkAddAndRemoveClassMethods);
            this.describe('toggleClass method', this._checkToggleClassMethod);
            this.describe('setElement method', this._checkSetElementMethod);
            this.describe('findElem method', this._checkFindElemMethod);
            this.describe('dropElemCache method', this._checkDropElemCacheMethod);
            this.describe('getElemData method', this._checkGetElemDataMethod);
        },

        _checkDataProperty: function () {
            this.it('should contain data attributes of element', function () {
                expect(this._data).to.be.an('object');
                expect(this._data['value']).to.be(1);
                expect(this._data['str']).to.be('str');
                expect(this._data['obj']).to.be.an('object');
            });
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
            this.it('should work for complex named class', function () {
                expect(this._class('classWithPlaceholder', {name: 'apple'})).to.be('class-with-name-apple');
            });
            this.it('should work for empty placeholders', function () {
                expect(this._class('classWithEmptyPlaceholder', {'': 'apple'})).to.be('class-with-name-apple');
            });
            this.it('should throw an Exception if there is no class', function () {
                expect(function () {
                    this._class('not-exist');
                }).to.throwError();
            });
            this.it('should not throw error if zero is placeholder', function () {
                expect(this._class('complexClass', 0, 0)).to.be('complex-class_0_0');
            });
            this.it('should throw an error if class name is not a string', function () {
                expect(function () {
                    this._class({});
                }.bind(this)).to.throwError();
            });
            this.it('should throw an error there is no enough placeholders to define a class', function () {
                expect(function () {
                    this._class('complexClass', 'arg');
                }.bind(this)).to.throwError();
                expect(function () {
                    this._class('complexClass', null, 2);
                }.bind(this)).to.throwError(/Second argument must be an object or an array/);
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
            this.it('should work for complex named class', function () {
                expect(this._selector('classWithPlaceholder', {name: 'apple'})).to.be('.class-with-name-apple');
            });
            this.it('should work for simple selector', function () {
                expect(this._selector('simpleSelector')).to.be('.simple-selector');
            });
            this.it('should work for complex selector', function () {
                expect(this._selector('complexSelector', 1, 2)).to.be('.complex-selector_1_2');
            });
            this.it('should work for complex named selector', function () {
                expect(this._selector('selectorWithPlaceholder', {name: 'apple'})).to.be('.selector-with-name-apple');
            });
            this.it('should throw an Exception if there is no selector', function () {
                expect(function () {
                    this._selector('not-exist');
                }).to.throwError();
            });
            this.it('should throw an error if selector name is not a string', function () {
                expect(function () {
                    this._selector({});
                }.bind(this)).to.throwError();
            });
            this.it('should throw an error there is no enough placeholders to define a selector', function () {
                expect(function () {
                    this._selector('complexSelector', 'arg');
                }.bind(this)).to.throwError();
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
        },

        _checkSetElementMethod: function () {
            this.it('should reset caches', function () {
                this.setElement(this._elem('alternativeRoot'));
                expect(this._data['value']).to.be(2);
                expect(this._elem('child').length).to.be(1);
                expect(this._hasClass('insideAlternativeRoot', 'child')).to.be.ok();
                this.setElement(this._$body);
                expect(this._data['value']).to.be(1);
                expect(this._elem('child').length).to.be(2);
            });
        },

        _checkFindElemMethod: function () {
            this.it('should find elements without using cache', function () {
                var $cached = this._elem('cacheTest');
                expect($cached).to.have.length(1);
                $cached.clone().insertAfter($cached);
                expect(this._elem('cacheTest')).to.have.length(1);
                expect(this._findElem('cacheTest')).to.have.length(2);
                $cached.remove();
                this._dropElemCache();
            });
        },

        _checkDropElemCacheMethod: function () {
            this.it('should drop element cache', function () {
                var $cached = this._elem('cacheTest');
                expect($cached).to.have.length(1);
                $cached.clone().insertAfter($cached);
                var $cached2 = this._elem('cacheTest2');
                expect($cached2).to.have.length(1);
                $cached2.clone().insertAfter($cached2);
                expect(this._elem('cacheTest')).to.have.length(1);
                expect(this._elem('cacheTest2')).to.have.length(1);
                this._dropElemCache('cacheTest');
                expect(this._elem('cacheTest')).to.have.length(2);
                expect(this._elem('cacheTest2')).to.have.length(1);
                this._dropElemCache();
                expect(this._elem('cacheTest')).to.have.length(2);
                expect(this._elem('cacheTest2')).to.have.length(2);
                $cached.remove();
                $cached2.remove();
                this._dropElemCache();
            });
        },

        _checkGetElemDataMethod: function () {
            this.it('should return data attributes of the element', function () {
                expect(this._getElemData('alternativeRoot')).to.eql({value: 2});
                expect(this._getElemData('alternativeRoot', 'value')).to.be(2);
            });
        }
    });
});
