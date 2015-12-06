function SurveysController($scope, $rootScope, $state, $location, $modal, ApiAdapter, Survey) {
	$scope.surveys = null;
	Survey.index({}, {}).then(
		function(result) {
			$scope.surveys = result;
			$scope.$apply()
		}
	);

	$scope.survey_questions = function(surveyId) {
		$state.go('surveys.questions', { surveyId: surveyId });
	};

	$scope.survey_delete = function(self_href) {
		ApiAdapter.execute("delete_survey", self_href, {}, true
		).then(
			function(response) {
				$state.go($state.current, {}, {reload: true});
			}
		);
	};

	$scope.survey_new = function() {
		$modal.open({
			size: 'lg',
			controller: function($scope, $modalInstance) {

				$scope.model = {
					survey: {
						attributes: {
							name: ""
						}
					}
				};

				$scope.onSubmit = function(data) {
					return ApiAdapter.execute("create_survey", {
						}, JSON.stringify(data), true
					).then(
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
			templateUrl: "/assets/components/surveys/SurveyModal.html"
		});
	};
};