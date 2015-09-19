var ExternalApps = {
    "league of legends": {
        windowName: 'Cliente PVP.net',
        execPath: '"C:\\Riot Games\\League of Legends\\lol.launcher.admin.exe"',
        canRestore: false,
        multiple: false
    },
    "calculator": {
        windowName: 'Calculadora',
        execPath: 'calc',
        canRestore: true,
        multiple: true
    },
    "spotify": {
        windowName: null,
        windowClass: 'SpotifyMainWindow',
        execPath: '"C:\\Users\\Daniel\\AppData\\Roaming\\Spotify\\Spotify.exe"',
        canRestore: false,
        multiple: false
    }
};

var ffi = require('ffi');
var user32 = ffi.Library('user32', {
    'FindWindowA': [
        'int32', ['string', 'string']
    ],
    'SendMessageA': [
        'int32', ['int32', 'int32', 'int32', 'int32']
    ],
    'ShowWindow': [
        'int32', ['int32', 'int32']
    ],
    'SetForegroundWindow': [
        'int32', ['int32']
    ],
    'GetClassNameA': [
        'int32', ['int32', 'string', 'int32']
    ]
});

var child_process = require('child_process');

Jarvis.AddCommand(/^(could you )?open ?(.*)$/, function(matches){
    var appName = matches[matches.length-1].toLowerCase(), app;

    if (!ExternalApps[appName]){
        Jarvis.Speak("Unknown app "+appName);
    }else{
        app = ExternalApps[appName];
    }

    var windowId = user32.FindWindowA(app.windowClass, app.windowName);

    if (!windowId || app.multiple){
        child_process.exec(app.execPath, function callback(error, stdout, stderr) {
            if (!error) {
                Jarvis.Speak("Opened " + appName);
            }else{
                Jarvis.Speak("Error opening " + appName);
            }
        });
    }else{
        if (app.canRestore){
            Jarvis.Speak("Focused "+appName);
            user32.ShowWindow(windowId, 9)
        }else{
            Jarvis.Speak(appName+" is already running");
        }
    }
});