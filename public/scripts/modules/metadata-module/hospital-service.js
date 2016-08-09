define(['angular', './metadata-module'], function(angular, module) {
    'use strict';

    /**
     * this service will handle all populate and actions on the line charts
     */
    module.factory('HospitalService', ['$q', '$http', '$log', function ($q, $http, $log) {
		var rootUrl = '/api/hospitals/';
		return {
			getHospitals: function() {
				var deferred = $q.defer();
				$http.get(rootUrl).success(function(data){
					deferred.resolve(data);
				}).error(function(e){
					$log.error(e);
					deferred.resolve(false);
				});
				return deferred.promise;
			},
			addHospital: function(hospital){
				var deferred = $q.defer();
				$http.post(rootUrl, hospital).success(function(data){
					deferred.resolve(data);
				}).error(function(e){
					$log.error(e);
					deferred.resolve(false);
				});
				return deferred.promise;
			},
			deleteHospital: function(hospitalId){
				var deferred = $q.defer();
				$http.delete(rootUrl+hospitalId).success(function(data){
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
