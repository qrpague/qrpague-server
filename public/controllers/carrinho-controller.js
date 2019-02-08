app.controller("CarrinhoController", function ($http, $scope, $rootScope, $location) {

    $scope.carrinho = $rootScope.carrinho || StorageSFD.getArray( "carrinho" )
    $rootScope.isBanner = false 

    console.log( $scope.carrinho )

    $scope.voltar = function () {
        $location.path('/');

    }
        
//{ indice: new Date(), dados: me.listaSanduiches[id] }
    $scope.delete = function( id ){
        $scope.carrinho.forEach( (item, index, array) => {
            if ( item.id === id ) {
                array.splice(index, 1);
                StorageSFD.clearAll()
                StorageSFD.save( "carrinho" , array )
            }
        }) 
       
    }
 
 
});


