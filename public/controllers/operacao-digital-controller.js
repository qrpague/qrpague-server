app.controller("OperacaoDigitalController", function ($scope, $rootScope,$location) {

    
   $scope.operacao = JSON.parse($location.search().operacao)

   $scope.evento = function( ) {
 
   //  StorageSFD.clearAll()
   //  StorageSFD.save( "carrinho" , $rootScope.carrinho )
   //  $location.url('carrinho');

   }
 
});


