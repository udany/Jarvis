
Jarvis.AddCommand(/^(search )?Google (for )?(.*)$/, function(matches){
    Jarvis.Speak("Searching for "+matches[matches.length-1]);
    Shell.openExternal('https://www.google.com.br/search?q='+matches[matches.length-1])
});

Jarvis.AddCommand(/^(search )?You( )?Tube (for )?(.*)$/, function(matches){
    Jarvis.Speak("Searching for "+matches[matches.length-1]);
    Shell.openExternal('https://www.youtube.com/results?search_query='+matches[matches.length-1])
});