var generateFbTestData = require('../../fb_test/generateTestData');
var appServer = require('../../../../src/webapp/app');
var Promise = require('bluebird');
var fbClient = require('../../fb_client/fbClient')
var log = require('../../utils/logger');
function processMessageRequest(socket, flowMessage) {
    let clientMessageFormat = {
        type: flowMessage.type,
        text: flowMessage.text,
        senderId: flowMessage.senderId,
        pageId: flowMessage.pageId,
        appId: flowMessage.appId
    }
    fbClient.sendMessageToFbServer(clientMessageFormat, function (response) {
        log.info("Response from Facebook after processed by Bot", response)
        generateFbTestData.addToActiveFlowById(flowMessage.flowId, {
            query: {
                type: flowMessage.type,
                text: flowMessage.text
            },
            response
        });
        socket.emit('chat_message', response)
    })
}
function updateFlowInfo(socket,oldFlowInfo,newFlowInfo){
    let keyPair = {};
    for(key in newFlowInfo){
        if(newFlowInfo[key]!=oldFlowInfo[key]){
            keyPair[key] = newFlowInfo[key];
        }
    }
    generateFbTestData.updateKeyPairById(oldFlowInfo.flowId,keyPair)
    .then((info)=>{
        log.info(info)
        socket.emit('updated_flowInfo',info)
    })
}
function saveActiveFlow(socket,flowInfo){
    console.log('saveActiveFlow',flowInfo)
    generateFbTestData.saveActiveFlowById(flowInfo.flowId)
    .then((info)=>{
        socket.emit('saved_activeFlow',info)
    })
}
function loadFlowById(socket,flowId){
    generateFbTestData.viewFlowById(flowId)
    .then((info)=>{
        socket.emit('loadedFlow',info)
    })
}
module.exports = function (io) {
    io.on('connection', function (socket) {
        log.info('a new user connected');
        socket.on('disconnect', function (socket) {
            log.info('user disconnected');
        });
        socket.on('chat_message', function (flowMessage) {
            log.info('message: ', flowMessage);
            processMessageRequest(socket, flowMessage)
        });
        socket.on('initiate_new_flow', function (flowInfo) {
            log.info('message: ', flowInfo);
            generateFbTestData.createNewFlow(flowInfo)
                .then((info) => {
                    socket.emit('new_flow_created', info)
                })
        });
        socket.on('update_flowInfo', function (oldFlowInfo, newFlowInfo) {
            log.info('message: ', oldFlowInfo, newFlowInfo);
            updateFlowInfo(socket,oldFlowInfo,newFlowInfo)
        })
        socket.on('save_activeFlow', function (flowInfo) {
            log.info('message: ', flowInfo);
            saveActiveFlow(socket,flowInfo)
        })
        socket.on('viewFlowById',function(flowId){
            log.info('viewFlowById',flowId);
            loadFlowById(socket,flowId)
        })
        //require test module 
    });

}