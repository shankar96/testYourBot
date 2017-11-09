var nock = require('nock')
var appConf = require("../../conf/appconf")
var webhookUrl = appConf.webhookUrl
console.log("Mocking FB server")

nock(appConf.fbUrl)
.post('?access_token='+appConf.token,messageFromWebhook)
.reply(200,{})

function messageFromWebhook(body) {
    console.log("in messageFromWebhook",body)
    return {
        
    }
}

