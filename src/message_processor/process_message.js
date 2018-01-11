'use strict'
var log = require('../utils/logger')
var channelHandler = require('../channel_helpers/channel_handler')
var nlpHandler = require('../nlp_helpers/nlp_handler')
function processMessage(valueContext) {
    log.info("in processMessage",valueContext)
    // if (valueContext.messageData.query == 'multiple_message') {
    //     valueContext.messageData.response=[
    //         {
    //             "text":"message1"
    //         },{
    //             "text":"message2"
    //         }
    //     ];
    //     channelHandler.sendMessage(valueContext);
    // } else {
    //     valueContext.messageData.response = "bot:-" + valueContext.messageData.query;
    //     channelHandler.sendMessage(valueContext);
    // }
    setTimeout(() => {
        nlpHandler.sendToDialogFlow(valueContext)
            .then(channelHandler.sendMessage)
            .catch((err) => {
                log.info("Error in Nlp", err);
                valueContext.messageData.response = "Error in Processing Your Request :- " + valueContext.messageData.query
                channelHandler.sendMessage(valueContext)
            })
    }, 0)

}

module.exports = {
    processMessage
}