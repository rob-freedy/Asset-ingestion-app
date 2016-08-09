define(['angular', './predix-module'], function(angular, module) {
    'use strict';

    /**
     * PredixAssetService is a sample service that integrates with Predix Asset Server API
     */
    module.factory('PredixAssetService', ['$q', '$http', '$log', function($q, $http, $log) {
        /*jshint camelcase: false */

        /**
         * Predix Asset server base url
         */
        var baseUrl = '/api/asset-service';

        /**
         * transform the asset entity into an object format consumable by px-context-browser item
         */
        var transformChildren = function(entities) { // transform your entity to context browser entity format
            var result = [];
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                var transformedEntity =  {
                    name: entity.name, // Displayed name in the context browser
                    uri: entity.uri, // Unique ID (could be a URI for example)
                    id: entity.id,
                    parentId: entity.parentId, // Unique ID (could be a URI for example)
                    classification: entity.classification,
                    model: entity.model, // Parent ID. Used to place the children under the corresponding parent in the browser.
                    serial_no: entity.serial_no,
                    isOpenable: true,
                    assetId: entity.assetId,
                    description: entity.description,
                    type: entity.type
                };
                if (entity.children){
                    transformedEntity.children = transformChildren(entity.children);
                }
                result.push(transformedEntity);
            }
            return result;
        };

        /**
         * fetch the asset children by parentId
         */
        var getEntityChildren = function(parentId, options) {
            var deferred = $q.defer();
            var childrenUrl = baseUrl + '/equipment?filter=parentId='+parentId;
            var childEntities = {
                meta: {
                    link: ''
                },
                data: []
            };
            if (options && options.hasOwnProperty('link')) {
                if (options.link === '') {
                    deferred.resolve(childEntities);
                    return deferred.promise;
                }
                else {
                    //overwrite url if there is link
                    childrenUrl = options.link;
                }
            }

            $http.get(childrenUrl).success(function(data, status, headers) {
                var linkHeader = headers('Link');
                var link = '';
                if (data.length !== 0) {
                    if (linkHeader && linkHeader !== '') {
                        var posOfGt = linkHeader.indexOf('>');
                        if (posOfGt !== -1) {
                            link = linkHeader.substring(1, posOfGt);
                        }
                    }
                }

                childEntities = {
                    meta: {link: link, parentId: parentId},
                    data: data
                };
                deferred.resolve(childEntities);
            })
            .error(function() {
                deferred.reject('Error fetching asset with id ' + parentId);
            });
            return deferred.promise;
        };

        var updateAsset = function(asset){
            var deferred = $q.defer();
            var url = baseUrl + asset.uri;
            asset.children = null;
            $http({
                method: 'PUT',
                url: url,
                headers: {
                    'Content-Type' : 'application/json'
                },
                data: [asset]
            }).success(function(data){
                $log.info(data);
                deferred.resolve(getAssetsByParentId(asset.parentId));
            })
            .error(function() {
                deferred.reject('Error fetching asset with id ' + asset.uri);
            });
            return deferred.promise;
        };

        var addAsset = function(asset){
            var deferred = $q.defer();
            var url = baseUrl + '/equipment';
            $http({
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type' : 'application/json'
                },
                data: [asset]
            }).success(function(data) {
                $log.info(data);
                deferred.resolve(getAssetsByParentId(asset.parentId));
            })
            .error(function() {
                deferred.reject('Error fetching asset with id ' + asset.uri);
            });
            return deferred.promise;
        };

        var deleteAsset = function(asset){
            var deferred = $q.defer();
            var url = baseUrl + asset.uri;
            $http({
                method: 'DELETE',
                url: url,
                headers: {
                    'Content-Type' : 'application/json'
                }
            }).success(function(data) {
                $log.info(data);
                deferred.resolve(getAssetsByParentId(asset.parentId));
            })
            .error(function(e) {
                $log.info(e);
                deferred.reject('Error deleting asset with id ' + asset.uri);
            });
            return deferred.promise;
        };

        /**
         * get asset by parent id
         */
        var getAssetsByParentId = function(parentId) {
            var deferred = $q.defer();
            getEntityChildren(parentId).then(function(results) {
                results.data = transformChildren(results.data);
                deferred.resolve(results);
            }, function() {
                deferred.reject('Error fetching asset with id ' + parentId);
            });
            return deferred.promise;
        };

        return {
            getAssetsByParentId: getAssetsByParentId,
            updateAsset: updateAsset,
            addAsset: addAsset,
            deleteAsset: deleteAsset
        };
    }]);
});
