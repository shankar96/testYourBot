var Promise = require('bluebird')
var appConf = require('../../conf/appconf')
var log = require('../utils/logger')
var request = require('request')
function sendToDialogFlow(valueContext) {
    return new Promise(function (resolve, reject) {
        try {
            var messageData = valueContext.messageData;
            var userQuery = messageData.query;
            var organization = messageData.organization;
            var user = messageData.user;
            // log.info('in sendToDialogFlow', valueContext);
            var options = {
                "url": appConf.dialogflowUrl,
                "json": {
                    "query": userQuery,
                    "lang": 'en',
                    "sessionId": user
                },
                "headers": {
                    "Authorization": "Bearer " + appConf.dialogflowToken,
                    "Content-Type": "application/json"
                }
            };
            request.post(options, function (err, response, body) {
                if (err) {
                    valueContext.err = err;
                    // log.info("api ai request failed", valueContext);
                    reject(err);
                } else {
                    body.sessionId = user;
                    if (response.statusCode == 200) {
                        // log.info(valueContext, 'response from api ai', body);
                        let actionData = {
                            'action': body.result.action,
                            'parameters': body.result.parameters,
                            'respText': body.result.fulfillment.speech
                        };
                        valueContext.messageData.response = actionData.respText
                        resolve(valueContext);
                    } else {
                        valueContext.err = err;
                        // log.error(valueContext, "api ai request status type is error", response);
                        reject(body);
                    }
                }
            });
        } catch (err) {
            valueContext.err = err;
            // log.error(valueContext, 'Exception occured while sending text to api ai');
            reject(err);
        }
    });
}

module.exports={
    sendToDialogFlow
}