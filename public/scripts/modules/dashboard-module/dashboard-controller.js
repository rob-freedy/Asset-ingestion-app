define(['angular', './dashboard-module'], function (angular, controllers) {
    'use strict';

    // Controller definition
    controllers.controller('DashboardsCtrl', ['$scope', '$log', 'PredixAssetService', 'PredixViewService', 'TimeseriesService', 'HospitalService', 'FieldEngineerService', 'ServiceRequestService', function ($scope, $log, PredixAssetService, PredixViewService, TimeseriesService, HospitalService, FieldEngineerService, ServiceRequestService) {

	
		// For Service Request and Blobstore
		$scope.loading = true;
		$scope.newServiceRequest = {
			'dateCreated': new Date(),
			'dateFulfilled': '',
			'hospital': '',
			'fieldEngineer': '',
			'assetId': ''
		};
		$scope.hospitals = [];
		$scope.fieldEngineers = [];
		
		$scope.addAlert('information', 'Loading', 'Loading hospitals.', 'dismiss', 2000);
		HospitalService.getHospitals().then(function(data){
			$scope.hospitals = data.data;
			$scope.addAlert('information', data.status, data.message, 'dismiss', 2000);
			$scope.loading = false;
		}, function(){
			$scope.loading = false;
			$scope.addAlert('warning', 'Error', 'Error loading hospitals.', 'dismiss', null);
		});
		
		$scope.addAlert('information', 'Loading', 'Loading field engineers.', 'dismiss', 2000);
		FieldEngineerService.getFieldEngineers().then(function(data){
			$scope.fieldEngineers = data.data;
			$scope.addAlert('information', data.status, data.message, 'dismiss', 2000);
			$scope.loading = false;
		}, function(){
			$scope.loading = false;
			$scope.addAlert('warning', 'Error', 'Error loading field engineers.', 'dismiss', null);
		});
        
		$scope.addServiceRequest = function(){
			if(!$scope.newServiceRequest.hospital || !$scope.newServiceRequest.fieldEngineer || !$scope.newServiceRequest.assetId){
                $scope.addAlert('warning', 'Error', 'Hospital, Field Engineer, and AssetId cannot be empty.', 'dismiss', null);
				$scope.loading = false;
            }else{
				$scope.loading = true;
				$scope.addAlert('information', 'Adding', 'Adding new Service Request.', 'dismiss', 2000);
				
				ServiceRequestService.addServiceRequest($scope.newServiceRequest).then(function(data){
					if(data.data.status === 'Error'){
						$scope.addAlert('warning', 'Error', 'Error creating service request.', 'dismiss', null);
						$scope.loading = false;
					} else{
						$scope.addAlert('information', 'Success', 'Successfully created new service request.', 'dismiss', 2000);
						$scope.loading = false;
					}
				}, function(){
					$scope.addAlert('warning', 'Error', 'Error creating service request.', 'dismiss', null);
					$scope.loading = false;
				});
			}
		};
        
		// For Timeseries complete
		$scope.contextLineData = [];
		$scope.currentAsset = '';
		
		$scope.refreshData = function() {
			TimeseriesService.getTimeseriesData($scope.currentAsset).then(function(response){
				if(response === false){
					//error
				}else{
					$scope.contextLineData = response;
				}
			}, function (message) {
				$log.error(message);
			});
		};
		
		
		PredixAssetService.getAssetsByParentId('null').then(function (initialContext) {

            //pre-select the 1st asset
            initialContext.data[0].selectedAsset = true;
            $scope.initialContexts = initialContext;
            $scope.initialContextName = initialContext.data[0].name;

            //load view selector
            $scope.openContext($scope.initialContexts.data[0]);
        }, function (message) {
            $log.error(message);
        });

        $scope.decks = [];
        $scope.selectedDeckUrl = null;

        // callback for when the Open button is clicked
        $scope.openContext = function (contextDetails) {

            // need to clean up the context details so it doesn't have the infinite parent/children cycle,
            // which causes problems later (can't interpolate: {{context}} TypeError: Converting circular structure to JSON)
            var newContext = angular.copy(contextDetails);
            newContext.children = [];
            newContext.parent = [];

            // url end point can change from context to context
            // so the same card can display different data from different contexts

            var url = {
                'parent': {
                    'datagrid-data': '/sample-data/datagrid-data.json'
                },
                'child': {
                    'core-vibe-rear-cruise': '/sample-data/core-vibe-rear-cruise.json',
                    'delta-egt-cruise': '/sample-data/delta-egt-cruise.json'
                },
                'child2': {
                    'core-vibe-rear-cruise': '/sample-data/core-vibe-rear-cruise0.json',
                    'delta-egt-cruise': '/sample-data/delta-egt-cruise.json'
                },
                'child3': {
                    'core-vibe-rear-cruise': '/sample-data/core-vibe-rear-cruise1.json',
                    'delta-egt-cruise': '/sample-data/delta-egt-cruise.json'
                }
            };

            console.log(newContext);
            newContext.urls = url[newContext.id];

            console.log(newContext);

            $scope.context = newContext;
			
			if(newContext.parentId !== null){
				$scope.currentAsset = newContext.assetId;
				$scope.newServiceRequest.assetId = newContext.assetId;
				TimeseriesService.getTimeseriesData($scope.currentAsset).then(function(response){
					if(response === false){
						//error
					}else{
						$scope.contextLineData = response;
					}
				}, function (message) {
					$log.error(message);
				});
			}
			
            //Tag string can be classification from contextDetails
            PredixViewService.getDecksByTags(newContext.classification) // gets all decks for this context
                .then(function (decks) {
                    $scope.decks = [];

                    if (decks && decks.length > 0) {
                        decks.forEach(function (deck) {
                            $scope.decks.push({name: deck.title, id: deck.id});
                        });
                    }
                });
        };

        $scope.viewServiceBaseUrl = PredixViewService.baseUrl;

        $scope.getChildren = function (parent, options) {
            return PredixAssetService.getAssetsByParentId(parent.id, options);
        };

        $scope.handlers = {
            itemOpenHandler: $scope.openContext,
            getChildren: $scope.getChildren
            // (optional) click handler: itemClickHandler: $scope.clickHandler
        };
    }]);
});
