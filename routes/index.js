var express = require('express');
var router = express.Router();
var fs = require('fs');
var api = require("../API");

var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {});
});

//GET the ID
router.get('/getid/:username', function(req, res, next){
  api.getID(config.key, req.params.username, function(id){
    res.json({id : id});
  });
});

//GET the games owned by the account
router.get('/getgames/:id', function(req, res, next){
  api.getGames(config.key, req.params.id, function(games){
    api.getNames(config.key, req.params.id, function(namesMap){
      api.createArray(config.key, namesMap, games, id, function(gameArray){
        res.json({gameArray : gameArray});
      });
    });
  })
});

module.exports = router;
