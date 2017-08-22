var app = angular.module('app');

app.controller('uploadImageCtrl', ['$scope', 'upload', function ($scope, upload,$uibModalInstance)
{
	$scope.uploadFile = function()
	{
		var file = $scope.file;
		
		upload.uploadFile(file).then(function(res)
		{
			$scope.imageUrlResponse = 'http://zaratech-ptm.ddns.net:8888/images/' + res.data.id;
		})
	}

	$scope.close = function(){
    	$uibModalInstance.close();
	}
}]);

app.directive('uploaderModel', ["$parse", function ($parse) {
	return {
		restrict: 'A',
		link: function (scope, iElement, iAttrs) 
		{
			iElement.on("change", function(e)
			{
				$parse(iAttrs.uploaderModel).assign(scope, iElement[0].files[0]);
			});
		}
	};
}]);

app.service('upload', ["$http", "$q", function ($http, $q) 
{
	this.uploadFile = function(file, name)
	{
		var deferred = $q.defer();
		var formData = new FormData();
		formData.append("file", file);
		return $http.post("http://zaratech-ptm.ddns.net:8888/images/", formData, {
			headers: {
				"Content-type": undefined
			},
			transformRequest: angular.identity
		})
		.success(function(res)
		{
			deferred.resolve(res);
		})
		.error(function(msg, code)
		{
			deferred.reject(msg);
		})
		return deferred.promise;
	}	
}]);
