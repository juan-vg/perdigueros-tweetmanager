var app = angular.module('app');

var api = "http://zaratech-ptm.ddns.net:8888";
// Stadistics Data Binding
app.controller('statisticsController', function($rootScope,$http,$scope,$location,AlertService) {
    $rootScope.currentUser = localStorage.getItem('currentUserName');
    var req = {
        method: 'GET',
        url: api + '/stats/users',
        headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token')
        }
    };
    $http(req).then(
        function successCallback(stats){
            var stadisticsCtrl = this;
            var tweetLikesData = stats.data.tweetLikes;
            if (tweetLikesData.length != 0) {
                // Exist Data
                $scope.emptytweetlikes=false;
                var label=[];
                var data=[];
                for( key = 0; key < tweetLikesData.length; key++) {
                    var n=key;
                    n++;
                    label.push("#"+n);
                    data.push(tweetLikesData[key].count);
                }
                // Config Chart
                $scope.labelTl = label;
                $scope.dataTl = data;
                $scope.optionsTl = {
                    scales: {
						xAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
                $scope.arr_tl = [];
				for( key = 0; key < tweetLikesData.length; key++) {
                    $scope.arr_tl.push(tweetLikesData[key].tweet);
                }
            }
            else {
                // No exist data
                $scope.emptytweetlikes=true;
            }

            // Top Tweets/RT
            var tweetRetweetsData= stats.data.tweetRetweets;
            if (tweetRetweetsData.length != 0) {
                // Exist Data
                $scope.emptytweetretweets=false;
                var label=[];
                var data=[];
                for( key = 0; key < tweetRetweetsData.length; key++) {
                    var n=key;
                    n++;
                    label.push("#"+n);
                    data.push(tweetRetweetsData[key].count);
                }
                // Config Chart
                $scope.labelTrt = label;
                $scope.dataTrt = data;
                $scope.optionsTrt = {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
                $scope.arr_trt = [];
				for( key = 0; key < tweetRetweetsData.length; key++) {
                    $scope.arr_trt.push(tweetRetweetsData[key].tweet);
                }
            }
            else {
                // No exist data
                $scope.emptytweetretweets=true;
            }

            // Top Tweets/likes per Month
            var tweetLikesPerMonthData= stats.data.tweetLikesPerMonth;
            if (tweetLikesPerMonthData.length != 0) {
                // Exist Data
                $scope.emptytweetlikesmonth=false;
                var label=[];
                var data=[];
                for( key = 0; key < tweetLikesPerMonthData.length; key++) {
                    var n=key;
                    n++;
                    label.push("#"+n);
                    data.push(tweetLikesPerMonthData[key].count);
                }
                // Config Chart
                $scope.labelTlm = label;
                $scope.dataTlm = data;
                $scope.optionsTlm = {
                    scales: {
                        xAxes: [{
                            display: this.scalesdisplay,
                            ticks: {
                                beginAtZero:this.beginzero,
                            }
                        }],
                        yAxes: [{
                            display: this.scalesdisplay,
                            ticks: {
                                beginAtZero:this.beginzero,
                            }
                        }]
                    }
                };
                $scope.arr_tlm = [];
				for( key = 0; key < tweetLikesPerMonthData.length; key++) {
                    $scope.arr_tlm.push(tweetLikesPerMonthData[key].tweet);
                }
            }
            else {
                // No exist data
                $scope.emptytweetlikesmonth=true;
            }
            // Top Tweets/likes per Day
            var tweetLikesPerDayData= stats.data.tweetLikesPerDay;
            if (tweetLikesPerDayData.length != 0) {
                // Exist Data
                $scope.emptytweetlikesday=false;
                var label=[];
                var data=[];
                for( key = 0; key < tweetLikesPerDayData.length; key++) {
                    var n=key;
                    n++;
                    label.push("#"+n);
                    data.push(tweetLikesPerDayData[key].count);
                }
                // Config Chart
                $scope.labelTld = label;
                $scope.dataTld = data;
                $scope.optionsTld = {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                };
                $scope.arr_tld = [];
				for( key = 0; key < tweetLikesPerDayData.length; key++) {
                    $scope.arr_tld.push(tweetLikesPerDayData[key].tweet);
                }
            }
            else {
                // No exist data
                $scope.emptytweetlikesday=true;
            }

            // Top Tweets/RT per Month
            var tweetRetweetsPerMonthData= stats.data.tweetRetweetsPerMonth;
            if (tweetRetweetsPerMonthData.length != 0) {
                // Exist Data
                $scope.emptytweetretweetsmonth=false;
                var label=[];
                var data=[];
                for( key = 0; key < tweetRetweetsPerMonthData.length; key++) {
                    var n=key;
                    n++;
                    label.push("#"+n);
                    data.push(tweetRetweetsPerMonthData[key].count);
                }
                // Config Chart
                $scope.labelTrtm = label;
                $scope.dataTrtm = data;
                $scope.optionsTrtm = {
                    scales: {
                        xAxes: [{
                            display: this.scalesdisplay,
                            ticks: {
                                beginAtZero:this.beginzero,
                            }
                        }],
                        yAxes: [{
                            display: this.scalesdisplay,
                            ticks: {
                                beginAtZero:this.beginzero,
                            }
                        }]
                    }
                };
                $scope.arr_trtm = [];
				for( key = 0; key < tweetRetweetsPerMonthData.length; key++) {
                    $scope.arr_trtm.push(tweetRetweetsPerMonthData[key].tweet);
                }
            }
            else {
                // No exist data
                $scope.emptytweetretweetsmonth=true;
            }
            // Top Tweets/RT per Day
            var tweetRetweetsPerDayData= stats.data.tweetRetweetsPerDay;
            if (tweetRetweetsPerDayData.length != 0) {
                // Exist Data
                $scope.emptytweetretweetsday=false;
                var label=[];
                var data=[];
                for( key = 0; key < tweetRetweetsPerDayData.length; key++) {
                    var n=key;
                    n++;
                    label.push("#"+n);
                    data.push(tweetRetweetsPerDayData[key].count);
                }
                // Config Chart
                $scope.labelTrtd = label;
                $scope.dataTrtd = data;
                $scope.optionsTrtd	= {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                };
                $scope.arr_trtd = [];
				for( key = 0; key < tweetRetweetsPerDayData.length; key++) {
                    $scope.arr_trtd.push(tweetRetweetsPerDayData[key].tweet);
                }
            }
            else {
                // No exist data
                $scope.emptytweetretweetsday=true;
            }
            // Number Tweets per Day
            var tweetsPerDayData= stats.data.tweetsPerDay;
            if (tweetsPerDayData.length != 0) {
                // Exist Data
                $scope.emptytweetsday=false;
                var label=[];
                var data=[];
                for( key = 0; key < tweetsPerDayData.length; key++) {
                    label.push("Dia: "+tweetsPerDayData[key].day);
                    data.push(tweetsPerDayData[key].count);
                }
                // Config Chart
                $scope.labelTd = label;
                $scope.dataTd = data;
                $scope.optionsTd	= {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            }
            else {
                // No exist data
                $scope.emptytweetsday=true;
            }
            // accFollowers
            var accFollowersData = stats.data.accFollowers;
            if (accFollowersData.length != 0) {
                // Exist Data
                $scope.emptyaccFollowers=false;
                var label=[];
                var data=[];
                for( key = 0; key < accFollowersData.length; key++) {
                    label.push(accFollowersData[key].accId);
                    data.push(accFollowersData[key].count);
                }
                // Config Chart
                $scope.labelAc = label;
                $scope.dataAc = data;
                $scope.optionsAc = {
                    scales: {
                        xAxes: [{
                            display: this.scalesdisplay,
                            ticks: {
                                beginAtZero:this.beginzero,
                            }
                        }],
                        yAxes: [{
                            display: this.scalesdisplay,
                            ticks: {
                                beginAtZero:this.beginzero,
                            }
                        }]
                    }
                };
                // OnClick when user click on the chart, it show description data of an account
                $scope.onClickAc = function (points, evt) {

                    var req = {
                        method: 'GET',
                        url: api + '/twitter-accounts/'+points[0]._view.label,
                        headers: {
                            'Content-Type': 'application/json',
                            'token': localStorage.getItem('token')
                        }
                    };
                    $http(req).then(successCallbackInfoAcc,errorCallbackInfoAcc);
                    // Request account data information
                    /* $http.get(api+'/twitter-accounts/'+points[0]._view.label,{headers: {'token': localStorage.getItem('token_admin')}}).then(successCallbackInfoAcc, errorCallbackInfoAcc);*/
                    function successCallbackInfoAcc(info){
                        $scope.acc_id=points[0]._view.label;
                        $scope.info_acc="Descripcion: " + info.data[0].description;
                    }
                    function errorCallbackInfoAcc(error){
                        $scope.info_acc="Error obteniendo datos";
                    }
                };
            }
            else {
                // No exist data
                $scope.emptyaccFollowers=true;
            }
            // top hashtags
            var hashtagsData = stats.data.hashtags;
            if (hashtagsData.length != 0) {
                // Exist Data
                $scope.emptyHashtags=false;
                var label=[];
                var data=[];
                for( key = 0; key < hashtagsData.length; key++) {
                    label.push(hashtagsData[key].hashtag);
                    data.push(hashtagsData[key].count);
                }
                // Config Chart
                $scope.labelHashtags = label;
                $scope.dataHashtags = data;
                $scope.optionsHashtags = {
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero:true,
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero:this.beginzero,
                            }
                        }]
                    }
                };
            }
            else {
                // No exist data
                $scope.emptyHashtags=true;
            }
            // Top Followed Users
            var followedData = stats.data.followed;
            if (followedData.length != 0) {
                // Exist Data
                $scope.emptyFollowed=false;
                var label=[];
                var data=[];
                for( key = 0; key < followedData.length; key++) {
                    label.push(followedData[key].followed);
                    data.push(followedData[key].count);
                }
                // Config Chart
                $scope.labelFollowed = label;
                $scope.dataFollowed = data;
                $scope.optionsFollowed = {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                };
            }
            else {
                // No exist data
                $scope.emptyFollowed=true;
            }

        }, function errorCallback(error){
			console.log("Error getting stats");
			var error_msg = "Error " + error.status + ": " + error.data;
			alert(error_msg);
		})
    .catch(function(response){
        if(response.status==403){
            localStorage.clear();
            AlertService.alert('Error','No tienes permiso para acceder a esta zona.','Cerrar');
            $location.url('/');
        }
    });
});
