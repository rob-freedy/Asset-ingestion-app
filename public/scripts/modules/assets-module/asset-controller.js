/*globals Polymer */

define(['angular', './asset-module'], function (angular, controllers) {
    'use strict';

    // Controller definition
    controllers.controller('AssetsCtrl', ['$scope', '$rootScope', '$log', 'PredixAssetService', function ($scope, $rootScope, $log, PredixAssetService) {
        /********************
        * Initialize variables
        ********************/

        $rootScope.loading = true;

        /*jshint camelcase: false */
        $scope.newEquipment = {
            name: '',
            assetId: '',
            classification: 'child',
            isOpenable: false,
            uri: '',
            type: '',
            parentId: '',
            model: '',
            serial_no: ''
        };


        /********************
        * Asset Service functions
        ********************/

        /*  Get the parent level assets using the Asset service  */
        $scope.getParents = function(){
            $rootScope.loading = true;
            $scope.addAlert('information', 'Loading', 'Loading equipment.', 'dismiss', 2000);
            PredixAssetService.getAssetsByParentId('null').then(function (initialContext) {
                $scope.addAlert('information', 'Success', 'Successfully loaded equipment.', 'dismiss', 2000);
                $rootScope.loading = false;

                //pre-select the 1st asset
                initialContext.data[0].selectedAsset = true;
                $scope.initialContexts = initialContext;
                $scope.initialContextName = initialContext.data[0].name;

                //load view selector
                $scope.openContext($scope.initialContexts.data[0]);
            }, function (message) {
                $log.error(message);
            });
        };

        /*  Get the child assets for a given parent  */
        $scope.getChildren = function (parent, options) {
            return PredixAssetService.getAssetsByParentId(parent.id, options);
        };

        /*  Add asset to Asset service  */
        $scope.addAsset = function(newAsset){
            $rootScope.loading = true;
            $scope.addAlert('information', 'Adding', 'Adding new asset.', 'dismiss', 2000);
            PredixAssetService.addAsset(newAsset).then(function () {
                $scope.addAlert('information', 'Success', 'Successfully added asset.', 'dismiss', 2000);
                $rootScope.loading = false;

                $scope.getParents();
            });
        };

        /*  Add asset to Asset service  */
        $scope.updateAsset = function(asset){
            $rootScope.loading = true;
            $scope.addAlert('information', 'Updating', 'Updating asset.', 'dismiss', 2000);
            PredixAssetService.updateAsset(asset).then(function () {
                $scope.addAlert('information', 'Success', 'Successfully updated asset.', 'dismiss', 2000);
                $rootScope.loading = false;

                $scope.getParents();
            });
        };

        /*  Delete an asset from the Asset service  */
        $scope.deleteAsset = function(asset){
            $rootScope.loading = true;
            $scope.addAlert('information', 'Deleting', 'Deleting asset.', 'dismiss', 2000);
            PredixAssetService.deleteAsset(asset).then(function () {
                $scope.addAlert('information', 'Success', 'Successfully deleted asset.', 'dismiss', 2000);
                $rootScope.loading = false;

                $scope.getParents();
            });
        };


        /********************
        * UI functions
        ********************/

        /*  Open the new equipment modal  */
        $scope.showNewEquipmentModal = function(){
            Polymer.dom(document).querySelector('#new-equipment-modal').modalButtonClicked();
        };

        /*  Open the edit equipment modal  */
        $scope.showEditEquipmentModal = function(equipment){
            Polymer.dom(document).querySelector('#edit-equipment-modal').modalButtonClicked();
            $scope.selectedEditAsset = angular.copy(equipment);
        };

        /*  Open the delete equipment modal  */
        $scope.showDeleteEquipmentModal = function(equipment){
            Polymer.dom(document).querySelector('#delete-equipment-modal').modalButtonClicked();
            $scope.selectedDeleteAsset = angular.copy(equipment);
        };

        /*  Handle the openContext event  */
        $scope.openContext = function (contextDetails) {
            $rootScope.loading = true;
            var newContext = angular.copy(contextDetails);
            newContext.children = [];
            newContext.parent = [];
            PredixAssetService.getAssetsByParentId(contextDetails.uri).then(function (children){
                newContext.children = children.data;
                $rootScope.loading = false;
            });

            $scope.asset = newContext;
            $scope.newEquipment.parent = contextDetails.id;
        };

        /*  Context viewer event handlers  */
        $scope.handlers = {
            itemOpenHandler: $scope.openContext,
            getChildren: $scope.getChildren
            //itemClickHandler: $scope.openContext // optional
        };


        /********************
        * Validation functions
        ********************/

        /*  New equipment validation  */
        $scope.validateNewEquipment = function(){
            $rootScope.loading = true;
            $scope.addAlert('information', 'Validating', 'Validating new asset.', 'dismiss', 2000);

            // Assume no validation errors
            var error = false;

            // Get local variables for the fields to validate - ran into issues with null values in object
            var assetId = $scope.newEquipment.assetId;
            var name = $scope.newEquipment.name;
            var type = $scope.newEquipment.type;
            var model = $scope.newEquipment.model;
            var serial_no = $scope.newEquipment.serial_no;

            // Validate each field
            if(!assetId){
                error = true;
                $scope.addAlert('error', 'Error', 'ID cannot be empty.', 'dismiss');
            }
            if(!name){
                error = true;
                $scope.addAlert('error', 'Error', 'Name cannot be empty.', 'dismiss');
            }
            if(!type){
                error = true;
                $scope.addAlert('error', 'Error', 'Type cannot be empty.', 'dismiss');
            }
            if(!model){
                error = true;
                $scope.addAlert('error', 'Error', 'Model cannot be empty.', 'dismiss');
            }
            if(!serial_no){
                error = true;
                $scope.addAlert('error', 'Error', 'Serial Number cannot be empty.', 'dismiss');
            }
            if(!error){
                $scope.newEquipment.parentId = $scope.asset.uri;
                $scope.newEquipment.uri = '/equipment/'+$scope.newEquipment.assetId;

                $scope.addAsset($scope.newEquipment);
            } else{
                $rootScope.loading = false;
                $scope.showNewEquipmentModal();
            }
            $scope.$apply();
        };

        /*  Edit equipment validation  */
        $scope.validateEditEquipment = function(){
            $rootScope.loading = true;
            $scope.addAlert('information', 'Validating', 'Validating asset.', 'dismiss', 2000);

            // Assume no validation errors
            var error = false;

            // Get local variables for the fields to validate - ran into issues with null values in object
            var assetId = $scope.selectedEditAsset.assetId;
            var name = $scope.selectedEditAsset.name;
            var type = $scope.selectedEditAsset.type;
            var model = $scope.selectedEditAsset.model;
            var serial_no = $scope.selectedEditAsset.serial_no;

            // Validate each field
            if(!assetId){
                error = true;
                $scope.addAlert('error', 'Error', 'ID cannot be empty.', 'dismiss');
            }
            if(!name){
                error = true;
                $scope.addAlert('error', 'Error', 'Name cannot be empty.', 'dismiss');
            }
            if(!type){
                error = true;
                $scope.addAlert('error', 'Error', 'Type cannot be empty.', 'dismiss');
            }
            if(!model){
                error = true;
                $scope.addAlert('error', 'Error', 'Model cannot be empty.', 'dismiss');
            }
            if(!serial_no){
                error = true;
                $scope.addAlert('error', 'Error', 'Serial Number cannot be empty.', 'dismiss');
            }
            if(!error){
                $scope.updateAsset($scope.selectedEditAsset);
            } else{
                $rootScope.loading = false;
                $scope.showEditEquipmentModal();
            }
            $scope.$apply();
        };


        /********************
        * Initializing functions
        ********************/
        $scope.init = function(){
            // Get the parent level assets for
            $scope.getParents();

            // Attach listener event to success click of add modal
            $('#new-equipment-modal')[0].addEventListener('btnModalPositiveClicked', function() {
                $scope.validateNewEquipment();
            });

            // Attach listener event to success click of edit modal
            $('#edit-equipment-modal')[0].addEventListener('btnModalPositiveClicked', function() {
                $scope.validateEditEquipment();
            });

            // Attach listener event to success click of delete modal
            $('#delete-equipment-modal')[0].addEventListener('btnModalPositiveClicked', function() {
                $scope.deleteAsset($scope.selectedDeleteAsset);
            });
        };

        $scope.init();
    }]);
});
