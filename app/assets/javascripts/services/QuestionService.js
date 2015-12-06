
testApp.constant('QUESTION_EVENTS', {
	create: 'create',
	update: 'update',
	destroy: 'destroy',
})

testApp.factory('Question', ['$rootScope', 'QUESTION_EVENTS', 'ApiAdapter',
	function($rootScope, QUESTION_EVENTS, ApiAdapter) {
		ApiAdapter.addRoute(
			"get_questions",
			"/surveys/{surveyId}/questions"
		);
		ApiAdapter.addRoute(
			"get_question",
			"/questions/{questionId}"
		);
		ApiAdapter.addRoute(
			"create_question",
			"/surveys/{surveyId}/questions",
			{
				"type": "POST",
				"processData": false,
				"contentType": "application/json",
				"success": function(result) {
					$rootScope.$broadcast(QUESTION_EVENTS.create, result.response);
				}
			}
		);
		ApiAdapter.addRoute(
			"update_question",
			"/questions/{questionId}",
			{
				"type": "PUT",
				"processData": false,
				"contentType": "application/json",
				"success": function(result) {
					$rootScope.$broadcast(QUESTION_EVENTS.update, result.response);
				}
			}
		);
		ApiAdapter.addRoute(
			"delete_question",
			"/questions/{questionId}",
			{
				"type": "DELETE",
				"success": function(result) {
					$rootScope.$broadcast(QUESTION_EVENTS.destroy, result);
				}
			}
		);

		return {
			get: function(params, data, args) {
				return ApiAdapter.execute("get_question", params, data, args);
			},
			index: function(params, data, args) {
				return ApiAdapter.execute("get_questions", params, data, args);
			},
			create: function(params, data, args) {
				return ApiAdapter.execute("create_question", params, data, args);
			},
			update: function(params, data, args) {
				return ApiAdapter.execute("update_question", params, data, args);
			},
			destroy: function(params, data, args) {
				return ApiAdapter.execute("delete_question", params, data, args);
			}
		};
	}
]);