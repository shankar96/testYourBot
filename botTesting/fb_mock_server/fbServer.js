'use strict'
var nock = require('nock')
var appConf = require('../conf/testConf')
var log = require('../utils/logger')
var request = require('request')
var webhookUrl = appConf.webhookUrl
var messageFormat = require('./messageFormat')
var serverEmitter = require('../event_handler/eventHandler')
var crypto = require('crypto');
var Promise = require('bluebird');
log.info('Mocking FB server')

function nockServer() { }
//receive messages from webhooks
var scope = nock('https://graph.facebook.com/')
    .persist()
    .filteringRequestBody(function (body) {
        body = JSON.parse(body);
        // console.log("body",body,body.recipient)
        serverEmitter.emit('webhookMessage', body);
        // console.log(scope) 
        // // scope.intercept
        // // scope.done()
        // nock.cleanAll()
        return '*';
    })
    .post('/v2.6/me/messages')
    .reply(200)
// .log(console.log);
// }
// nock.recorder.rec();
function handleError() {
    console.log('uncaughtException', arguments)
}
process.on('uncaughtException', handleError)
process.on('unhandledRejection', handleError)
var queueMessages = {

}
var timerIds = {

}
setInterval(() => {
    if (nock.pendingMocks().length > 0) {
        // log.info("\nIn ", queueMessages, nock.pendingMocks());
        // nock.cleanAll();
    }
}, 1000)
serverEmitter.on('webhookMessage', messageFromWebhook)
function triggerMessageEvent(eventName) {
    let senderId = eventName.split('_')[1];
    let body = queueMessages[senderId]
    clearTimeout(timerIds[senderId]);
    timerIds[senderId] = setTimeout(() => {
        log.info("\tin fbServer after userMessage Emitting event " + eventName)
        serverEmitter.emit(eventName, body);
        delete queueMessages[senderId];
        delete timerIds[senderId]
    }, 100)
    // log.info("In trigger", queueMessages[senderId],nock.pendingMocks())

}
serverEmitter.on('triggerMessageEvent', triggerMessageEvent)
function messageFromWebhook(body) {
    //deliver to client using eventEmitter
    // log.info('in messageFromWebhook', body)
    let senderId = body.recipient.id;
    let eventName = 'fbMessage_' + senderId;
    // log.info("in fbServer Emitting event "+eventName);
    queueMessages[senderId].push(body)

    serverEmitter.emit('triggerMessageEvent', eventName)
    // console.log("queMessages", queueMessages, new Date().getTime())
}

serverEmitter.on('userMessage', messageFromUser)
function messageFromUser(body) {
    let senderId = body.senderId;
    queueMessages[senderId] = [];
    // log.info('\tin fbServer ok emitted event userMessage',"ohh");
    // let eventName = 'fbMessage_'+body.senderId;
    // log.info("in fbServer after userMessage Emitting event "+eventName)
    // serverEmitter.emit(eventName,"{response}");
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
        resolve('mySecretKey')//fetch from dbHelper or need to set in config
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
                    log.info("Error in sendMessageToWebhook", err)
                } else {

                }
                // console.log("body in sendMessageToWebhook ",body);
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
        log.info("Invalid Message from fbClient");
        let eventName = 'fbMessage_' + msg.senderId;
        serverEmitter.emit(eventName, { "err": "Invalid Message from fbClient" });
    }
}