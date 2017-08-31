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
                url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
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
                        AlertService.alert('Error','Account not exists or disabled','Cerrar');
                    }
                });

            tweetCtrl.getTracking();

        }
        else{
            tweetCtrl.homeTimeLineTweetsList = null;
        }
    });
    /**
     * GET HOME TIMELINE
     */
    tweetCtrl.getHomeTimeline = function () {
        if ($rootScope.activeAccount) {
            var req = {
                method: 'GET',
                url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
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
                        AlertService.alert('Error','Account not exists or it is disabled','Close');
                    }
                    else if(response.status==503){
                        AlertService.alert('Error','Twitter Internal Service error,wait few seconds for retry the operation.','Close');
                    }
                });
        }
        else {
            tweetCtrl.homeTimeLineTweetsList = null;
            AlertService.alert('Error', 'Twitter account must be selected previously.', 'Close');
        }
    };
    /**
     * GET MY TWEETS
     */
    tweetCtrl.getMyTweets = function () {
        if ($rootScope.activeAccount) {
            var req = {
                method: 'GET',
                url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
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
                    AlertService.alert('Error', 'Selected account is not valid for get my tweets operation.', 'Close');
                }
                else if (response.status == 403) {
                    localStorage.clear();
                    AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                    $location.url('/');
                }
                else if (response.status == 404) {
                    AlertService.alert('Error', 'Account not exists or it is disabled.', 'Close');
                }
                else if (response.status == 500) {
                    AlertService.alert('Error', 'Error into the database.', 'Close');
                }
                else if (response.status == 503) {
                    AlertService.alert('Error','Twitter Internal Service error,wait few seconds for retry the operation.','Close');
                }
            });
        }
        else {
            tweetCtrl.myTweets = null;
            AlertService.alert('Error', 'Twitter account must be selected previously.', 'Close');
        }
    };

    /**
     * GET SCHEDULED TWEETS
     */
    tweetCtrl.getScheduledTweets = function () {
        if ($rootScope.activeAccount) {
            var req = {
                method: 'GET',
                url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
                + localStorage.getItem('selectedAccount') + '/tweets/scheduled',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('token')
                }
            }
            $http(req).then(function (response) {
                tweetCtrl.scheduledTweets = response.data;
            }).catch(function (response) {
                if (response.status == 400) {
                    AlertService.alert('Error', 'Selected account is not valid for get scheduled tweets operation.', 'Close');
                }
                else if (response.status == 403) {
                    localStorage.clear();
                    AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                    $location.url('/');
                }
                else if (response.status == 404) {
                    AlertService.alert('Error', 'Account not exists or it is disabled.', 'Close');
                }
                else if (response.status == 500) {
                    AlertService.alert('Error', 'Error into the database.', 'Close');
                }
                else if (response.status == 503) {
                    AlertService.alert('Error','Twitter Internal Service error,wait few seconds for retry the operation.','Close');
                }
            });
        }
        else {
            tweetCtrl.scheduledTweets = null;
            AlertService.alert('Error', 'Twitter account must be selected previously.', 'Close');
        }
    }

    /**
     * PUBLISH A NEW TWEET
     */
    tweetCtrl.publishTweet = function () {
        if ($rootScope.activeAccount) {
            var req = {
                method: 'POST',
                url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
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
                AlertService.alert('Congratulations', 'Tweet has been published successfully.', 'Close');
            })
                .catch(function (response) {
                    if (response.status == 400) {
                        AlertService.alert('Error', 'Selected account is not valid for publish tweet operation.', 'Close');
                    }
                    else if (response.status == 403) {
                        localStorage.clear();
                        AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                        $location.url('/');
                    }
                    else if (response.status == 404) {
                        AlertService.alert('Error', 'Account not exists or it is disabled.', 'Close');
                    }
                    else if (response.status == 500) {
                        AlertService.alert('Error', 'Error into the database.', 'Close');
                    }
                    else if (response.status == 503) {
                        AlertService.alert('Error','Twitter Internal Service error,wait few seconds for retry the operation.','Close');
                    }
                });
        }
        else {
            AlertService.alert('Error', 'Twitter account must be selected previously.', 'Close');
        }
    }
    /**
     * SCHEDULED A TWEET BY DATE, HOUR AND MINUTE
     */
    tweetCtrl.scheduleTweet = function () {
        if ($rootScope.activeAccount) {
            var req = {
                method: 'POST',
                url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
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
                AlertService.alert('Congratulations', 'Tweet has been scheduled successfully.', 'Close');
            }).catch(function (response) {
                if (response.status == 400) {
                    AlertService.alert('Error', 'Selected account is not valid for schedule tweet operation.', 'Close');
                }
                else if (response.status == 403) {
                    localStorage.clear();
                    AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                    $location.url('/');
                }
                else if (response.status == 404) {
                    AlertService.alert('Error', 'Account not exists or it is disabled.', 'Close');
                }
                else if (response.status == 500) {
                    AlertService.alert('Error', 'Error into the database.', 'Close');
                }
                else if (response.status == 503) {
                    AlertService.alert('Error','Twitter Internal Service error,wait few seconds for retry the operation.','Close');
                }
            });
        }
        else {
            AlertService.alert('Error', 'Twitter account must be selected previously.', 'Close');
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
                url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
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
                        AlertService.alert('Error', 'Selected account is not valid for get mentions operation.', 'Close');
                    }
                    else if (response.status == 403) {
                        localStorage.clear();
                        AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                        $location.url('/');
                    }
                    else if (response.status == 404) {
                        AlertService.alert('Error', 'Account not exists or it is disabled.', 'Close');
                    }
                    else if (response.status == 500) {
                        AlertService.alert('Error', 'Error into the database.', 'Close');
                    }
                    else if (response.status == 503) {
                        AlertService.alert('Error','Twitter Internal Service error,wait few seconds for retry the operation.','Close');
                    }
                });
        }
        else {
            tweetCtrl.mentions = null;
            AlertService.alert('Error', 'Twitter account must be selected previously.', 'Close');
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
                url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
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
                        AlertService.alert('Error', 'Selected account is not valid for get retweets operation.', 'Close');
                    }
                    else if (response.status == 403) {
                        localStorage.clear();
                        AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                        $location.url('/');
                    }
                    else if (response.status == 404) {
                        AlertService.alert('Error', 'Account not exists or it is disabled.', 'Close');
                    }
                    else if (response.status == 500) {
                        AlertService.alert('Error', 'Error into the database.', 'Close');
                    }
                    else if (response.status == 503) {
                        AlertService.alert('Error','Twitter Internal Service error,wait few seconds for retry the operation.','Close');
                    }
                });
            ;
        }
        else {
            tweetCtrl.retweets = null;
            AlertService.alert('Error', 'Twitter account must be selected previously.', 'Close');
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
                url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
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
                        AlertService.alert('Error', 'Selected account is not valid for get favorites tweets operation.', 'Close');
                    }
                    else if (response.status == 403) {
                        localStorage.clear();
                        AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                        $location.url('/');
                    }
                    else if (response.status == 404) {
                        AlertService.alert('Error', 'Account not exists or it is disabled.', 'Close');
                    }
                    else if (response.status == 500) {
                        AlertService.alert('Error', 'Error into the database.', 'Close');
                    }
                    else if (response.status == 503) {
                        AlertService.alert('Error','Twitter Internal Service error,wait few seconds for retry the operation.','Close');
                    }
                });
            ;
        }
        else {
            tweetCtrl.favorites = null;
            AlertService.alert('Error', 'Twitter account must be selected previously.', 'Close');
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
            url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
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
                    AlertService.alert('Error', 'Twitter account must be selected previously.', 'Close');
                }
            });
    }

    /**
     *
     */
    tweetCtrl.webSocketFollowedUsers = function () {
        var ws2 = $websocket(localStorage.getItem('wsApi')+':'+localStorage.getItem('rtPort')+'/twitter-accounts/' +
            localStorage.getItem('selectedAccount') + '/tweets/hashtags');
        ws2.onOpen(function () {
            ws.close(true);
            ws2.send('token:' + localStorage.getItem('token'));
        });
        ws2.onError(function () {
            ws2.close(true);
        })

        var tweetCollection2 = [];
        ws2.onMessage(function (response) {
            ws.close(true);
            tweetCollection2.push(JSON.parse(response.data));
            tweetCtrl.followedUserTweet = tweetCollection2;
        });
    }
    /**
     * Add a new hashtag to the list
     */
    tweetCtrl.postHashtag = function () {
        var req = {
            method: 'POST',
            url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
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
            AlertService.alert('Congratulations', 'Hashtag has been added successfully', 'Close');
            tweetCtrl.getAllHashtags();
        })
            .catch(function (response) {
                if (response.status == 400) {
                    AlertService.alert('Error', 'Selected account is not valid for publish tweet operation.', 'Close');
                }
                else if (response.status == 403) {
                    localStorage.clear();
                    AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                    $location.url('/');
                }
                else if (response.status == 404) {
                    AlertService.alert('Error', 'Account not exists or it is disabled.', 'Close');
                }
                else if (response.status == 500) {
                    AlertService.alert('Error', 'Error into the database.', 'Close');
                }
                else if (response.status == 503) {
                    AlertService.alert('Error','Twitter Internal Service error,wait few seconds for retry the operation.','Close');
                }
            });

    }

    /**
     * DELETES SELECTED HASHTAG
     */
    tweetCtrl.deleteHashtag = function (i) {
        var req = {
            method: 'DELETE',
            url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
            + localStorage.getItem('selectedAccount') + '/hashtags/' +
            i.hashtag,
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        };
        $http(req).then(function (response) {
            AlertService.alert('Congratulations', 'Followed hashtag has been deleted successfully.', 'Close');
            tweetCtrl.getAllHashtags();
        })
            .catch(function (response) {
                if(response.status==400){
                    AlertService.alert('Error','The provided id is not valid','Close');
                }
                else if(response.status==403){
                    localStorage.clear();
                    AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                    $location.url('/');
                }
                else if(response.status==404){
                    AlertService.alert('Error','Hashtag not found','Close');
                }
                else if(response.status==409){
                    AlertService.alert('Conflict','The hashtag does not exists for the twitter account','Close');
                }
                else if(response.status==500){
                    AlertService.alert('Error','PTM database error','Close');
                }
            });
    }

    tweetCtrl.getTracking= function (){
        tweetCtrl.getAllHashtags();
        tweetCtrl.getAllFollowed();
    }

    /**
     * GETS ALL FOLLOWED USERS
     */
    tweetCtrl.getAllFollowed = function () {
        var req = {
            method: 'GET',
            url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
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
                if(response.status==403){
                    localStorage.clear();
                    AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                    $location.url('/');
                }
                else if(response.status==404){
                    AlertService.alert('Error','Twitter account for this operation not found','Close');

                }
                else if(response.status==500){
                    AlertService.alert('Error','PTM database error','Close');
                }
            });
    }

    /**
     * ADD A NEW FOLLOWED USER
     */
    tweetCtrl.postFollowed = function () {
        var req = {
            method: 'POST',
            url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
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
            AlertService.alert('Congratulations', 'Followed user has been added successfully.', 'Close');
            tweetCtrl.getAllFollowed();
        })
            .catch(function (response) {
                if(response.status==403){
                    AlertService.alert('Error','La cuenta no existe o está desactivada','Cerrar');
                    $location.url('/dashboard');
                }
                else if(response.status==400){
                    AlertService.alert('Error','El campo está vacío o ha habido un problema con la información introducida.','Cerrar');
                }
                else if(response.status==404){
                    AlertService.alert('Error','La cuenta no existe o está desactivada','Cerrar');
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
            url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
            + localStorage.getItem('selectedAccount') + '/followed-users/' +
            i.user,
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        };
        $http(req).then(function (response) {
            AlertService.alert('Congratulations', 'Followed user has been deleted successfully.', 'Close');
            tweetCtrl.getAllFollowed();
        })
            .catch(function (response) {
                if(response.status==400){
                    AlertService.alert('Error','The provided id is not valid','Close');
                }
                else if(response.status==403){
                    localStorage.clear();
                    AlertService.alert('Inactivity time', 'Due to inactivity, the session has been closed for security reasons.', 'Close');
                    $location.url('/');
                }
                else if(response.status==404){
                    AlertService.alert('Error','Followed user not found','Close');
                }
                else if(response.status==409){
                    AlertService.alert('Conflict','The followed user does not exists for the twitter account','Close');
                }
                else if(response.status==500){
                    AlertService.alert('Error','PTM database error','Close');
                }
            });
    }

    /**
     * Open websocket chanell for hashtag tweets
     */
    tweetCtrl.webSocketHashtags = function () {

        if ($rootScope.activeAccount) {
            var ws = $websocket(localStorage.getItem('wsApi')+':'+localStorage.getItem('rtport')+'/twitter-accounts/' +
                localStorage.getItem('selectedAccount') + '/tweets/hashtags');

            ws.onOpen(function () {
                ws.send('token:' + localStorage.getItem('token'));
            });

            var tweetCollection = [];
            ws.onMessage(function (response) {
                if (response.data == "TWITTER ERROR") {
                    ws.close(true);
                    ws = $websocket(localStorage.getItem('wsApi')+':'+localStorage.getItem('rtport')+'/twitter-accounts/' +
                        localStorage.getItem('selectedAccount') + '/tweets/hashtags');
                }
                else if(response.data =='EMPTY LIST ERROR'){
                    AlertService.alert('Atention','There are not hashtags to follow on this account.','Close');
                }
                else if(response.data=='VALIDATION-ERROR: ACCOUNT NOT FOUND'){
                    AlertService.alert('Atention','Account not exists or it is disabled.','Close');
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
            AlertService.alert('Error', 'Twitter account must be selected previously.', 'Close');
        }
    }

    /**
     *
     */
    tweetCtrl.webSocketFollowedUsers = function () {
        if ($rootScope.activeAccount) {
            var ws2 = $websocket(localStorage.getItem('wsApi')+':'+localStorage.getItem('rtport')+'/twitter-accounts/' +
                localStorage.getItem('selectedAccount') + '/tweets/followed');

            var tweetCollection2 = [];
            ws2.onOpen(function () {
                ws2.send('token:' + localStorage.getItem('token'));
            });

            ws2.onMessage(function (response) {

                if (response.data == "TWITTER ERROR") {
                    ws2 = $websocket(localStorage.getItem('wsApi')+':'+localStorage.getItem('rtport')+'/twitter-accounts/' +
                        localStorage.getItem('selectedAccount') + '/tweets/followed');
                }

                else if(response.data =='EMPTY LIST ERROR'){
                    AlertService.alert('Warning','There are not users to follow on this account.','Close');
                }
                else if(response.data=='VALIDATION-ERROR: ACCOUNT NOT FOUND'){
                    AlertService.alert('Warning','Account not exists or it is disabled.','Close');
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
            AlertService.alert('Error', 'Twitter account must be selected previously.', 'Close');
        }
    }

    tweetCtrl.isUserSelected = function(){
        var req = {
            method: 'GET',
            url: localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'
            + localStorage.getItem('selectedAccount') ,
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token')
            }
        }
        $http(req).then(function (response) {
        }).catch(function (response) {
            if(response.status==404){
                AlertService.alert('Atention','Account not exists or it is disabled.','Close');
            }
        });
    }
    tweetCtrl.shortUrl = function(){
            var data = {
                'url': tweetCtrl.url_data
            };
            $http.post(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/urls', data
            )
            //201 status code The short URL was created successfully
                .then(function (response) {
                        //get URL with the id of the original url
                        tweetCtrl.url_response="Resultado:" + localStorage.getItem('api')+":"+localStorage.getItem('port')+"/urls/"+response.data.id;
                    },
                    //status code errors
                    function (response) {
                        //if Params error
                        if (response.status == 400) {
                            AlertService.alert('Error','Shortener error','Close');
                        }
                        //DB insert error
                        else if (response.status == 500) {
                            AlertService.alert('Error','Shortener error cause of database','Close');
                        }
                    });
    }
});