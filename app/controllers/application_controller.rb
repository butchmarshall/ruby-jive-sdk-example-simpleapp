class ApplicationController < ActionController::Base
	# Set P3P header
	before_filter do
		response.headers['P3P'] = 'CP="CAO PSA OUR"'
	end
	after_filter :set_csrf_cookie

	def set_csrf_cookie
		if protect_against_forgery?
			cookies['XSRF-TOKEN'] = form_authenticity_token
		end
	end
	
	def test
		render :text => request.env["jive.email"]
	end
end
