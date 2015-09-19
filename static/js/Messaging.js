var ipc = require('ipc');

function MainCall(method, data){
    return ipc.sendSync('synchronous-message', method, data);
}

var Messaging = {
    binds: {},
    Bind: function(method, callback){
        this.binds[method] = callback;
    }
};

ipc.on('asynchronous-reply', function(method, data) {
    if (Messaging.binds[method]){
        Messaging.binds[method](data);
    }else{
        console.log('IPC: '+method);
        console.log(data);
    }
});