angular.module('AddTweet', []).controller('TweetController', ['$scope', function($scope, $http) {
       $scope.tweet = {
        minDate: new Date(new Date().getTime() + 5*60000)
       };
       $scope.addTweet =function() {

       };
}]);
