var auth = require('../helpers/auth');
var proxy = require('../helpers/proxy');

var config = {
  /**
   * --------- ADD YOUR UAA CONFIGURATION HERE ---------
   *
   * This uaa helper object simulates NGINX uaa integration using Grunt allowing secure cloudfoundry service integration in local development without deploying your application to cloudfoundry.
   * Please update the following uaa configuration for your solution
   */
  uaa: {
    clientId: 'predix-seed',
    serverUrl: 'https://7a4485e7-97aa-49e9-9610-39568ba77e42.predix-uaa.run.aws-usw02-pr.ice.predix.io',
    defaultClientRoute: '/about',
    base64ClientCredential: 'cHJlZGl4LXNlZWQ6dHJhaW5pbmc='
  },
  /**
   * --------- ADD YOUR SECURE ROUTES HERE ------------
   *
   * Please update the following object add your secure routes
   *
   * Note: Keep the /api in front of your services here to tell the proxy to add authorization headers.
   */
  proxy: {
    '/api/view-service': {
      url: 'https://predix-views.run.aws-usw02-pr.ice.predix.io',
      instanceId: 'cc5c84e3-3e53-43e6-8062-12071a89d032',
      pathRewrite: { '^/api/view-service': '/api'}
    },
    '/api/hospitals':{
      url: 'https://itpe-training-servicerequest-metadata.run.aws-usw02-pr.ice.predix.io',
      instanceId: '',
      pathRewrite: {'^/api/hospitals':'/api/hospital'}
    },
    '/api/asset-service': {
  		url: 'https://predix-asset.run.aws-usw02-pr.ice.predix.io',
  		instanceId: 'e64d4066-693c-4eba-9371-007eae6f053d',
  		pathRewrite: { '^/api/asset-service': '/'}
  	},
	'/api/timeseries-service': {
		url: 'https://time-series-store-predix.run.aws-usw02-pr.ice.predix.io/v1/datapoints',
		instanceId: '72963a4d-b5bc-4cf1-b7bd-ef9f363ecb5b',
		pathRewrite: { '^/api/timeseries-service': '/'}
	},
	'/api/field_engineer':{
      url: 'https://itpe-training-servicerequest-metadata.run.aws-usw02-pr.ice.predix.io',
      instanceId: '',
      pathRewrite: {'^/api/field_engineer':'/api/fe/'}
    },
	'/api/service_request':{
      url: 'https://itpe-training-servicerequest-metadata.run.aws-usw02-pr.ice.predix.io',
      instanceId: '',
      pathRewrite: {'^/api/service_request':'/api/sr/'}
    },
	'/api/blobstore':{
      url: 'https://itpe-training-blobstore-controller.run.aws-usw02-pr.ice.predix.io',
      instanceId: '',
      pathRewrite: {'^/api/blobstore':'/api/v1/file/'}
    }
  }
};

module.exports = {
  server: {
    options: {
      port: 9000,
      base: 'public',
      open: true,
      hostname: 'localhost',
      middleware: function (connect, options) {
        var middlewares = [];

        //add predix services proxy middlewares
        middlewares = middlewares.concat(proxy.init(config.proxy));

        //add predix uaa authentication middlewaress
        middlewares = middlewares.concat(auth.init(config.uaa));

        if (!Array.isArray(options.base)) {
          options.base = [options.base];
        }

        var directory = options.directory || options.base[options.base.length - 1];
        options.base.forEach(function (base) {
          // Serve static files.
          middlewares.push(connect.static(base));
        });

        // Make directory browse-able.
        middlewares.push(connect.directory(directory));

        return middlewares;
      }
    }
  }
};
