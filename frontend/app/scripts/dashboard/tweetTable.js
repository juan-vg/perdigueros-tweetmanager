
var app = angular.module('app');


/**
 *
 */
app.controller('tweetTableCtrl', function ( $rootScope, $http,AlertService) {
    var tweetCtrl = this;
    // GET HOME
    tweetCtrl.getHomeTimeline = function() {
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
                console.log(response);
                tweetCtrl.homeTimeLineTweetsList = response.data;
            });
        }
        else{
            tweetCtrl.homeTimeLineTweetsList = null;
        }
    };
    // GET MY TWEETS
    tweetCtrl.getMyTweets = function() {
        if($rootScope.activeAccount) {
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
                console.log(response);
                tweetCtrl.myTweets = response.data;
            });
        }
        else{
            tweetCtrl.myTweets = null;
        }
    };
    // GET SCHEDULE TWEETS
    tweetCtrl.getScheduledTweets = function() {
        if($rootScope.activeAccount) {
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
            });
        }
        else{
            tweetCtrl.scheduledTweets = null;
        }
    }
    tweetCtrl.publishTweet = function(){
        if($rootScope.activeAccount) {
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
                AlertService.alert('Enhorabuena','El tweet se ha publicado correctamente.','Cerrar');
            });
        }
        else{
            console.log("Not user selected");
        }
    }
    tweetCtrl.scheduleTweet = function(){
        if($rootScope.activeAccount) {
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
                    'date' : tweetCtrl.sDate
                }
            };
            $http(req).then(function (response) {
                // Confirmation alert about schedule a tweet
                AlertService.alert('Enhorabuena','El tweet se ha programado correctamente.','Cerrar');
            });
        }
        else{
            console.log("Not user selected");
        }
    }
    tweetCtrl.getMentions = function(){
        // if an account is selected
        if($rootScope.activeAccount) {
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
                console.log(response);
                tweetCtrl.mentions = response.data;
            });
        }
        else{
            tweetCtrl.mentions = null;
        }
    }

});