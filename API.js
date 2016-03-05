var http = require('http');
var fs = require('fs');

var API = {};

//Returns JSON from url
API.callURL = function(url, callback) {
  http.get(url, function(res) {
    var body = "";

    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      callback(body);
    });

  }).on('error', function(e){
    console.log("Couldn't connect to the steam API.");
    throw "Couldn't connect to the steam API.";
  });
}

//Finding user ID from vanity URL
API.getID = function(key, username, callback) {
  var url = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=" + key + "&vanityurl=" + username;

  try {
    this.callURL(url, function(data) {
      data = JSON.parse(data);
      if(data.response.success == 1) {
        callback(data.response.steamid);
      }
      else {
        console.log("Couldn't find steam ID for this username");
        throw "Couldn't find steam ID for this username";
      }
    });
  }
  catch (err) {
    throw err;
  }
};

//Finds the games owned by the player
API.getGames = function(key, id, callback) {
  var url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" + key + "&steamid=" + id + "&format=json";

  try {
    this.callURL(url, function(data) {
      callback(JSON.parse(data));
    });
  }
  catch (err) {
    throw err;
  }
}

API.createArray = function(key, namesMap, games, id, callback) {
  var gameArray = [];

  for(var i = 0; i<games.response.games.length; i++) {
    var playtime = games.response.games[i].playtime_forever;
    var appid = games.response.games[i].appid
    //associate the name with the ID
    for(var j = 0; j < namesMap.applist.apps.length; j++) {
      if (games.response.games[i].appid == namesMap.applist.apps[j].appid) {
          var name = namesMap.applist.apps[j].name;
      }
    }

    gameArray.push({name : name, totalPlaytime : playtime, id : appid});
  }

  callback(gameArray);
}

//add achievements progress to the gameArray
API.addProgress = function(key, id, gameArray, callback){
  var pushed = 0;
  var gameArray = gameArray;
  var i = 0;

  while (i<gameArray.length){
    var url = "http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid="+gameArray[i].appid+"&key="+ key +"&steamid=" +id;
    console.log(url)
    this.callURL(url, function(data){
      console.log(data);
      data = JSON.parse(data);
      if(data.playerstats.hasOwnProperty("achievements")) {
        //Retrieves the achievement percentage
        var successCount = 0;
        var failureCount = 0;
        for(var j = 0; j<data.playerstats.achievements.length; j++) {
          if(data.playerstats.achievements[j].achieved == 1) {
            successCount++;
          }
          else {
            failureCount++
          }
        }
        var totalProgress = (successCount)/(failureCount+successCount) * 100;

        gameArray[pushed].progress = totalProgress;
        pushed++;
      }
      else{
        gameArray[pushed].progress = "No achievements";
        pushed++;
      }

      if(pushed == gameArray.length){
        callback(gameArray);
      }
    });
    i++;
  }
}

//Retrieve a JSON that allows us to associate names and appids
API.getNames = function(key, games, callback) {
  var url = "http://api.steampowered.com/ISteamApps/GetAppList/v2";
  var today = new Date();
  try {
    //Downloads the AppList file it it doesn't exsit locally or if it hasn't been updated today
    fs.stat("AppList.json", function(err, stats) {
      if(err != null) {
        API.callURL(url, function(data) {
          fs.writeFileSync('AppList.json', data, 'utf8');
          fs.readFile('AppList.json', function(err, data) {
            data = JSON.parse(data);
            callback(data);
          });
        });
      }
      else if(stats.mtime.getDate() != today.getDate() &&
        stats.mtime.getMonth() != today.getMonth() &&
        stats.mtime.getFullYear() != today.getFullYear()) {
          API.callURL(url, function(data) {
            fs.writeFileSync('AppList.json', data, 'utf8');
            fs.readFile('AppList.json', function(err, data) {
              data = JSON.parse(data);
              callback(data);
            });
          });
      }
      else {
        fs.readFile('AppList.json', function(err, data) {
          data = JSON.parse(data);
          callback(data);
        });
      }
    });
  }
  catch (err) {
    throw err;
  }
}

module.exports = API;
