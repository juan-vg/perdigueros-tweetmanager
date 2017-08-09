var app = angular.module('app');


/**
 * Controller for tweet table information
 */
app.controller('tweetTableCtrl', function ($rootScope, $http, AlertService) {
    var tweetCtrl = this;
    /**
     * GET HOME TIMELINE
     */
    tweetCtrl.getHomeTimeline = function () {
        if ($rootScope.activeAccount) {
            var req = {
                method: 'GET',
                url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
                + localStorage.getItem('selectedAccount') + '/tweets/home-timeline',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                }
            }
            $http(req).then(function (response) {
                tweetCtrl.homeTimeLineTweetsList = response.data;
            });
        }
        else {
            tweetCtrl.homeTimeLineTweetsList = null;
            AlertService.alert('Error', 'Debe seleccionar una cuenta de Twitter previamente', 'Cerrar');
        }
    };
    /**
     * GET MY TWEETS
     */
    tweetCtrl.getMyTweets = function () {
        if ($rootScope.activeAccount) {
            var req = {
                method: 'GET',
                url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
                + localStorage.getItem('selectedAccount') + '/tweets/user-timeline',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                }
            }
            $http(req).then(function (response) {
                tweetCtrl.myTweets = response.data;
            }).catch(function (response) {
                if (response.status == 400) {
                    AlertService.alert('Error', 'El id proveído no es váido o hay un error en los parametros. ', 'Cerrar');
                }
                else if (response.status == 403) {
                    AlertService.alert('Error', 'El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.', 'Cerrar');
                }
                else if (response.status == 404) {
                    AlertService.alert('Error', 'No ha sido posible encontrar la cuenta de twitter seleccionada.', 'Cerrar');
                }
                else if (response.status == 500) {
                    AlertService.alert('Error', 'Error en la base de datos', 'Cerrar');
                }
                else if (response.status == 503) {
                    AlertService.alert('Error', 'Servicio externo de Twitter no disponible.', 'Cerrar');
                }
            });
        }
        else {
            tweetCtrl.myTweets = null;
            AlertService.alert('Error', 'Debe seleccionar una cuenta de Twitter previamente', 'Cerrar');
        }
    };

    /**
     * GET SCHEDULED TWEETS
     */
    tweetCtrl.getScheduledTweets = function () {
        if ($rootScope.activeAccount) {
            var req = {
                method: 'GET',
                url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
                + localStorage.getItem('selectedAccount') + '/tweets/scheduled',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                }
            }
            $http(req).then(function (response) {
                console.log(response);
                tweetCtrl.scheduledTweets = response.data;
            }).catch(function (response) {
                if (response.status == 400) {
                    AlertService.alert('Error', 'El id proveído no es váido o hay un error en los parametros. ', 'Cerrar');
                }
                else if (response.status == 403) {
                    AlertService.alert('Error', 'El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.', 'Cerrar');
                }
                else if (response.status == 404) {
                    AlertService.alert('Error', 'No ha sido posible encontrar la cuenta de twitter seleccionada.', 'Cerrar');
                }
                else if (response.status == 500) {
                    AlertService.alert('Error', 'Error en la base de datos', 'Cerrar');
                }
                else if (response.status == 503) {
                    AlertService.alert('Error', 'Servicio externo de Twitter no disponible.', 'Cerrar');
                }
            });
        }
        else {
            tweetCtrl.scheduledTweets = null;
            AlertService.alert('Error', 'Debe seleccionar una cuenta de Twitter previamente', 'Cerrar');
        }
    }

    /**
     * PUBLISH A NEW TWEET
     */
    tweetCtrl.publishTweet = function () {
        if ($rootScope.activeAccount) {
            var req = {
                method: 'POST',
                url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
                + localStorage.getItem('selectedAccount') + '/tweets/publish',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                },
                data: {
                    'text': tweetCtrl.tweet
                }
            };
            $http(req).then(function (response) {
                // Confirmation alert about publish a new tweet
                AlertService.alert('Enhorabuena', 'El tweet se ha publicado correctamente.', 'Cerrar');
            })
                .catch(function (response) {
                    if (response.status == 400) {
                        AlertService.alert('Error', 'El id proveído no es váido o hay un error en los parametros. ', 'Cerrar');
                    }
                    else if (response.status == 403) {
                        AlertService.alert('Error', 'El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.', 'Cerrar');
                    }
                    else if (response.status == 404) {
                        AlertService.alert('Error', 'No ha sido posible encontrar la cuenta de twitter seleccionada.', 'Cerrar');
                    }
                    else if (response.status == 503) {
                        AlertService.alert('Error', 'Servicio externo de Twitter no disponible.', 'Cerrar');
                    }
                });
        }
        else {
            AlertService.alert('Error', 'Debe seleccionar una cuenta de Twitter previamente', 'Cerrar');
        }
    }
    /**
     * SCHEDULED A TWEET BY DATE, HOUR AND MINUTE
     */
    tweetCtrl.scheduleTweet = function () {
        if ($rootScope.activeAccount) {
            var req = {
                method: 'POST',
                url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
                + localStorage.getItem('selectedAccount') + '/tweets/schedule',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                },
                data: {
                    'text': tweetCtrl.sTweet,
                    'date': tweetCtrl.sDate
                }
            };
            $http(req).then(function (response) {
                // Confirmation alert about schedule a tweet
                AlertService.alert('Enhorabuena', 'El tweet se ha programado correctamente.', 'Cerrar');
            }).catch(function (response) {
                if (response.status == 400) {
                    AlertService.alert('Error', 'El id proveído no es váido o hay un error en los parametros. ', 'Cerrar');
                }
                else if (response.status == 403) {
                    AlertService.alert('Error', 'El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.', 'Cerrar');
                }
                else if (response.status == 500) {
                    AlertService.alert('Error', 'Error guardando tweet programado en la base de datos.', 'Cerrar');
                }
                else if (response.status == 503) {
                    AlertService.alert('Error', 'Servicio externo de Twitter no disponible.', 'Cerrar');
                }
            });
        }
        else {
            AlertService.alert('Error', 'Debe seleccionar una cuenta de Twitter previamente', 'Cerrar');
        }
    }

    /**
     * GET MENTIONS
     */
    tweetCtrl.getMentions = function () {
        // if an account is selected
        if ($rootScope.activeAccount) {
            var req = {
                method: 'GET',
                url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
                + localStorage.getItem('selectedAccount') + '/tweets/mentions',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                }
            }
            $http(req).then(function (response) {
                tweetCtrl.mentions = response.data;
            })
                .catch(function (response) {
                    if (response.status == 400) {
                        AlertService.alert('Error', 'El id proveído no es váido o hay un error en los parametros. ', 'Cerrar');
                    }
                    else if (response.status == 403) {
                        AlertService.alert('Error', 'El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.', 'Cerrar');
                    }
                    else if (response.status == 404) {
                        AlertService.alert('Error', 'No ha sido posible encontrar la cuenta de twitter seleccionada.', 'Cerrar');
                    }
                    else if (response.status == 500) {
                        AlertService.alert('Error', 'Error en la base de datos', 'Cerrar');
                    }
                    else if (response.status == 503) {
                        AlertService.alert('Error', 'Servicio externo de Twitter no disponible.', 'Cerrar');
                    }
                });
        }
        else {
            tweetCtrl.mentions = null;
            AlertService.alert('Error', 'Debe seleccionar una cuenta de Twitter previamente', 'Cerrar');
        }
    }

    /**
     * GET MY TWEETS HAS BEEN RETWEETED
     */
    tweetCtrl.getRetweets = function () {
        // if an account is selected
        if ($rootScope.activeAccount) {
            var req = {
                method: 'GET',
                url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
                + localStorage.getItem('selectedAccount') + '/tweets/retweeted',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                }
            }
            $http(req).then(function (response) {
                tweetCtrl.retweets = response.data;
            })
                .catch(function (response) {
                    if (response.status == 400) {
                        AlertService.alert('Error', 'El id proveído no es váido o hay un error en los parametros. ', 'Cerrar');
                    }
                    else if (response.status == 403) {
                        AlertService.alert('Error', 'El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.', 'Cerrar');
                    }
                    else if (response.status == 404) {
                        AlertService.alert('Error', 'No ha sido posible encontrar la cuenta de twitter seleccionada.', 'Cerrar');
                    }
                    else if (response.status == 500) {
                        AlertService.alert('Error', 'Error en la base de datos', 'Cerrar');
                    }
                    else if (response.status == 503) {
                        AlertService.alert('Error', 'Servicio externo de Twitter no disponible.', 'Cerrar');
                    }
                });
            ;
        }
        else {
            tweetCtrl.retweets = null;
            AlertService.alert('Error', 'Debe seleccionar una cuenta de Twitter previamente', 'Cerrar');
        }
    }

    /**
     * GET MY FAVORITE TWEETS
     */
    tweetCtrl.getFavorites = function () {
        // if an account is selected
        if ($rootScope.activeAccount) {
            var req = {
                method: 'GET',
                url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
                + localStorage.getItem('selectedAccount') + '/tweets/favorited',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                }
            }
            $http(req).then(function (response) {
                tweetCtrl.favorites = response.data;
            })
                .catch(function (response) {
                    if (response.status == 400) {
                        AlertService.alert('Error', 'El id proveído no es váido o hay un error en los parametros. ', 'Cerrar');
                    }
                    else if (response.status == 403) {
                        AlertService.alert('Error', 'El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.', 'Cerrar');
                    }
                    else if (response.status == 404) {
                        AlertService.alert('Error', 'No ha sido posible encontrar la cuenta de twitter seleccionada.', 'Cerrar');
                    }
                    else if (response.status == 500) {
                        AlertService.alert('Error', 'Error en la base de datos', 'Cerrar');
                    }
                    else if (response.status == 503) {
                        AlertService.alert('Error', 'Servicio externo de Twitter no disponible.', 'Cerrar');
                    }
                });
            ;
        }
        else {
            tweetCtrl.favorites = null;
            AlertService.alert('Error', 'Debe seleccionar una cuenta de Twitter previamente', 'Cerrar');
        }
    }
});