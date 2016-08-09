define(['angular', './metadata-module'], function(angular, module) {
    'use strict';

    /**
     * this service will handle all populate and actions on the line charts
     */
    module.factory('ServiceRequestService', ['$q', '$http', '$log', function ($q, $http, $log) {
		var rootUrl = '/api/service_request/';
		return {
			getServiceRequests: function() {
				var deferred = $q.defer();
				$http.get(rootUrl).success(function(data){
					deferred.resolve(data);
				}).error(function(e){
					$log.error(e);
					deferred.resolve(false);
				});
				return deferred.promise;
			},
			addServiceRequest: function(serviceRequest) {
				var deferred = $q.defer();
				$http.post(rootUrl, serviceRequest).success(function(data){
					deferred.resolve(data);
				}).error(function(e){
					$log.error(e);
					deferred.resolve(false);
				});
				return deferred.promise;
			},
			updateServiceRequest: function(serviceRequest){
				var deferred = $q.defer();
				$http.put(rootUrl, serviceRequest).success(function(data){
					deferred.resolve(data);
				}).error(function(e){
					$log.error(e);
					deferred.resolve(false);
				});
				return deferred.promise;
			}
        };
    }]);
});
