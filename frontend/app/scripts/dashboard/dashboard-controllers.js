/**
 * Created by sergiopedrerobenedi on 22/5/17.
 */
//Dashboard controllers
var app = angular.module('app');

/**
 * Create ShowHideUserMenu, a controller that manage the user top menu visbilt
 */
app.controller('ShowHideUserMenu', ['$scope', '$http', function ($scope,$http) {
    $scope.$on('$routeChangeSuccess', function () {
        $scope.userVisible = false;
        if (localStorage.getItem("token")) {
            $scope.userVisible = true;
        }
    });
    var data = {
        'token': localStorage.getItem('token'),
        'id': localStorage.getItem('userId')
    }
    $http.get('http://zaratech-ptm.ddns.net:8888/users/'+data.id, {
        headers: {
            'Content-type' : 'application/json',
            'token': data.token
        }

    }).success(function (data) {
        //es un array 0
        $scope.username = data[0].name;
    });
}]);