app.controller("HomeController", function ($window, $http, $scope, $rootScope, $location) {

    $scope.operacoes = []



    $scope.detail = function (item) {
        $rootScope.produto = item

        $location.url('produto-detalhe?produto=' + JSON.stringify(item));
    }
    $scope.requestOperacoes = function () {

        var rest = {
            method: 'GET',
            url: connectApp.loja_url + "/operacoes",
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

    $scope.go_back = function () {
        $window.history.back();
    }
    $scope.home = function () {
        $location.url('/');
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


