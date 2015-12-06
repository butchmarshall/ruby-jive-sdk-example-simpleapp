;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.jQuery.Api = factory(root.jquery);
  }
}(this, function(jquery) {
(function (factory) {
    'use strict';
	factory(window.jQuery);
}(function (jQuery) {
    'use strict';

	function isDOMElement(o){
		return (
			typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
			o && typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string"
		);
	};

	var Api = {};
	Api.baseUrl = function() {
		return Api.domain;
	};
	Api.extraParams = {};
	Api.domain = window.location.protocol+"//"+window.location.host;

	// Private variables
	var routes = {},
	request_cache = {},
	defaultDataType = "json";

	function get_request(args) {
		return jQuery.Request(args).then(
			function(result) {
				return ((result.response)? result.response : result);
			}
		);
	}

	function build_url(base, data) {
		data = ((typeof(data) != "object") ? {} : data);

		// Building a key from a dom element?  Serialize the object
		if (isDOMElement(data)) {
			var $focused = jQuery(':focus'),
			$data = jQuery(data)
			$data.wrap("<form></form>");

			var $form = $data.parent();
			data = $form.serializeObject();
			$data.unwrap();

			$focused.focus();
		}

		var sep = (base.indexOf('?') > -1) ? '&' : '?',
		query_str = jQuery.param(data);

		return base + ((query_str.length > 0) ? (sep + jQuery.param(data)) : '');
	}

	// Takes an endpoint, turns it into a uri
	function endpoint_to_uri(endpoint, parts) {
		// Subsitute in order
		// TODO - more robust browser support for array detection
		if (jQuery.isArray(parts)) {
			var index = 0, match;
			while(match = endpoint.match(/{[^}]+}/)) {
				endpoint = endpoint.replace(/{[^}]+}/, parts[index]);
				index++;

				// Index out of range!
				if (!parts[index]) {
					break;
				}
			}
		}
		// Substitute via key -> value pairs
		else {
			for(var k in parts) {
				endpoint = endpoint.replace("{"+k+"}", parts[k]);
			}
		}

		var extra_params = Api.extraParams;

		return build_url(endpoint, extra_params);
	};

	function build_response_links(route_name, response) {
		// Build auto pagination
		if (response.links) {
			// Next page
			if (response.links.next) {
				response.next = to_request(route_name, response.links.next.href);
			}
			// Next page
			if (response.links.previous) {
				response.previous = to_request(route_name, response.links.previous.href);
			}
		}
		
		return response;
	}

	// Returns the next page
	function to_request(route_name, uri) {
		return function() {
			// No protocol specified
			if (!uri.match(/^http[s]?:/i)) {
				// use baseUrl if specified
				if (Api.baseUrl) {
					uri = Api.baseUrl()+uri;
				}
				// use the pages location
				else {
					uri = window.location.protocol+"//"+window.location.host+uri;
				}
			}
			var cache_key = build_url(uri, {});

			if (!request_cache[route_name]) {
				request_cache[route_name] = {};
			}

			if (!request_cache[route_name][cache_key]) {
				request_cache[route_name][cache_key] = get_request({
					url: uri,
					type: "GET",
					dataType: routes[route_name].dataType
				});
			}

			return request_cache[route_name][cache_key].promise().then(
				function(response) {
					return build_response_links(route_name, response);
				}
			);
		};
	}
	
	// Returns an in progress or finished request, or executes a new request if never executed before
	function to_route_request(route_name, orig_parts, data, args) {
		var parts = orig_parts, route = routes[route_name], uri = null,
		no_cache = ((typeof(args) === "boolean")? args : args.no_cache);
		args = ((typeof(args) != "object")? {} : args);

		if (typeof(parts) == "string") {
			var parsed_parts = {},
			matches,
			parsed_uri = jQuery.Request.parseUri(parts),
			route_parts = route.endpoint.split(/\//),
			url_parts = parsed_uri.path.split(/\//);

			if (route_parts.length == url_parts.length) {
				for(var i = 0; i < route_parts.length; i++) {
					if (matches = route_parts[i].match(/^{([^}]+)}$/)) {
						parsed_parts[matches[1]] = url_parts[i];
					}
					else if (route_parts[i] != url_parts[i]) {
						// URI is non standard!
						uri = parts;
						break;
					}
				}
			}
			parts = parsed_parts;

			if (parsed_uri.query.length > 0) {
				data = (typeof(data) != "object")? {} : data;

				data = jQuery.extend(data, jQuery.deparam(parsed_uri.query));
			}

			if (uri) {
				uri = build_url(uri, Api.extraParams);
			}
		}
	
		if (!uri) {
			uri = endpoint_to_uri(route.endpoint, parts);
		}

		// No protocol specified
		if (!uri.match(/^http[s]?:/i)) {
			// use baseUrl if specified
			if (Api.baseUrl) {
				uri = Api.baseUrl()+uri;
			}
			// use the pages location
			else {
				uri = window.location.protocol+"//"+window.location.host+uri;
			}
		}
		var cache_key = ((route.type == "GET") ? build_url(uri, data) : uri);

		// If the parts passed are an array - map these to an associative array
		if (jQuery.isArray(parts)) {
			var tmp_parts = {},
			matches = route.endpoint.match(/{[^}]+}/g), match;
			for(var i = 0; i < matches.length; i++) {
				match = matches[i].replace(/^{/, '').replace(/}$/, '');
				if (parts[i]) {
					tmp_parts[match] = parts[i];
				}
			}
			parts = tmp_parts;
		}

		if (!request_cache[route_name]) {
			request_cache[route_name] = {};
		}

        // Allows us to modify the data sent
        data  = route.before_send(data);

		if (!request_cache[route_name][cache_key] || no_cache) {
			request_cache[route_name][cache_key] = get_request(jQuery.extend({}, args, route, {
				url: uri,
				data: data,
				dataType: defaultDataType
			}));
		}

		// Fire any callbacks added to the route
		(function(route, cache_key) {
			request_cache[route_name][cache_key].promise().then(
				function(response) {
					route.success({
						response: response,
						route: route,
						request_cache: request_cache,
						no_cache: no_cache
					});
				},
				function(response) {
					route.failure(response);
					delete(request_cache[route_name][cache_key]);
				}
			);
		})(route, cache_key);

		// Forget non-get requests from the cache
		if (route.type != "GET") {
			(function(cache_key) {
				request_cache[route_name][cache_key].promise().then(
					function() {
						request_cache[route_name][cache_key] = null;
					}
				);
			})(cache_key);
		}

		return request_cache[route_name][cache_key].promise().then(
			function(response) {
                if (route.filter_response) {
                    return route.filter_response(response, parts, orig_parts, data).then(
                        function(response) {
                            return build_response_links(route_name, response);
                        }
                    )
                }

				return build_response_links(route_name, response);
			}
		);
	};

	// Logger
	Api.logger = function() {
		// We don't want our logger crashing if console not defined (ie?)
		try {
		var args = Array.prototype.slice.call(arguments, 0),
			type = args.shift();
		} catch(e) {
		}
	};

	Api.clearCache = function(route_name) {
		request_cache[route_name] = {};
		return true;
	};

	// Add a route
	Api.addRoute = function(route_name, endpoint, args) {
		args = ((typeof(args) != "object") ? {} : args);
		args.endpoint = endpoint;
		args.type = ((typeof(args.type) != "string") ? "GET" : args.type.toUpperCase());
		args.dataType = ((typeof(args.dataType) != "string") ? defaultDataType : args.dataType);
		args.success = ((typeof(args.success) != "function") ? function() {} : args.success);
		args.failure = ((typeof(args.failure) != "function") ? function() {} : args.failure);
		args.before_send = ((typeof(args.before_send) != "function") ? function(data) { return data; } : args.before_send);
		args.filter_response = ((typeof(args.filter_response) != "function") ? function(response) { return jQuery.Deferred().resolve(response); } : args.filter_response);
		args.cors = ((typeof(args.cors) != "boolean") ? true : args.cors);
		args.processData = ((typeof(args.processData) != "boolean") ? true : args.processData);

		if (routes[route_name]) {
			Api.logger("warn", "Overwriting already defined route", route_name);
		}

		routes[route_name] = jQuery.extend({}, args);
	};

	// Execute a defined route
	Api.execute = function(route_name, parts, data, args) {
		// Route not previously defined
		if (!routes[route_name]) {
			Api.logger("error", "Could not execute undefined route", route_name);
			return false;
		}

		return to_route_request(route_name, parts, data, args);
	};

	Api.url = function(route_name, parts, data) {
		// Route not previously defined
		if (!routes[route_name]) {
			Api.logger("error", "Could not execute undefined route", route_name);
			return false;
		}

		var route = routes[route_name], uri = null;

		if (typeof(parts) == "string") {
			var parsed_parts = {},
			matches,
			parsed_uri = jQuery.Request.parseUri(parts),
			route_parts = route.endpoint.split(/\//),
			url_parts = parsed_uri.path.split(/\//);

			if (route_parts.length == url_parts.length) {
				for(var i = 0; i < route_parts.length; i++) {
					if (matches = route_parts[i].match(/^{([^}]+)}$/)) {
						parsed_parts[matches[1]] = url_parts[i];
					}
					else if (route_parts[i] != url_parts[i]) {
						// URI is non standard!
						uri = parts;
						break;
					}
				}
			}
			parts = parsed_parts;

			if (parsed_uri.query.length > 0) {
				data = (typeof(data) != "object")? {} : data;

				data = jQuery.extend(data, jQuery.deparam(parsed_uri.query));
			}

			if (uri) {
				uri = build_url(uri, Api.extraParams);
			}
		}

		if (!uri) {
			uri = endpoint_to_uri(route.endpoint, parts);
		}

		// No protocol specified
		if (!uri.match(/^http[s]?:/i)) {
			// use baseUrl if specified
			if (Api.baseUrl) {
				uri = Api.baseUrl()+uri;
			}
			// use the pages location
			else {
				uri = window.location.protocol+"//"+window.location.host+uri;
			}
		}

		// Not get - need to fake the method
		if (route.type != "GET") {
			uri = build_url(uri, { "_method": route.type });
		}
		
		if (typeof(data) != "undefined") {
			uri = build_url(uri, data);
		}

		return uri;
	}

	jQuery.Api = Api;
}));
return jQuery.Api;
}));
