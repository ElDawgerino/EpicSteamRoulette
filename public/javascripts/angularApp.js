var app = angular.module('EpicSteamRoulette', ['ui.router']);

app.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider){
      $stateProvider.state('home', {
        url: '/home',
        templateUrl: 'home.html',
        controller: 'HomeCtrl'
      });

      $stateProvider.state('roulette', {
        url: '/roulette/{id}',
        templateUrl: 'roulette.html',
        controller: 'RouletteCtrl'
      });

      $urlRouterProvider.otherwise('home');
}]);

app.controller('HomeCtrl', [
'$scope',
'$http',
'$state',
function($scope, $http, $state){
  $scope.name = "";
  $scope.id = "";

  $scope.getID = function(){
    $http.get('/getid/' + $scope.name).then(function(response){
      $state.go('roulette', {id : respone.data.id}, {});
    });
  };
}]);

app.controller('RouletteCtrl', [
  '$scope',
  '$stateParams',
  function($scope, $stateParams){
    $scope.test = "test";
    $scope.id = $stateParams.id;
  }
]);
