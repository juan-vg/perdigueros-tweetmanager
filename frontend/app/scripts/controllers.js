/**
 * Created by sergiopedrerobenedi on 18/5/17.
 */
// Create the principal module that contains all the services and controllers which management the application
var app = angular.module('app');


/**
 * Controller that manage the signin view,that is the main view of the application.
 * Uses services $auth for satellizer, $location for routes, $scope for the scope and $http for internet services.
 */
app.controller('signinCtrl', ['$location', '$http', '$auth', 'AlertService',
    function ($location, $http, $auth, AlertService) {
        var vm = this;

        $http.get('config.json').
        then(function onSuccess(response) {
            localStorage.setItem('api', response.data.api);
            localStorage.setItem('port', response.data.apiPort);
            localStorage.setItem('rtport', response.data.rtPort);
            localStorage.setItem('wsApi',response.data.wsApi);
        }).
        catch(function onError(response) {
            console.log("Error obteniendo API");
        });

        // Local Login function
        this.login = function () {
            // Uses the $auth login function for login process
            $auth.login({
                'email': vm.email,
                'passwd': vm.passwd,
                'g-recaptcha-response': vm.captchaResponse,
                'loginType': 'local'
            })
            // success, sets userId in localStorage and redirects to dashboard view
                .then(function (response) {
                    AlertService.alert('Congratulations', 'You have signed in successfully.', 'Close');
                    localStorage.setItem('userId', response.data.id);
                    localStorage.setItem('token', response.data.token);
                    $location.path('/dashboard');
                })
                // Handle signin errors
                .catch(function (response) {
                    if (response.status == 400) {
                        AlertService.alert('Captcha', 'Captcha is not correct validated.Please, try again.', 'Close');
                    }
                    else if (response.status == 401) {
                        AlertService.alert('Incorrect data', 'Check the data entered in the sign in form.', 'Close');
                    }
                    else if (response.status == 409) {
                        AlertService.alert('Validate account', 'Account is pending validation. Please validate it. ', 'Close');
                    }
                    else if (response.status == 459) {
                        AlertService.alert('Change your password', 'The password generated by default has not yet been changed.', 'Close');
                    }
                    else if (response.status == 460) {

                        AlertService.alert('Incorrect data', 'Check the data entered in the sign in form', 'Close');
                    }
                    else if (response.status == 500) {
                        AlertService.alert('DB error', 'Error in database. Sorry for the inconvenience', 'Close');
                    }
                    else if (response.status == 503) {
                        AlertService.alert('External error', 'Error signin by external causes(Facebook,Google,OpenID)', 'Close');
                    }
                });
        }

        // Authenticate function for social network login
        this.authenticate = function (provider) {
            // satellizer $auth function authenticate for providers login
            $auth.authenticate(provider)
                .then(function () {
                    data = {
                        'code': localStorage.getItem('satellizer_token'),
                        'loginType': provider
                    };
                    // Sends 'code' and 'loginType' to backend
                    $http.post(localStorage.getItem('api')+":"+localStorage.getItem('port')+ '/login/signin', data)
                    // if success redirect to /dashboard view
                        .then(function (response) {
                            AlertService.alert('Congratulations', 'You have been successfully signed in with ' + provider +'.', 'Close');
                            localStorage.removeItem('satellizer_token');
                            localStorage.setItem('userId', response.data.id);
                            localStorage.setItem('token', response.data.token);
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
        if (localStorage.getItem('token')) {
            $location.url('/dashboard');
        }
        // else redirects to signin view
        else {
            localStorage.clear();
            $location.url('/');
        }

    }]);


/**
 * Create the signup controller. Once it is successfully executed, redirects to validate view.
 * Otherwise, treat posibble errors.
 */

app.controller('signupCtrl', ['$scope', '$http', '$location','AlertService', function ($scope, $http, $location,AlertService) {
    $scope.postData = function () {
        var data = {
            'name': $scope.name,
            'surname': $scope.surname,
            'email': $scope.email,
            'g-recaptcha-response': $scope.captchaResponse
        };
        $http.post(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/login/signup', data
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
                        AlertService.alert('Error','Email has been used in this application.','Close');
                    }
                    //if captcha validation error
                    else if (response.status == 400) {
                        AlertService.alert('Error','Captcha not resolved correctly.','Close');
                    }
                    //db error
                    else if (response.status == 500) {
                        AlertService.alert('Error','Error in database. Sorry for the inconvenience','Close');
                    }
                });
    };
}]);

/**
 * Create the validateCtrl, verify the e-mail and the code and redirect to 'first-login' page
 */
app.controller('validateCtrl', ['$scope', '$http', '$location','AlertService', function ($scope, $http, $location,AlertService) {
    var mail = "";
    $scope.validate = function () {
        var data = {
            'email': $scope.email,
            'code': $scope.code
        };
        $http.post(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/login/validate', data
        ).then(function (response) {
                $location.url('/first-login');
            },
            //status code errors
            function (response) {
                //incorrect validation code
                if (response.status == 401) {
                    AlertService.alert('Error','You have entered the validation code incorrectly. Check it out or request a new one','Close');
                    $location.url('/');
                }
                else if(response.status == 400) {
                    AlertService.alert('Error','Params error','Close');
                }
                //db error
                else if (response.status == 500) {
                    AlertService.alert('Error','Error in database. Sorry for the inconvenience','Close');
                }
            });
    };

    // RESEND FUNCTION
    $scope.resend = function () {
        var data = {
            'email': $scope.email
        };
        $http.post(localStorage.getItem('api')+":"+localStorage.getItem('port')+'validate/resend', data
        ).then(function (response) {
                $location.url('/validate');
            },
            //status code errors
            function (response) {
                //already validated, not active or not existing mail for user
                if (response.status == 409) {
                    AlertService.alert('Error','The user is already validated, disabled or there is no e-mail in the application.','Close');
                    $location.url('/');
                }
                else if(response.status == 400){
                    AlertService.alert('Error','Incorrect params','Close');
                }
                //db error
                else if (response.status == 500) {
                    AlertService.alert('Error','Error in database. Sorry for the inconvenience.','Close');
                }
            });
    }
}]);

/**
 * Create the firstLoginCtrl, verify the e-mail and update passwords
 */
app.controller('firstLoginCtrl', ['$scope', '$http', '$location','AlertService', function ($scope, $http, $location,AlertService) {
    $scope.firstlogin = function () {
        var data = {
            'email': $scope.email,
            'oldPasswd': $scope.oldPasswd,
            'newPasswd': $scope.newPasswd
        };
        $http.post(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/login/firstlogin', data
        ).then(function (response) {
                $location.url('/');
                AlertService.alert('Congratulations','Password be changed successfully','Close');
            },
            //status code errors
            function (response) {
                //incorrect validation user or non active user, or not existing email
                if (response.status == 409) {
                    AlertService.alert('Error','The user is already validated, disabled or there is no e-mail in the application.','Close');
                    $location.url('/');
                }
                else if(response.status == 400){
                    AlertService.alert('Error','Incorrect params.','Close');
                }
                //db error
                else if (response.status == 500) {
                    AlertService.alert('Error','Error in database. Sorry for the inconvenience.','Close');
                }
            });
    };
}]);

/**
 * Create the forgotPasswdCtrl, that manages the forgotView .
 */
app.controller('forgotPasswdCtrl', ['$scope', '$http', '$location','AlertService', function ($scope, $http, $location,AlertService) {
    $scope.remember = function () {
        var data = {
            'email': $scope.emailForgot
        };
        $http.post(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/login/remember', data
        ).then(function (response) {
            AlertService.alert('Congratulations','New password has been generated and it has been sended to your e-mail.','Close');
                $location.url('/');
            },
            //status code errors
            function (response) {
                //incorrect validation user or non active user, or not existing email
                if (response.status == 409) {
                    AlertService.alert('Error','The user is already validated, disabled or there is no e-mail in the application.','Close');
                    $location.url('/');
                }
                //db error
                else if (response.status == 500) {
                    AlertService.alert('Error','Error in database. Sorry for the inconvenience.','Close');
                }
            });
    };
}]);


/**
 * Dashboard page controller
 */
app.controller('dashboardCtrl', function ($rootScope, $location, $scope, $http, AlertService) {
    var req = {
        method: 'GET',
        url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/users/' + localStorage.getItem('userId'),
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token')
        }
    };
    $http.get('config.json').
    then(function onSuccess(response) {
        localStorage.setItem('api', response.data.api);
        localStorage.setItem('port', response.data.apiPort);
    }).
    catch(function onError(response) {
        console.log("Error getting API");
    });
    $http(req).then(function (response) {
        var name = response.data[0].email.substring(0, response.data[0].email.lastIndexOf("@"));
        $rootScope.currentUser = name;
        localStorage.setItem('currentUserName',name);
        $rootScope.currentUserId = "";
    })
    //error
        .catch(function (response) {
            // Handle login errors
            if (response.status == 400) {
                localStorage.clear();
                AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                $location.url('/');

            }
            else if(response.status==403){
                localStorage.clear();
                AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                $location.url('/');
            }
        });

});

/**
 * Controller to show or hide top user dropdown menu
 */
app.controller('userMenuCtrl', function ($scope, AlertService, $location) {
    $scope.isUserActive = function () {
        // if token exists
        if (localStorage.getItem('token')) {
            return true;
        }
        //if token not exists
        else {
            return false;
        }
    }

    $scope.logout = function () {
        localStorage.clear();
        $location.url('/');
    }

    $scope.showModal = function () {
        AlertService.alert('Close session ', 'Are you sure you want to log out?', 'Yes', $scope.logout, 'Cancel');
    }

});
/**
 * Angular controller which reactives an user account
 */
app.controller('reactivateCtrl',function($http,AlertService,$auth) {
    var vm = this;

    // Local Login function
    this.reactivate = function (provider) {
        var data = {
            'email': vm.email,
            'passwd': vm.passwd,
            'g-recaptcha-response': vm.captchaResponse,
            'loginType': provider,
            'code': ''
        };
        if (data.loginType != 'local') {
            $auth.authenticate(provider).then(function(response){
                data.code = response.access_token;
                $http.post(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/login/reactivate', data)
                    .then(function (response) {
                        AlertService.alert('Congratulations', 'Account has been reactivated successfully.', 'Close');
                    });
            });
        }
        else {
            // Sends 'code' and 'loginType' to backend
            $http.post(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/login/reactivate', data)
                .then(function () {
                    AlertService.alert('Congratulations', 'Account has been reactivated successfully.', 'Close');
                })
                .catch(function (response) {
                    if (response.status == 400) {
                        AlertService.alert('Captcha', 'Captcha is not correct validated.Please, try again.', 'Close');
                    }
                    else if (response.status == 401) {
                        AlertService.alert('Incorrect data', 'Check the data entered in the sign in form.', 'Close');
                    }
                    else if (response.status == 409) {
                        AlertService.alert('Validate account', 'La cuenta esta pendiente de ser validada. Por favor valídela. ', 'Close');
                    }
                    else if (response.status == 459) {
                        AlertService.alert('Change your password', 'The password generated by default has not yet been changed.', 'Close');
                    }
                    else if (response.status == 460) {

                        AlertService.alert('Incorrect data', 'Check the data entered in the sign in form', 'Close');
                    }
                    else if (response.status == 500) {
                        AlertService.alert('DB error', 'Error in database. Sorry for the inconvenience', 'Close');
                    }
                    else if (response.status == 503) {
                        AlertService.alert('External error', 'Error signin by external causes(Facebook,Google,OpenID)', 'Close');
                    }
                });
        }
    }

});


app.controller('404Ctrl',function(){
 AlertService.alert('Error','Requested route not exists','Close');
 $location.url('/');
});



