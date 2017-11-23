module.exports = function (io) {
    io.on('connection', function (socket) {
        console.log('a new user connected');
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
        socket.on('chat_message', function(msg){
            console.log('message: ' ,msg);
            setTimeout(()=>{
                socket.emit('chat_message','Reply From server'+JSON.stringify(msg))
            },5000)
        });
        socket.on('initiate_new_flow', function(flowInfo){
            console.log('message: ' ,flowInfo);
            setTimeout(()=>{
                flowInfo.description = "created... " + flowInfo.description;
                socket.emit('new_flow_created',flowInfo)
            },5000)
        });
        socket.on('update_flowInfo',function(oldFlowInfo,newFlowInfo){
            console.log('message: ' ,oldFlowInfo,newFlowInfo);
            setTimeout(()=>{
                newFlowInfo.description = "updated... " + newFlowInfo.description;
                socket.emit('updated_flowInfo',newFlowInfo)
            },5000)
        })
    });
    
}