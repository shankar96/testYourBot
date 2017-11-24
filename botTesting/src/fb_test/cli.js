'use strict'
var generateTestData = require('./generateTestData');
var readLine = require('readline');
var appserver = require('../../../src/webapp/app');// to start app server
var fbClient = require('../fb_client/fbClient'); // to dispatch message via fbClient
var fbServer = require('../fb_mock_server/fbServer')// to start mock server

const cli = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

var recursiveAsyncReadLine = function (question, color, cb) {
    cli.question(coloredText(question, color), function (answer) {
        cb(answer);
    });
};
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
function keyPressSimulate() {
    process.stdin.on('keypress', (str, key) => {
        if (key.ctrl && key.name === 'c') {
            coloredText('Process interrupeted..', colors.FgRed)
            console.log(colors.Reset);
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
    "exit": "0. => type <0> or <exit>"
}

// let clientMessageFormat = {
//     type: "text",
//     text: "hi",
//     senderId: "senderId",
//     pageId: "pageId",
//     appId: "appId",
// }

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
                    }
                    if (text.length > 0 && (type.indexOf('text') > -1 || type.indexOf('postback') > -1 || type.indexOf('quick_replies') > -1)) {
                        fbClient.sendMessageToFbServer(clientMessageFormat, function (response) {
                            coloredText("Response from Facebook after processed by Bot", colors.FgYellow)
                            coloredText(response, colors.FgBlue);
                            generateTestData.addToActiveFlowById(flowId, { query: { type, text }, response })
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
        coloredText("Here is the Flow for flowId <" + flowId + ">", colors.FgCyan);
        generateTestData.viewFlowById(flowId)
            .then((data) => {
                resolve(data);
            }).catch((err) => {
                resolve(err);
            })

    })
}
function viewAllFlowId() {
    return new Promise((resolve, reject) => {
        coloredText("Listing below all FlowIds...", colors.FgCyan);
        generateTestData.viewAllFlowId()
            .then((data) => {
                resolve(data)
            }).catch((err) => {
                resolve(err)
            })
    })
}
function saveFlow(flowId) {
    return new Promise((resolve, reject) => {
        generateTestData.saveActiveFlowById(flowId)
            .then((resp) => {
                resolve(resp);
            }).catch((err) => {
                reject(err);
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
                resolve({ success: true, message: "updateFlowInfoById cancelled.." });
            } else {
                getUpdateParams(answer.trim().split(":"))
                    .then((keyPair) => {
                        coloredText("new Flow info for flowId <" + flowId + ">", colors.FgCyan)
                        coloredText(keyPair, colors.FgYellow)
                        readRequiredData("\nconfirm to updateFlowInfoById? <y/n>", colors.FgBlue, function (confirm) {
                            if (confirm.toLowerCase().indexOf('y') > -1 || confirm.toLowerCase().indexOf('yes') > -1) {
                                generateTestData.updateKeyPairById(flowId, keyPair)
                                    .then((resp) => {
                                        resolve(resp)
                                    }).catch((err) => {
                                        reject(err)
                                    })
                            } else {
                                resolve({ success: true, message: "updateFlowInfoById cancelled.." });
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
                    } else {
                        coloredText("your older flowId is <" + resp.oldFlowId + "> and newer flowId is <" + resp.newFlowId + ">\n NOTE: remember older Id to do action or delete it later after this..", colors.FgBlue);
                        saveViewFlowById(resp.newFlowId)
                    }
                }).catch((err) => {
                    coloredText(err, colors.FgRed)
                    saveViewFlowById(flowId)
                })
        } else if (answer.toLowerCase().indexOf('discard') > -1) {
            generateTestData.deleteFlowById(flowId, 'fromCache')
                .then((resp) => {
                    coloredText(resp, colors.FgCyan)
                    initiate()
                }).catch((err) => {
                    coloredText(err, colors.FgRed)
                    initiate();
                })

        } else {
            coloredText("\t XXXXXXXX please chhose options wisely it may tampered the generated flow", colors.FgRed)
            saveViewFlowById(flowId);
        }
    })
}

function createNewFlow() {
    coloredText("\n\t************ create Flow Now By passing some required Info *******", colors.FgCyan);
    readRequiredData("\t <required> what is your senderId/userId?\t", colors.FgGreen, function (senderId) {
        readRequiredData("\t <required> what is corresponding pageId?\t", colors.FgGreen, function (pageId) {
            readRequiredData("\t <required> what is corresponding appId?\t", colors.FgGreen, function (appId) {
                recursiveAsyncReadLine("\t <optional> Give some name to this flowId ", colors.FgYellow, function (flowId) {
                    recursiveAsyncReadLine("\t <optional> Give some description for the flow <optional>", colors.FgYellow, function (description) {
                        coloredText("\n wait a moment we are creating new Flow...", colors.FgGreen);
                        generateTestData.createNewFlow({ senderId, pageId, appId, flowId, description })
                            .then((info) => {
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

                            }).catch((err) => {
                                coloredText(err, colors.FgRed)
                                initiate()
                            })
                    })
                })
            })
        })
    })

}
function printPretty(msg, color) {
    try {
        let str = JSON.stringify(msg, null, 2);
        console.log(color, str)
    } catch (error) {
        console.log(color, msg)
    }

}
function coloredText(msg, color) {
    color ? "" : color = colors.FgMagenta;
    if (typeof msg == 'object') {
        printPretty(msg, color)
    } else {
        console.log(color, msg)
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
    coloredText(hints.welcome, colors.FgCyan);
    coloredText(hints.options, colors.FgCyan);
    coloredText(hints.createNewFlow, colors.FgCyan);
    coloredText(hints.viewAllFlowId, colors.FgCyan);
    coloredText(hints.viewFlowById, colors.FgCyan);
    coloredText(hints.updateFlowInfoById, colors.FgCyan);
    coloredText(hints.deleteFlowById, colors.FgCyan);
    coloredText(hints.exit, colors.FgRed);
}
function startClI() {
    recursiveAsyncReadLine("What you want to do?\n\t", colors.FgGreen, function (answer) {
        coloredText("Answer.." + answer, colors.FgYellow)
        if (answer.toLowerCase().indexOf('createnewflow') > -1 || answer.toLowerCase().indexOf('1') > -1) {
            clear();
            coloredText("\t__________________createNewFlow...__________________\t" + answer, colors.FgBlue)
            createNewFlow()
        } else if (answer.toLowerCase().indexOf('viewallflowid') > -1 || answer.toLowerCase().indexOf('2') > -1) {
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
        } else if (answer.toLowerCase().indexOf('viewflowbyid') > -1 || answer.toLowerCase().indexOf('3') > -1) {
            clear();
            coloredText("__________________viewFlowById...__________________\t" + answer, colors.FgBlue)
            readRequiredData("\tEnter flowId whose info you want to view", colors.FgCyan, function (answer) {
                viewFlowById(answer.trim())
                    .then((resp) => {
                        coloredText(resp, colors.FgYellow);
                        startClI()
                    }).catch((err) => {
                        coloredText(err, colors.FgRed)
                        startClI()
                    })
            })
        } else if (answer.toLowerCase().indexOf('updateflowinfobyid') > -1 || answer.toLowerCase().indexOf('4') > -1) {
            clear();
            coloredText("__________________updateFlowInfoById...__________________\t" + answer, colors.FgBlue)
            readRequiredData("\tEnter flowId whose info you want to update", colors.FgCyan, function (answer) {
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
        } else if (answer.toLowerCase().indexOf('deleteflowbyid') > -1 || answer.toLowerCase().indexOf('5') > -1) {
            clear();
            coloredText("__________________deleteFlowById...__________________\t" + answer, colors.FgBlue)
            readRequiredData("\tEnter flowId whose info you want to delete", colors.FgCyan, function (answer) {
                let flowId = answer.trim();
                generateTestData.deleteFlowById(flowId)
                    .then((resp) => {
                        coloredText(resp, colors.FgYellow);
                        startClI()
                    }).catch((err) => {
                        coloredText(err, colors.FgRed)
                        startClI()
                    })
            })
        } else if (answer.toLowerCase().indexOf('exit') > -1 || answer.toLowerCase().indexOf('0') > -1) {
            clear();
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
    setTimeout(() => {
        coloredText(" Enter paramters without <> . Its just showing that the parameters are inside <>", colors.FgGreen)
        showHints()
        startClI();
    }, 3000)
}
setTimeout(() => {
    initiate();
},10)
