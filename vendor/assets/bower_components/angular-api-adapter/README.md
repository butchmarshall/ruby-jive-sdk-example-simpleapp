Angular Api
===================

An alternative to ngResource for interacting with APIs.

## Basic Usage

Set up a service.

```js
angular
	.module("myApp", [])
	.factory('Customer', ['$rootScope', 'ApiAdapter',
	function($rootScope, ApiAdapter) {
		ApiAdapter.addRoute(
			"get_customers",
			"/api/customers"
		);
		ApiAdapter.addRoute(
			"get_customer",
			"/api/customers/{customerId}"
		);
		ApiAdapter.addRoute(
			"create_customer",
			"/api/customers",
			{
				"type": "POST",
				"success": function() {
					ApiAdapter.clearCache("get_customers");
				}
			}
		);
		ApiAdapter.addRoute(
			"update_customer",
			"/api/customers/{customerId}",
			{
				"type": "PUT",
				"success": function() {
					ApiAdapter.clearCache("get_customer");
					ApiAdapter.clearCache("get_customers");
				}
			}
		);
		ApiAdapter.addRoute(
			"delete_account_customer",
			"/api/customers/{customerId}",
			{
				"type": "DELETE",
				"success": function() {
					ApiAdapter.clearCache("get_customer");
					ApiAdapter.clearCache("get_customers");
				}
			}
		);

		return {
			get: function(params, args, noCache) {
				return ApiAdapter.execute(
					"get_customer",
					params,
					args,
					((typeof(noCache) != "boolean")? true : noCache)
				);
			},
			index: function(params, args, noCache) {
				return ApiAdapter.execute(
					"get_customers",
					params,
					args,
					((typeof(noCache) != "boolean")? true : noCache)
				);
			},
			create: function(params, args, noCache) {
				return ApiAdapter.execute(
					"create_customer",
					params,
					args,
					((typeof(noCache) != "boolean")? true : noCache)
				);
			},
			update: function(params, args, noCache) {
				return ApiAdapter.execute(
					"update_customer",
					params,
					args,
					((typeof(noCache) != "boolean")? true : noCache)
				);
			},
			destroy: function(params, args, noCache) {
				return ApiAdapter.execute(
					"delete_customer",
					params,
					args,
					((typeof(noCache) != "boolean")? true : noCache)
				);
			}
		};
	}
]);
```

Use the service

```js
angular
	.module("myApp", [])
	.controller('MyController', ['$scope', '$rootScope', 'Customer',
	function($scope, $rootScope, Customer) {
		// Get a customer
		Customer.get({ customerId: 1 }).then(
			function(result) {
				// ...
			}
		);
		// Get customers
		Customer.get({}, { page: 5 }).then(
			function(result) {
				// ...
			}
		);
	}
]);
```