define(['angular', './predix-module'], function(angular, module) {
    'use strict';

    /**
     * this service will handle all populate and actions on the line charts
     */
    module.factory('BlobstoreService', ['$q', '$http', '$log', function ($q, $http, $log) {
        return {
            uploadObject: function(formData) {
				var deferred = $q.defer();
				$http.post('/api/blobstore/', formData, {
	                transformRequest: angular.identity,
	                headers: {
	                    'Content-Type': undefined
					}
				}).success(function(data){
					deferred.resolve(data);
				}).error(function(e){
					$log.info(e);
					deferred.resolve(false);
				});
				return deferred.promise;
			}
        };
    }]);
});
