'use strict'
var request = require('request')
var appConf = require('../../conf/testConf')
var log = require('../utils/logger')
var clientEmitter = require('../event_handler/eventHandler')
function sendMessageToFbServer(msg, cb) {
    
    let eventName = 'fbMessage_'+msg.senderId;
    log.info('\tin fbClient Waiting for webhook Response for eventName '+eventName)
    clientEmitter.once(eventName,function(response){
        console.log("\tin fbClient We got webhook Response for eventName"+eventName)
        cb(response);
    })
    // log.info("\tin fbClient Emitting event userMessage")
    clientEmitter.emit('userMessage',msg)
    
}

module.exports = {
    sendMessageToFbServer
}