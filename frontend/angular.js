angular.module('PwdCheck', []).controller('PasswordController', function ($scope) {
    $scope.pwdError =false;
    $scope.checkPwd =function() {
      if ($scope.password !== "12345678") {
        $scope.pwdError =true;
      }
    };
  });

var UsersData=angular.module('UsersData', []);
UsersData.controller('UserController', function($scope) {
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

UsersData.controller('UserDoorController', function($scope) {
	$scope.users =[
  					{
    					"name" : "alex",
    					"type" : "Salida",
    					"date" : "05/01/1998 01:00"
  					},
    				{
    					"name" : "albert",
    					"type" : "Nuevo",
    					"date" : "15/07/1999 15:00"
  					},
				];

});
UsersData.controller('UserLastController', function($scope) {
	var moment = require('js/moment');
	$scope.users =[
  					{
    					"name" : "alex",
    					"date" : "05/01/1998 01:00"
  					},
    				{
    					"name" : "albert",
    					"date" : "15/07/1999 15:00"
  					},
				];
});