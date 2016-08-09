define(['angular', './manage-module'], function (angular, controllers) {
    'use strict';

    // Controller definition
    controllers.controller('ManageCtrl', ['$scope', '$rootScope', '$log', 'PredixViewService', function ($scope, $rootScope, $log, PredixViewService) {
        $rootScope.loading = true;
        $scope.viewServiceBaseUrl = PredixViewService.baseUrl;
        $scope.context = {
            'urls':{
                'datagrid-table' : ''
            }
        };

        $scope.addAlert('information', 'Loading', 'Loading decks.', 'dismiss', 2000);
        //Tag string can be classification from contextDetails
        PredixViewService.getDecksByTags('parent').then(function(decks){
            $scope.decks = [];
            $scope.addAlert('information', 'Success', 'Decks loaded.', 'dismiss', 2000);
            if (decks && decks.length > 0) {
                decks.forEach(function (deck) {
                    $scope.decks.push({name: deck.title, id: deck.id, title: deck.title});
                });
                $scope.selectedDeck = $scope.decks[0];
            } else{
                $log.info('No decks provided');
            }
            $rootScope.loading = false;
            $scope.addAlert('information', 'Loading', 'Loading cards.', 'dismiss', 2000);
        });
    }]);
});
