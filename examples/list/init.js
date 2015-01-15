requirejs.config({
    paths: {
        Backbone: '../../bower_components/backbone/backbone',
        underscore: '../../bower_components/underscore/underscore',
        jquery: '../../bower_components/jquery/dist/jquery',
        lib: '../../lib'
    },
    shim: {
        jquery: {
            exports: 'jQuery'
        }
    }
});

require(['jquery', 'ListView'], function ($, ListView) {
    new ListView({
        el: $('.list')
    });
});
