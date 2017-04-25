angular.module('PwdCheck', []).directive('validPasswordC', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue, $scope) {
                var noMatch = viewValue != scope.myForm.password.$viewValue
                ctrl.$setValidity('noMatch', !noMatch)
            })
        }
    }
});

angular.module('UsersData', []).controller('UserController', function($scope) {
	$scope.users =[
  					{
    					"name" : "alex",
    					"last" : "29/08/2016",
    					"first" : "29/04/2016"
  					},
    				{
    					"name" : "albert",
    					"last" : "29/08/2016",
    					"first" : "29/04/2016"
  					},
  					{
    					"name" : "andrea",
    					"last" : "29/08/2016",
    					"first" : "29/04/2016"
  					},
				];
	$scope.removeUser =function(name) {
		var index = -1;		
		var comArr = eval( $scope.users );
		for( var i = 0; i < comArr.length; i++ ) {
			if( comArr[i].name === name ) {
				index = i;
				break;
			}
		}
		$scope.users.splice( index, 1 );		
	};

});