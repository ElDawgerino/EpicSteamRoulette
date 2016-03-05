var express = require('express');
var router = express.Router();

var api = require("../API");
var fs = require('fs');

router.get('/', function(req, res, next) {
  res.status(404).send('Specify a username');
});

router.get('/:username', function(req, res, next) {
  //Parsing config
  var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

  try {
    //getting the account ID
    api.getID(config.key, req.params.username, function(id) {
      //getting the games owned by the account
      api.getGames(config.key, id, function(games) {
        //associate the name to the appid
        api.getNames(config.key, id, function(namesMap) {
          //generating a JSON containing the game names
          api.createArray(config.key, namesMap, games, id, function(gameArray){
            //adding the achivement progress to gameArray
            api.addProgress(config.key, id, gameArray, function(gameArray) {
              var obj = JSON.stringify({gameArray : gameArray});
              //rendering the page
              res.render('roulette', {username : req.params.username, games: obj});
            });
          });
        });
      });
    });

  }
  catch (err) {
    res.status(404).send("Couldn't gather data from the steam API");
  }
});

module.exports = router;
