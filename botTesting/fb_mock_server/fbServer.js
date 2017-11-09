var nock = require('nock')
var appConf = require("../../conf/appconf")
var webhookUrl = appConf.webhookUrl

nock(appConf.fbUrl)
.post('/')
.reply(200,messageFromWebhook)

function messageFromWebhook(argument) {
    console.log(argument)
    return {
        
    }
}

