/*
 * Description: A script
 * Version: 0.1
 * Author: Daniel Andrade
 * Date: 16/09/2015
 * This code may not be reused without proper permission from its creator.
 */
var spotify = require('spotify-win-remote');

var spotifyCall = new JarvisCall("Spotify *input");
spotifyCall.beep = false;
spotifyCall.color = "#119921";
spotifyCall.prefix = "Spotify ";

spotifyCall.AddCommand("play", function(){
    spotify.togglePausePlay();
});
spotifyCall.AddCommand("pause", function(){
    spotify.togglePausePlay();
});
spotifyCall.AddCommand("next", function(){
    spotify.next();
});
spotifyCall.AddCommand("previous", function(){
    spotify.prev();
});
spotifyCall.AddCommand("mute", function(){
    spotify.toggleMute();
});