(function (factory) {
    'use strict';

	factory(window.jQuery);

}(function (jQuery) {
    'use strict';

	jQuery.Request = function(args) {
		if (jQuery.support.cors && args.crossDomain !== false) {
			var data, form;
			if (args.data && args.processData !== false) {
				try {
					data = jQuery.dataToJson(args.data);
				} catch(e) {
					data = null;
				}

				// Some data (file uploads) can't be submitted using xhrRequest - will have to use FormData
				if (data) {
					args.data = data;
				}
				// Check to see if FormData is supported first
				else if (typeof(FormData) == "function") {
					data = jQuery.dataToInputs(args.data, "hidden");
					form = jQuery("<form></form>");

					for(var i = 0; i < data.length; i++) {
						form.append(data[i]);
					}

					args.data = new FormData(form.get(0));
					args.processData = false;
					args.cache = false;
					args.contentType = false;
				}
			}
			if (data !== false || !args.data) {
				var defer = jQuery.Deferred();
				(function(defer) {
				args.xhr = function() {
					var xhr = jQuery.ajaxSettings.xhr();
					try {
						if (xhr.upload) {
							xhr.upload.addEventListener('progress', function(e) {
								if (e.lengthComputable) {
									defer.notify({ total: e.total, loaded: e.loaded });
								}
							}, false);
						}
						else {
							xhr.addEventListener('progress', function(e) {
								if (e.lengthComputable) {
									defer.notify({ total: e.total, loaded: e.loaded });
								}
							}, false);
						}
					}
					catch(e) {
					}
					return xhr;
				};
				})(defer);

				// Send cookies
				args.xhrFields = {
					withCredentials: true
				};
				jQuery.ajax(args).fail(
					function(xhr, status, error) {
						try {
							defer.reject({
								"headers": xhr.getAllResponseHeaders(),
								"response": JSON.parse(xhr.responseText),
								"status": xhr.status
								
							});
							if (xhr.error.error) {
								xhr.error = xhr.error.error;
							}
						} catch(e) {
							defer.reject({
								"status" : 500,
								"response" : {
									"message": e.message
								},
								"headers": {}
							});
						}
					}
				).success(
					function(response, status, xhr) {
						defer.resolve({
							"headers": xhr.getAllResponseHeaders(),
							"response": response,
							"status": xhr.status
						});
					}
				);

				return defer.promise();
			}
		}
		return jQuery.XDR(args);
	};

	jQuery.Request.parseUri = (function() {
		var parseUri = function(str) {
			var	o   = parseUri.options,
				m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
				uri = {},
				i   = 14;

			while (i--) uri[o.key[i]] = m[i] || "";

			uri[o.q.name] = {};
			uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
				if ($1) uri[o.q.name][$1] = $2;
			});

			return uri;
		};

		parseUri.options = {
			strictMode: false,
			key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
			q:   {
				name:   "queryKey",
				parser: /(?:^|&)([^&=]*)=?([^&]*)/g
			},
			parser: {
				strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
				loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
			}
		};
		return parseUri;
	})();

}));