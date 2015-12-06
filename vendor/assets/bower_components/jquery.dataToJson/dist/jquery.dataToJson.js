;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.jQuery.dataToJson = factory(root.jquery);
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

	jQuery.dataToJson = function(data) {
		var g_dataToJson = function(data) {
			var datum;

			if (isDOMElement(data)) {
				return jQuery(data).find("input,textarea,select").serializeObject();
			}
			else if (typeof(data) == "object") {
				var result = {};
				for(var k in data) {
					if (isDOMElement(data[k])) {
						result[k] = jQuery(data[k]).find("input,textarea,select").serializeObject();
					}
					else {
						result[k] = g_dataToJson(data[k]);
					}
				}
				return result;
			}
			else {
				return data;
			}
		},
		g_hasFileInput = function(data, hasFileInput, depth) {
			depth = ((typeof(depth) == "undefined") ? 0 : depth);
			hasFileInput = ((typeof(hasFileInput) != "boolean") ? false : hasFileInput);

			if (depth > 2) {
				return false;
			}

			if (jQuery.isPlainObject(data)) {
				for(var k in data) {
					if (isDOMElement(data[k])) {
						hasFileInput = hasFileInput || (jQuery("input[type='file']",data[k]).length > 0);
					}				
					else if (typeof(data[k] == "object")) {
						hasFileInput = hasFileInput || g_hasFileInput(data[k], hasFileInput, (depth+1));
					}
				}
			}
			else if (isDOMElement(data)) {
				var $data = jQuery(data);
				if ($data.prop("tagName") == "INPUT" && $data.prop("type") == "file") {
					return true;
				}
				
				return (jQuery("input[type='file']",data).length > 0);
			}
			return hasFileInput;
		};
		if (g_hasFileInput(data)) {
			return false;
		}
		return g_dataToJson(data);
	};
}));
return jQuery.dataToJson;
}));
