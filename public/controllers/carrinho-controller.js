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

    $scope.finalizar = function () {
 
        let itensQrpague = []
        $scope.carrinho.forEach( item => {
            
            let produto = { indice : new Date() , dados : item }
            itensQrpague.push( produto )
        })

        $rootScope.order = {
            itens : itensQrpague ,
            valor : $scope.total(),
            terminal: connectApp.terminal

        }



        $location.path('checkout');

    }
    $scope.total = function(){
        let total = 0
        if ( !$scope. carrinho ) {
            return 0
        }
        $scope. carrinho.forEach( produtos =>{
            total = total + produtos.valor
        })

        return truncateNumber(total,2) 
    }
});


