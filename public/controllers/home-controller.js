app.controller("HomeController", function ($window, $http, $scope, $rootScope, $location) {

    $scope.operacoes = []



     
    $scope.requestOperacoes = function () {

        var rest = {
            method: 'GET',
            url: connectApp.gateway_qrpague + "/operacoes",
            headers: { 'Content-Type': 'application/json' },
            data: {}
        }

        $http(rest).then((result, error) => {
            if (error) {
                console.log("PRODUTO GET", error)
                return Msg("Erro consulta produtos")
            }
            $scope.operacoes = result.data
        })

    }
    $scope.detail = function( item ) {
        $location.url('/operacao-digital?operacao=' + JSON.stringify(item));
    }
    $scope.total = function (situacao) {

        let total = 0
        let operacoes = $scope.operacoes
        for (i = 0; i < operacoes.lenght ; i++) {
            let element = operacoes[i]
            if (element.situacao == situacao) {
                total = total++
            }
        }
        return total;

    }


    $scope.requestOperacoes()




});


