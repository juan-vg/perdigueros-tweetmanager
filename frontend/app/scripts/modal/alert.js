/**
 * Created by sergiopedrerobenedi on 13/7/17.
 */

var app = angular.module('app');

app.service('AlertService',function($uibModal){
    /*
     headerText - presents text in header
     bodyText - presents text in body
     buttonText - presents text in button. On its click if method parameters is not passed, modal will be closed.
     In situation that the method parameters is passed, on its click, method will be called. For situations
     like that, there is parameter buttonText2 which will be used as cancel modal functionality.
     method - presents passed function which will be called on confirmation
     buttonText2 - presents text in button for cancel

     */
    var alert = function(headerText, bodyText, buttonText, method, buttonText2){

        method = method || function(){};
        buttonText2 = buttonText2 || '';


        $uibModal.open({
            animation: true,
            templateUrl: '/partials/modal/alert.html',
            controller: 'AlertModalInstanceCtrl',
            size: 'md',
            resolve: {
                headerText: function () {
                    return headerText;
                },
                bodyText: function () {
                    return bodyText;
                },
                buttonText: function () {
                    return buttonText;
                },
                method: function () {
                    return method;
                },
                buttonText2: function () {
                    return buttonText2;
                }
            }
        });
    };

    return{
        alert: alert
    };

});

app.controller('AlertModalInstanceCtrl', function ($scope, $uibModalInstance, headerText, bodyText, buttonText, method, buttonText2) {
    $scope.headerText = headerText;
    $scope.bodyText = bodyText;
    $scope.buttonText = buttonText;
    $scope.method = method;
    $scope.buttonText2 = buttonText2;

    $scope.ok = function () {
        $scope.method();
        $uibModalInstance.dismiss('cancel');
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});