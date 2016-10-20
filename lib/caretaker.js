/*
 * Caretaker
 * https://github.com/goliatone/caretaker
 *
 * Copyright (c) 2016 goliatone
 * Licensed under the MIT license.
 */

'use strict';

var extend = require('gextend');
var _inherit = require('util').inherits;
var EventEmitter = require('events').EventEmitter;


var DEFAULTS = {
    autoinitialize: true
};

function caretaker(config){
    EventEmitter.call(this);
    config = extend({}, this.constructor.DEFAULTS, config);

    if(config.autoinitialize ) this.init(config);
}

_inherit(caretaker, EventEmitter);

caretaker.DEFAULTS = DEFAULTS;

caretaker.prototype.init = function(config){
    if(this.initialized) return;
    this.initialized = true;

    extend(this, this.constructor.DEFAULTS, config);

};

caretaker.prototype.logger = console;

/**
 * Exports module
 */
module.exports = caretaker;
