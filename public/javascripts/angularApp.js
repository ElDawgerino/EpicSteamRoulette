var app = angular.module('EpicSteamRoulette', []);

//Allows you to get to the correct page when typing your name into home
app.controller('HomeCtrl', [
'$scope',
function($scope){
  $scope.name = "";

  $scope.$watch("name", function(newVal, oldVal) {
    $scope.target = "/roulette/" + $scope.name;
  });
}]);

app.controller('RouletteCtrl', [
  '$scope',
  '$window',
  function($scope, $window){
    $scope.pickGame = function() {
      var pick = Math.floor(Math.random() * $scope.games.names.length);
      $window.alert($scope.games.names[pick].name);
    }
  }
])
