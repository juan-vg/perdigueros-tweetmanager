var app = angular.module('app');


/**
 * Controller for tweet table information
 */
app.controller('tweetTableCtrl', function ($rootScope, $http, AlertService, $uibModal, $websocket,$location) {
    var tweetCtrl = this;
    /*
    *  Load home timeline at init of controller
    * */
    $rootScope.$watch("activeAccount",function(){
        if($rootScope.activeAccount) {
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
            })
                .catch(function(response){
                    if(response.status==404){
                        tweetCtrl.homeTimeLineTweetsList = null;
                        AlertService.alert('Error','Cuenta no existente o desactivada','Cerrar');
                    }
                });

            tweetCtrl.getSeguimiento();

        }
    });
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
            })
                .catch(function (response) {
                    if(response.status==404){
                        tweetCtrl.homeTimeLineTweetsList = null;
                        AlertService.alert('Error','Cuenta no existente o desactivada','Cerrar');
                    }
                    else if(response.status==503){
                        AlertService.alert('Error','Error con servicio interno de Twitter, espere unos segundos para reintentar la operación','Cerrar');
                    }
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
                    AlertService.alert('Error', 'El id provisto no es válido o hay un error en los parametros. ', 'Cerrar');
                }
                else if (response.status == 403) {
                    AlertService.alert('Error', 'El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.', 'Cerrar');
                }
                else if (response.status == 404) {
                    AlertService.alert('Error', 'Cuenta no existente o desactivada.', 'Cerrar');
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
                    AlertService.alert('Error', 'El id provisto no es válido o hay un error en los parametros. ', 'Cerrar');
                }
                else if (response.status == 403) {
                    AlertService.alert('Error', 'El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.', 'Cerrar');
                }
                else if (response.status == 404) {
                    AlertService.alert('Error', 'Cuenta no existente o desactivada.', 'Cerrar');
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
                        AlertService.alert('Error', 'El id provisto no es válido o el tweet es demasiado largo para ser publicado. Revíselo antes ', 'Cerrar');
                    }
                    else if (response.status == 403) {
                        AlertService.alert('Error', 'El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.', 'Cerrar');
                    }
                    else if (response.status == 404) {
                        AlertService.alert('Error', 'Cuenta no existente o desactivada.', 'Cerrar');
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
                    AlertService.alert('Error', 'El id provisto no es válido o hay un error en los parametros. ', 'Cerrar');
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
                else if(response.status == 404){
                    AlertService.alert('Error','La cuenta seleccionada no existe o está desactivada','Cerrar');
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
                        AlertService.alert('Error', 'El id provisto no es válido o hay un error en los parametros. ', 'Cerrar');
                    }
                    else if (response.status == 403) {
                        AlertService.alert('Error', 'El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.', 'Cerrar');
                    }
                    else if (response.status == 404) {
                        AlertService.alert('Error', 'Cuenta no existente o desactivada', 'Cerrar');
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
                        AlertService.alert('Error', 'El id provisto no es válido o hay un error en los parametros. ', 'Cerrar');
                    }
                    else if (response.status == 403) {
                        AlertService.alert('Error', 'El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.', 'Cerrar');
                    }
                    else if (response.status == 404) {
                        AlertService.alert('Error', 'Cuenta no existente o desactivada', 'Cerrar');
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
                        AlertService.alert('Error', 'El id provisto no es válido o hay un error en los parametros. ', 'Cerrar');
                    }
                    else if (response.status == 403) {
                        AlertService.alert('Error', 'El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.', 'Cerrar');
                    }
                    else if (response.status == 404) {
                        AlertService.alert('Error', 'Cuenta no existente o desactivada', 'Cerrar');
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

    /**
     * Show URL shortener modal
     */
    tweetCtrl.showUrlModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'partials/modal/urlShortener.html',
            controller: 'urlModalCtrl'
        });
    }
    /**
     * Show upload image modal
     */

    tweetCtrl.uploadImageModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl : 'partials/modal/uploadImage.html',
            controller : 'uploadImageCtrl'
        });
    }
    /**
     * Function that get all hashtags added by twitter account
     */
    tweetCtrl.getAllHashtags = function () {
        var req = {
            method: 'GET',
            url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
            + localStorage.getItem('selectedAccount') + '/hashtags',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        }
        $http(req).then(function (response) {
            tweetCtrl.allHashtags = response.data;
        })
            .catch(function (response) {
                if (response.status == 400) {
                    AlertService.alert('Error', 'Debe seleccionar una cuenta de twitter antes', 'Cerrar');
                }
            });
    }

    /**
     *
     */
    tweetCtrl.webSocketFollowedUsers = function () {
        var ws2 = $websocket('ws://zaratech-ptm.ddns.net:8889/twitter-accounts/' +
            localStorage.getItem('selectedAccount') + '/tweets/hashtags');
        ws2.onOpen(function () {
            ws.close(true);
            ws2.send('token:' + localStorage.getItem('token'));
        });
        ws2.onError(function (error) {
            ws2.close(true);
        })

        var tweetCollection2 = [];
        ws2.onMessage(function (response) {
            ws.close(true);
            tweetCollection2.push(JSON.parse(response.data));
            tweetCtrl.followedUserTweet = tweetCollection2;
            console.log(tweetCtrl.followedUserTweet);
        });
    }
    /**
     * Add a new hashtag to the list
     */
    tweetCtrl.postHashtag = function () {
        var req = {
            method: 'POST',
            url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
            + localStorage.getItem('selectedAccount') + '/hashtags',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            },
            data: {
                'hashtag': tweetCtrl.hashtag
            }
        };
        $http(req).then(function (response) {
            AlertService.alert('Enhorabuena', 'El hashtag se ha añadido correctamente', 'Cerrar');
            tweetCtrl.getAllHashtags();
        })
            .catch(function (response) {
                if(response.status==403){
                    AlertService.alert('Error','El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.','Cerrar');
                    $location.url('/dashboard');
                }
                else if(response.status==400){
                    AlertService.alert('Error','El campo está vacío o ha habido un problema con la información introducida.','Cerrar');
                }
                else if(response.status==404){
                    AlertService.alert('Error','Cuenta no existente o desactivada','Cerrar');
                }
                else if(response.status==409){
                    AlertService.alert('Error','El hashtag a seguir ya existe en la lista de hashtags seguidos.','Cerrar');
                }
            });

    }

    /**
     * DELETES SELECTED HASHTAG
     */
    tweetCtrl.deleteHashtag = function (i) {
        var req = {
            method: 'DELETE',
            url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
            + localStorage.getItem('selectedAccount') + '/hashtags/' +
            i.hashtag,
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        };
        $http(req).then(function (response) {
            AlertService.alert('Enhorabuena', 'El hashtag a seguir se ha eliminado correctamente', 'Cerrar');
            tweetCtrl.getAllHashtags();
        })
            .catch(function (response) {

            });
    }

    tweetCtrl.getSeguimiento= function (){
        tweetCtrl.getAllHashtags();
        tweetCtrl.getAllFollowed();
    }

    /**
     * GETS ALL FOLLOWED USERS
     */
    tweetCtrl.getAllFollowed = function () {
        var req = {
            method: 'GET',
            url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
            + localStorage.getItem('selectedAccount') + '/followed-users',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        }
        $http(req).then(function (response) {
            tweetCtrl.allFollowedUsers = response.data;
        })
            .catch(function (response) {

            });


    }

    /**
     * ADD A NEW FOLLOWED USER
     */
    tweetCtrl.postFollowed = function () {
        var req = {
            method: 'POST',
            url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
            + localStorage.getItem('selectedAccount') + '/followed-users',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            },
            data: {
                'newuser': tweetCtrl.followedUser
            }

        };
        $http(req).then(function (response) {
            AlertService.alert('Enhorabuena', 'El usuario a seguir se ha añadido correctamente', 'Cerrar');
            tweetCtrl.getAllFollowed();
        })
            .catch(function (response) {
                if(response.status==403){
                    AlertService.alert('Error','El usuario actualmente logueado no tiene permiso sobre la cuenta de Twitter seleccionada.','Cerrar');
                    $location.url('/dashboard');
                }
                else if(response.status==400){
                    AlertService.alert('Error','El campo está vacío o ha habido un problema con la información introducida.','Cerrar');
                }
                else if(response.status==404){
                    AlertService.alert('Error','Cuenta no existente o desactivada','Cerrar');
                }
                else if(response.status==409){
                    AlertService.alert('Error','El usuario a seguir ya existe en la lista de usuarios seguidos.','Cerrar');
                }
            });

    }


    /**
     * DELETES A FOLLOWED USER
     */
    tweetCtrl.deleteFollowed = function (i) {
        var req = {
            method: 'DELETE',
            url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
            + localStorage.getItem('selectedAccount') + '/followed-users/' +
            i.user,
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        };
        $http(req).then(function (response) {
            AlertService.alert('Enhorabuena', 'El usuario a seguir se ha eliminado correctamente', 'Cerrar');
            tweetCtrl.getAllFollowed();
        })
            .catch(function (response) {

            });

    }

    /**
     * Open websocket chanell for hashtag tweets
     */
    tweetCtrl.webSocketHashtags = function () {

        if ($rootScope.activeAccount) {
            var ws = $websocket('ws://zaratech-ptm.ddns.net:8889/twitter-accounts/' +
                localStorage.getItem('selectedAccount') + '/tweets/hashtags');

            ws.onOpen(function () {
                ws.send('token:' + localStorage.getItem('token'));
            });

            var tweetCollection = [];
            ws.onMessage(function (response) {
                console.log(response);
                if (response.data == "TWITTER ERROR") {
                    ws.close(true);
                    ws = $websocket('ws://zaratech-ptm.ddns.net:8889/twitter-accounts/' +
                        localStorage.getItem('selectedAccount') + '/tweets/hashtags');
                }
                else if(response.data =='EMPTY LIST ERROR'){
                    AlertService.alert('Atencion','No hay hashtags a seguir en esta cuenta','Cerrar');
                }
                else if(response.data=='VALIDATION-ERROR: ACCOUNT NOT FOUND'){
                    AlertService.alert('Atencion','La cuenta no existe o está desactivada','Cerrar');
                }
                var res;
                try {
                    res = JSON.parse(response.data);
                }
                catch (e) {
                    res = {'id_str': response.data};
                }
                tweetCollection.push({
                    'id_str': res.id_str
                });
                tweetCtrl.hashtagTweet = tweetCollection;
            });
        }
        else{
            AlertService.alert('Error','Debe seleccionar una cuenta de twitter previamente.','Cerrar');
        }
    }

    /**
     *
     */
    tweetCtrl.webSocketFollowedUsers = function () {
        if ($rootScope.activeAccount) {
            var ws2 = $websocket('ws://zaratech-ptm.ddns.net:8889/twitter-accounts/' +
                localStorage.getItem('selectedAccount') + '/tweets/followed');

            var tweetCollection2 = [];
            ws2.onOpen(function () {
                ws2.send('token:' + localStorage.getItem('token'));
            });

            ws2.onMessage(function (response) {

                if (response.data == "TWITTER ERROR") {
                    ws2 = $websocket('ws://zaratech-ptm.ddns.net:8889/twitter-accounts/' +
                        localStorage.getItem('selectedAccount') + '/tweets/followed');
                }

                else if(response.data =='EMPTY LIST ERROR'){
                    AlertService.alert('Atencion','No hay usuarios a seguir en esta cuenta','Cerrar');
                }
                else if(response.data=='VALIDATION-ERROR: ACCOUNT NOT FOUND'){
                    AlertService.alert('Atencion','La cuenta no existe o está desactivada','Cerrar');
                }
                var res;
                try {
                    res = JSON.parse(response.data);
                }
                catch (e) {
                    res = {'id_str': response.data};
                }
                tweetCollection2.push({
                    'id_str': res.id_str
                });
                tweetCtrl.followedUserTweet = tweetCollection2;
            });
        }
        else{
            AlertService.alert('Error','Debe seleccionar una cuenta de twitter previamente.','Cerrar');
        }
    }

    tweetCtrl.isUserSelected = function(){
        var req = {
            method: 'GET',
            url: 'http://zaratech-ptm.ddns.net:8888/twitter-accounts/'
            + localStorage.getItem('selectedAccount') ,
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        }
        $http(req).then(function (response) {
        }).catch(function (response) {
            if(response.status==404){
                AlertService.alert('Error', 'Cuenta no existente o desactivada.', 'Cerrar');
            }
        });
    }
    tweetCtrl.shortUrl = function(){
            var data = {
                'url': tweetCtrl.url_data
            };
            $http.post('http://zaratech-ptm.ddns.net:8888/urls', data
            )
            //201 status code The short URL was created successfully
                .then(function (response) {
                        //get URL with the id of the original url
                        tweetCtrl.url_response="Resultado: http://zaratech-ptm.ddns.net:8888/urls/"+response.data.substring(21,45);
                    },
                    //status code errors
                    function (response) {
                        //if Params error
                        if (response.status == 400) {
                            alert("Error con el acortador");
                            console.log("Params error");
                        }
                        //DB insert error
                        else if (response.status == 500) {
                            alert("Error con el acortador debido a la base de datos");
                            console.log("DB error");
                        }
                    });
    }
});
