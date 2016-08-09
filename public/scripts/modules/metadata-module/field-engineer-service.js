define(['angular', './metadata-module'], function(angular, module) {
    'use strict';

    /**
     * this service will handle all populate and actions on the line charts
     */
    module.factory('FieldEngineerService', ['$q', '$http', '$log', function ($q, $http, $log) {
		var rootUrl = '/api/field_engineer/';
		return {
			getFieldEngineers: function() {
				var deferred = $q.defer();
				$http.get(rootUrl).success(function(data){
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