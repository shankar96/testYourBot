'use strict'
var fbHelper = require('./fb_helper')
function sendMessage(valueContext) {
    console.log("in sendMessage")
    if (valueContext.messageData.channel == 'facebook'){
        fbHelper.sendFBMessage(valueContext.messageData);
    }
    else{
        console.log("No such channel",valueContext.messageData.channel);
    }
}
module.exports = {
    sendMessage
}