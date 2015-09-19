/// Load api
var LolApi = require('leagueapi');
LolApi.init('7cadff94-f97a-4364-8294-7fd2c8f7dc19', 'euw');

/// Manage api rate limiting
ApiRates = {
    maxPer10Minutes: 500,
    maxPer10Seconds: 10,
    per10Minutes:0,
    per10Seconds:0,
    queue: [],
    /**
     * @return {boolean}
     */
    MayCall: function(){
        return this.per10Minutes < this.maxPer10Minutes && this.per10Seconds < this.maxPer10Seconds;
    },
    Call: function(c){
        this.queue.push(c);
        this.TryCall();
    },
    TryCall: function(){
        if (this.MayCall()){
            var c = this.queue.pop();
            if (c){
                this.per10Minutes++;
                this.per10Seconds++;
                c();

                setTimeout(function(){
                    ApiRates.per10Seconds--;
                    ApiRates.TryCall();
                }, 10*1000);

                setTimeout(function(){
                    ApiRates.per10Minutes--;
                    ApiRates.TryCall();
                }, 10*60*1000);
            }
        }
    }
};

/// Manage stored info
var LoLInfo = {
    region: 'br'
};
var infoJson = localStorage.getItem("lol");
if (infoJson){
    LoLInfo = JSON.parse(infoJson);
}
LoLInfo.Save = function(){
    localStorage.setItem("lol", JSON.stringify(LoLInfo));
};
LoLInfo.LoadChampions = function(){
    LolApi.Static.getChampionList({}, function(error, data){
        if(!error){
            LoLInfo.Champions = data.data;
            LoLInfo.Save();
        }
    });
};
LoLInfo.GetChampionById = function(id){
    for (var i in this.Champions){
        var c = this.Champions[i];
        if(c.id == id) return c;
    }
    return null;
};
LoLInfo.LoadSummoner = function(){
    Prompt("League of Legends", "What's your LoL summoner name?", '', function(name){
        Jarvis.Speak("Searching...");
        ApiRates.Call(function(){
            LolApi.Summoner.getByName(name, LoLInfo.region, function(error, data){
                if (error || !data[name.toLowerCase()]){
                    Jarvis.Speak("Couldn't find a summoner called "+name);
                }else{
                    LoLInfo.Summoner = data[name.toLowerCase()];
                    LoLInfo.Save();
                    Jarvis.Speak("Sure, you're "+name+"!");
                }
            });
        });
    });
};
if (!LoLInfo.Champions){
    LoLInfo.LoadChampions();
}

LoLGame = {
    teamNames: ['blue', 'red'],
    divisions: {
        'I': 1,
        'II': 2,
        'III': 3,
        'IV': 4,
        'V': 5
    }
};
LoLGame.Load = function(){
    ApiRates.Call(function(){
        LolApi.getCurrentGame(LoLInfo.Summoner.id, LoLInfo.region, function(error, data){
            if (error){
                Jarvis.Speak("No game found");
            }else{
                LoLGame.data = data;
                LoLGame.Parse();
                Jarvis.Speak("Game loaded!");
            }
        });
    });
};
LoLGame.Parse = function(){
    this.teams = [];
    this.teamsLoaded = [];
    for (var i = 0; i < this.data.participants.length; i++){
        var p = this.data.participants[i];
        if (this.teams.indexOf(p.teamId)===-1){
            this.teams.push(p.teamId);
        }
        p.champion = LoLInfo.GetChampionById(p.championId);
    }
    this.teams = this.teams.sort();
};
LoLGame.GetParticipantLeague = function(i, callback){
    var p = this.data.participants[i];

    ApiRates.Call(function(){
        LolApi.getLeagueEntryData(p.summonerId, LoLInfo.region, function(error, data){
            if (error){
                p.league = {};
            }else{
                p.league = data[p.summonerId][0];
            }
            callback();
        });
    });
};
LoLGame.LoadTeam = function(team){
    if (this.teamsLoaded[team]){
        this.VerifyTeamLoad(team);
        return;
    }
    for (var i = 0; i < this.data.participants.length; i++){
        var p = this.data.participants[i];
        if (this.teams[team] === p.teamId){
            this.GetParticipantLeague(i, function(){
                LoLGame.VerifyTeamLoad(team);
            });
        }
    }
};
LoLGame.VerifyTeamLoad = function(team){
    var loaded = true;
    for (var i = 0; i < this.data.participants.length; i++){
        var p = this.data.participants[i];
        if (this.teams[team] === p.teamId){
            if (!p.league) loaded = false;
        }
    }
    if (loaded){
        this.teamsLoaded[team] = true;
        this.Team(team);
    }
};
LoLGame.Team = function(team){
    var text = [];
    if (!this.teamsLoaded[team]){
        this.LoadTeam(team);
    }else{
        for (var i = 0; i < this.data.participants.length; i++){
            var p = this.data.participants[i];
            if (this.teams[team] === p.teamId){
                var tier = p.league.tier ? p.league.tier.toLowerCase() : "unranked";
                var division = '';
                if (p.league.entries){
                    var entry = p.league.entries[0];
                    var lp = entry.leaguePoints;
                    division = LoLGame.divisions[entry.division]+" with "+lp+" lp";
                    if (lp == 100 && entry.miniSeries){
                        division += " in promotion";
                        if (entry.miniSeries.wins || entry.miniSeries.losses){
                            division += entry.miniSeries.wins ? entry.miniSeries.wins : " no";
                            division += entry.miniSeries.wins == 1 ? " win" : " wins";
                            division += entry.miniSeries.losses ? entry.miniSeries.wins : " no";
                            division += entry.miniSeries.losses == 1 ? " loss" : " losses";
                        }
                    }
                }

                text.push(p.champion.name+" is "+tier+" "+division);
            }
        }

        Jarvis.Speak(text.join(". "));
    }
};
LoLGame.Player = function(i){
    var p = this.data.participants[i];
    if (p.stats){
        var totalGames = p.stats.totalSessionsPlayed;

        var avgK = Math.round(p.stats.totalChampionKills/totalGames);
        var avgD = Math.round(p.stats.totalDeathsPerSession/totalGames);
        var avgA = Math.round(p.stats.totalAssists/totalGames);

        var winRate = Math.round((p.stats.totalSessionsWon/totalGames)*100);

        var quadras = p.stats.totalQuadraKills;
        var pentas = p.stats.totalPentaKills;

        var text = p.champion.name+" has a win rate of "+winRate+" percent with "+totalGames+" games and an average KDA of "+avgK+", "+avgD+", "+avgA+".";
        if (quadras) text += "Also, "+quadras+" quadra kills";
        if (pentas) text += "And, "+pentas+" penta kills";

        Jarvis.Speak(text);
    }else if (p.stats===false) {
        Jarvis.Speak("No stats for "+p.champion.name);
    }else{
        Jarvis.Speak("Loading "+p.champion.name+" stats");
        ApiRates.Call(function(){
            LolApi.Stats.getRanked(p.summonerId, 'SEASON2015', LoLInfo.region, function(error,data){
                if (error){
                    Jarvis.Speak("Failed to fetch player stats.");
                }else{
                    for (var j = 0; j < data.length; j++){
                        if (data[j].id == p.champion.id){
                            p.stats = data[j].stats;
                            LoLGame.Player(i);
                        }
                    }
                }
                if(!p.stats)
                    p.stats = false;
            });
        });
    }
};



/// Assistant integration
var LeagueCall = new JarvisCall("League of Legends *input");
LeagueCall.color = "#112199";
LeagueCall.prefix = "LoL ";

LeagueCall.AddCommand("username", function(){
    Jarvis.Speak("What's your League summoner name?");
    LoLInfo.LoadSummoner();
});

LeagueCall.AddCommand(/loads? game/, function(){
    if (!LoLInfo.Summoner){
        Jarvis.Speak("I need your League summoner name before");
        LoLInfo.LoadSummoner();
    }else{
        Jarvis.Speak("Searching...");
        LoLGame.Load();
    }
});

LeagueCall.AddCommand(/^(blue|red) team$/, function(matches){
    if (!LoLInfo.Summoner){
        Jarvis.Speak("What's your League summoner name?");
        LoLInfo.LoadSummoner();
    }else{
        Jarvis.Speak("Loading...");
        LoLGame.Team(LoLGame.teamNames.indexOf(matches[1]));
    }
});

var PlayerNumberAliases = {
    "one": 1,
    "two": 2,
    "three": 3,
    "free": 3,
    "for": 4,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "aids": 8,
    "nine": 9,
    "ten": 10,
    "dan": 10
};

LeagueCall.AddCommand(/^player (.*)$/, function(matches){
    var match = matches[1];
    var i = parseInt(match, 10);
    if (isNaN(i) || i == 0){
        if (PlayerNumberAliases[match.toLowerCase()]){
            i = PlayerNumberAliases[match.toLowerCase()];
        }
    }

    if (!isNaN(i) && i > 0){
        LoLGame.Player(i-1);
    }
});