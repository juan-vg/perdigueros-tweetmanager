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
                .then(function (response, $rootScope) {
                    AlertService.alert('Enhorabuena', 'Te has logueado correctamente.', 'Cerrar');
                    localStorage.setItem('userId', response.data.id);
                    localStorage.setItem('token', response.data.token);
                    $location.path('/dashboard');
                })
                // Handle signin errors
                .catch(function (response) {
                    if (response.status == 400) {
                        AlertService.alert('Captcha', 'No se ha validado correctamente el captcha.Repita el proceso.', 'Cerrar');
                    }
                    else if (response.status == 401) {
                        AlertService.alert('Datos incorrectos', 'Revise los datos ingresados en el formulario de logueo.', 'Cerrar');
                    }
                    else if (response.status == 409) {
                        AlertService.alert('Validar la cuenta', 'La cuenta esta pendiente de ser validada. Por favor valídela. ', 'Cerrar');
                    }
                    else if (response.status == 459) {
                        AlertService.alert('Cambie su contraseña', 'Todavía no ha cambiado la contraseña generada por defecto.', 'Cerrar');
                    }
                    else if (response.status == 460) {

                        AlertService.alert('Datos incorrectos', 'Revise los datos ingresados en el formulario de logueo.', 'Cerrar');
                    }
                    else if (response.status == 500) {
                        AlertService.alert('DB error', 'Error en la base de datos.Disculpe las molestias.', 'Cerrar');
                    }
                    else if (response.status == 503) {
                        AlertService.alert('Error externo', 'Error de logueo por causas externas(Facebook,Google,OpenID).', 'Cerrar');
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
                    $http.post('http://zaratech-ptm.ddns.net:8888/login/signin', data)
                    // if success redirect to /dashboard view
                        .then(function (response) {
                            AlertService.alert('Enhorabuena', 'Te has logueado correctamente con ' + provider, 'Cerrar');
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
                        AlertService.alert('Error','Email ya está en uso en esta aplicación','Cerrar');
                    }
                    //if captcha validation error
                    else if (response.status == 400) {
                        AlertService.alert('Error','Captcha no resuelto correctamente','Cerrar');
                    }
                    //db error
                    else if (response.status == 500) {
                        AlertService.alert('Error','Error de la base de datos del sistema. Disculpe las molestias.','Cerrar');
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
        $http.post('http://zaratech-ptm.ddns.net:8888/login/validate', data
        ).then(function (response) {
                $location.url('/first-login');
            },
            //status code errors
            function (response) {
                //incorrect validation code
                if (response.status == 401) {
                    AlertService.alert('Error','Ha ingresado mal el codigo de validación. Reviselo o solicite uno nuevo','Cerrar');
                    $location.url('/');
                }
                else if(response.status == 400) {
                    AlertService.alert('Error','Error de parametros','Cerrar');
                }
                //db error
                else if (response.status == 500) {
                    AlertService.alert('Error','Error en la base de datos del sistema. Disculpe las molestias','Cerrar');
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
                    AlertService.alert('Error','El usuario ya está validado,está deshabilitado o no existe el e-mail en la aplicación.','Cerrar');
                    $location.url('/');
                }
                else if(response.status == 400){
                    AlertService.alert('Error','Parametros incorrectos','Cerrar');
                }
                //db error
                else if (response.status == 500) {
                    AlertService.alert('Error','Error en la base de datos del sistema.Disculpe las molestias.','Cerrar');
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
        $http.post('http://zaratech-ptm.ddns.net:8888/login/firstlogin', data
        ).then(function (response) {
                $location.url('/');
                console.log("Change password correct");
            },
            //status code errors
            function (response) {
                //incorrect validation user or non active user, or not existing email
                if (response.status == 409) {
                    AlertService.alert('Error','El usuario no está validado,está deshabilitado o no existe el e-mail en la aplicación.','Cerrar');
                    $location.url('/');
                }
                else if(response.status == 400){
                    AlertService.alert('Error','Parametros incorrectos.','Cerrar');
                }
                //db error
                else if (response.status == 500) {
                    AlertService.alert('Error','Error en la base de datos del sistema. Disculpe las molestias.','Cerrar');
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
        $http.post('http://zaratech-ptm.ddns.net:8888/login/remember', data
        ).then(function (response) {
            AlertService.alert('Enhorabuena','Se ha enviado su nueva contraseña por correo','Cerrar');
                $location.url('/');
            },
            //status code errors
            function (response) {
                //incorrect validation user or non active user, or not existing email
                if (response.status == 409) {
                    AlertService.alert('Error','El usuario no está validado,está deshabilitado o no existe el e-mail en la aplicación.','Cerrar');
                    $location.url('/');
                }
                //db error
                else if (response.status == 500) {
                    AlertService.alert('Error','Error en la base de datos del sistema. Disculpe las molestias.','Cerrar');
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
        url: 'http://zaratech-ptm.ddns.net:8888/users/' + localStorage.getItem('userId'),
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token')
        }
    };
    $http(req).then(function (response) {
        var name = response.data[0].email.substring(0, response.data[0].email.lastIndexOf("@"));
        $rootScope.currentUser = name;
        console.log(response);
        $rootScope.currentUserId = "";
    })
    //error
        .catch(function (response) {
            // Handle login errors
            if (response.status == 400) {
                localStorage.clear();
                AlertService.alert('Error','No tienes permiso para acceder a esta zona.','Cerrar');
                $location.url('/');

            }
            else if(response.status==403){
                localStorage.clear();
                AlertService.alert('Tiempo de inactividad', 'Debido a periodo de inactividad se ha cerrado la sesion por seguridad.', 'Cerrar');
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
        AlertService.alert('Cerrar sesión ', '¿Estás seguro de que quieres cerrar la sesión?', 'Ok', $scope.logout, 'Cancel');
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
                console.log(response);
                data.code = response.access_token;
                $http.post('http://zaratech-ptm.ddns.net:8888/login/reactivate', data)
                    .then(function (response) {
                        AlertService.alert('Enhorabuena', 'Se ha reactivado tu cuenta correctamente', 'Cerrar');
                    });
            });
        }
        else {
            // Sends 'code' and 'loginType' to backend
            $http.post('http://zaratech-ptm.ddns.net:8888/login/reactivate', data)
                .then(function (response) {
                    AlertService.alert('Enhorabuena', 'Se ha reactivado tu cuenta correctamente', 'Cerrar');
                })
                .catch(function (response) {
                    if (response.status == 400) {
                        AlertService.alert('Captcha', 'No se ha validado correctamente el captcha.Repita el proceso.', 'Cerrar');
                    }
                    else if (response.status == 401) {
                        AlertService.alert('Datos incorrectos', 'Revise los datos ingresados en el formulario de logueo.', 'Cerrar');
                    }
                    else if (response.status == 409) {
                        AlertService.alert('Validar la cuenta', 'La cuenta esta pendiente de ser validada. Por favor valídela. ', 'Cerrar');
                    }
                    else if (response.status == 459) {
                        AlertService.alert('Cambie su contraseña', 'Todavía no ha cambiado la contraseña generada por defecto.', 'Cerrar');
                    }
                    else if (response.status == 460) {

                        AlertService.alert('Datos incorrectos', 'Revise los datos ingresados en el formulario de logueo.', 'Cerrar');
                    }
                    else if (response.status == 500) {
                        AlertService.alert('DB error', 'Error en la base de datos.Disculpe las molestias.', 'Cerrar');
                    }
                    else if (response.status == 503) {
                        AlertService.alert('Error externo', 'Error de logueo por causas externas(Facebook,Google,OpenID).', 'Cerrar');
                    }
                });
        }
    }

});


app.controller('404Ctrl',function(){

});



