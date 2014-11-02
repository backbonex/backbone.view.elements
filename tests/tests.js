requirejs.config({
    paths: {
        Backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        jquery: '../bower_components/jquery/dist/jquery',
        mocha: '../bower_components/mocha/mocha',
        lib: '../lib',
        expect: '../bower_components/expect.js/index'
    },
    shim: {
        jquery: {
            exports: 'jQuery'
        },
        mocha: {
            exports: 'mocha',
            init: function () {
                this.mocha.setup('bdd');
                this.mocha.it = this.it;
                this.mocha.describe = this.describe;
                return this.mocha;
            }
        },
        expect: {
            exports: 'expect'
        }
    }
});

require(['ElementsViewTests'], function (ElementsViewTests) {
    new ElementsViewTests({
        el: document.body
    });
});
