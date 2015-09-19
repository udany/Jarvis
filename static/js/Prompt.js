function Prompt(title, text, value, callback){
    var id = MainCall("prompt", {title: title, text: text, value: value});
    Prompt.pending[id] = callback;
}
Prompt.pending = [];

Messaging.Bind('prompt-reply', function(data){
    if(Prompt.pending[data.id]){
        Prompt.pending[data.id](data.reply);
        Prompt.pending[data.id] = null;
    }
});