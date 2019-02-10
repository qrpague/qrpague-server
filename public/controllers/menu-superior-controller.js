app.controller("MenuSuperiorController", function ($window, $http, $scope, $rootScope, $location) {

    $scope.search = false;
    $rootScope.textSearch = undefined 
  
    $scope.go_back = function () {
        $window.history.back();
    }
    $scope.home = function () {
        $location.url('/');
    }
    $scope.isSearch = function() {
        $scope.search = !$scope.search
    }




});


