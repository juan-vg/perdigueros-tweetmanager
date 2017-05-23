/**
 * Created by sergiopedrerobenedi on 18/5/17.
 */
// create the controller and inject Angular's $scope
var app = angular.module('app');

app.controller('signinCtrl',  ['$auth','$location','$scope','$http',
    function($auth,$location,$scope,$http) {
        if(localStorage.getItem("token")){
            $location.url('/dashboard');
            $scope.menuState.show = true;
        }
        else{
            $scope.login = function () {
                var data = {
                    'email': $scope.email,
                    'passwd': $scope.passwd,
                    'g-recaptcha-response': $scope.captchaResponse
                };
                $http.post('http://zaratech-ptm.ddns.net:8888/login/signin', data)
                    .then(function (response) {
                        localStorage.setItem("token", response.data.token);
                        localStorage.setItem("userId", response.data.id);
                        $location.url('/dashboard');
                    })
                    .catch(function (response) {
                        // Captcha validation error OR params error
                        if (response.status == 400) {

                        }
                        //Incorrect login
                        else if (response.status == 401) {
                            console.log("Captcha validation error");
                        }
                        // Must validate the account (email)
                        else if (response.status == 409) {
                            console.log("DB error");
                        }
                        else if (response.status == 459) {
                            console.log("Must change password first")
                        }
                        else if (response.status == 500) {
                            console.log("DB error");
                        }
                    });
            }

            };

            $scope.authenticate = function (provider) {
                $auth.authenticate(provider)
                //succesful authentication
                    .then(function () {
                        $location.url('/dashboard');
                    })
                    //handle errors
                    .catch(function (error) {
                        if (error.message) {
                            console.log(error);

                        } else if (error.data) {
                            console.log(error);

                        } else {
                            console.log(error);
                        }
                    });
            };
    }]);

//create the singup controller, if success redirection to /validate, else
app.controller('signupCtrl', ['$scope','$http','$location',function($scope,$http,$location ) {
    $scope.postData = function(){
        app.value();
        var data = {
            'name': $scope.name,
            'surname': $scope.surname,
            'email': $scope.email,
            'g-recaptcha-response' : $scope.captchaResponse
        };
        $http.post('http://zaratech-ptm.ddns.net:8888/login/signup',data
        )
            //200 status code(valid,user not exists and not have other problems)
            .then(function(response){
                //redirection to /validate view
                $location.url('/validate');
        },
            //status code errors
            function(response){
                //if email address already in use
                if(response.status==409) {

                }
                //if captcha validation error
                else if(response.status==400){
                    console.log("Captcha validation error");
                }
                //db error
                else if(response.status==500){
                    console.log("DB error");
                }
            });
    };
}]);

//create the validateCtrl, verify the e-mail and the code and redirect to 'first-login' page
app.controller('validateCtrl', ['$scope','$http','$location',function($scope,$http,$location) {
    var mail = "";
    $scope.validate = function(){
        var data = {
            'email': $scope.email,
            'code' : $scope.code
        };
        $http.post('http://zaratech-ptm.ddns.net:8888/login/validate',data
        ).then(function(response){
                console.log(response);
                $location.url('/first-login');
            },
            //status code errors
            function(response){
                //incorrect validation code
                if(response.status==401) {
                    $scope.errorMessage = "Incorrect validation code";
                    console.log("Incorrect validation code");
                    $location.url('/');
                }
                //db error
                else if(response.status==500){
                    console.log("DB error");
                }
            });
    };

    // RESEND FUNCTION
    $scope.resend = function(){
        var data = {
            'email': $scope.emailresend
        };
        $http.post('http://zaratech-ptm.ddns.net:8888/login/validate/resend',data
        ).then(function(response){
                console.log(response);
                $location.url('/validate');
            },
            //status code errors
            function(response){
                //already validated, not active or not existing mail for user
                if(response.status==409) {
                    console.log("User already validated,not active or not existing email.");
                    $location.url('/');
                }
                //db error
                else if(response.status==500){
                    console.log("DB error");
                }
            });
    }
}]);

//create the firstLoginCtrl, verify the e-mail and update passwords
app.controller('firstLoginCtrl', ['$scope','$http','$location',function($scope,$http,$location) {
    $scope.firstlogin = function(){
        var data = {
            'email': $scope.email,
            'oldPasswd' : $scope.oldPasswd,
            'newPasswd': $scope.newPasswd
        };
        $http.post('http://zaratech-ptm.ddns.net:8888/login/firstlogin',data
        ).then(function(response){
                $location.url('/');
                console.log("Change password correct");
            },
            //status code errors
            function(response){
                //incorrect validation user or non active user, or not existing email
                if(response.status==409) {
                    console.log("User not validated,not active, or not existing email");
                    $location.url('/');
                }
                //db error
                else if(response.status==500){
                    console.log("DB error");
                }
            });
    };
}]);

//create the firstLoginCtrl, verify the e-mail and update passwords
app.controller('forgotPasswdCtrl', ['$scope','$http','$location',function($scope,$http,$location) {
    $scope.remember = function(){
        var data = {
            'email': $scope.emailForgot
        };
        $http.post('http://zaratech-ptm.ddns.net:8888/login/remember',data
        ).then(function(response){
                $location.url('/');
            },
            //status code errors
            function(response){
                //incorrect validation user or non active user, or not existing email
                if(response.status==409) {
                    console.log("User not validated,not active, or not existing email");
                    $location.url('/');
                }
                //db error
                else if(response.status==500){
                    console.log("DB error");
                }
            });
    };
}]);

//create the firstLoginCtrl, verify the e-mail and update passwords
app.controller('LogoutController',['$location','$scope',function($location){
    localStorage.clear();
    $location.url('/');
}]);

app.controller('ShowHideUserMenu',['$scope','$route',function($scope,$route) {
    $scope.$on('$routeChangeSuccess', function() {
        $scope.userVisible = false;
        if(localStorage.getItem("token")){
            $scope.userVisible = true;
        }
    });
}]);













