var $messages = $('.messages-content'),
    d, h, m,
    i = 0;
console.log("started", $messages)
$(window).load(function () {
    $messages.mCustomScrollbar();
});

function updateScrollbar() {
    $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
        scrollInertia: 10,
        timeout: 0
    });
}

function setDate() {
    d = new Date()
    if (m != d.getMinutes()) {
        m = d.getMinutes();
        $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
    }
}


function insertMessage(type) {
    msg = $('.message-input').val();
    if ($.trim(msg) == '') {
        return false;
    }
    $(`
        <div class="message message-personal">
            <div class="eachMessage">
            `+ msg + `
        </div>
        </div>
    `).appendTo($('.mCSB_container')).addClass('new');
    setDate();
    $('.message-input').val(null);
    updateScrollbar();
    // setTimeout(function () {
    //     fakeMessage();
    // }, 1000 + (Math.random() * 20) * 100);
    //ajax call
    getReplyMessage(msg, type)
}

$('.message-submit').click(function () {
    // console.log("message submit clicked", arguments, $('.message-input').val())
    insertMessage('text');
});

$(window).on('keydown', function (e) {
    // console.log("message submit keydown", e, "valie", $('.message-input').val())
    if (e.which == 13) {
        insertMessage('text');
        return false;
    }
})

var Fake = [
    'Hi there, I\'m Shanky\'s Bot and you?',
    'Nice to meet you',
    'How are you?',
    'Not too bad, thanks',
    'What do you do?',
    'That\'s awesome',
    'Codepen is a nice place to stay',
    'I think you\'re a nice person',
    'Why do you think that?',
    'Can you explain?',
    'Anyway I\'ve gotta go now',
    'It was a pleasure chat with you',
    'Time to make a new codepen',
    'Bye',
    ':)'
]

function fakeMessage() {
    // console.log("in fakeMessage", $('.message-input'), $('.message-input').val(), "omg")
    if ($('.message-input').val() != '') {
        return false;
    }
    $('<div class="message loading new"><figure class="avatar"><img src="/images/pp.png" /></figure><span></span></div>').appendTo($('.mCSB_container'));
    updateScrollbar();

    setTimeout(function () {
        $('.message.loading').remove();
        $('<div class="message new"><figure class="avatar"><img src="/images/pp.png" /></figure>' + Fake[i] + '</div>').appendTo($('.mCSB_container')).addClass('new');
        setDate();
        updateScrollbar();
        i++;
    }, 1000 + (Math.random() * 20) * 100);

}
function getReplyMessage(msg, type) {
    $('<div class="message loading new"><figure class="avatar"><img src="/images/pp.png" /></figure><span></span></div>').appendTo($('.mCSB_container'));
    updateScrollbar();
    disableInput();// disable typing untill get response
    ((textMessage, type) => {
        var formatMessage = {
            flowId: $('.inputFlowId').prop('value'),
            senderId: $('.inputSenderId').prop('value'),
            pageId: $('.inputPageId').prop('value'),
            appId: $('.inputAppId').prop('value'),
            type: type,
            text: textMessage
        }
        sendMessageToServer(formatMessage)
    })(msg, type)
}
function updateReplyMessage(msg) {
    enableInput();// enable typing after response

    $('.message.loading').remove();
    $(` 
    <div class="message new">
        <figure class="avatar">
            <img src="/images/pp.png" />
        </figure>
        <div class="eachMessage">
            `+ JSON.stringify(msg, null, 2) + `
        </div>
    </div>
    `).appendTo($('.mCSB_container')).addClass('new col-md-12');
    setDate();
    updateScrollbar();
}

function loadChatWindowWithMessages(flow) {
    console.log("loadChatWindowWithMessages", flow)
    for (var i = 0; i < flow.length; i++) {
        $(`
            <div class="message message-personal">
                <div class="eachMessage" title="`+flow[i].query.type+`">
                `+ flow[i].query.text + `
            </div>
            </div>
        `).appendTo($('.mCSB_container')).addClass('new');
        setDate();
        $('.message-input').val(null);
        updateScrollbar();

        $('.message.loading').remove();
        $(` 
            <div class="message new">
                <figure class="avatar">
                    <img src="/images/pp.png" />
                </figure>
                <div class="eachMessage">
                    `+ JSON.stringify(flow[i].response, null, 2) + `
                </div>
            </div>
        `).appendTo($('.mCSB_container')).addClass('new col-md-12');
        setDate();
        updateScrollbar();
    }
}