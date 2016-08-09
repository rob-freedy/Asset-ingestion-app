/*globals Polymer */

define(['angular', './manage-module'], function (angular, controllers) {
    'use strict';

    // Controller definition
    controllers.controller('HospitalCtrl', ['$scope', '$rootScope', '$log', 'HospitalService', function ($scope, $rootScope, $log, HospitalService) {
        $log.log('Hospital controller loaded.');
        $rootScope.loading = true;
        $scope.allHospitalsHeaderText = 'All Hospitals';

        $scope.updateNewHospitalModel = function(){
            $scope.newHospital = {
                'address': '',
                'country': '',
                'description': '',
                'name': '',
                'postalCode': ''
            };
        };

        $scope.refresh = function(){
            $rootScope.loading = true;
            $scope.addAlert('information', 'Loading', 'Loading hospitals.', 'dismiss', 2000);
            HospitalService.getHospitals().then(function(data){
                $scope.addAlert('information', data.status, data.message, 'dismiss', 2000);
                $scope.hospitals = data.data;
                $rootScope.loading = false;
            }, function(){
                $scope.addAlert('error', 'Error', 'Error loading hospitals.', 'dismiss', 5000);
                $rootScope.loading = false;
            });
        };

        $scope.deleteSelected = function(){
            $scope.allSelectedRows = document.getElementById('hospital-table').selectedRows;
            console.log($scope.allSelectedRows);
        };

        Polymer.dom(document).querySelector('#add-hospital-modal').addEventListener('btnModalPositiveClicked', function() {
            $rootScope.loading = true;
            var valid = true;

            for (var key in $scope.newHospital) {
                if($scope.newHospital[key] === ''){
                    valid = false;
                    $scope.addAlert('error', 'Error', key.toUpperCase() + ' is required.', 'dismiss', 5000);
                }
            }
            if(valid){
                $scope.addAlert('information', 'Adding', 'Adding the new hospital', 'dismiss', 2000);
                HospitalService.addHospital($scope.newHospital).then(function(data){
                    $scope.addAlert('information', data.status, data.message, 'dismiss', 2000);
                    $scope.updateNewHospitalModel();
                    $scope.refresh();
                }, function(){
                    $scope.addAlert('error', 'Error', 'Error adding hospital.', 'dismiss', 5000);
                    $rootScope.loading = false;
                });
            }else{
                $scope.showAddModal();
                $rootScope.loading = false;
            }
        });

        Polymer.dom(document).querySelector('#delete-hospitals-modal').addEventListener('btnModalPositiveClicked', function() {
            $($scope.allSelectedRows).each(function(key, value){
                $rootScope.loading = true;
                $log.info('Deleting ' + JSON.stringify(value));
                $scope.addAlert('information', 'Deleting', 'Deleting ' + $scope.allSelectedRows[key].row.name + '.', 'dismiss', 2000);
                HospitalService.deleteHospital($scope.allSelectedRows[key].row.hospitalId).then(function(data){
                    $scope.addAlert('information', data.status, data.message, 'dismiss', 2000);
                    $scope.updateNewHospitalModel();
                    $scope.refresh();
                }, function(){
                    $scope.addAlert('error', 'Error', 'Error deleting ' + $scope.allSelectedRows[key].row.name + '.', 'dismiss', 5000);
                    $rootScope.loading = false;
                });
            });
            document.getElementById('hospital-table').selectedRows = [];
        });

        $scope.refresh();
        $scope.updateNewHospitalModel();
    }]);
});
