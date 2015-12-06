;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.jQuery.xdr = factory(root.jquery);
  }
}(this, function(jquery) {
(function (factory) {
    'use strict';
	factory(window.jQuery);
}(function (jQuery) {
    'use strict';

	jQuery.XDR = (function() {
		var hideCss = { position: "absolute", width: "0px", height: "0px", top: "-1000px" },
		globalFrameId = 0,
		getToken = function() {
			return jQuery.ajax({
				url: jQuery.XDR.domain+"/xdr.json",
				dataType: "jsonp",
				data: { "_method":"put" },
				crossDomain: true
			});
		},
		setFormData = function($form, data) {
			var fields = jQuery.dataToInputs(data, "hidden");
			for(var i = 0; i < fields.length; i++) {
				$form.append(fields[i]);
			}
		},
		getForm = function(args, deferredSuccess) {
			globalFrameId++;
			var deferred = jQuery.Deferred(),
			$form = jQuery("<form method='post' onsubmit='return false;' enctype='multipart/form-data' accept-charset='UTF-8'></form>"),
			$method = jQuery("<input type='hidden' name='_method' />"),
			token = getToken();

			setFormData($form, args.data);
			$form.css(hideCss);

			$form.attr("action", args.url);
			$method.val(args.type.toLowerCase());
			$form.prepend($method);
			token.success(function(response) {
				var $token = jQuery("<input type='hidden' name='xdr[token]' />");
				$token.val(response.xdr_token);
				$form.prepend($token);
				deferred.resolveWith($form,[response.xdr_token]);
			});

			jQuery(document.body).append($form);

			return deferred;
		},
		getIFrame = function() {
			var deferred = jQuery.Deferred(),
			frameId = globalFrameId,
			iframeName = "xdr_form_"+frameId,
			iframeInited = false,
			$iframe = jQuery("<iframe name='"+iframeName+"'></iframe>");

			$iframe.css(hideCss);

			$iframe.bind('load', function() {
				if (!iframeInited) {
					iframeInited = true;
					deferred.resolveWith($iframe);
				}
			});
			jQuery(document.body).append($iframe);

			return deferred;
		},
		getData = function(xdr_token) {
			return jQuery.ajax({
				url: jQuery.XDR.domain+"/xdr/"+xdr_token+".json",
				dataType: "jsonp",
				crossDomain: true
			});
		};

		return function(args) {
			args = (typeof(args) != "object")? {} : args;
			var actions = {
				get: function() {
					var defer = jQuery.Deferred();
					args.dataType = 'jsonp';
					args.crossDomain = true;
					jQuery.ajax(args).done(
						function(result) {
							if (typeof(result) == "object" &&
								result.status && result.body) {
								defer.reject({
									headers: {},
									response: result.body,
									status: result.status
								});
							}
							else {
								defer.resolve({
									response: result,
									headers: {},
									status: 200
								});
							}
						}
					);
					return defer.promise();
				},
				post: function() {
					var defer = jQuery.Deferred(),
					$form = getForm(args, defer);
					$form.done(function(xdr_token) {
						var $iframe = getIFrame();
						$form = this;
						$iframe.done(function() {
							$iframe = this,
							iframePostLoaded = false;

							$form.attr('target', $iframe.attr('name'));
							$form.attr('id', $iframe.attr('name'));

							$iframe.bind('load', function() {
								if(!iframePostLoaded) {
									iframePostLoaded = true;
									$iframe.remove();
									$form.remove();
									getData(xdr_token).done(
										function(result) {
											if (!(result.status+"").match(/2[0-9]+/)) {
												defer.reject(result);
											}
											else {
												defer.resolve(result);
											}
										}
									);
								}
							});
							$form.get(0).submit();
						});
					});

					return defer.promise();
				}
			};
			
			return (typeof(args.type) == "string" && args.type.toLowerCase() != "get")? actions.post() : actions.get();
		}
	})();

	jQuery.XDR.domain = window.location.protocol+"//"+window.location.host;
}));
return jQuery.xdr;
}));
