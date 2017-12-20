'use strict'
var nock = require('nock')
var appConf = require('../../conf/testConf')
var log = require('../utils/logger')
var request = require('request')
var webhookUrl = appConf.webhookUrl
var messageFormat = require('./messageFormat')
var serverEmitter = require('../event_handler/eventHandler')
var crypto = require('crypto');
var Promise = require('bluebird');
log.info('Mocking FB server')

//receive messages from webhooks
var scope = nock(appConf.fbUrl)
    .persist()
    .filteringRequestBody(function (body) {
        body = JSON.parse(body);
        serverEmitter.emit('webhookMessage', body);
        return '*';
    })
    .post(appConf.fbMessageEndPoint)
    .query(function(){return true;})
    .reply(200)
    // .log(console.log);
function handleError() {
    log.error('uncaughtException', arguments)
}
process.on('uncaughtException', handleError)
process.on('unhandledRejection', handleError)
/**
 * queuing webhook responses for each user
 */
var queueMessages = {}
var timerIds = {}
serverEmitter.on('webhookMessage', messageFromWebhook)
function triggerMessageEvent(eventName) {
    let senderId = eventName.split('_')[1];
    let body = queueMessages[senderId]
    clearTimeout(timerIds[senderId]);
    timerIds[senderId] = setTimeout(() => {
        // log.info("\tin fbServer after webhook Response Message Emitting event " + eventName)
        serverEmitter.emit(eventName, body);
        delete queueMessages[senderId];
        delete timerIds[senderId]
    }, 100)
}
serverEmitter.on('triggerMessageEvent', triggerMessageEvent)
function messageFromWebhook(body) {
    //queMessages webhook responses to deliver to client at once (easier for testing all responses for a query at once)
    let senderId = body.recipient.id;
    let eventName = 'fbMessage_' + senderId;
    if(queueMessages[senderId]) {
      queueMessages[senderId].push(body)
      // console.log("messageFromWebhook"+new Date().getTime(),body, queueMessages)
      serverEmitter.emit('triggerMessageEvent', eventName)
    }else{
      log.error("No queue in messageFromWebhook", body, queueMessages)
    }
}

serverEmitter.on('userMessage', messageFromUser)
function messageFromUser(body) {
    let senderId = body.senderId;
    queueMessages[senderId] = [];
    // log.info('\tin fbServer messageFromUser'+new Date().getTime(),queueMessages[senderId]);
    //send to webhook Api
    buildStructuredMessage(body);

}
/**
 msg={
     type:"postback/quick_replies/text",
     text:"",
     senderId:"",
     pageId:"",
     appId:"",
 }
 */
/**
 
 */
function generate_X_Hub_Signature(algorithm, secret, buffer) {
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(buffer, 'utf-8');
    return algorithm + '=' + hmac.digest('hex');

}
function getAppSecretByAppId(appId) {
    return new Promise((resolve, reject) => {
        let secretKey = appConf.fbSecretKeyByAppId[appId]
        if(secretKey){
            resolve(secretKey)
        }else{
            resolve('mySecretKey')//fetch from dbHelper or need to set in config
        }
    })
}
function sendMessageToWebhook(structuredMessage, appId) {
    getAppSecretByAppId(appId)
        .then((appSecret) => {
            let options = {
                url: webhookUrl.replace(':appId', appId),
                method: "POST",
                headers: {
                    'x-hub-signature': generate_X_Hub_Signature('sha1', appSecret, new Buffer(JSON.stringify(structuredMessage)))
                },
                json: structuredMessage
            }
            request(options, function (err, resp, body) {
                if (err) {
                    log.error("Error in sendMessageToWebhook", err)
                }
            })
        })

}
function buildStructuredMessage(msg) {
    //format Message as send by fb
    let structuredMessage = {}
    if (msg.type == "postback") {
        structuredMessage = messageFormat.postbackMessage

        structuredMessage.entry[0].id = msg.pageId
        structuredMessage.entry[0].time = new Date().getTime()
        structuredMessage.entry[0].messaging[0].recipient.id = msg.pageId
        structuredMessage.entry[0].messaging[0].sender.id = msg.senderId
        structuredMessage.entry[0].messaging[0].timestamp = new Date().getTime()
        structuredMessage.entry[0].messaging[0].postback.payload = msg.text
        structuredMessage.entry[0].messaging[0].postback.title = "Payload Title"
        sendMessageToWebhook(structuredMessage, msg.appId);
    } else if (msg.type == "quick_replies") {
        structuredMessage = messageFormat.quickReplyMessage

        structuredMessage.entry[0].id = msg.pageId
        structuredMessage.entry[0].time = new Date().getTime()
        structuredMessage.entry[0].messaging[0].recipient.id = msg.pageId
        structuredMessage.entry[0].messaging[0].sender.id = msg.senderId
        structuredMessage.entry[0].messaging[0].timestamp = new Date().getTime()
        structuredMessage.entry[0].messaging[0].message.text = "Quick Replies Title"
        structuredMessage.entry[0].messaging[0].message.quick_reply.payload = msg.text
        sendMessageToWebhook(structuredMessage, msg.appId);
    } else if (msg.type == "text") {
        structuredMessage = messageFormat.textMessage

        structuredMessage.entry[0].id = msg.pageId
        structuredMessage.entry[0].time = new Date().getTime()
        structuredMessage.entry[0].messaging[0].recipient.id = msg.pageId
        structuredMessage.entry[0].messaging[0].sender.id = msg.senderId
        structuredMessage.entry[0].messaging[0].timestamp = new Date().getTime()
        structuredMessage.entry[0].messaging[0].message.text = msg.text
        sendMessageToWebhook(structuredMessage, msg.appId);
    } else {
        log.error("Invalid Message from fbClient");
        let eventName = 'fbMessage_' + msg.senderId;
        serverEmitter.emit(eventName, { "err": "Invalid Message from fbClient" });
    }
}