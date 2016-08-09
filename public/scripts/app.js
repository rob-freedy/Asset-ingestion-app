/**
 * Load controllers, directives, filters, services before bootstrapping the application.
 * NOTE: These are named references that are defined inside of the config.js RequireJS configuration file.
 */
define([
    'jquery',
    'angular',
    'main',
    'routes',
    'interceptors',
    'px-datasource',
    'ng-bind-polymer'
], function ($, angular) {
    'use strict';

    /**
     * Application definition
     * This is where the AngularJS application is defined and all application dependencies declared.
     * @type {module}
     */
    var predixApp = angular.module('predixApp', [
        'app.routes',
        'app.interceptors',
        'dashboard.module',
        'predix.module',
        'asset.module',
        'manage.module',
        'metadata.module',
        'predix.datasource',
        'px.ngBindPolymer'
    ]);

	predixApp.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;
                
                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);
	
    /**
     * Main Controller
     * This controller is the top most level controller that allows for all
     * child controllers to access properties defined on the $rootScope.
     */
    predixApp.controller('MainCtrl', ['$scope', '$rootScope', 'PredixUserService', function ($scope, $rootScope, predixUserService) {

        //Global application object
        window.App = $rootScope.App = {
            version: '1.0',
            name: 'Predix Seed',
            session: {},
            tabs: [
                {icon: 'fa-tachometer', state: 'dashboards', label: 'Dashboards', path: 'dashboards'},
                {icon: 'fa-ambulance', state: 'assets', label: 'Assets', path: 'assets'},
                {icon: 'fa-cog', label: 'Manage', state: 'manage', path: 'manage', subitems: [
                    {state: 'hospitals', label: 'Hospitals', path: 'manage/hospitals'},
                    {state: 'field-engineers', label: 'Field Engineers', path: 'manage/field-engineers'},
                    {state: 'service-requests', label: 'Service Requests', path: 'manage/service-requests'}
                ]}
            ]
        };

        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            if (angular.isObject(error) && angular.isString(error.code)) {
                switch (error.code) {
                    case 'UNAUTHORIZED':
                        //redirect
                        predixUserService.login(toState);
                        break;
                    default:
                        //go to other error state
                }
            }
            else {
                // unexpected error
            }
        });

        $rootScope.addAlert = function(type, title, message, action, autoDismiss){
            $('.alert-container').append('<px-alert-message type="'+type+'" message-title="'+title+'" message="'+message+'" auto-dismiss='+autoDismiss+' action="'+action+'"></px-alert-message>');
        };
        $rootScope.loading = false;
    }]);


    //Set on window for debugging
    window.predixApp = predixApp;

    //Return the application  object
    return predixApp;
});
