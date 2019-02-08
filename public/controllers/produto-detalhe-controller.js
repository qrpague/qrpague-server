app.controller("ProdutoDetalheController", function ($scope, $rootScope,$location) {

   $scope.produtos = $rootScope.produtos
   $rootScope.isBanner = false 
   $scope.produto = JSON.parse($location.search().produto)

   $scope.comprar = function( ) {

    $rootScope.carrinho = $rootScope.carrinho || []  
    $rootScope.carrinho.push( $scope.produto )

    StorageSFD.clearAll()
    StorageSFD.save( "carrinho" , $rootScope.carrinho )


    $location.url('carrinho');

   }
 
});


