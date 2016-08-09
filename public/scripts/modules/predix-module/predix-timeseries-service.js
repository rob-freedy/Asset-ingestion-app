define(['angular', './predix-module'], function(angular, module) {
    'use strict';

    /**
     * this service will handle all populate and actions on the line charts
     */
    module.factory('TimeseriesService', ['$q', '$http', '$log', function ($q, $http, $log) {
		return {
			getTimeseriesData: function(asset) {
				var deferred = $q.defer();
				$http.post('/api/timeseries-service', {
					'start': '1y-ago',
					'tags': [{
						'name': asset
					}]
				}).success(function(data){
					var result = data.tags[0].results[0].values;
					var dataToPush = new Array(result.length);
					for(var i = 0; i < result.length; i++){
						dataToPush[i]= [result[i][0], result[i][1]];
						
					}
					deferred.resolve(dataToPush);
				}).error(function(e){
					$log.info(e);
					deferred.resolve(false);
				});
				
				return deferred.promise;
			}
        };
    }]);
});
