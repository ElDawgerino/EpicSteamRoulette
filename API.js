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

//Retrieve a JSON that allows us to associate names and appids
API.getNames = function(key, games, callback) {
  var url = "http://api.steampowered.com/ISteamApps/GetAppList/v2";
  var today = new Date();
  try {
    //Downloads the AppList file it it doesn't exsit locally or if it hasn't been updated today
    fs.stat("AppList.json", function(err, stats) {
      if(err != null) {
        console.log("Past errcheck");
        API.callURL(url, function(data) {
          console.log("Past callURL");
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

//Generates an array containing the names of the games owned by the user
API.createArray = function(games, map, callback) {
  var names = [];
  for(var i = 0; i < games.response.games.length; i++) {
    for(var j = 0; j < map.applist.apps.length; j++) {
      if (games.response.games[i].appid == map.applist.apps[j].appid) {
        names.push({
          name: map.applist.apps[j].name
        });
      }
    }
  }
  callback(names);
}

module.exports = API;
