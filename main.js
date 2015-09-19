//////////////////////// STARTUP
var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
require('crash-reporter').start(); // Report crashes to our server.

/////////////////////// MESSAGING
var Messaging = {
    binds: {},
    Bind: function(method, callback){
        this.binds[method] = callback;
    }
};

var ipc = require('ipc');
ipc.on('synchronous-message', function(event, method, data) {
    if (Messaging.binds[method]){
        event.returnValue = Messaging.binds[method](data, event);
    }else{
        event.returnValue = null;
    }
});


///////////////////// MAIN WINDOW
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    var atomScreen = require('screen');
    var size = atomScreen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 300,
        height: 200,
        transparent: true,
        center: true,
        frame: false,
        resizable: false,
        x: size.width-300,
        y: size.height-200,
        icon: __dirname + '/static/images/icon.png'
    });

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/main/index.html');

    // Open the DevTools.
    //mainWindow.openDevTools({detach: true});

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        app.quit();
    });
});


///////////////////////// DIALOGS

var dialogs = [];
var dialogId = 0;
function Dialog(id, type, title, text, value, sender){
    var DialogObj = this;
    this.id = id;
    this.type = type;
    this.title = title ? title : 'Dialog';
    this.text = text ? text : '';
    this.value = value ? value : '';
    this.sender = sender;

    this.dialog = new BrowserWindow({
        width: 300,
        height: 100,
        transparent: true,
        center: true,
        frame: false,
        resizable: false,
        icon: __dirname + '/static/images/icon.png',
        show: false
    });

    this.dialog.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        DialogObj.dialog = null;
    });

    this.dialogWeb = this.dialog.webContents;
    this.dialogWeb.once('did-finish-load', function(){
        DialogObj.dialogWeb.executeJavaScript('showDialog('+DialogObj.id+', "'+DialogObj.title+'","'+DialogObj.text+'", "'+DialogObj.value+'")');
    });

    // and load the index.html of the app.
    this.dialog.loadUrl('file://' + __dirname + '/dialog/index.html');
}
Dialog.types = {
    alert: 1,
    prompt: 2
};
Dialog.prototype.Reply = function(reply){
    this.sender.send('asynchronous-reply', 'prompt-reply', {id: this.id, reply: reply});
};

Messaging.Bind("prompt", function(data, e){
    dialogId+=1;

    var dialog = new Dialog(dialogId, Dialog.types.prompt, data.title, data.text, data.value, e.sender);
    dialogs[dialogId] = dialog;
    return dialogId;
});

Messaging.Bind("prompt-reply", function(data, e){
    if (dialogs[data.id]){
        var d = dialogs[data.id];
        d.Reply(data.reply);
        dialogs[data.id] = null;
        return true;
    }else{
        return false;
    }
});