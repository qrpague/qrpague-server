var app = angular.module('myApp', ['ngRoute']);

app.run(function($rootScope) {
    $rootScope.$on("$locationChangeStart", function(event, next, current) { 
        console.log( event , next , current)
        setTimeout( function (){ $( "html" ).scrollTop( 0 );  }, 100)
    });
});



app.config(['$routeProvider', '$locationProvider', function AppConfig($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "./views/home.html",
            controller: "HomeController"

        })
        .when("/produto-detalhe", {
            templateUrl: "./views/produto-detalhe.html",
            controller: "ProdutoDetalheController"

        })
        .when("/carrinho", {
            templateUrl: "./views/carrinho.html",
            controller: "CarrinhoController"

        })
        .when("/checkout", {
            templateUrl: "./views/checkout.html",
            controller: "CheckoutController"

        })
        .when("/checkout-result", {
            templateUrl: "./views/checkout-result.html",
            controller: "CheckoutResultController"

        })
        .otherwise({
            redirectTo: '/'
        });
    // $locationProvider.html5Mode({
    //     enabled: true,
    //     requireBase: false
    // });
    // $locationProvider.hashPrefix('!');
}]);


