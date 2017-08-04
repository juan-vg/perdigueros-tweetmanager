/**
 * Created by sergiopedrerobenedi on 12/7/17.
 */

var app = angular.module('app');
/**
 *
 */

app.controller("profileCtrl", function($http,$scope){
        console.log('here in profileCtrl controller');
        var req = {
            method: 'GET',
            url: 'http://zaratech-ptm.ddns.net:8888/users/'
            + localStorage.getItem('userId') ,
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        }
        $http(req).then(function (response) {
            console.log(response);
            $scope.myInfo = response.data;
        });

        $scope.changePassword = function(){
            var req = {
                method : 'PUT',
                url : 'http://zaratech-ptm.ddns.net:8888/users/'
                + localStorage.getItem('userId') ,
                headers : {
                    'Content-Type' : 'application/json',
                    'token' : localStorage.getItem('token')
                },
                data : {
                    'email': $scope.myInfo[0].email,
                    'oldPasswd': $scope.oldPasswd,
                    'newPasswd': $scope.newPasswd
                }
            };
            console.log(req);
            $http(req).then(function(response){
                console.log(response);
            });
        }
});
