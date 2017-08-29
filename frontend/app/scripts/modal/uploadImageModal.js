var app = angular.module('app');

app.controller('uploadImageCtrl', function ($scope, upload,$uibModalInstance)
{
    $scope.close = function(){
        $uibModalInstance.close();
    }

	$scope.uploadFile = function()
	{
		var file = $scope.file;
		
		upload.uploadFile(file).then(function(res)
		{
			$scope.imageUrlResponse = localStorage.getItem('api')+'/images/' + res.data.id;
		})
	}

});

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

app.service('upload', function ($http, $q)
{
    this.uploadFile = function(file)
    {
        var deferred = $q.defer();
        var formData = new FormData();
        formData.append("file", file);
        return $http.post(localStorage.getItem('api')+"/images/", formData, {
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
});

