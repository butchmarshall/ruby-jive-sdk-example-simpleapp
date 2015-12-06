function SurveyQuestionAnswersController($scope, $rootScope, $state, $location, $modal, $stateParams, ApiAdapter, Survey, Question, Answer) {
	$scope.headers = {
		'Accept-Language': 'en'
	};

	$scope.survey = null;
	Survey.get({
		surveyId: $stateParams.surveyId
	}, {}).then(
		function(result) {
			$scope.survey = result;
			$scope.$apply()
		}
	);

	$scope.question = null;
	$scope.answers = {};
	$scope.$watch("headers['Accept-Language']", function(newValue, oldValue) {
		Question.get({
			questionId: $stateParams.questionId
		}, {}).then(
			function(result) {
				$scope.question = result;
				$scope.$apply()
			}
		);
	
		Answer.index({
			questionId: $stateParams.questionId
		}, {}, {
			no_cache: true,
			headers: $scope.headers
		}).then(
			function(result) {
				$scope.answers = result;
				if(!$scope.$$phase) {
					$scope.$apply()
				}
			}
		);

	});
	
	$scope.answer_delete = function(self_href) {
		ApiAdapter.execute("delete_answer", self_href, {}, true
		).then(
			function(response) {
				$state.go($state.current, {}, {reload: true});
			}
		);
	};

	$scope.answer_edit = function(answer_id) {
		$modal.open({
			size: 'lg',
			resolve: {
				answer: [function($stateParams, Api) {
					return Answer.get({answerId: answer_id});
				}]
			},
			controller: function($scope, $modalInstance, answer) {
				$scope.model = {
					id: answer.data.id,
					answer: {
						attributes: answer.data.attributes
					}
				};

				$scope.onSubmit = function(data) {
					return ApiAdapter.execute("update_answer", {
						answerId: answer_id
					}, JSON.stringify(data), {
						no_cache: true,
						headers: {
							'Accept-Language': data.language
						}
					}).then(
						function(response) {
							$state.go($state.current, {}, {reload: true});
							$modalInstance.close();
							return response;
						}
					);
				};
				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: "/assets/components/surveys/AnswerModal.html"
		});
	};

	$scope.answer_new = function() {
		$modal.open({
			size: 'lg',
			controller: function($scope, $modalInstance) {
				$scope.model = {
					answer: {
						attributes: {
							text: ""
						}
					}
				};

				$scope.onSubmit = function(data) {
					return ApiAdapter.execute("create_answer", {
						questionId: $stateParams.questionId
					}, JSON.stringify(data), {
						no_cache: true,
						headers: {
							'Accept-Language': data.language
						}
					}).then(
						function(response) {
							$state.go($state.current, {}, {reload: true});
							$modalInstance.close();
							return response;
						}
					);
				};
				$scope.cancel = function() {
					$modalInstance.close();
				};
			},
			templateUrl: "/assets/components/surveys/AnswerModal.html"
		});
	};
};