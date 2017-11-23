var activeFlow;
function hideFlowWindow() {
    $('.chat-window-container').hide();
}
function showFlowWindow(type) {
    if (type === 'clickedCreateNewFlow') {
        $('.chat-window-container').show();
        hideChatWindow(type);
        showInnerHint();
        hideOuterHint()
    } else {
        $('.chat-window-container').show();
    }
}
function disableFlowInfo() {
    $('.inputSenderId').prop('disabled', true);
    $('.inputPageId').prop('disabled', true)
    $('.inputAppId').prop('disabled', true)
    $('.inputFlowId').prop('disabled', true)
    $('.inputFlowDescription').prop('disabled', true)
}
function enableFlowInfo() {
    $('.inputSenderId').prop('disabled', false);
    $('.inputPageId').prop('disabled', false)
    $('.inputAppId').prop('disabled', false)
    $('.inputFlowId').prop('disabled', false)
    $('.inputFlowDescription').prop('disabled', false)
}

function showChatWindow() {
    $('.frame').show()
}
function hideChatWindow(type) {
    if (type == 'clickedCreateNewFlow') {
        $('.frame').hide()
    }
}
function disableInput() {
    $('.message-input').prop('disabled', true)
    $('.message-input').prop('placeholder', "processing...")
}
function enableInput() {
    $('.message-input').prop('disabled', false)
    $('.message-input').prop('placeholder', "Type your message...")
}
function hideOuterHint() {
    $('.outer-hint').hide()
}
function showOuterHint() {
    $('.outer-hint').show()
}
function hideInnerHint() {
    $('.inner-hint').hide()
}
function showInnerHint() {
    $('.inner-hint').show()
}
function validateFlowInfo() {
    var senderId = $('.inputSenderId').prop('value'),
        pageId = $('.inputPageId').prop('value'),
        appId = $('.inputAppId').prop('value'),
        flowId = $('.inputFlowId').prop('value'),
        description = $('.inputFlowDescription').prop('value'),
        isValid = true,
        help = "";

    if (!senderId) {
        isValid = false;
        help = help + "senderId, "
        $('.validSenderId').css('color', "red")
    } else {
        $('.validSenderId').css('color', "green")
    }
    if (!pageId) {
        isValid = false;
        $('.validPageId').css('color', "red")
        help = help + "pageId, "
    } else {
        $('.validPageId').css('color', "green")
    }
    if (!appId) {
        isValid = false;
        $('.validAppId').css('color', "red")
        help = help + "appId, "
    } else {
        $('.validAppId').css('color', "green")
    }
    if (!flowId) {
        $('.validFlowId').css('color', "yellow")
    } else {
        $('.validFlowId').css('color', "green")
    }
    if (!description) {
        $('.validFlowDescription').css('color', "yellow")
    } else {
        $('.validFlowDescription').css('color', "green")
    }
    console.log(senderId, pageId, appId, description, flowId, help);
    if (isValid) {
        console.log("validated...")
        //disable buttons flowIds create etc..
        $('.edit_update_flowInfo').prop('disabled', true);
        disableFlowInfo();


        // show hint fetching
        $('.inner-hint-message').prop('innerText', "We are creating new flow as mentioned above...");
        $('.inner-hint-message').css('color', 'green')
        return { senderId, pageId, appId, description, flowId,valid:true}
    } else {
        // alert("Please set the required field => "+help);
        $('.inner-hint-message').prop('innerText', "Please set the required field => " + help);
        $('.inner-hint-message').css('color', 'red')
        return { valid:false }
    }
    
}
function edit_update_flowInfo() {
    if ($('.edit_update_flowInfo').prop('title') == 'create') {
        var validInfo = validateFlowInfo();
        if(validInfo.valid){
            delete validInfo.valid;
            createNewFlow(validInfo)
        }
    } else if ($('.edit_update_flowInfo').prop('title') == 'edit') {//edit
        console.log("Editing...")
        $('.edit_update_flowInfo').prop('disabled', false);
        $('.edit_update_flowInfo').prop('innerText', 'update details »');
        $('.edit_update_flowInfo').prop('title', "update");
        enableFlowInfo()
        //disable input messaging till it get updated
        disableInput();
    } else if ($('.edit_update_flowInfo').prop('title') == 'update') {
        var validInfo = validateFlowInfo();
        if(validInfo.valid){
            delete validInfo.valid;
            updateFlowInfo(validInfo,activeFlow);
        }
    }
}
function clickedCreateNewFlow() {
    if (activeFlow) {
        //warn want to delete?
        console.log('activeFlow going on',activeFlow)
    } else {
        //show chat set conf
        showFlowWindow('clickedCreateNewFlow');
        $('.edit_update_flowInfo').prop('disabled', false);
        $('.edit_update_flowInfo').prop('innerText', 'Create Flow Details »');
        $('.edit_update_flowInfo').prop('title', "create");

    }
}
function updateFlowInfo(newFlowInfo,oldFlowInfo){
    socket.emit('update_flowInfo',oldFlowInfo,newFlowInfo);
}
function createNewFlow(flowInfo) {
    socket.emit('initiate_new_flow', flowInfo);
}
function saveRespondedFlowInfo(flowInfo){
    $('.inputSenderId').prop('value',flowInfo.senderId);
    $('.inputPageId').prop('value',flowInfo.pageId);
    $('.inputAppId').prop('value',flowInfo.appId);
    $('.inputFlowId').prop('value',flowInfo.flowId);
    $('.inputFlowDescription').prop('value',flowInfo.description)
}
function newFlowCreated(flowInfo) {
    activeFlow = flowInfo
    // showchat
    saveRespondedFlowInfo(flowInfo);
    enableInput();// enable typing
    // enable editing of flow info
    $('.edit_update_flowInfo').prop('disabled', false);
    $('.edit_update_flowInfo').prop('innerText', 'Edit details »');
    $('.edit_update_flowInfo').prop('title', "edit");
    showChatWindow();
    hideInnerHint();
}
function updatedFlowInfo(flowInfo){
    activeFlow = flowInfo
    saveRespondedFlowInfo(flowInfo);
    enableInput();// enable typing
    //enable editing of flow info
    $('.edit_update_flowInfo').prop('disabled', false);
    $('.edit_update_flowInfo').prop('innerText', 'Edit details »');
    $('.edit_update_flowInfo').prop('title', "edit");
}
function viewFlowById(flowId) {
    //ajax call to fetch flowInfo
    //get and replace all chats
    //editable flowInfo
}
function reload() {
    if (activeFlow) {
        //warn
        console.log('activeFlow going on',activeFlow)
    } else {
        location.reload()
    }
}
var socket;
$(window).load(function () {
    socket = io();
    socket.on('chat_message', function (msg) {
        console.log("received Message", msg);
        receivedMessageFromServer(msg)

    });
    socket.on('new_flow_created', function (flowInfo) {
        newFlowCreated(flowInfo)
    })
    socket.on('updated_flowInfo',function(flowInfo){
        updatedFlowInfo(flowInfo)
    })
    hideFlowWindow();
});
function sendMessageToServer(msg) {
    console.log("sending message", msg)
    socket.emit('chat_message', msg);
}
function receivedMessageFromServer(msg) {

    updateReplyMessage(msg)
}
