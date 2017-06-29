/**
 * Created by sergiopedrerobenedi on 22/6/17.
 */

var app = angular.module('app');
/**
 *
 */
app.controller('accountTableCtrl', function ($rootScope,$location,$scope, $http) {
        $scope.createAccount = function() {
            console.log('here');
            var req = {
                method: 'POST',
                url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                },
                data: {
                    'information': {
                        'consumerKey': $scope.consumerKey,
                        'consumerSecret': $scope.consumerSecret,
                        'accessToken': $scope.accessToken,
                        'accessTokenSecret': $scope.accessTokenSecret

                    },
                    'description': $scope.description
                }
            };
            $http(req).then(function (response) {
                console.log(response);
            });
        };
        $scope.menuState = {};
        $scope.addAccountState = 'Añadir cuenta';
        $scope.menuState.show = false;
        $scope.changeMenu    = function(){
            $scope.menuState.show  = !$scope.menuState.show;
            /*
             * Change the name of the button according to the Boolean value of the variable that handles the visibility
             * of the account creation menu.
             */
            if($scope.menuState.show == true){
                $scope.addAccountState = 'Ocultar';
            }
            else if($scope.menuState.show == false){
                $scope.addAccountState = "Añadir cuenta";
            }
        }
            console.log('Get accounts');
            var req = {
                method: 'GET',
                url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                }
            };
            $http(req).then(function (response) {
                console.log(response.data);
                $scope.accountList =  response.data;
            });
});
