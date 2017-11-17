'use strict'
var log = require('../utils/logger')
var fbHelper = require('./fb_helper')
function sendMessage(valueContext) {
    log.info("in sendMessage")
    if (valueContext.messageData.channel == 'facebook'){
        fbHelper.sendFBMessage(valueContext.messageData);
    }
    else{
        log.info("No such channel",valueContext.messageData.channel);
    }
}
module.exports = {
    sendMessage
}