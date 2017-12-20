var activeFlow = {};
var customFlowInfo = {};
function hideFlowWindow() {
    $('.chat-window-container').hide();
}
function showFlowWindow(type) {
    if (type === 'createNewFlow') {
        $('.chat-window-container').show();
        hideChatWindow(type);
        showInnerHint({ innerText: 'you are about to create new testFlow. <br/>Before adding a Flow please fill up the required data' });
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
    if (type == 'createNewFlow') {
        $('.frame').hide()
    }else{
         $('.frame').hide()
    }
}
function disableInput() {
    alertInfo("Info!","Your message is processing now...")
    $('.message-input').prop('disabled', true)
    $('.message-input').prop('placeholder', "processing...")
}
function enableInput() {
    alertInfo("Info!","Type your message now...")
    $('.message-input').prop('disabled', false)
    $('.message-input').focus()
    $('.message-input').prop('placeholder', "Type your message...")
}
function hideOuterHint() {
    $('.outer-hint').hide()
}
function showOuterHint(info = {}) {
    $('.outer-hint').show()
    if (info.innerHTML) {
        $('.outer-hint-message').prop('innerHTML', info.innerHTML);
    }
    if (info.color) {
        $('.outer-hint-message').css('color', info.color);
    }
}
function hideInnerHint() {
    $('.inner-hint').hide()
}
function showInnerHint(info = {}) {
    $('.inner-hint').show()
    if (info.innerHTML) {
        $('.inner-hint-message').prop('innerHTML', info.innerHTML);
    }
    if (info.color) {
        $('.inner-hint-message').css('color', info.color);
    }
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

        return { senderId, pageId, appId, description, flowId, valid: true }
    } else {
        // alert("Please set the required field => "+help);
        alertWarning("Warning","Please set the required field => " + help)
        showInnerHint({ innerHTML: "Please set the required field => " + help, color: 'red' })
        return { valid: false }
    }

}
function edit_update_flowInfo() {
    if ($('.edit_update_flowInfo').prop('title') == 'create') {
        var validInfo = validateFlowInfo();
        if (validInfo.valid) {
            delete validInfo.valid;
            // show hint fetching
            showInnerHint({ innerHTML: 'We are creating new flow as mentioned above...', color: 'green' })
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
        if (validInfo.valid) {
            delete validInfo.valid;
            updateFlowInfo(validInfo, activeFlow);
        }
    }
}
function create_save_flow() {
    if (Object.keys(activeFlow).length > 0) {

        console.log('activeFlow going on', activeFlow);
        if ($('.create_save_flow').prop('title') == 'saveActiveFlow') {
            socket.emit('save_activeFlow', activeFlow);
        } else {
          alertWarning("Warning!","An active flow is going on reset/reload to create new flow")
        }
    } else {
        //show chat set conf
        enableFlowInfo()
        console.log("creating new flow...")
        alertSuccess("Success!","add flow Details and create a flow ")
        setCustomFlowInfo();
        showFlowWindow($('.create_save_flow').prop('title'));
        $('.edit_update_flowInfo').prop('disabled', false);
        $('.edit_update_flowInfo').prop('innerText', 'Create Flow Details »');
        $('.edit_update_flowInfo').prop('title', "create");
        //hint
        showInnerHint({ innerHTML: "you are about to create new testFlow.<br/>Before adding a Flow please fill up the required data", color: "black" })
    }
}
function updateFlowInfo(newFlowInfo, oldFlowInfo) {
    socket.emit('update_flowInfo', oldFlowInfo, newFlowInfo);
}
function createNewFlow(flowInfo) {
    socket.emit('initiate_new_flow', flowInfo);
}
function saveRespondedFlowInfo(flowInfo) {
    $('.inputSenderId').prop('value', flowInfo.senderId);
    $('.inputPageId').prop('value', flowInfo.pageId);
    $('.inputAppId').prop('value', flowInfo.appId);
    $('.inputFlowId').prop('value', flowInfo.flowId);
    $('.inputFlowDescription').prop('value', flowInfo.description)
}
function newFlowCreated(info) {

    if (info.success == true) {
        $('.message-box').show();
        activeFlow = info.flowInfo
        // showchat
        saveRespondedFlowInfo(info.flowInfo);
        enableInput();// enable typing
        // enable editing of flow info
        $('.edit_update_flowInfo').prop('disabled', false);
        $('.edit_update_flowInfo').prop('innerText', 'Edit details »');
        $('.edit_update_flowInfo').prop('title', "edit");
        //create button to save
        $('.create_save_flow').prop('title', 'saveActiveFlow');
        $('.create_save_flow').prop('innerText', 'save Active Flow »');
        showChatWindow();
        hideInnerHint();
    } else {

    }
}
function updatedFlowInfo(updatedInfo) {
    console.log(updatedInfo)
    if (updatedInfo.success == true) {
        for (key in updatedInfo.keyPair) {
            activeFlow[key] = updatedInfo.keyPair[key]
        }
        saveRespondedFlowInfo(activeFlow);
        enableInput();// enable typing
        //enable editing of flow info
        $('.edit_update_flowInfo').prop('disabled', false);
        $('.edit_update_flowInfo').prop('innerText', 'Edit details »');
        $('.edit_update_flowInfo').prop('title', "edit");
        //create button to save
        $('.create_save_flow').prop('title', 'saveActiveFlow');
        $('.create_save_flow').prop('innerText', 'save Active Flow »');
    } else {
        saveRespondedFlowInfo(activeFlow);
        enableInput();// enable typing
        //enable editing of flow info
        $('.edit_update_flowInfo').prop('disabled', false);
        $('.edit_update_flowInfo').prop('innerText', 'Edit details »');
        $('.edit_update_flowInfo').prop('title', "edit");
        //create button to save
        $('.create_save_flow').prop('title', 'saveActiveFlow');
        $('.create_save_flow').prop('innerText', 'save Active Flow »');
        console.log("some Error", updatedInfo)
    }
}
function resetFlowInfo() {
    // reinitialize active flow
    activeFlow = {};
    $('.inputSenderId').prop('value', '');
    $('.inputPageId').prop('value', '');
    $('.inputAppId').prop('value', '');
    $('.inputFlowId').prop('value', '');
    $('.inputFlowDescription').prop('value', '')
    $('#mCSB_1_container').empty();
    $('.validSenderId').css('color', 'rgb(0, 0, 0)');
    $('.validpageId').css('color', 'rgb(0, 0, 0)');
    $('.validAppId').css('color', 'rgb(0, 0, 0)')
    $('.validFlowId').css('color', 'rgb(0, 0, 0)')
    $('.validFlowDescription').css('color', 'rgb(0, 0, 0)')
}
function savedActiveFlow(savedInfo) {
    console.log(savedInfo);
    if (savedInfo.success == true) {
        hideFlowWindow()
        resetFlowInfo();
        showOuterHint({ innerHTML: "successfully saved..." });
        enableFlowInfo()
        //delete all messages
        //button to create new flow
        $('.create_save_flow').prop('title', 'createNewFlow');
        $('.create_save_flow').prop('innerText', 'Create New Flow »');
    } else {

    }
}
function viewFlowById(flowId) {
    resetFlowInfo();
    showOuterHint({ innerHTML: "Please wait...  <br/> We are fetching the details of " + flowId, color: "green" })
    socket.emit('viewFlowById', flowId);
}
function loadedFlowInfoById(flowInfo) {
    console.log('loadedFlowInfoById',flowInfo)
    if (flowInfo.success == true) {
        hideOuterHint();
        hideInnerHint();
        $('.message-box').hide()
        //update flowInfo
        activeFlow = {
            flowId: flowInfo.flow.flowId,
            appId: flowInfo.flow.appId,
            pageId: flowInfo.flow.pageId,
            description: flowInfo.flow.description,
            senderId: flowInfo.flow.senderId
        }
        showFlowWindow();
        showChatWindow();
        saveRespondedFlowInfo(activeFlow);
        loadChatWindowWithMessages(flowInfo.flow.flow)
        disableFlowInfo()
        $('.edit_update_flowInfo').prop('disabled', false);
        $('.edit_update_flowInfo').prop('innerText', 'Edit Flow Details »');
        $('.edit_update_flowInfo').prop('title', "edit");

    } else if(flowInfo.err=='404'){
        showOuterHint({ innerHTML: flowInfo.message, color: 'red' });
        setTimeout(()=>{
            reset();
        },2000)
    } else {
        showOuterHint({ innerHTML: flowInfo.message, color: 'red' })
    }
}
function deletedFlow(info){
    console.log(info);
    alertSuccess("Success!","successFully deleted flow")
    showOuterHint({innerHTML:info.message+"<br/> Refresh Now.."})
    setTimeout(()=>{
        reset();
    },2000);
}
function deleteActiveFlow(){
    if (Object.keys(activeFlow).length > 0) {
        console.log('activeFlow going on', activeFlow);
        alertDanger("Danger!","Deleting flowId"+activeFlow.flowId)
        socket.emit("deleteFlowById",activeFlow);
        hideFlowWindow();
        showOuterHint({innerHTML:"deleting flowId => "+activeFlow.flowId})
        resetFlowInfo();
        
    } else {
        console.log("No active Flow to delete")
    }
}
function testedFlow(info) {
  console.log("testedFlow",info);
  var pass = 0;
  var failed = 0;
  for(let key in info){
    if(info[key].state === 'passed'){
      pass++;
    }else{
      failed++;
    }
  }
  alertInfo("Info!","<span>Total messages tested => "+Object.keys(info).length+"</span><br/><span style='color: green;'> Passed Test "+pass+"</span><br/><span style='color: red'>  failed test "+failed+"</span>")
}

function testingInfo(info) {
  console.log("testingInfo",info);
  let title = ""
  if(info.state === 'passed'){
    title = '<p style="color:green">'+info.title.replace("<","&lt;").replace(">","&gt;")+' </p>'
    alertSuccess("Success!",title)
  }else{
    title = '<p style="color:red">'+info.title.replace("<","&lt;").replace(">","&gt;")+' </p>'
    alertDanger("Danger!",title)
  }
  showOuterHint({
    innerHTML:"Testing in process => {"+activeFlow.flowId+"} <br/>"
              +title
              +"<pre>"+JSON.stringify(info, null, '  ').replace("<","&lt;").replace(">","&gt;")+"</pre>"
  })

}
function testFlow() {
  if (Object.keys(activeFlow).length > 0) {
    console.log('activeFlow going on', activeFlow);
    alertInfo("Info!","testing of flow with flowId"+activeFlow.flowId)
    socket.emit("testFlowById",activeFlow);
    hideFlowWindow();
    showOuterHint({innerHTML:"testFlowById flowId => "+activeFlow.flowId})
    // resetFlowInfo();

  } else {
    console.log("No active Flow to test");
    alertWarning("Warning!","There is no active flow to test..")
  }
}
function setCustomFlowInfo() {
  if(Object.keys(customFlowInfo).length > 0){
    console.log("set custom flow and get new custom flow")
    $('.inputSenderId').prop('value', customFlowInfo.senderId);
    $('.inputPageId').prop('value', customFlowInfo.pageId);
    $('.inputAppId').prop('value',customFlowInfo.appId);
    getCustomFlowInfo()
  }else {
    console.log("get new custom flow...")
    getCustomFlowInfo()
  }
}
function getCustomFlowInfo(info){
  if(info){
    console.log("updating custom flow....")
    customFlowInfo = info;
  }else{
    socket.emit('getCustomFlowInfo',"");
  }
}
function reset() {
    if (Object.keys(activeFlow).length > 0) {
        //warn
        console.log('activeFlow going on', activeFlow);
        alertWarning("Warning!","resetting active flow..")
        delete activeFlow;
        activeFlow ={};
        resetFlowInfo();
        hideFlowWindow();
        showOuterHint({innerHTML:"You can generate TestData using this"});
        //button to create new flow
        $('.create_save_flow').prop('title', 'createNewFlow');
        $('.create_save_flow').prop('innerText', 'Create New Flow »');
    } else {
      alertWarning("Warning!","Reloading the page")
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
  socket.on('new_flow_created', function (info) {
      newFlowCreated(info)
  })
  socket.on('updated_flowInfo', function (updatedInfo) {
      updatedFlowInfo(updatedInfo)
  })
  socket.on('saved_activeFlow', function (savedInfo) {
      savedActiveFlow(savedInfo)
  })
  socket.on('loadedFlow', function (info) {
      loadedFlowInfoById(info)
  })
  socket.on('deletedFlow',function(info){
      deletedFlow(info);
  })
  socket.on('testedFlow',function(info){
    testedFlow(info);
  })
  socket.on('testingInfo',function(info){
    testingInfo(info);
  })
  socket.on('getCustomFlowInfo',function (info) {
    getCustomFlowInfo(info);
  })
  hideFlowWindow();
  getCustomFlowInfo();
  alertInfo("Info!","welcome to bot testing..")
});
function sendMessageToServer(msg) {
    console.log("sending message", msg)
    socket.emit('chat_message', msg);
}
function receivedMessageFromServer(msg) {
    updateReplyMessage(msg)
}
