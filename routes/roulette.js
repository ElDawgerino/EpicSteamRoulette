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
        //retrieving the game names
        api.getNames(config.key, games, function(namesMap) {
          //finding the names that concerns us
          api.createArray(games, namesMap, function(names) {
            var obj = JSON.stringify({names : names});
            res.render('roulette', {username : req.params.username, games: obj});
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
