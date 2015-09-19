var Shell = require('shell');

responsiveVoice.setDefaultVoice("UK English Male");
var Jarvis = {
    name: 'Jarvis',
    commands: [],
    userName: "",
    silent: false,
    Command: function(input){
        $("#console").html(input).css('opacity',"1").css('color', 'white');
        for (var i = 0; i < this.commands.length; i++){
            if (this.commands[i].Test(input)){
                Shell.beep();
                console.log("Matched command "+this.commands[i].command.toString());
                return;
            }
        }
        //Jarvis.Speak("Sorry "+this.userName+", didn't understand what you meant by "+input);
    },
    Start: function(){
        var name = localStorage.getItem("jarvisName");
        if (name) this.name = name;

        var uName = localStorage.getItem("jarvisUserName");
        if (uName) this.userName = uName;

        this.BindCall();
    },
    BindCall: function(){
        var cmm = {};
        var j = this;

        cmm['hey'] = {
            'regexp': new RegExp('^(Oka?y?|Hey) '+this.name+' (.*)$'),
            'callback': function(hey, command){
                j.Command(command);
            }
        };

        cmm["Hey "+this.name] = function(){
            j.Command("");
        };
        annyang.addCommands(cmm);
        $(".status").html("Say Hey "+this.name+"!");
        localStorage.setItem("jarvisName", this.name);
    },
    UnbindCall: function(){
        var cmm = ["Hey "+this.name, "hey"];
        annyang.removeCommands(cmm);
    },
    AddCommand: function(command, callback){
        if (command instanceof JarvisCommand){
            this.commands.push(command);
        }else{
            this.commands.push(new JarvisCommand(command, callback));
        }
    },
    RemoveCommand: function(command){
        var idx = this.commands.indexOf(command);
        if (idx >=0){
            this.commands.splice(idx,1);
        }
    },
    Speak: function(text){
        if (text instanceof Array) text = text[Math.randomInt(0, text.length)];
        if (!this.silent) responsiveVoice.speak(text);
    },
    Speaking: function(){
        return responsiveVoice.isPlaying();
    },
    ShutUp: function(){
        responsiveVoice.cancel();
    }
};


function JarvisCall(call){
    this.call = call;
    this.commands = [];
    this.beep = true;
    this.prefix = '';
    this.color = 'white';
    this.Bind();
}
JarvisCall.prototype.Bind = function(){
    var cmm = {};
    var j = this;

    cmm[this.call] = function(command){
        j.Command(command);
    };

    annyang.addCommands(cmm);
};
JarvisCall.prototype.Command = function(input){
    $("#console").html(this.prefix+input).css('opacity',"1").css('color', this.color);
    for (var i = 0; i < this.commands.length; i++){
        if (this.commands[i].Test(input)){
            if (this.beep) Shell.beep();
            console.log("Matched command "+this.commands[i].command.toString());
            return;
        }
    }
    //Jarvis.Speak("Sorry "+Jarvis.userName+", didn't understand "+input);
};
JarvisCall.prototype.AddCommand = function(command, callback){
    if (command instanceof JarvisCommand){
        this.commands.push(command);
    }else{
        this.commands.push(new JarvisCommand(command, callback));
    }
};


/* Command class */
function JarvisCommand(command, callback){
    this.command = (command instanceof Array) ? command : [command];
    this.callback = callback;
}

/**
 * @return {boolean}
 */
JarvisCommand.prototype.Test = function(input){
    for (var i = 0; i < this.command.length; i++){
        if (this.TestCommand(i, input)) return true;
    }
    return false;
};
/**
 * @return {boolean}
 */
JarvisCommand.prototype.TestCommand = function(i, input){
    var c = this.command[i];
    if (typeof c === typeof ''){
        if (input.search(c)===0){
            this.callback.apply(this, [input.substr(c.length).trim()]);
            return true;
        }
    } else if(c instanceof RegExp){
        if (c.test(input)){
            this.callback.apply(this, [c.exec(input)]);
            return true;
        }
    }
    return false;
};


/* Base Commands */

Jarvis.AddCommand(/^$/, function(){
    if (!Jarvis.userName){
        Jarvis.Speak([
            "Hello! What's your name?",
            "Hi! What's your name?",
            "Hello! How should I call you?"
        ]);

        annyang.addCommands({"My name is :name": function(name){
            Jarvis.userName = name;
            localStorage.setItem("jarvisUserName", Jarvis.userName);
            Jarvis.Speak("Nice to meet you "+Jarvis.userName);
            annyang.removeCommands(["My name is :name"]);
        }});
    }else{
        Jarvis.Speak([
            "Hey "+Jarvis.userName+"! What's up?",
            "Oh, it's you again...",
            "Hi "+Jarvis.userName+", how may I be of use?",
            "So... We meet again",
            "Why are you wasting my time?",
            "How may I help?",
            "Hello "+Jarvis.userName+", how are you?",
            "Sorry Dave... I can't do that",
            "Whatever...",
            "At last... 42!",
            "Do you want cake?",
            "Talk to the hand",
            "Come with me if you want to live"
        ]);
    }
});

Jarvis.AddCommand(["my name is", "I'm", "I am"], function(name){
    Jarvis.userName = name;
    localStorage.setItem("jarvisUserName", Jarvis.userName);
    Jarvis.Speak([
        "Understood, I'll call you "+Jarvis.userName,
        "Okay, "+Jarvis.userName+" it is!"
    ]);
});

Jarvis.AddCommand(["may I call you", 'your name is'], function(name){
    Jarvis.UnbindCall();
    Jarvis.name = name;
    Jarvis.BindCall();
    Jarvis.Speak("No problem, call me "+Jarvis.name+" from now on");
});

Jarvis.AddCommand("talk to me", function(name){
    Jarvis.silent = false;
    Jarvis.Speak("Okay  "+Jarvis.userName+", sure thing!");
});

Jarvis.AddCommand(["be quiet", 'silent', 'shut up'], function(name){
    Jarvis.silent = true;
});

Jarvis.AddCommand(/^(what )?time( is it)?$/, function(name){
    Jarvis.Speak("It's "+(new Date()).format("H i"));
});

annyang.addCommands({"okay": function(){
    Jarvis.ShutUp();
}});

annyang.addCallback("result", function(a){
    if (a.length)
        $("#console").html(a[0]).css('opacity',".5").css('color', 'white');
});