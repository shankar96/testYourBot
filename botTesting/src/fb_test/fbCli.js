'use strict'
var readLine = require('readline');

const cli = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});
var colors = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    // Reverse: "\x1b[7m",
    // Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",//
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",//
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",//
    BgYellow: "\x1b[43m",//
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m",
}
var recursiveAsyncReadLine = function (question, color, cb) {
    cli.question(coloredText(question, color), function (answer) {
        cb(answer);
    });
};
function keyPressSimulate() {
    process.stdin.on('keypress', (str, key) => {
        if (key.ctrl && key.name === 'c') {
            coloredText('Process interrupeted..', colors.FgRed, colors.Reset)
        }
        // else {
        //     coloredText(`You pressed the "${str}" key`);
        //     coloredText();
        //     coloredText(key);
        //     coloredText();
        // }
    });
}
keyPressSimulate()
// process.on('SIGINT', function() {
//     coloredText('Caught interrupt signal',colors.FgRed);
//     process.exit();
// });

function clear() {
    process.stdout.write('\x1Bc');
}
var hints = {
    "welcome": "\n\t*****Welcome to CLI FLOW Generator...*****",
    "options": "*****choose options as mentioned below*****\n",
    "createNewFlow": "1. => type <1> or <createNewflow>",
    "viewAllFlowId": "2. => type <2> or <viewAllFlowId>",
    "viewFlowById": "3. => type <3> or <viewFlowById>",
    "updateFlowInfoById": "4. => type <4> or <updateFlowInfoById>",
    "deleteFlowById": "5. => type <5> or <deleteFlowById> ",
    "testFlowById": "6. => type <6> or <testFlowById>",
    "testAllFlows": "7. => type <7> or <testAllFlows>",
    "exit": "0. => type <0> or <exit>"
}

function printPretty(msg, color) {
    try {
        let str = JSON.stringify(msg, null, 2);
        console.log(color, str, colors.Reset)
    } catch (error) {
        console.log(color, msg, colors.Reset)
    }

}
function coloredText(msg, color) {
    color ? "" : color = colors.FgMagenta;
    if (typeof msg == 'object') {
        printPretty(msg, color)
    } else {
        console.log(color, msg, colors.Reset)
    }
    return '';
}
function readRequiredData(msg, color, cb) {
    recursiveAsyncReadLine(msg, color, function (answer) {
        if (answer.length > 0) {
            cb(answer)
        } else {
            coloredText("Enter the Required Information..", colors.FgYellow);
            readRequiredData(msg, color, function (answer) {
                cb(answer);
            })
        }
    })
}
function showHints() {
    coloredText('', colors.Blink)
    for (let key in hints) {
        if (key == 'exit') {
            coloredText(hints.exit, colors.FgRed);
        } else {
            coloredText(hints[key], colors.FgCyan);
        }
    }
}
let eventMessage = {
    getCustomFlowInfo: "getCustomFlowInfo",
    deletedFlow: "deletedFlow",
    loadedFlow: "loadedFlow",
    saved_activeFlow: "saved_activeFlow",
    updated_flowInfo: "updated_flowInfo",
    chat_message: "chat_message",
    initiate_new_flow: "initiate_new_flow",
    update_flowInfo: "update_flowInfo",
    save_activeFlow: "save_activeFlow",
    viewFlowById: "viewFlowById",
    deleteFlowById: "deleteFlowById",
    testFlowById: "testFlowById",
    testingInfo: "testingInfo",
    testedFlow: "testedFlow",
    new_flow_created: "new_flow_created",
    viewAllFlowId: "viewAllFlowId"
}

var activeFlowInfo = {}
var customFlowInfo = {}
module.exports = function (socket) {
    function getCustomFlowInfo() {
        postGetSocketMessage(eventMessage.getCustomFlowInfo, eventMessage.getCustomFlowInfo, {}, function (info) {
            coloredText("Custom flow Info is updated");
            customFlowInfo = info;
        })
    }
    function postGetSocketMessage(event, result, msg, cb) {
        if (msg instanceof Array) {
            if (msg.length == 1) {
                socket.emit(event, msg[0])
            } else if (msg.length == 2) {
                socket.emit(event, msg[0], msg[1])
            } else if (msg.length == 3) {
                socket.emit(event, msg[0], msg[1], msg[2])
            } else {
                coloredText("LENGTH OF MESSAGE IS MORE THAN EXPECTED", colors.FgRed)
            }
        } else {
            socket.emit(event, msg)
        }
        socket.once(result, cb)

    }

    function addMessages(flowId, senderId, pageId, appId) {
        return new Promise((resolve, reject) => {
            readRequiredData("\t Enter your message to be processed by bot or enter <exit/done>", colors.FgCyan, function (answer) {
                if (answer.toLowerCase().indexOf('exit') > -1 || answer.toLowerCase().indexOf('done') > -1) {
                    resolve(answer)
                } else {
                    try {
                        let text, type, clientMessageFormat;
                        [type, text] = answer.trim().split(":");
                        type = type.toLowerCase().trim();
                        text = text.trim();
                        clientMessageFormat = {
                            type,
                            text,
                            senderId,
                            pageId,
                            appId,
                            flowId
                        }
                        if (text.length > 0 && (type.indexOf('text') > -1 || type.indexOf('postback') > -1 || type.indexOf('quick_replies') > -1)) {
                            /**
                             let clientMessageFormat = {
                                    type: "text",
                                    text: "hi",
                                    senderId: "senderId",
                                    pageId: "pageId",
                                    appId: "appId",
                                }
            
                             */
                            postGetSocketMessage(eventMessage.chat_message, eventMessage.chat_message, clientMessageFormat, function (response) {
                                coloredText("Response from Facebook after processed by Bot", colors.FgYellow)
                                coloredText(response, colors.FgBlue);
                                addMessages(flowId, senderId, pageId, appId)
                                    .then((status) => {
                                        resolve(status)
                                    })
                            })

                        } else {
                            coloredText(clientMessageFormat, colors.FgRed)
                            coloredText("\tXXXXXX unstructured message XXXXXX", colors.FgRed);
                            addMessages(flowId, senderId, pageId, appId)
                                .then((status) => {
                                    resolve(status)
                                })
                        }
                    } catch (err) {
                        coloredText(err, colors.FgRed)
                        coloredText("\tXXXXXX unstructured message XXXXXX", colors.FgRed);
                        addMessages(flowId, senderId, pageId, appId)
                            .then((status) => {
                                resolve(status)
                            })
                    }
                }

            })
        })
    }
    function viewFlowById(flowId) {
        return new Promise((resolve, reject) => {
            // coloredText("Here is the Flow for flowId <" + flowId + ">", colors.FgCyan);
            postGetSocketMessage(eventMessage.viewFlowById, eventMessage.loadedFlow, flowId, function (info) {
                resolve(info)
            })
        })
    }
    function viewAllFlowId() {
        return new Promise((resolve, reject) => {
            coloredText("Listing below all FlowIds...", colors.FgCyan);
            postGetSocketMessage(eventMessage.viewAllFlowId, eventMessage.viewAllFlowId, {}, function (info) {
                resolve(info)
            })
        })
    }
    function saveFlow(flowId) {
        return new Promise((resolve, reject) => {
            postGetSocketMessage(eventMessage.save_activeFlow, eventMessage.saved_activeFlow, { flowId }, function (info) {
                resolve(info)
            })
        })
    }

    function getUpdateParams(params) {
        let keyWords = ["flowId", "description", "senderId", "pageId", "appId"]
        return new Promise((resolveAll, rejectAll) => {
            let keyPair = {}
            if (params.length == keyWords.length) {
                params.reduce((promiseChain, value, index) => {
                    return promiseChain.then(() => {
                        return new Promise((resolve, reject) => {
                            if (value.trim() == 0) {
                                resolve();
                                if (index == (keyWords.length - 1)) {
                                    resolveAll(keyPair);
                                }
                            } else {

                                readRequiredData("Enter " + keyWords[index], colors.FgCyan, function (answer) {
                                    keyPair[keyWords[index]] = answer;
                                    resolve();
                                    if (index + 1 == keyWords.length) {
                                        resolveAll(keyPair);
                                    }
                                })
                            }

                        })
                    })
                }, Promise.resolve())
            } else {
                rejectAll({ success: false, message: "Length mismatch of entered params..." })
            }
        })
    }
    function updateFlowInfoById(flowId) {
        return new Promise((resolve, reject) => {
            coloredText("what Info you want to update about flowId <" + flowId + "> ", colors.FgCyan);
            coloredText("\t Instructions\n\t\t pass boolen info as <flowId:description:senderId:pageId:appId>/cancel", colors.FgCyan);
            coloredText("\tExample:- <0:1:1:1:0> means you will update description,senderId and pageId", colors.FgCyan)
            recursiveAsyncReadLine("Enter bool Info", colors.FgCyan, function (answer) {
                if (answer.toLowerCase().indexOf('cancel') > -1) {
                    resolve({ success: false, message: "updateFlowInfoById cancelled.." });
                } else {
                    answer = answer.replace("<", "").replace(">", "");
                    getUpdateParams(answer.trim().split(":"))
                        .then((keyPair) => {
                            coloredText("new Flow info for flowId <" + flowId + ">", colors.FgCyan)
                            coloredText(keyPair, colors.FgYellow)
                            readRequiredData("\nconfirm to updateFlowInfoById? <y/n>", colors.FgBlue, function (confirm) {
                                if (confirm.toLowerCase().indexOf('y') > -1 || confirm.toLowerCase().indexOf('yes') > -1) {
                                    postGetSocketMessage(eventMessage.update_flowInfo, eventMessage.updated_flowInfo, [{ flowId }, keyPair], function (info) {
                                        resolve(info)
                                    })
                                } else {
                                    resolve({ success: false, message: "updateFlowInfoById cancelled.." });
                                }
                            })

                        }).catch((err) => {
                            reject(err)
                        })
                }
            })
        })
    }
    function saveViewFlowById(flowId) {
        recursiveAsyncReadLine("\t**** enter <save/view/update/discard> to save, view, update or discard the flow created with flowId <" + flowId + ">", colors.FgCyan, function (answer) {
            if (answer.toLowerCase().indexOf('save') > -1) {
                saveFlow(flowId)
                    .then((resp) => {
                        coloredText(resp, colors.FgYellow);
                        initiate();
                    }).catch((err) => {
                        coloredText(err, colors.FgRed);
                        initiate();
                    })
            } else if (answer.toLowerCase().indexOf('view') > -1) {
                viewFlowById(flowId)
                    .then((resp) => {
                        coloredText(resp, colors.FgYellow);
                        saveViewFlowById(flowId)
                    }).catch((err) => {
                        coloredText(err, colors.FgRed);
                        saveViewFlowById(flowId)
                    })
            } else if (answer.toLowerCase().indexOf('update') > -1) {
                updateFlowInfoById(flowId)
                    .then((resp) => {
                        coloredText(resp, colors.FgYellow);
                        if (resp.oldFlowId == resp.newFlowId) {
                            saveViewFlowById(resp.newFlowId)
                        } else if (resp.success == false) {
                            saveViewFlowById(flowId)
                        } else {
                            coloredText("your older flowId is <" + resp.oldFlowId + "> and newer flowId is <" + resp.newFlowId + ">\n NOTE: remember older Id to do action or delete it later after this..", colors.FgBlue);
                            saveViewFlowById(resp.newFlowId)
                        }
                    }).catch((err) => {
                        coloredText(err, colors.FgRed)
                        saveViewFlowById(flowId)
                    })
            } else if (answer.toLowerCase().indexOf('discard') > -1) {
                postGetSocketMessage(eventMessage.deleteFlowById, eventMessage.deletedFlow, { flowId }, function (info) {
                    coloredText(info, colors.FgCyan)
                    initiate()
                })

            } else {
                coloredText("\t XXXXXXXX please chhose options wisely it may tampered the generated flow", colors.FgRed)
                saveViewFlowById(flowId);
            }
        })
    }
    function createFlowInfo(cb) {
        coloredText("\n\t************ create Flow Now By passing some required Info *******", colors.FgCyan);
        readRequiredData("\t Want to use custom flow Info", colors.FgGreen, function (answer) {
            if (answer == 'y' || answer == 'yes' && customFlowInfo) {
                cb({ senderId: customFlowInfo.senderId, appId: customFlowInfo.appId, pageId: customFlowInfo.pageId })
            } else {
                readRequiredData("\t <required> what is your senderId/userId?\t", colors.FgGreen, function (senderId) {
                    readRequiredData("\t <required> what is corresponding pageId?\t", colors.FgGreen, function (pageId) {
                        readRequiredData("\t <required> what is corresponding appId?\t", colors.FgGreen, function (appId) {
                            cb({ senderId, appId, pageId })
                        })
                    })
                })
            }
        })
    }
    function createNewFlow() {
        createFlowInfo(function (flowInfo) {
            let senderId = flowInfo.senderId, pageId = flowInfo.pageId, appId = flowInfo.appId;
            coloredText("required info used", colors.FgCyan)
            coloredText(flowInfo, colors.FgGreen);
            recursiveAsyncReadLine("\t <optional> Give some name to this flowId ", colors.FgYellow, function (flowId) {
                recursiveAsyncReadLine("\t <optional> Give some description for the flow <optional>", colors.FgYellow, function (description) {
                    coloredText("\n wait a moment we are creating new Flow...", colors.FgGreen);

                    postGetSocketMessage(eventMessage.initiate_new_flow, eventMessage.new_flow_created, { senderId, pageId, appId, flowId, description }, function (info) {
                        coloredText("Congrats!! newFlow created with following Info", colors.FgCyan);
                        coloredText(info.flowInfo, colors.FgYellow);
                        coloredText("\t follow instructions to add new messages to flowId <" + info.flowInfo.flowId + ">", colors.FgCyan);
                        coloredText("\t enter <typeOfMessage>:<message>\n\ttypeOfMessage and message are required parameters", colors.FgCyan)
                        coloredText("\t\t Example => <text>:<yourmessage>", colors.FgCyan)
                        coloredText("\t\t Example => <postback>:<yourmessage>", colors.FgCyan)
                        coloredText("\t\t Example => <quick_replies>:<yourmessage>", colors.FgCyan)
                        addMessages(info.flowInfo.flowId, info.flowInfo.senderId, info.flowInfo.pageId, info.flowInfo.appId)
                            .then((status) => {
                                coloredText("\tyou have stopped adding flow in flowId <" + info.flowInfo.flowId + ">", colors.FgYellow)
                                saveViewFlowById(info.flowInfo.flowId)
                            })
                    })
                })
            })
        })


    }
    function getValidFlowId(msg, cb) {
        readRequiredData(msg, colors.FgCyan, function (answer) {
            let flowId = answer.trim();
            viewFlowById(flowId)
                .then((resp) => {
                    if (resp.success) {
                        cb(flowId)
                    } else {
                        coloredText(resp, colors.FgRed);
                        getValidFlowId(msg, function (info) {
                            cb(info)
                        })
                    }
                }).catch((err) => {
                    coloredText(err, colors.FgRed)
                    initiate()
                })
        })
    }
    function testingFlowInfo(info){
        coloredText(info,colors.FgMagenta);
    }
    function testFlowById(flowInfo, cb) {
        socket.emit(eventMessage.testFlowById, flowInfo );
        socket.once(eventMessage.testedFlow,cb)
        socket.on(eventMessage.testingInfo,testingFlowInfo);
    }
    function startClI() {
        recursiveAsyncReadLine("What you want to do?\n\t", colors.FgGreen, function (answer) {
            answer = answer.replace("<","").replace(">","");
            coloredText("Answer.." + answer, colors.FgYellow)
            if (answer.toLowerCase().indexOf('createnewflow') > -1 || answer == 1) {
                clear();
                coloredText("\t__________________createNewFlow...__________________\t" + answer, colors.FgBlue)
                createNewFlow()
            } else if (answer.toLowerCase().indexOf('viewallflowid') > -1 || answer == 2) {
                clear();
                coloredText("__________________viewAllFlowId...__________________\t" + answer, colors.FgBlue)
                viewAllFlowId()
                    .then((resp) => {
                        coloredText(resp, colors.FgCyan)
                        startClI()
                    }).catch((err) => {
                        coloredText(err, colors.FgRed)
                        startClI();
                    })
            } else if (answer.toLowerCase().indexOf('viewflowbyid') > -1 || answer == 3) {
                clear();
                coloredText("__________________viewFlowById...__________________\t" + answer, colors.FgBlue)
                getValidFlowId("\tEnter flowId whose info you want to view", function (answer) {
                    viewFlowById(answer.trim())
                        .then((resp) => {
                            coloredText(resp, colors.FgYellow);
                            startClI()
                        }).catch((err) => {
                            coloredText(err, colors.FgRed)
                            startClI()
                        })
                })
            } else if (answer.toLowerCase().indexOf('updateflowinfobyid') > -1 || answer == 4) {
                clear();
                coloredText("__________________updateFlowInfoById...__________________\t" + answer, colors.FgBlue)
                getValidFlowId("\tEnter flowId whose info you want to update", function (answer) {
                    let flowId = answer.trim();
                    updateFlowInfoById(flowId)
                        .then((resp) => {
                            coloredText(resp, colors.FgYellow);
                            if (resp.oldFlowId == resp.newFlowId) {
                                saveViewFlowById(resp.newFlowId)
                            } else {
                                coloredText("your olderFlowId " + resp.oldFlowId + " and newer is" + resp.newFlowId + "\n note down Older Id to do action over it later", colors.FgYellow);
                                saveViewFlowById(resp.newFlowId)
                            }
                        }).catch((err) => {
                            coloredText(err, colors.FgRed)
                            saveViewFlowById(flowId)
                        })
                })
            } else if (answer.toLowerCase().indexOf('deleteflowbyid') > -1 || answer == 5) {
                clear();
                coloredText("__________________deleteFlowById...__________________\t" + answer, colors.FgBlue)
                getValidFlowId("\tEnter flowId whose info you want to delete", function (answer) {
                    let flowId = answer.trim();
                    postGetSocketMessage(eventMessage.deleteFlowById, eventMessage.deletedFlow, { flowId }, function (info) {
                        coloredText(info, colors.FgCyan)
                        startClI()
                    })
                })
            } else if (answer.toLowerCase().indexOf('testFlowById') > -1 || answer == 6) {
                getValidFlowId("\tEnter the FlowId which you want to test", function (answer) {
                    let flowId = answer.trim();
                    testFlowById({flowId}, function (allTest) {
                        coloredText(allTest,colors.FgBlue)
                        socket.removeEventListener(eventMessage.testingInfo,testingFlowInfo);
                        startClI()
                    })
                })

            } else if (answer.toLowerCase().indexOf('testAllFlows') > -1 || answer == 7) {
                testFlowById({}, function (allTest) {
                    coloredText(allTest,colors.FgBlue)
                    socket.removeEventListener(eventMessage.testingInfo,testingFlowInfo);
                    startClI()
                })
            } else if (answer.toLowerCase().indexOf('exit') > -1 || answer === 0) {
                coloredText("\texiting...__________________\t" + answer, colors.FgBlue)
                process.exit();
            } else {
                clear();
                coloredText("\tXXXXXXX please choose below options.. XXXXXXXX", colors.FgRed);
                showHints()
                startClI();
            }
        })
    }
    function initiate() {
        getCustomFlowInfo();
        setTimeout(() => {
            coloredText(" Enter paramters without <> . Its just showing that the parameters are inside <>", colors.FgGreen)
            showHints()
            startClI();
        }, 3000)
    }
    setTimeout(() => {

        initiate();
    }, 10)



}