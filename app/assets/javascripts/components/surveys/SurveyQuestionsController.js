function SurveyQuestionsController($scope, $rootScope, $state, $location, $modal, $stateParams, ApiAdapter, Survey, Question) {
	$scope.headers = {
		'Accept-Language': 'en'
	};

	$scope.question_answers = function(questionId) {
		$state.go('surveys.questions.answers', {
			surveyId: $stateParams.surveyId,
			questionId: questionId
		});
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
	
	$scope.questions = {};

	$scope.$watch("headers['Accept-Language']", function(newValue, oldValue) {

		Question.index({
			surveyId: $stateParams.surveyId
		}, {}, {
			no_cache: true,
			headers: $scope.headers
		}).then(
			function(result) {
				$scope.questions = result;
				if(!$scope.$$phase) {
					$scope.$apply()
				}
			}
		);

	});
	
	$scope.question_delete = function(self_href) {
		ApiAdapter.execute("delete_question", self_href, {}, true
		).then(
			function(response) {
				$state.go($state.current, {}, {reload: true});
			}
		);
	};

	$scope.question_edit = function(question_id) {
		$modal.open({
			size: 'lg',
			resolve: {
				question: [function($stateParams, Api) {
					return Question.get({questionId: question_id});
				}]
			},
			controller: function($scope, $modalInstance, question) {
				$scope.model = {
					id: question.data.id,
					question: {
						attributes: question.data.attributes
					}
				};

				$scope.onSubmit = function(data) {
					return ApiAdapter.execute("update_question", {
						questionId: question_id
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
			templateUrl: "/assets/components/surveys/QuestionModal.html"
		});
	};

	$scope.question_new = function() {
		$modal.open({
			size: 'lg',
			controller: function($scope, $modalInstance) {
				$scope.model = {
					question: {
						attributes: {
							text: ""
						}
					}
				};

				$scope.onSubmit = function(data) {
					return ApiAdapter.execute("create_question", {
						surveyId: $stateParams.surveyId
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
			templateUrl: "/assets/components/surveys/QuestionModal.html"
		});
	};
};