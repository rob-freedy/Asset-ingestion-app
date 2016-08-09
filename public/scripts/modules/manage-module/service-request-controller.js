/*globals Polymer */

define(['angular', './manage-module'], function (angular, controllers) {
    'use strict';

    // Controller definition
    controllers.controller('ServiceRequestCtrl', ['$scope', '$rootScope', '$log', 'HospitalService', 'FieldEngineerService', 'ServiceRequestService', 'BlobstoreService', function ($scope, $rootScope, $log, HospitalService, FieldEngineerService, ServiceRequestService, BlobstoreService) {

		$rootScope.loading = true;
        $scope.alServiceRequestsHeaderText = 'All Service Requests';
		$scope.serviceRequests = [];
		$scope.selectedServiceRequest = '';
		$scope.myFile = null;

		$scope.$watch('file', function (newVal) {
			if (newVal){
				$log.info(newVal);
			}
		});
		  
		$scope.hospitals = [];
		$scope.fieldEngineers = [];
		$scope.ttt = '';
		
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
	
		$scope.refresh = function(){
            $rootScope.loading = true;
            $scope.addAlert('information', 'Loading', 'Loading service requests.', 'dismiss', 2000);
            ServiceRequestService.getServiceRequests().then(function(data){
	            $scope.addAlert('information', data.status, data.message, 'dismiss', 2000);
                $scope.serviceRequests = data.data;
                $rootScope.loading = false;
	        }, function(){
	            $scope.addAlert('error', 'Error', 'Error loading service requests.', 'dismiss', 5000);
                $rootScope.loading = false;
	        });
        };
		
		$scope.uploadFile = function(){
			$rootScope.loading = true;
			var formData = new FormData();
			formData.append('file', $scope.myFile);
			
			// first upload the file into the blobstore
			BlobstoreService.uploadObject(formData).then(function(data){
				var blobId = data.data;
				// now we want to add this to the attachment list
				$scope.selectedServiceRequest.serviceRequestsAttachment.push({
					'blobUrl':blobId
				});
                $scope.addAlert('information', data.status, data.message, 'dismiss', 2000);
                $rootScope.loading = false;
				$scope.refresh();
				Polymer.dom(document).querySelector('#update-service-request-modal').modalButtonClicked();
				Polymer.dom(document).querySelector('#upload-file-modal').modalButtonClicked();
			}, function(){
				$scope.addAlert('warning', 'Error', 'Error uploading file.', 'dismiss', null);
                $rootScope.loading = false;
				Polymer.dom(document).querySelector('#update-service-request-modal').modalButtonClicked();
				Polymer.dom(document).querySelector('#upload-file-modal').modalButtonClicked();
			});
		};
		
		$scope.fulfillServiceRequest = function(){
			$scope.addAlert('error', 'information', 'Service Request will be fulfilled once saved', 'dismiss', 5000);
			$scope.selectedServiceRequest.dateFulfilled = new Date();
		};
		
		Polymer.dom(document).querySelector('#update-service-request-modal').addEventListener('btnModalPositiveClicked', function() {
			$rootScope.loading = true;

            if(!$scope.selectedServiceRequest.hospital || !$scope.selectedServiceRequest.fieldEngineer || !$scope.selectedServiceRequest.assetId){
                $scope.addAlert('warning', 'Error', 'Hospital, Field Engineer, and AssetId cannot be empty.', 'dismiss', null);
				$rootScope.loading = false;
			}else{
				$rootScope.loading = true;
				$scope.addAlert('information', 'Updating', 'Updating Service Request.', 'dismiss', 2000);
				ServiceRequestService.updateServiceRequest($scope.selectedServiceRequest).then(function(data){
					if(data.data.status === 'Error'){
						$scope.addAlert('warning', 'Error', 'Error updating service request.', 'dismiss', null);
						$rootScope.loading = false;
						$scope.refresh();
					}else{
						$scope.addAlert('information', 'Success', 'Successfully updated new service request.', 'dismiss', 2000);
						$rootScope.loading = false;
						$scope.refresh();
					}
				}, function(){
					$scope.addAlert('warning', 'Error', 'Error updating service request.', 'dismiss', null);
					$rootScope.loading = false;
					$scope.refresh();
				});
			}
        });
		
		document.getElementById('service-request-table').addEventListener('px-row-click', function(e) {
			$scope.selectedServiceRequest = e.detail.row.row;
			$scope.selectedServiceRequest.hospital = e.detail.row.row.hospital;
			$scope.selectedServiceRequest.fieldEngineer = e.detail.row.row.fieldEngineer;
			$scope.selectedServiceRequest.serviceRequestsAttachment = e.detail.row.row.serviceRequestsAttachment;
			Polymer.dom(document).querySelector('#update-service-request-modal').modalButtonClicked();
			$scope.$apply();
		});
		
		$scope.refresh();
    }]);
});
