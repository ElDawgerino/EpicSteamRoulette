var app = angular.module('EpicSteamRoulette', []);

//Allows you to get to the correct page when typing your name into home
app.controller('HomeCtrl', [
'$scope',
function($scope){
  $scope.name = ""

  $scope.$watch("name", function(newVal, oldVal) {
    $scope.target = "/roulette/" + $scope.name;
  });
}]);

app.controller('RouletteCtrl', [
  '$scope',
  function($scope){
    $scope.mySplit = function(string, nb) {
      return string.split(",", nb);
    }
  }
])
