'use strict';
/*
 * Caretaker
 * https://github.com/goliatone/caretaker
 *
 * Copyright (c) 2016 goliatone
 * Licensed under the MIT license.
 */

var fs = require('fs');
var extend = require('gextend');
var human = require('human-time');
var time = require('english-time-mirror');
var _inherit = require('util').inherits;
var debug = require('debug')('caretaker');
var EventEmitter = require('events');
var formatDate = require('./formatDate');

var DEFAULTS = {
    timeout: 20 * 60 * 1000, //20 minutes,
    waitBeforeExit: 2 * 1000, //10 seconds to tidy up
    bequest: {},
    name: 'careTaker_' + Date.now(),
    autoinitialize: true,
    willPath: './.caretaker',
    logger: console,
    filepathTransform: function(filepath){
        return filepath + '_' + formatDate(new Date(), '%Y-%M-%d-%H:%m:%s');
    },
    serializer: function(data){
        return data;
    }
};

/**
 * Manages a program life-cycle.
 *
 * - raise
 * - check
 * - terminate
 *
 * set timeout. If we do not get new content after this period of time,
 * we consider the system wonked
 *
 * TODO: Make CLI helper program
 *
 * @param {Object} options Config object
 */
function CareTaker(options){

    if(!(this instanceof CareTaker)){
        return new CareTaker(options);
    }

    EventEmitter.call(this);

    options = extend({}, DEFAULTS, options);

    if(options.autoinitialize) this.init(options);

}

_inherit(CareTaker, EventEmitter);

CareTaker.DEFAULTS = DEFAULTS;

CareTaker.prototype.init = function(config){
    if(this.initialized) return this;
    this.initialized = true;

    if(typeof config.timeout === 'string') config.timeout = time(config.timeout);

    extend(this, config);

    this.startup();

    this.tick();
};


/**
 * Code to be executed on startup
 * @return {void}
 */
CareTaker.prototype.startup = function(){
    this.strtime = Date.now();

    //we should try to load a previous notice
    //if we find one, we know that we are efectively
    //reborn. If we are reborn, the first time we get
    //a checkpoint, we should send a notice. In our case
    //we want to know if we missed any crytical data
    //It is for the external system to determine this and
    //to take relevant actions.
    var payload = this.readWill();

    if(payload) {
        debug('Startup found old will from caretaker:\n%s', payload);
        this.emit('startup', payload);
    }
};

CareTaker.prototype.readWill = function(){
    var payload = false;
    try {
        payload = fs.readFileSync(this.willPath, 'utf-8');
    } catch(e){
        if(e.code === 'ENOENT') return false;
        debug('e %s', e.stack);
    }
    return payload;
}

CareTaker.prototype.tick = function(){
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(this.terminate.bind(this), this.timeout);
};

/**
 * Check point for monitored service.
 * CareTaker expects this function to be called
 * in an interval of time lower than the specified
 * `timeout` period.
 * In the case that the TTL is expired the instance
 * will execute the `terminate` function.
 *
 * @param  {Object} data Object to be serialized
 * @return {void}
 */
CareTaker.prototype.check = function(data){
    //TODO: should we try to abort?
    if(this.terminated) return;

    debug('check, next tick in %s, started %s',
        human(new Date(Date.now() + this.timeout)),
        human((Date.now() - this.strtime)/1000));

    this.bequest = this.serializer(data);

    this.tick();
};


CareTaker.prototype.terminate = function(){
    debug('** Client did not check-in on time. Terminating session, started %s',
        human((Date.now() - this.strtime)/1000));

    //clear next tick
    this.terminated = true;

    //emit event, we are leaving
    this.emit('terminate.before', this.bequest);

    //exit
    debug('CareTaker will exit in %s, giving you a chance to clean up', this.waitBeforeExit);

    var self = this;
    this.terminateId = setTimeout(this.doTermiante.bind(this), this.waitBeforeExit);
};

CareTaker.prototype.doTermiante = function(){
    var will = this.saveWill(this.willPath, this.bequest);
    this.emit('terminate', new Error('The will before termination is:\n' + will));
};

CareTaker.prototype.saveWill = function(filepath, payload){
    filepath = this.filepathTransform(filepath);

    var data = JSON.stringify(payload, null, 4);

    debug('Saving will: \n%s', data);

    try {
        fs.writeFileSync(filepath, data);
        this.emit('savewill', {filepath: filepath, data: data});
    } catch(e){
        debug('ERROR: \n%s', e.stack);
        this.logger.error('ERROR', e.stack);
    }

    return data;
};

module.exports = CareTaker;
