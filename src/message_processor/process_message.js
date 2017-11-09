'use strict'
var channelHandler = require('../channel_helpers/channel_handler')
function processMessage(valueContext){
    console.log("in processMessage")
    valueContext.messageData.response = 'bot:- '+valueContext.messageData.query;
    channelHandler.sendMessage(valueContext);
}

module.exports={
    processMessage
}