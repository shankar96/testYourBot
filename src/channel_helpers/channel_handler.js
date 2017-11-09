var fbHelper = require('./fb_helper')
function sendMessage(valueContext) {
    console.log("in sendMessage")
    if (valueContext.messageData.channel == 'facebook'){
        fbHelper.sendFBMessage(valueContext);
    }
    else{
        console.log("No such channel",valueContext.messageData.channel);
    }
}
module.exports = {
    sendMessage
}