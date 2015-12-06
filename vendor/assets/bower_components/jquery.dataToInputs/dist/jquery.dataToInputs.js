;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.jQuery.dataToInputs = factory(root.jquery);
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

	jQuery.dataToInputs = (function() {
		var g_toInputs = function(data, inputType, keyStack, inputStack) {
			inputType = (typeof(inputType) == "undefined")? "hidden" : inputType;
			keyStack = (typeof(keyStack) == "undefined")? [] : keyStack;
			inputStack = (typeof(inputStack) == "undefined")? [] : inputStack;

			var dataType = (jQuery.isArray(data)? "array" : typeof(data)), valType,
			type, val, keyStackCopy, keyStackCopy2, name, $input, cleanArray,
			toInput = function(stack, val) {
				var name = "";
				for(var i = 0; i < stack.length; i++) {
					if (i == 0) {
						name = stack[i];
					}
					else {
						name += "["+stack[i]+"]";
					}
				}
				var $input = jQuery("<input />");
				$input.attr("type", inputType);
				$input.attr("name", name);
				$input.val(val);
				return $input;
			};

			// Convert the DOM element to JSON
			if (isDOMElement(data)) {
				var $data = jQuery(data), $elem, $origInput, tagName, tagType,
				inputs = ((jQuery.inArray($data.prop("tagName"), ["INPUT","TEXTAREA","SELECT"]) !== -1) ? $data : jQuery("input,textarea,select", data));

				for (var i = 0; i < inputs.length; i++) {
					$origInput = jQuery(inputs[i]);
					tagName = $origInput.prop("tagName").toLowerCase();
					tagType = $origInput.attr("type");
					$elem = jQuery("<input type='hidden' value='' />");

					if (tagName == "input" && (tagType == "checkbox" || tagType == "radio")) {
						if ($origInput.is(":checked")) {
							$elem.val($origInput.val());
						}
						else if (tagType == "radio") {
							continue;
						}
					}
					else if (tagName == "input" && $origInput.attr("type") == "file") {
						$elem = jQuery(inputs[i].cloneNode(true));
					}
					else {
						$elem.val($origInput.val());
					}

					var stack = [];
					for(var j = 0; j < keyStack.length; j++) {
						stack.push(keyStack[j]);
					}
					var parts = jQuery(inputs[i]).attr("name") || null;
					parts = (parts)? parts.split(/\[/) : parts;

					if (parts) {
						for(var j = 0; j < parts.length; j++) {
							stack.push(parts[j].replace(/\]$/, ''));
						}
					}

					var name = "";
					for(var j = 0; j < stack.length; j++) {
						if (j == 0) {
							name = stack[j];
						}
						else {
							name += "["+stack[j]+"]";
						}
					}

					$elem.attr("name", name);
					if ($origInput.attr("type") == "file") {
						$elem.insertBefore(inputs[i]);
						inputStack.push(inputs[i]);
					}
					else {
						inputStack.push($elem.get(0));
					}
				}
			}
			else if ((dataType == "string" || dataType == "number")) {
				inputStack.push(toInput(keyStack, data));
			}
			else {
				for(var k in data) {
					keyStackCopy = keyStack.slice();
					name = "";
					val = data[k];
					type = (jQuery.isArray(val)? "array" : typeof(val)),
					keyStackCopy.push(k);
					// We need to recurse this data to build a key
					if (type == "object") {
						g_toInputs(data[k], inputType, keyStackCopy, inputStack);
					}
					else if (type == "array") {
						cleanArray = true;
						for(var i = 0; i < val.length; i++) {
							valType = (jQuery.isArray(val[i])? "array" : typeof(val[i]));
							if (!(valType == "string" ||
							valType == "number")) {
								cleanArray = false;
							}
						}
						if (!cleanArray) {
							for(var i = 0; i < val.length; i++) {
								keyStackCopy2 = keyStackCopy.slice();
								keyStackCopy2.push(i);
								g_toInputs(data[k][i], inputType, keyStackCopy2, inputStack);
							}
						}
						else {
							for(var i = 0; i < val.length; i++) {
								keyStackCopy2 = keyStackCopy.slice();
								keyStackCopy2.push("");
								g_toInputs(data[k][i], inputType, keyStackCopy2, inputStack);
							}
						}
					}
					// We can construct an input from here
					else {
						inputStack.push(toInput(keyStackCopy, val));
					}
				}
			}
			return inputStack;
		};
		return function(data, type) {
			return g_toInputs(data, type);
		}
	})();

}));
return jQuery.dataToInputs;
}));
