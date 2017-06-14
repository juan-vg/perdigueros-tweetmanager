/**
 * Created by sergiopedrerobenedi on 18/5/17.
 */
// Create the principal module that contains all the services and controllers which management the application
var app = angular.module('app');

/**
 * Controller that manage the signin view,that is the main view of the application.
 * Uses services $auth for satellizer, $location for routes, $scope for the scope and $http for internet services.
 */
app.controller('signinCtrl', ['$location', '$http', '$auth', '$rootScope',
    function ($location, $http,$auth,$rootScope) {
    var vm = this;

    // Local Login function
    this.login = function(){
        // Uses the $auth login function for login process
        $auth.login({
            'email' : vm.email,
            'passwd' : vm.passwd,
            'g-recaptcha-response' : vm.captchaResponse,
            'loginType' : 'local'
        })
        // success, sets userId in localStorage and redirects to dashboard view
        .then(function(response){
            console.log(response);
            localStorage.setItem('userId', response.data.id);
            $location.path('/dashboard');
        })
            //error
            .catch(function(response){
                console.log(response);
            });
    }

    // Authenticate function for social network login
    this.authenticate = function(provider) {
        // satellizer $auth function authenticate for providers login
        $auth.authenticate(provider)
            .then(function () {
                data = {
                    'code': localStorage.getItem('satellizer_token'),
                    'loginType': provider
                };
                // Sends 'code' and 'loginType' to backend
                $http.post('http://zaratech-ptm.ddns.net:8888/login/signin', data)
                    // if success redirect to /dashboard view
                    .then(function (response) {
                        $location.path('/dashboard');
                    });
            })
            // Handle errors
            .catch(function (error) {
                if (error.message) {
                    console.log(error);
                    // Satellizer promise reject error.
                    console.log(error.message);
                } else if (error.data) {
                    // HTTP response error from server
                    console.log(error.data.message + "   " + error.status);
                } else {
                    console.log(error);
                }
                //if errors calls to clear and logout for clean localstorage
                localStorage.clear();
                $auth.logout();

            });
    }

    // if localStorage has an user active, the behaviour is to redirect to dashboard view
        if($auth.isAuthenticated()){
            $
            $location.url('/dashboard');
        }
        // else redirects to signin view
        else{
            $location.url('/');
        }

    }]);


/**
 * Create the signup controller. Once it is successfully executed, redirects to validate view.
 * Otherwise, treat posibble errors.
 */

app.controller('signupCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    $scope.postData = function () {
        var data = {
            'name': $scope.name,
            'surname': $scope.surname,
            'email': $scope.email,
            'g-recaptcha-response': $scope.captchaResponse
        };
        $http.post('http://zaratech-ptm.ddns.net:8888/login/signup', data
        )
        //200 status code(valid,user not exists and not have other problems)
            .then(function (response) {
                    //redirection to /validate view
                    $location.url('/validate');
                },
                //status code errors
                function (response) {
                    //if email address already in use
                    if (response.status == 409) {

                    }
                    //if captcha validation error
                    else if (response.status == 400) {
                        console.log("Captcha validation error");
                    }
                    //db error
                    else if (response.status == 500) {
                        console.log("DB error");
                    }
                });
    };
}]);

/**
 * Create the validateCtrl, verify the e-mail and the code and redirect to 'first-login' page
 */
app.controller('validateCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    var mail = "";
    $scope.validate = function () {
        var data = {
            'email': $scope.email,
            'code': $scope.code
        };
        $http.post('http://zaratech-ptm.ddns.net:8888/login/validate', data
        ).then(function (response) {
                $location.url('/first-login');
            },
            //status code errors
            function (response) {
                //incorrect validation code
                if (response.status == 401) {
                    $scope.errorMessage = "Incorrect validation code";
                    console.log("Incorrect validation code");
                    $location.url('/');
                }
                //db error
                else if (response.status == 500) {
                    console.log("DB error");
                }
            });
    };

    // RESEND FUNCTION
    $scope.resend = function () {
        var data = {
            'email': $scope.email
        };
        $http.post('http://zaratech-ptm.ddns.net:8888/login/validate/resend', data
        ).then(function (response) {
                $location.url('/validate');
            },
            //status code errors
            function (response) {
                //already validated, not active or not existing mail for user
                if (response.status == 409) {
                    console.log("User already validated,not active or not existing email.");
                    $location.url('/');
                }
                //db error
                else if (response.status == 500) {
                    console.log("DB error");
                }
            });
    }
}]);

/**
 * Create the firstLoginCtrl, verify the e-mail and update passwords
 */
app.controller('firstLoginCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    $scope.firstlogin = function () {
        var data = {
            'email': $scope.email,
            'oldPasswd': $scope.oldPasswd,
            'newPasswd': $scope.newPasswd
        };
        $http.post('http://zaratech-ptm.ddns.net:8888/login/firstlogin', data
        ).then(function (response) {
                $location.url('/');
                console.log("Change password correct");
            },
            //status code errors
            function (response) {
                //incorrect validation user or non active user, or not existing email
                if (response.status == 409) {
                    console.log("User not validated,not active, or not existing email");
                    $location.url('/');
                }
                //db error
                else if (response.status == 500) {
                    console.log("DB error");
                }
            });
    };
}]);

/**
 * Create the forgotPasswdCtrl, that manages the forgotView .
 */
app.controller('forgotPasswdCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    $scope.remember = function () {
        var data = {
            'email': $scope.emailForgot
        };
        $http.post('http://zaratech-ptm.ddns.net:8888/login/remember', data
        ).then(function (response) {
                $location.url('/');
            },
            //status code errors
            function (response) {
                //incorrect validation user or non active user, or not existing email
                if (response.status == 409) {
                    console.log("User not validated,not active, or not existing email");
                    $location.url('/');
                }
                //db error
                else if (response.status == 500) {
                    console.log("DB error");
                }
            });
    };
}]);

/**
 * Create the LogoutController that manage the logout function of the site.
 */
app.controller('LogoutController', ['$auth','$location', function ($auth,$location) {
    $auth.logout();
    localStorage.clear();
    $location.url('/');
}]);


/**
 * Dashboard page controller
 */
app.controller('dashboardCtrl', function ($rootScope,$location,$scope, $http,$auth) {

});

/**
 * Controller to show or hide top user dropdown menu
 */
app.controller('userMenuCtrl', function ($scope,$auth) {
    $scope.isUserActive = function () {
        return $auth.isAuthenticated();
    }

});




