'use strict'
var request = require('request')
var appConf = require('../../conf/appconf')
var log = require('../utils/logger')
const crypto = require('crypto');
var cryptoUtil = {
    createHmacSha1Hash(secretKey, data) {
        var hashValue;
        try {
            hashValue = crypto.createHmac('sha1', secretKey)
                .update(data)
                .digest('hex');
        } catch (err) {
            log.error(err);
        }
        return hashValue;
    }
}
function verifyRequestSignature(signatureHeader, appSecret, requestBody) {
    log.info('start of verifyRequestSignature')
    return new Promise(
        function (resolve, reject) {
            try {
                if (signatureHeader && appSecret && requestBody) {
                    var elements = signatureHeader.split('=')
                    var signatureHash = elements[1]
                    var calculatedHash = cryptoUtil.createHmacSha1Hash(appSecret, requestBody)
                    if (signatureHash !== calculatedHash) {
                        log.info("Couldn't validate the request signature as singature hash and calculated hash are not matching")
                        reject(new Error("Couldn't validate the request signature."))
                    } else {
                        log.info('valid request signature')
                        resolve('Valid Signature')
                    }
                } else {
                    log.info("Couldn't validate the request signature as some fileds are missing", signatureHeader, appSecret, requestBody)
                    reject(new Error("Couldn't validate the request signature."))
                }
            } catch (err) {
                log.info("Couldn't validate the request signature.")
                reject(err)
            }
        })
}

function parseIncomingMessage(req) {
    log.info('start of parsing incoming request', JSON.stringify(req.body))
    try {
        let data, valueContext
        data = JSON.parse(JSON.stringify(req.body))
        valueContext = []
        if (data.entry) {
            let entries = data.entry
            entries.forEach((entry) => {
                let messagingEvents = entry.messaging
                if (messagingEvents) {
                    messagingEvents.forEach((event) => {
                        if ((event.message && !event.message.is_echo) || (event.postback && event.postback.payload) || (event.account_linking && event.account_linking.status === 'linked')) {
                            let sender = event.sender.id.toString()
                            let pageId = event.recipient.id.toString()
                            let text
                            if (event.message) {
                                text = event.message.text
                            } else if (event.postback) {
                                text = event.postback.payload
                            } else {
                                // this is to notify user about the features we support for the first time
                                text = '  Hi'
                            }
                            let messageData = {
                                'user': sender,
                                'organization': pageId,
                                'query': text.toLowerCase(),
                                'channel': 'facebook'
                            }
                            if (event.postback) {
                                messageData.type = 'postback'
                            }
                            let valueContextElem = {
                                'messageData': messageData,
                                'appId': req.params['appId']
                            }
                            log.info(valueContextElem, text, sender)
                            valueContext.push(valueContextElem)
                        }
                    })
                }
            })
        }
        return valueContext
    } catch (err) {
        log.error('error while parsing incoming request', err)
    }
}

function sendFBMessage(messageData) {
    log.info('start of sendFBMessage', messageData)
    let user, organization, response, messageArray, valueContext
    user = messageData.user
    organization = messageData.organization
    response = messageData.response

    messageArray = typeof (response) === 'string' ? [{
        'text': response
    }] : response
    valueContext = {
        'messageData': messageData
    }
    // log.info(response, messageArray)
    messageArray.forEach(function (message) {
        request({
            url: appConf.fbUrl,
            qs: {
                access_token: appConf.token
            },
            method: 'POST',
            json: {
                recipient: {
                    id: user
                },
                message: message
            }
        }, (error, response, body) => {
            if (error) {
                log.error(valueContext, 'Error while sending FB message request', error)
            } else {
                log.info(valueContext, body, "Successfully sent message '%s' to user", JSON.stringify(message))
            }
        })
    })

}

module.exports = {
    parseIncomingMessage,
    sendFBMessage,
    verifyRequestSignature
}