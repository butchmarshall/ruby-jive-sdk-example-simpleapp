
testApp.constant('ANSWER_EVENTS', {
	create: 'create',
	update: 'update',
	destroy: 'destroy',
})

testApp.factory('Answer', ['$rootScope', 'ANSWER_EVENTS', 'ApiAdapter',
	function($rootScope, ANSWER_EVENTS, ApiAdapter) {
		ApiAdapter.addRoute(
			"get_answers",
			"/questions/{questionId}/answers"
		);
		ApiAdapter.addRoute(
			"get_answer",
			"/answers/{answerId}"
		);
		ApiAdapter.addRoute(
			"create_answer",
			"/questions/{questionId}/answers",
			{
				"type": "POST",
				"processData": false,
				"contentType": "application/json",
				"success": function(result) {
					$rootScope.$broadcast(ANSWER_EVENTS.create, result.response);
				}
			}
		);
		ApiAdapter.addRoute(
			"update_answer",
			"/answers/{answerId}",
			{
				"type": "PUT",
				"processData": false,
				"contentType": "application/json",
				"success": function(result) {
					$rootScope.$broadcast(ANSWER_EVENTS.update, result.response);
				}
			}
		);
		ApiAdapter.addRoute(
			"delete_answer",
			"/answers/{answerId}",
			{
				"type": "DELETE",
				"success": function(result) {
					$rootScope.$broadcast(ANSWER_EVENTS.destroy, result);
				}
			}
		);

		return {
			get: function(params, data, args) {
				return ApiAdapter.execute("get_answer", params, data, args);
			},
			index: function(params, data, args) {
				return ApiAdapter.execute("get_answers", params, data, args);
			},
			create: function(params, data, args) {
				return ApiAdapter.execute("create_answer", params, data, args);
			},
			update: function(params, data, args) {
				return ApiAdapter.execute("update_answer", params, data, args);
			},
			destroy: function(params, data, args) {
				return ApiAdapter.execute("delete_answer", params, data, args);
			}
		};
	}
]);