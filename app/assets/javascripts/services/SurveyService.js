
testApp.constant('SURVEY_EVENTS', {
	create: 'create',
	update: 'update',
	destroy: 'destroy',
})

testApp.factory('Survey', ['$rootScope', 'SURVEY_EVENTS', 'ApiAdapter',
	function($rootScope, SURVEY_EVENTS, ApiAdapter) {
		ApiAdapter.addRoute(
			"get_surveys",
			"/surveys"
		);
		ApiAdapter.addRoute(
			"get_survey",
			"/surveys/{surveyId}"
		);
		ApiAdapter.addRoute(
			"create_survey",
			"/surveys",
			{
				"type": "POST",
				"processData": false,
				"contentType": "application/json",
				"success": function(result) {
					$rootScope.$broadcast(SURVEY_EVENTS.create, result.response);
				}
			}
		);
		ApiAdapter.addRoute(
			"update_survey",
			"/surveys/{surveyId}",
			{
				"type": "PUT",
				"processData": false,
				"contentType": "application/json",
				"success": function(result) {
					$rootScope.$broadcast(SURVEY_EVENTS.update, result.response);
				}
			}
		);
		ApiAdapter.addRoute(
			"delete_survey",
			"/surveys/{surveyId}",
			{
				"type": "DELETE",
				"success": function(result) {
					$rootScope.$broadcast(SURVEY_EVENTS.destroy, result);
				}
			}
		);

		return {
			get: function(params, args, noCache) {
				return ApiAdapter.execute("get_survey", params, args, ((typeof(noCache) != "boolean")? true : noCache));
			},
			index: function(params, args, noCache) {
				return ApiAdapter.execute("get_surveys", params, args, ((typeof(noCache) != "boolean")? true : noCache));
			},
			create: function(params, args, noCache) {
				return ApiAdapter.execute("create_survey", params, args, ((typeof(noCache) != "boolean")? true : noCache));
			},
			update: function(params, args, noCache) {
				return ApiAdapter.execute("update_survey", params, args, ((typeof(noCache) != "boolean")? true : noCache));
			},
			destroy: function(params, args, noCache) {
				return ApiAdapter.execute("delete_survey", params, args, ((typeof(noCache) != "boolean")? true : noCache));
			}
		};
	}
]);