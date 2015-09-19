window.$ = window.jQuery = require('../libs/jquery-2.1.4.js');

var remote = require('remote');
$(function(){
    $('[data-action="close"]').on('click', function(){
        window.close();
    });
    $('[data-action="dev"]').on('click', function(){
        remote.getCurrentWindow().openDevTools({detach: true});
    });
});