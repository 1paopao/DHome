/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(10);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "iconfont.eot";

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "body,\r\nul,\r\nli,\r\ndl,\r\ndt,\r\ndd,\r\np,\r\nol,\r\nh1,\r\nh2,\r\nh3,\r\nh4,\r\nh5,\r\nh6,\r\nform,\r\nimg,\r\ntable,\r\nfieldset,\r\nlegend {\r\n\tmargin: 0;\r\n\tpadding: 0;\r\n}\r\n\r\nul,\r\nli,\r\nol {\r\n\tlist-style: none;\r\n}\r\n\r\nimg,\r\nfieldset {\r\n\tborder: 0;\r\n}\r\n\r\nimg {\r\n\tdisplay: block;\r\n}\r\n\r\na {\r\n\ttext-decoration: none;\r\n\tcolor: #333;\r\n}\r\n\r\nh1,\r\nh2,\r\nh3,\r\nh4,\r\nh5,\r\nh6 {\r\n\tfont-weight: 100;\r\n}\r\n\r\nbody {\r\n\tfont-size: 12px;\r\n\tfont-family: \"\\5FAE\\8F6F\\96C5\\9ED1\";\r\n}\r\n\r\ninput,\r\na {\r\n\toutline: none;\r\n}\r\n\r\n//字体文件\r\n@font-face {\r\n  font-family: 'iconfont';\r\n  src: url(" + __webpack_require__(2) + ");\r\n  src: url(" + __webpack_require__(2) + "?#iefix) format('embedded-opentype'),\r\n  url(" + __webpack_require__(4) + ") format('woff'),\r\n  url(" + __webpack_require__(5) + ") format('truetype'),\r\n  url(" + __webpack_require__(6) + "#iconfont) format('svg');\r\n}", ""]);

// exports


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "iconfont.woff";

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "iconfont.ttf";

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "iconfont.svg";

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(8);

__webpack_require__(11);

__webpack_require__(15);

__webpack_require__(19);

__webpack_require__(23);

__webpack_require__(25);

var _jquery = __webpack_require__(29);

var _jquery2 = _interopRequireDefault(_jquery);

var _loginReg = __webpack_require__(31);

var _loginReg2 = _interopRequireDefault(_loginReg);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import $ from 'n-zepto';
//import $ from 'jquery';
/*main.css*/
_loginReg2.default.login();

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(9);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./complist.scss", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./complist.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports
exports.i(__webpack_require__(3), "");

// module
exports.push([module.i, "body {\n  width: 100%; }\n  body .company-top {\n    height: 40px; }\n    body .company-top .company-location {\n      width: 1206px;\n      margin: 0 auto;\n      line-height: 40px; }\n      body .company-top .company-location i {\n        font-family: 'iconfont';\n        display: inline-block;\n        width: 35px;\n        height: 35px;\n        font-style: normal; }\n  body .company-cont .company-table {\n    width: 1206px;\n    margin: 0 auto;\n    margin-top: 12px;\n    margin-bottom: 45px;\n    border-collapse: collapse;\n    border-spacing: 0; }\n    body .company-cont .company-table .type {\n      width: 92px;\n      text-align: center; }\n    body .company-cont .company-table td {\n      border: 1px solid #999;\n      padding: 0 19px;\n      line-height: 30px; }\n  body .company-cont .recommend {\n    width: 1206px;\n    margin: 0 auto;\n    line-height: 34px;\n    border: 1px solid #999;\n    padding: 0 15px;\n    box-sizing: border-box;\n    position: relative; }\n    body .company-cont .recommend a {\n      position: absolute;\n      right: 20px; }\n  body .company-cont .recom-cont {\n    width: 1206px;\n    margin: 0 auto;\n    margin-top: 12px;\n    border: 1px solid #999;\n    padding: 12px;\n    box-sizing: border-box;\n    overflow: hidden; }\n    body .company-cont .recom-cont dt {\n      float: left;\n      padding: 18px;\n      box-sizing: border-box;\n      width: 120px; }\n    body .company-cont .recom-cont dd {\n      float: left; }\n      body .company-cont .recom-cont dd .company-left {\n        float: left;\n        width: 825px;\n        border-right: 1px solid #999; }\n        body .company-cont .recom-cont dd .company-left p:nth-child(1) {\n          font-size: 22px;\n          font-weight: 600;\n          margin-top: 10px;\n          margin-bottom: 17px; }\n        body .company-cont .recom-cont dd .company-left p:nth-child(2) span:nth-of-type(1) {\n          display: inline-block;\n          width: 14px;\n          height: 14px;\n          line-height: 14px;\n          text-align: center;\n          color: #fff;\n          background: #79cbc9; }\n        body .company-cont .recom-cont dd .company-left p:nth-child(2) span:nth-of-type(2) {\n          display: inline-block;\n          width: 14px;\n          height: 14px;\n          line-height: 14px;\n          text-align: center;\n          color: #fff;\n          background: #efa091; }\n        body .company-cont .recom-cont dd .company-left p:nth-child(2) span:nth-of-type(3) {\n          display: inline-block;\n          width: 14px;\n          height: 14px;\n          line-height: 14px;\n          text-align: center;\n          color: #fff;\n          background: #e0bf7a; }\n        body .company-cont .recom-cont dd .company-left p:nth-child(2) span:nth-of-type(4) {\n          display: inline-block;\n          width: 14px;\n          height: 14px;\n          line-height: 14px;\n          text-align: center;\n          color: #fff;\n          background: #f7a768; }\n        body .company-cont .recom-cont dd .company-left p:nth-child(2) span:nth-of-type(5) {\n          display: inline-block;\n          width: 14px;\n          height: 14px;\n          line-height: 14px;\n          text-align: center;\n          color: #fff;\n          background: #8fd0a5; }\n        body .company-cont .recom-cont dd .company-left p:nth-child(2) span:nth-of-type(6) {\n          display: inline-block;\n          width: 14px;\n          height: 14px;\n          line-height: 14px;\n          text-align: center;\n          color: #fff;\n          background: #90b5c7; }\n        body .company-cont .recom-cont dd .company-left p:nth-child(2) span:nth-of-type(7) {\n          display: inline-block;\n          width: 14px;\n          height: 14px;\n          line-height: 14px;\n          text-align: center;\n          color: #fff;\n          background: #90b5c5; }\n        body .company-cont .recom-cont dd .company-left p:nth-child(2) strong {\n          font-size: 14px;\n          font-weight: 200; }\n        body .company-cont .recom-cont dd .company-left p:nth-child(3) {\n          margin-top: 15px;\n          font-size: 14px; }\n          body .company-cont .recom-cont dd .company-left p:nth-child(3) i {\n            font-style: normal;\n            font-family: iconfont;\n            display: inline-block;\n            width: 15px;\n            height: 15px; }\n      body .company-cont .recom-cont dd .company-right {\n        float: left;\n        width: 233px;\n        text-align: center;\n        line-height: 20px;\n        font-size: 14px; }\n        body .company-cont .recom-cont dd .company-right strong {\n          display: block; }\n        body .company-cont .recom-cont dd .company-right span {\n          display: block;\n          color: #ea9957; }\n        body .company-cont .recom-cont dd .company-right button {\n          padding: 0 30px;\n          font-size: 18px;\n          color: #fff;\n          line-height: 32px;\n          background: #e16e13;\n          border: none; }\n", ""]);

// exports


/***/ }),
/* 10 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(12);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./compdetail.scss", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./compdetail.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports
exports.i(__webpack_require__(3), "");

// module
exports.push([module.i, ".comp-detail {\n  width: 1206px;\n  margin: 0 auto;\n  overflow: hidden;\n  margin-top: 40px; }\n  .comp-detail dl {\n    height: 256px; }\n    .comp-detail dl dt {\n      float: left;\n      padding-left: 53px; }\n    .comp-detail dl dd {\n      float: left;\n      font-size: 16px; }\n      .comp-detail dl dd div:nth-child(1) {\n        float: left;\n        margin: 27px 0;\n        padding: 0 40px 0 200px;\n        line-height: 50px;\n        border-right: 1px solid #999;\n        text-align: center; }\n        .comp-detail dl dd div:nth-child(1) p {\n          padding: 6px; }\n          .comp-detail dl dd div:nth-child(1) p i {\n            float: left;\n            width: 35px;\n            height: 35px;\n            background: url(" + __webpack_require__(13) + ") no-repeat -6px top; }\n          .comp-detail dl dd div:nth-child(1) p .i1 {\n            background-position-y: -47px; }\n          .comp-detail dl dd div:nth-child(1) p .i2 {\n            background-position-y: -95px; }\n          .comp-detail dl dd div:nth-child(1) p span {\n            float: left;\n            cursor: pointer; }\n      .comp-detail dl dd div:nth-child(2) {\n        float: left;\n        margin: 27px 0 27px 30px; }\n        .comp-detail dl dd div:nth-child(2) p:nth-child(1) {\n          line-height: 50px; }\n        .comp-detail dl dd div:nth-child(2) .comp-star {\n          line-height: 36px; }\n          .comp-detail dl dd div:nth-child(2) .comp-star span {\n            display: inline-block;\n            width: 17px;\n            height: 17px;\n            background: url(" + __webpack_require__(14) + ") no-repeat left top; }\n  .comp-detail .comp-bottom h2 {\n    height: 50px;\n    line-height: 50px;\n    text-align: center;\n    border-bottom: 1px solid #999; }\n  .comp-detail .comp-bottom p {\n    text-indent: 2em;\n    font-size: 14px;\n    line-height: 31px; }\n", ""]);

// exports


/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,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"

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAQCAMAAACm90YvAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAS9QTFRF/uRu/uBi/80p9PTz/9E3/txW6uro/9dG/f397Ozq8vLx+vr64eHe/8gc/uyF4+Ph/v7+9/f2/u+O5ubk9/f37u7s5OTh5ubj8fHw+fn45+fk/Pz8//zs//755eXj8PDv/vKX+Pj36Ojm6+vq/ueF//nV7u7t//TG//bb39/c8/Py/9xu/+mk//C1//31/vew/885/Pz78PDu7e3r/9tp//fN/9lP6+vp+Pj47e3s5eXi//744uLf/vGd//TS/++1/9RP/+eX//ra/+SS/umA9fX0/vWt/u2O/vm8/vS2/uyX//vv/vO5/+ur//vk/vWe/vW+//3m//bR/888//3o//rY///8/uN2//no//nl//LK/uRw/80x5+fl/+yy//78/vGj/991/uh6////////otLYBwAAAGV0Uk5T/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wAZaNKDAAABCUlEQVR42mzQBVPDMBiA4UAgJBXqM8aM4e4uG85wd0v//2+gNF+2TN67XnrtczEUQpthhyiMCMabkw7IKbWo2av7dpXL+E2qWigctSFMcFJVj9uu6z60INvyOcFSZYevv/ujjk+XLwcl0XHwsci5YzCtSEOUPfhVOxfGSJC8w6OoxjwjQOHtG2p09iWmOhwvctl6yY5WHO2qV66vOLGqAwo8O979dC/0NNPYe4oJlM5ROONKn2hXPaJBY8U0uIlaD1RR0MCWmGthBNRON/SjqLUkT7MM5piA+jTNuanXJdPca7p4Ymk+SaQ8UPt3F//fxybfFZXfiK9dH7JAPcs/L+q+5Mt89PwJMAD0MqzLg8Ai2gAAAABJRU5ErkJggg=="

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(16);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./home.scss", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./home.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "@font-face {\n  font-family: 'iconfont';\n  src: url(" + __webpack_require__(2) + ");\n  src: url(" + __webpack_require__(2) + "?#iefix) format(\"embedded-opentype\"), url(" + __webpack_require__(4) + ") format(\"woff\"), url(" + __webpack_require__(5) + ") format(\"truetype\"), url(" + __webpack_require__(6) + "#iconfont) format(\"svg\"); }\n\nheader, #content, footer {\n  width: 1200px;\n  margin: 0 auto; }\n\n#head-wrap, #banner, #content-wrap, #footer-wrap {\n  width: 100%; }\n\n#head-wrap {\n  background: #000; }\n\nheader {\n  height: 60px;\n  overflow: hidden;\n  display: flex;\n  justify-content: space-between; }\n  header #logo {\n    width: 100px;\n    margin-top: 10px; }\n  header nav ul li {\n    float: left;\n    padding: 0 20px;\n    margin-top: 20px;\n    color: #fff; }\n    header nav ul li a {\n      float: left;\n      height: 18px;\n      line-height: 18px;\n      font-size: 18px;\n      color: #fff; }\n    header nav ul li em {\n      padding: 0 5px;\n      font-style: normal;\n      font-family: iconfont; }\n  header nav li:last-child a {\n    padding: 0 10px; }\n  header nav li:last-child a:first-child {\n    border-right: 2px solid #fff; }\n  header nav .active a {\n    color: red; }\n\n#banner {\n  position: relative;\n  height: 588px;\n  overflow: hidden; }\n  #banner ul {\n    position: absolute;\n    height: 588px; }\n    #banner ul li {\n      float: left; }\n      #banner ul li img {\n        width: 1423px;\n        height: 588px; }\n  #banner #direction {\n    display: none; }\n    #banner #direction span {\n      position: absolute;\n      width: 40px;\n      height: 80px;\n      background: rgba(0, 0, 0, 0.3);\n      text-align: center;\n      line-height: 80px;\n      color: #d7d7d7;\n      font-family: iconfont;\n      font-size: 40px;\n      font-weight: 900;\n      cursor: pointer; }\n    #banner #direction #left-arrow {\n      left: 120px;\n      top: 50%;\n      margin-top: -40px; }\n    #banner #direction #right-arrow {\n      right: 120px;\n      top: 50%;\n      margin-top: -40px; }\n  #banner .search {\n    position: absolute;\n    bottom: 20px;\n    left: 50%;\n    margin-left: -310px;\n    width: 586px;\n    height: 34px;\n    padding: 23px 17px;\n    background: rgba(0, 0, 0, 0.4);\n    border-radius: 15px; }\n    #banner .search form select {\n      float: left;\n      width: 240px;\n      height: 34px;\n      border: 0;\n      text-indent: 2em; }\n      #banner .search form select option {\n        height: 20px;\n        line-height: 20px; }\n    #banner .search form input {\n      float: left;\n      height: 34px;\n      border: 0; }\n    #banner .search form input[type=\"text\"] {\n      text-indent: 1em;\n      width: 241px;\n      padding: 0;\n      margin: 0 18px 0 10px; }\n    #banner .search form input[type='button'] {\n      width: 73px;\n      background: #d94700;\n      color: #fff; }\n\n#content {\n  min-height: 400px;\n  height: auto !important;\n  height: 400px;\n  overflow: hidden; }\n  #content .tit {\n    width: 308px;\n    height: 34px;\n    line-height: 34px;\n    margin: 5px auto; }\n    #content .tit .left_line, #content .tit .right_line {\n      float: left;\n      width: 100px;\n      height: 2px;\n      margin-top: 16px;\n      background: #3f3f3f; }\n    #content .tit h3 {\n      float: left;\n      margin: 0 20px;\n      font-size: 22px;\n      color: #656565; }\n  #content .home_contop {\n    float: left;\n    width: 100%;\n    height: 325px;\n    margin: 66px 34px 72px 34px; }\n    #content .home_contop .left {\n      float: left;\n      width: 495px;\n      height: 325px; }\n    #content .home_contop .right {\n      float: left;\n      width: 637px;\n      height: 325px;\n      background: #000; }\n      #content .home_contop .right div {\n        width: 440px;\n        height: 194px;\n        margin-top: 77px;\n        background: #d7d7d7; }\n  #content .psd {\n    float: left;\n    width: 100%;\n    height: 496px;\n    margin: 34px 34px 0; }\n    #content .psd ul {\n      width: 100%;\n      height: 406px; }\n      #content .psd ul li {\n        position: relative;\n        float: left;\n        width: 378px;\n        height: 201px;\n        line-height: 201px;\n        text-align: center;\n        overflow: hidden; }\n        #content .psd ul li img {\n          width: 100%;\n          height: 100%; }\n        #content .psd ul li .hovers {\n          position: absolute;\n          top: 201px;\n          left: 0;\n          width: 100%;\n          height: 100%;\n          background: rgba(0, 0, 0, 0.5);\n          color: #fff;\n          font-size: 18px; }\n  #content .fitup {\n    float: left;\n    width: 100%;\n    height: 363px; }\n    #content .fitup ul {\n      width: 100%;\n      height: 253px;\n      display: flex;\n      justify-content: space-around; }\n      #content .fitup ul li {\n        transition-duration: 0.5s; }\n        #content .fitup ul li div {\n          width: 100%;\n          height: 56px;\n          background: #222;\n          color: #fff;\n          line-height: 25px;\n          text-align: center; }\n          #content .fitup ul li div a {\n            display: block;\n            width: 70px;\n            height: 20px;\n            margin: 0 auto;\n            line-height: 20px;\n            background: #d74d0c;\n            color: #fff; }\n      #content .fitup ul li:hover {\n        box-shadow: 0px 5px 15px #666;\n        transform: scale(1.05); }\n  #content .home_share {\n    float: left;\n    width: 100%;\n    height: 455px;\n    background: plum;\n    margin-bottom: 50px; }\n    #content .home_share .share_info {\n      position: relative;\n      float: left;\n      width: 650px;\n      height: 455px;\n      background: url(" + __webpack_require__(17) + ") no-repeat center top/cover; }\n      #content .home_share .share_info div {\n        position: absolute;\n        right: 0;\n        top: 90px;\n        width: 424px;\n        height: 240px;\n        padding: 18px 10px 0 13px;\n        margin-top: 16px;\n        background: rgba(191, 191, 191, 0.8); }\n        #content .home_share .share_info div dl dt {\n          float: left;\n          width: 95px;\n          height: 95px;\n          margin-right: 10px; }\n          #content .home_share .share_info div dl dt img {\n            width: 100%;\n            height: 100%;\n            border-radius: 50%; }\n        #content .home_share .share_info div dd {\n          float: left;\n          width: 300px;\n          height: 248px; }\n          #content .home_share .share_info div dd h2 {\n            line-height: 32px;\n            color: #262626; }\n          #content .home_share .share_info div dd p:nth-of-type(1) {\n            line-height: 13px;\n            margin: 5px auto;\n            font-size: 14px; }\n            #content .home_share .share_info div dd p:nth-of-type(1) span:first-child {\n              padding-right: 5px;\n              margin-right: 5px;\n              border-right: 1px solid #505956; }\n          #content .home_share .share_info div dd p:nth-of-type(2) {\n            line-height: 26px;\n            font-size: 14px; }\n          #content .home_share .share_info div dd p:nth-of-type(3) img {\n            width: 136px;\n            height: 136px; }\n    #content .home_share .user_img {\n      float: right;\n      width: 550px;\n      height: 455px;\n      background: url(" + __webpack_require__(18) + "); }\n      #content .home_share .user_img ul {\n        padding-left: 63px; }\n        #content .home_share .user_img ul li {\n          float: left;\n          position: relative;\n          width: 125px;\n          height: 125px;\n          margin: 65px 35px 0 0;\n          transition-duration: .5s;\n          opacity: 0.6; }\n          #content .home_share .user_img ul li img {\n            width: 100%;\n            border-radius: 50%; }\n        #content .home_share .user_img ul .active {\n          opacity: 1; }\n\n#clear {\n  display: block;\n  clear: both;\n  height: 0;\n  overflow: hidden;\n  visibility: hidden; }\n\n#footer-wrap {\n  background: #232323; }\n\nfooter {\n  height: 147px; }\n", ""]);

// exports


/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = "data:image/jpeg;base64,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Umx0AAAAAAAAAAAAAAAAVG9wIFVudEYjUmx0AAAAAAAAAAAAAAAAU2NsIFVudEYjUHJjQFkAAAAAAAAAAAAQY3JvcFdoZW5QcmludGluZ2Jvb2wAAAAADmNyb3BSZWN0Qm90dG9tbG9uZwAAAAAAAAAMY3JvcFJlY3RMZWZ0bG9uZwAAAAAAAAANY3JvcFJlY3RSaWdodGxvbmcAAAAAAAAAC2Nyb3BSZWN0VG9wbG9uZwAAAAAAOEJJTQPtAAAAAAAQAEgAAAABAAIASAAAAAEAAjhCSU0EJgAAAAAADgAAAAAAAAAAAAA/gAAAOEJJTQQNAAAAAAAEAAAAWjhCSU0EGQAAAAAABAAAAB44QklNA/MAAAAAAAkAAAAAAAAAAAEAOEJJTScQAAAAAAAKAAEAAAAAAAAAAjhCSU0D9QAAAAAASAAvZmYAAQBsZmYABgAAAAAAAQAvZmYAAQChmZoABgAAAAAAAQAyAAAAAQBaAAAABgAAAAAAAQA1AAAAAQAtAAAABgAAAAAAAThCSU0D+AAAAAAAcAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAA4QklNBAAAAAAAAAIAAThCSU0EAgAAAAAABAAAAAA4QklNBDAAAAAAAAIBAThCSU0ELQAAAAAABgABAAAAAjhCSU0ECAAAAAAAEAAAAAEAAAJAAAACQAAAAAA4QklNBB4AAAAAAAQAAAAAOEJJTQQaAAAAAAM/AAAABgAAAAAAAAAAAAABxwAAAooAAAAFZypoB5iYAC0ANQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAACigAAAccAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAQAAAAAAAG51bGwAAAACAAAABmJvdW5kc09iamMAAAABAAAAAAAAUmN0MQAAAAQAAAAAVG9wIGxvbmcAAAAAAAAAAExlZnRsb25nAAAAAAAAAABCdG9tbG9uZwAAAccAAAAAUmdodGxvbmcAAAKKAAAABnNsaWNlc1ZsTHMAAAABT2JqYwAAAAEAAAAAAAVzbGlj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OlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDE3LTEwLTA1VDEwOjI0OjI1KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE3LTEwLTA1VDEwOjI0OjI1KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxNy0xMC0wNVQxMDoyNDoyNSswODowMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozMjAzZmQyYS00NDJkLTM2NDItOTU1MS1kOGE2MWFmNDkwOTIiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDozZWM3M2ZjMS1hOTc0LTExZTctYjE0My1kZTBkNzJmNWQ4YTciIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpmZmM3NGFiYS0xNDgzLWJmNDEtYjMzZC02MjFkNDE2N2MwMzIiIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgZGM6Zm9ybWF0PSJpbWFnZS9qcGVnIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpmZmM3NGFiYS0xNDgzLWJmNDEtYjMzZC02MjFkNDE2N2MwMzIiIHN0RXZ0OndoZW49IjIwMTctMTAtMDVUMTA6MjQ6MjUrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE3IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MzIwM2ZkMmEtNDQyZC0zNjQyLTk1NTEtZDhhNjFhZjQ5MDkyIiBzdEV2dDp3aGVuPSIyMDE3LTEwLTA1VDEwOjI0OjI1KzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPjA1QzlBOTNDRjUzMzIzRTIxQTRCNkI3REFGOTVGQTQ3PC9yZGY6bGk+IDxyZGY6bGk+MDg1RDUwREMyNTRBQTU2QzJCM0QyREUwNUI1MDk3ODA8L3JkZjpsaT4gPHJkZjpsaT4wOTI1MTk3RUQ1QkJDMzdCMjg3Mjc1NDc3NUVDNUMwQTwvcmRmOmxpPiA8cmRmOmxpPjBBQTc3QkRBMTY0MDVGOEU2QjU1NzZGQzRBQzA1NUEzPC9yZGY6bGk+IDxyZGY6bGk+MjY3ODY3RjFDNzIzRjIxNEVFM0VGMjQ4MUJFQkFCNTY8L3JkZjpsaT4gPHJkZjpsaT4yOEQwQjBCOUE0NkREOEQzNUFGNjJGNjNEOEQ0QUNERTwvcmRmOmxpPiA8cmRmOmxpPjJGODFDRjI5RTNCRUQxODRBNUZDMUExNTgyNzc4M0VDPC9yZGY6bGk+IDxyZGY6bGk+NDI5MUY3QjlCMzg0MzBGNDI4MTZBRDhEOUQzODI1Qjc8L3JkZjpsaT4gPHJkZjpsaT40MzJDODgwNjNDQjk3QzlFOTU3NzFCNTczRTc3OEIxMzwvcmRmOmxpPiA8cmRmOmxpPjREMUVDNUNEMDA1NTJBNkE5QjE3NkE5NDQ5Qjk0QzMxPC9yZGY6bGk+IDxyZGY6bGk+NTdDMDY4NzIzOTk2REE3NEEwMkY4NTUzOURDQTI3NTE8L3JkZjpsaT4gPHJkZjpsaT41Qjk5ODdEQ0QwNjk4RjQ2MUQ4ODkyRkU3MTdGNDA1OTwvcmRmOmxpPiA8cmRmOmxpPjVEOEFBODBGODY1QzA3MTQ5Q0MyNEEwNkYxM0U0QkVFPC9yZGY6bGk+IDxyZGY6bGk+NjhFQjdCMTg3RjAyMUJCN0FGMjMxOTM1MTVEQThFRTM8L3JkZjpsaT4gPHJkZjpsaT42QTQyNUQ4QzlDMTY3NzkwNDg0QTY4QkNEMjJENTQwMTwvcmRmOmxpPiA8cmRmOmxpPjc0QzNBNzY4MzI2N0RDQzU0QjQ2RUJCODAxOENFQTExPC9yZGY6bGk+IDxyZGY6bGk+N0QyQjI2OERDQjdBMkJEMEZBNDZGOUMwRDU0QkQzRDk8L3JkZjpsaT4gPHJkZjpsaT5BMTY3QTlEQzU2NUNCNzM4QUY0N0YwOTAyMkQ2RUM4NTwvcmRmOmxpPiA8cmRmOmxpPkE1N0U0RkIzMDg5MTZFODdFN0YwMjFBNjg5M0VCMzk4PC9yZGY6bGk+IDxyZGY6bGk+QjAwNUVBMTQ1NjYyQjg0NTEyNjUyMDk3RjJFQ0Y0QjU8L3JkZjpsaT4gPHJkZjpsaT5CMDU3MUQyN0VCREE4NkIxRkZBODhFQUZDMjdBN0E2MTwvcmRmOmxpPiA8cmRmOmxpPkIyRTRDNjk2RkMwNzlFQTJEODc2OUY1QzJERDMzOUREPC9yZGY6bGk+IDxyZGY6bGk+QjM1NkExNDdENEREMUQ2QzVEMjE0RTE0REQ2QzFGMzk8L3JkZjpsaT4gPHJkZjpsaT5CNkQ3NEQ4MTI0OUQ1NjI3RDA2NDBDRkE1REU3Q0ZFMjwvcmRmOmxpPiA8cmRmOmxpPkI5QjFCNDc0MzE3M0UwNTI2QzJBNjM4N0EzREJBNUE3PC9yZGY6bGk+IDxyZGY6bGk+QkQwMjZBQTEwNDc2MDg0NzhEMjE1NkJGMTJGNjdBQzk8L3JkZjpsaT4gPHJkZjpsaT5ENUE3NzQzOTk5OEM2NjgxRjJBNTIxRTQ4MkU0QzlFMjwvcmRmOmxpPiA8cmRmOmxpPkQ2MDNDM0UzN0JFNjIwQkU4QzBFODY1QTFFRTczQzAwPC9yZGY6bGk+IDxyZGY6bGk+RDgwOThBNTM3RDMyNkRFRkEwNUQzMTUwM0NEQjE4RTY8L3JkZjpsaT4gPHJkZjpsaT5EOTJEMzM3RTVGODRDRjkyMDMwNUY3RTgwQUM1MDMzODwvcmRmOmxpPiA8cmRmOmxpPkUyNzI1Mjg0MzE3NEQ2NTU1NjdFRkYxQkU2ODQ4NDE2PC9yZGY6bGk+IDxyZGY6bGk+RTMxRjkzQTA2RkE2MTg1NkJGMEREQ0NENUIxNDZGODM8L3JkZjpsaT4gPHJkZjpsaT5FOTRENDcyMENGNjI0MzFBMUVBNkU1M0M0NjAyM0Y4RTwvcmRmOmxpPiA8cmRmOmxpPkY0OUY3NTdEMTU3QjdFMjM2ODYxNjgwMjA4QTExOEFGPC9yZGY6bGk+IDxyZGY6bGk+RkE1MzU3QjI1Nzc3REYzMDdDMUQ3NTFERThFQzNBOEE8L3JkZjpsaT4gPHJkZjpsaT5GRDVERUM1QTk1OEZCNDk1N0U3ODY3RkE1QTIyMDlDRjwvcmRmOmxpPiA8cmRmOmxpPnhtcC5kaWQ6NjJGMjU1MEI3QTlDRTcxMTgwMzg4NEJFRUVCMjQyQjY8L3JkZjpsaT4gPC9yZGY6QmFnPiA8L3Bob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0idyI/Pv/iDFhJQ0NfUFJPRklMRQABAQAADEhMaW5vAhAAAG1udHJSR0IgWFlaIAfOAAIACQAGADEAAGFjc3BNU0ZUAAAAAElFQyBz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haOzw9Pj8ykalKS0xNTk9JWltcXV5fUoR1dmOHaGlqa2xtbm9md3h5ent8fX5/dIWGh4iJiouMjY6Pg5SVlpeYmZqbnJ2en5KjpKWmp6ipqqusra6vr/2gAMAwEAAhEDEQA/ALOo6io0L+/N9P8Ajq//AEd7U9NdSEqKi3+fm+v/AB1f+g/2r37r3XP7io/47zf9TX/6O9+69177io/47zf9TX/6O9+69177io/47zf9TX/6O9+69177io/47zf9TX/6O9+69177io/47zf9TX/6O9+691nFRUWH7830H+7X/p/wb37r3Xf3FR/x3m/6mv8A9He/de699xUf8d5v+pr/APR3v3XuvfcVH/Heb/qa/wD0d7917rNDVzo5bzzfpI/zzj8j86vfuvdTFr52YL5puf8Am+5/3i/v3XqnrOKiouP35vqP92v/ANHe9EChx17rP55/+O0v/Ux/+K+0/TvXvPP/AMdpf+pj/wDFffuvde88/wDx2l/6mP8A8V9+6917zz/8dpf+pj/8V9+6917zz/8AHaX/AKmP/wAV9+6917zz/wDHaX/qY/8AxX37r3XvPP8A8dpf+pj/APFffuvde88//HaX/qY//Fffuvde88//AB2l/wCpj/8AFffuvde88/8Ax2l/6mP/AMV9+6917zz/APHaX/qY/wDxX37r3XvPP/x2l/6mP/xX37r3XvPP/wAdpf8AqY//ABX37r3XvPP/AMdpf+pj/wDFffuvde88/wDx2l/6mP8A8V9+6917zz/8dpf+pj/8V9+6917zz/8AHaX/AKmP/wAV9+6917zz/wDHaX/qY/8AxX37r3WJqio1H9+b8f7tf+n/AAb37r3XH7io/wCO83/U1/8Ao737r3WOSoqOP35vz/u1/wDD/avfuvdY/uKj/jvN/wBTX/6O9+69177io/47zf8AU1/+jvfuvdeNRUHgTzXPH+df8/8AIXv3XusX+U/8dpf+p0n/AEd7917rKKioHBnmuOP86/4/5C9+691jLVLEsJpef+b0n/R3v3Xuuv8AKf8AjtL/ANTpP+jvfuvde/yn/jtL/wBTpP8Ao737r3Xv8p/47S/9TpP+jvfuvddhqlSGM0vH/N6T/o737r3WQ1FQeBPNc8f51/z/AMhe/de6xf5T/wAdpf8AqdJ/0d7917r3+U/8dpf+p0n/AEd7917r3+U/8dpf+p0n/R3v3Xuvf5T/AMdpf+p0n/R3v3Xuvf5T/wAdpf8AqdJ/0d7917rLE9QjajNL9CP89IfyP9q9+691I+4qP+O83/U1/wDo737r3XvuKj/jvN/1Nf8A6O9+69177io/47zf9TX/AOjvfuvde+4qP+O83/U1/wDo737r3XvuKj/jvN/1Nf8A6O9+69177io/47zf9TX/AOjvfuvde+4qP+O83/U1/wDo737r3XvuKj/jvN/1Nf8A6O9+69177io/47zf9TX/AOjvfuvde+4qP+O83/U1/wDo737r3XvuKj/jvN/1Nf8A6O9+69177io/47zf9TX/AOjvfuvde+4qP+O83/U1/wDo737r3XvuKj/jvN/1Nf8A6O9+69177io/47zf9TX/AOjvfuvde+4qP+O83/U1/wDo737r3XjNUP6fPNz/AM3X/wCjvfuvdcCtRY/u1H0P+7X/AKf8G9+691F/yn/jtL/1Ok/6O9+691y/yn/jtL/1Ok/6O966ZPE9R3nqFYr55uP+br/0/wCDe/da6jS1FRqH7830/wCOr/1P+1e3o/hP29bHWL7io/47zf8AU1/+jvbnW+vfcVH/AB3m/wCpr/8AR3v3XuvfcVH/AB3m/wCpr/8AR3v3XuujUVFj+/N9D/u1/wCn/BvfuvdYPuKj/jvN/wBTX/6O9+69177io/47zf8AU1/+jvfuvdQpKio1t+/N9f8Ajq//AEd7917rh9xUf8d5v+pr/wDR3v3Xuv/Qsp1MOAzAf659qemuuQkkH0dv9uffuvdZ4XdtV2Y2tbn/AF/fuvdSUJJ5J+n/ABT37r3WT37r3Xvfuvde9+6913c/1P8At/fuvdeuf6n/AG59+691lQ3HP9f+Ke/de65e/de697917rsEgggkEfQj37r3WVZZNS3drXF+f8ffjwPXunD7gf1P/JI9punesmonm555+vv3Xusq/pH+x/3v37r3XL37r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691wckWsbfX/iPfuvdY7n+p/wBuffuvdeuf6n/bn37r3XYJuOT9R+ffuvdZvfuvde9+691hf9R/2H+9D37r3XH37r3XrA/UA+/de65Iqk8qPp/Qf4e/de6yaE/1K/8AJI/4p7917r2hf9Sv+2H/ABT37r3XL37r3XHQv+pX/bD/AIp7917rla3A4Hv3Xuve/de697917r3v3XuvWvweR7917rgVWx9K/Q/ge/de6x3P9T/tz7917r1z/U/7c+/de69c/wBT/tz7917r1z/U/wC3Pv3XusiEm9zf6f8AE+/de652v9ffuvddWH9B/th7917r1h/Qf7Ye/de69Yf0H+2Hv3XuvWH9B/th7917r1h/Qf7Ye/de69Yf0H+2Hv3XuuDgC1hb6/8AEe/de6x+/de697917r3v3Xuve/de697917r3v3Xusbkg8E/T/ivv3XuuFz/U/wC3Pv3XuuaEk8k/T/inv3Xusl7cjg+/de65a2/1Tf7c/wDFffuvddXP9T/tz7917rlc/wBT/tz710yeJ6xmNGJLKCT9SRyffutdYJYo9Q9C/T+n+J9vR/Cft62OsDQK1tKfS97Af7D251vrBLTkKLKRz/rfg/0t7917rAYWUEn8f7UT/wAT7917rH7917rqw/oP9sPfuvdYT9T/AK59+691Bk/W3+v7917rh7917r//0bKbe1Nei3x5PXr1vfq9e8eT165KxS+n8/W/+H/I/funoXZ9Wry6zRSuWIJH6T+P8R790/1KViSAT/vX9PfuvdZPfuvde9+691737r3XvfuvdZU+n+x/4ge/de65+/de697917rmgBYA/Qn37r3Unwp/j/t/fuvde8Sf0P8Atz7roX06tqPWYMQAB9ALD/Ye/aF9Otaj1OiePQuq97G/1/qfetC9XBNOud1PK/T/AIn37QvXuuj7owApTrfXXunXuve/de697917r3v3Xuve/de697917r3v3XuuiAfr7917rg6gDgfn37r3WP37r3Xvfuvdctbf1/3gf8U9+6917W39f94H/FPfuvddE35Pv3Xuuvfuvde9+6912CR9Pfuvdc1YkgE/71/T37r3WT37r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691x0L/AE/3k/8AFffuvdYj9T/rn37r3XXv3Xuve/de67BI+nv3Xuu9bf1/3gf8U9+6917W39f94H/FPfuvde1t/X/eB/xT37r3Xtbf1/3gf8U9+691nFiAf8B/vvr7oY5fKVafZ1rPWNmIJAP+8f4f6/v3hzf79X9nXs9cdZ/1/wDYD37WI+2Qgt8sdb64lifqD7940Xp/Pr359df7A+3I2SRtKjNOtMQoqT13/t/b3hfI9U8Rf4h17/b+/eF8j17xFP4h17j37wv6J6vnr3Hv3hf0T17PWMsQTb2ywoxHVCxBI64nn6+69a1t69dqoN7/AOHv1eva29esgQD6e/V69rbrlYe/da1N69dH6H/WPv3W9TevWLUffuvaz17W39f94Hv3Veva2/r/ALwP+Ke/de66PPJ592DFRQde68Dpva3P9Rf/AHv3vxG9evV67Lg/rtb/AAsvP+uB7sjMxoeHWweschgKMD+R/qv8f9b271vqGY4LGwN7f6r/AI37917rBoX+n+8n/ivv3XusBRbnj8n8n+v+v7917ptmFpXA/r/xA9+691i9+691/9Kyr2o6J+ve/de66PvY6U2/4/y/y9ZIP1n/AIKf97Hv3SrqWDY39+691zDkkDj6/wC+/Pv3Xusnv3Xuve/de697917rKn0/2P8AxA9+6912zFbW/N/fuvddKxJsbfT37r3WaP8AWv8Ar+/de6m+/de697917r3v3Xuu7X/LD/WPvXVxw6zRyGNdIF+b3J59+631njkV76/Ta1ufre9/969tyeXXh1kOj+y1z/xH+29t9b669+691737r3Xvfuvde9+691737r3Xvfuvde9+6910Rfg+/de646B/j/vH/FPfuvddFAATz9P99+PfuvdY/fuvde9+691737r3Xvfuvde9+691yUXNj/T37r3WQIAb8+/de65e/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de6wH6n/AFz/AL37917rr37r3Xvfuvdc1Rnvb8Wv/sf+Re/de67MUg5C6v62N7D+v+w9+691xICjkMDb+1ZRf/XP09+691w0zsf20jI4JvKt7f7e1/fuvdd2dR60C/8ATxOP+K+/de678yL+t41A4+vI4/2x90+juTkOaH59b6wvNdiUZSvFj45DfgfkcH3v6O5/jP7R1rrsSroJZrEH66HCW/xuOD7sttpFJct+Rx149YjOL3WSB1uNQEgRkvf66jYnj3vwIvQda6xPkqONfVNErXF9dTCigc3IZmAvxx78fDth4g48OqOpdaDrBJuHAwIzVORpodI5Zqyl0L+Lsdd7X90+uT+L/D014B6aKjfO06dXds9jAiIzuxrILKqAlmIDXIAHv31yfxf4etiAgg9JWXunreO2neGEa/0vK3P+tz+R799cn8Z6UU+fWfA9v7A3BWtQY/dWEram+lI6Sc+tr28amU8yX4t/X3761P4z1r8+hDWpW6SzwzQQPc2YAyIP7OoAafV9f9Y+/axJ3g4PTTfEeuYkRrlb6bnQSDdl/r/sT731rrmJAv0I5/wPv3Xuu/MP8P8AbH37r3XTT6QTwbf64/3n37r3WA1nB9K/Q/2v+Ne/de6wfdP/AKlf95/4r7917r33T/6lf95/4r7917r33T/6lf8Aef8Aivv3XuvfdP8A6lf95/4r7917r33T/wCpX/ef+K+/de6xy1TlR6QOR9Cf6H25H8R+zrw6itO7Aj+v+J9vdW6xa2HN/pz9B+P9h7917rH98/8AxzX/AG59+691wNW5JOlef9f/AIr7917qO7a2LEWJ9+691w9+691//9Oym/tTTov+nb+Idev79Tr307fxDron37p2KMx6qnj1lg/Wf+Cn/ex79091K9+6912PqP8AXH+9+/de6z+/de697917r3v3XusqfT/Y/wDED37r3XbKWtb8X9+6910qkG5t9PfuvdZo/wBa/wCv7917qb7917r3v3Xuve/de65X9+6sDQdev79Tr2odcSW/sm39fdGUtTPW9Q65xuyNdiWFiLf7b3Xwz69e1DqSkodgtrX/ACbW9+8M+vXtQPUjR/tS/wC39+0H163Xrjb37QfXr1euvbfW+ve/de697beTSaaSerBa9e9+EleCnr2k9cSwHu5NBWnXtB668i/763/FfddR/gPXtB66Lggj+o/w97DEn4T17Sesft7wz69N6h1737wz69e1Dr3uwhc5HDr2r5Hrom34J/1vfvAk9OvV+R67UO/6U+lr3IW1/wDX+v090dGSmocevaj/AAnqTHCwN3KqLH6HWb/gWXnn3Tr2r+ievOCvKqzD/VW0rb6XJb6c+9gVNOvaj/CeuIP9TGP+niX/ANtf3bSP4h17V8uscs8MX1cn/WU+/aR/F1up9OubtoUNdCCAR+4oPIvyD9PftI/iHTHjkEjwm68C5QSeMeNhcP5EKkXt9f8AYe/af6Q699R/wpuvIwbn+zexdbOoP9Lj8+2ndEOlnFenEkLCugjrm5VQCpaT669EbHx/01f6/uvjRf78H7eraj/CesBqIr6btqtfSyFOB9eWsL/4e/eNF/vxf29e1H+E9YWroAdGpNf4UyRpc/kXZrC3+PvXjRf78X9v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r3R7txbPxu5xhd4UtJDtfftPTNWUe54sLFlq3FzV6RPUUtajoylleMCO4NrH37r3SI/0O5Xc2RiyfYO4d37sqjKFQZPItjqGpf8A3XUxYemZIo4UW45FgG9+690MWD2HRbdZ46Okoccqovjix9JEvmHA/wAonVQ97fU3v7qxopPXuldDiKBrSVKBnUh145DDlTf63B9seL8z1unTj46b/D/bf8a968T5n+fXqdcuPx9Px/rfj/ePduPXuve/de697917rHJ+P9j/AMR7917rpPr/ALD/AIke/de6y+/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3XusL/qP+w/3oe/de64+3o/hP29Ubj117v1Xrpvp/sfdJPh60esftjrXXvfuvde9+691737r3Xvfuvde9+691//17Ok+1pQGlqlRl/UpNiDf6f0/Hsq8dV7SwBHRktsWUNpJ6hZHcmKx8X3U2agiUej7dqczMQp/UGAI5v9Pe/qV/jHW/pT/Aem6h3ph8i6xUOmpMp0zFYGh5vZfqBrvz/re3oZBJqo1adXWLw69pFenuqylRSowx2NFRVMpKxuOAPy/wBPqDb/AG/t7q3Scx028Kyr82XggpaFJCWiBHkMZvbQPz6re/de6XNN+g/8hf8AEe9HpmTz+zply31X/kH/AIn3seXRbJwPQR7ouI2/12/3v2HrmLLmmanozhoWj/1eXRd9x/5yq/4MD/tgvsOXcRqcdCay8/8AV6dBJWf57/kFf+J9oUXSCKefRovDqOn6h/sf96Pu/W+nen/QP9Yf8T7UW39p+XTFz/Zj7epUf61/1/a/pB1N96IqCOtHgeuAuOfp/r+0j2pqKjh0lNGBA6G3rWOUSiajEAgFjKa1giEj9RBa3A5/2Hs/2xKBTw6r4DMRUV6MfHjcjURR5Gi3Ht7G0U41yJTxpNLIq+h18gvqPpP+x9itaaVpwp0Hr1Sl1Mp4g/5OpkOU2li0MsQ/idWDaWoEJiDygWZVQgalHBv+b+7dJep9BkarLtO1PHT4uFdB+7qrR6Va9jGTYGw+v+t7917qLka7ZVAFjze45srVPKseikiNTGGYH1aEuRYC1/x7917pjydVtXGwNWQY2Gop1TyGWWgc1FuANCst9RLe/dbX4h0x7c3pj83WyUOExbYmUME+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"

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = "data:image/jpeg;base64,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AAAAAAAAAAAAAABCbGQgVW50RiNSbHQAAAAAAAAAAAAAAABSc2x0VW50RiNQeGxAUgAAAAAAAAAAAAp2ZWN0b3JEYXRhYm9vbAEAAAAAUGdQc2VudW0AAAAAUGdQcwAAAABQZ1BDAAAAAExlZnRVbnRGI1JsdAAAAAAAAAAAAAAAAFRvcCBVbnRGI1JsdAAAAAAAAAAAAAAAAFNjbCBVbnRGI1ByY0BZAAAAAAAAAAAAEGNyb3BXaGVuUHJpbnRpbmdib29sAAAAAA5jcm9wUmVjdEJvdHRvbWxvbmcAAAAAAAAADGNyb3BSZWN0TGVmdGxvbmcAAAAAAAAADWNyb3BSZWN0UmlnaHRsb25nAAAAAAAAAAtjcm9wUmVjdFRvcGxvbmcAAAAAADhCSU0D7QAAAAAAEABIAAAAAQACAEgAAAABAAI4QklNBCYAAAAAAA4AAAAAAAAAAAAAP4AAADhCSU0EDQAAAAAABAAAAFo4QklNBBkAAAAAAAQAAAAeOEJJTQPzAAAAAAAJAAAAAAAAAAABADhCSU0nEAAAAAAACgABAAAAAAAAAAI4QklNA/UAAAAAAEgAL2ZmAAEAbGZmAAYAAAAAAAEAL2ZmAAEAoZmaAAYAAAAAAAEAMgAAAAEAWgAAAAYAAAAAAAEANQAAAAEALQAAAAYAAAAAAAE4QklNA/gAAAAAAHAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAOEJJTQQAAAAAAAACAAE4QklNBAIAAAAAAAQAAAAAOEJJTQQwAAAAAAACAQE4QklNBC0AAAAAAAYAAQAAAAI4QklNBAgAAAAAABAAAAABAAACQAAAAkAAAAAAOEJJTQQeAAAAAAAEAAAAADhCSU0EGgAAAAADPwAAAAYAAAAAAAAAAAAAAckAAAInAAAABWcqaAeYmAAtADYAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAicAAAHJAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAEAAAAAAABudWxsAAAAAgAAAAZib3VuZHNPYmpjAAAA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MQA3AAAAAQA4QklNBAYAAAAAAAcACAAAAAEBAP/hFZhodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNy0xMC0wNVQxMDozNjozMCswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxNy0xMC0wNVQxMDozNjozMCswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTctMTAtMDVUMTA6MzY6MzArMDg6MDAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTcwNmU2ZTgtZjM5NS0xMTRhLWFmZDktYTc5ODE0YmRlNzdiIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6Zjk5ZjhjYjktYTk3NS0xMWU3LWIxNDMtZGUwZDcyZjVkOGE3IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6M2RiNTU4MmUtMjk1YS1hOTRlLTgwZjItNTdkZTU4MjM2OTNlIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIGRjOmZvcm1hdD0iaW1hZ2UvanBlZyI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6M2RiNTU4MmUtMjk1YS1hOTRlLTgwZjItNTdkZTU4MjM2OTNlIiBzdEV2dDp3aGVuPSIyMDE3LTEwLTA1VDEwOjM2OjMwKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjU3MDZlNmU4LWYzOTUtMTE0YS1hZmQ5LWE3OTgxNGJkZTc3YiIgc3RFdnQ6d2hlbj0iMjAxNy0xMC0wNVQxMDozNjozMCswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT4wNUM5QTkzQ0Y1MzMyM0UyMUE0QjZCN0RBRjk1RkE0NzwvcmRmOmxpPiA8cmRmOmxpPjA4NUQ1MERDMjU0QUE1NkMyQjNEMkRFMDVCNTA5NzgwPC9yZGY6bGk+IDxyZGY6bGk+MDkyNTE5N0VENUJCQzM3QjI4NzI3NTQ3NzVFQzVDMEE8L3JkZjpsaT4gPHJkZjpsaT4wQUE3N0JEQTE2NDA1RjhFNkI1NTc2RkM0QUMwNTVBMzwvcmRmOmxpPiA8cmRmOmxpPjI2Nzg2N0YxQzcyM0YyMTRFRTNFRjI0ODFCRUJBQjU2PC9yZGY6bGk+IDxyZGY6bGk+MjhEMEIwQjlBNDZERDhEMzVBRjYyRjYzRDhENEFDREU8L3JkZjpsaT4gPHJkZjpsaT4yRjgxQ0YyOUUzQkVEMTg0QTVGQzFBMTU4Mjc3ODNFQzwvcmRmOmxpPiA8cmRmOmxpPjQyOTFGN0I5QjM4NDMwRjQyODE2QUQ4RDlEMzgyNUI3PC9yZGY6bGk+IDxyZGY6bGk+NDMyQzg4MDYzQ0I5N0M5RTk1NzcxQjU3M0U3NzhCMTM8L3JkZjpsaT4gPHJkZjpsaT40RDFFQzVDRDAwNTUyQTZBOUIxNzZBOTQ0OUI5NEMzMTwvcmRmOmxpPiA8cmRmOmxpPjU3QzA2ODcyMzk5NkRBNzRBMDJGODU1MzlEQ0EyNzUxPC9yZGY6bGk+IDxyZGY6bGk+NUI5OTg3RENEMDY5OEY0NjFEODg5MkZFNzE3RjQwNTk8L3JkZjpsaT4gPHJkZjpsaT41RDhBQTgwRjg2NUMwNzE0OUNDMjRBMDZGMTNFNEJFRTwvcmRmOmxpPiA8cmRmOmxpPjY4RUI3QjE4N0YwMjFCQjdBRjIzMTkzNTE1REE4RUUzPC9yZGY6bGk+IDxyZGY6bGk+NkE0MjVEOEM5QzE2Nzc5MDQ4NEE2OEJDRDIyRDU0MDE8L3JkZjpsaT4gPHJkZjpsaT43NEMzQTc2ODMyNjdEQ0M1NEI0NkVCQjgwMThDRUExMTwvcmRmOmxpPiA8cmRmOmxpPjdEMkIyNjhEQ0I3QTJCRDBGQTQ2RjlDMEQ1NEJEM0Q5PC9yZGY6bGk+IDxyZGY6bGk+QTE2N0E5REM1NjVDQjczOEFGNDdGMDkwMjJENkVDODU8L3JkZjpsaT4gPHJkZjpsaT5BNTdFNEZCMzA4OTE2RTg3RTdGMDIxQTY4OTNFQjM5ODwvcmRmOmxpPiA8cmRmOmxpPkIwMDVFQTE0NTY2MkI4NDUxMjY1MjA5N0YyRUNGNEI1PC9yZGY6bGk+IDxyZGY6bGk+QjA1NzFEMjdFQkRBODZCMUZGQTg4RUFGQzI3QTdBNjE8L3JkZjpsaT4gPHJkZjpsaT5CMkU0QzY5NkZDMDc5RUEyRDg3NjlGNUMyREQzMzlERDwvcmRmOmxpPiA8cmRmOmxpPkIzNTZBMTQ3RDRERDFENkM1RDIxNEUxNERENkMxRjM5PC9yZGY6bGk+IDxyZGY6bGk+QjZENzREODEyNDlENTYyN0QwNjQwQ0ZBNURFN0NGRTI8L3JkZjpsaT4gPHJkZjpsaT5COUIxQjQ3NDMxNzNFMDUyNkMyQTYzODdBM0RCQTVBNzwvcmRmOmxpPiA8cmRmOmxpPkJEMDI2QUExMDQ3NjA4NDc4RDIxNTZCRjEyRjY3QUM5PC9yZGY6bGk+IDxyZGY6bGk+RDVBNzc0Mzk5OThDNjY4MUYyQTUyMUU0ODJFNEM5RTI8L3JkZjpsaT4gPHJkZjpsaT5ENjAzQzNFMzdCRTYyMEJFOEMwRTg2NUExRUU3M0MwMDwvcmRmOmxpPiA8cmRmOmxpPkQ4MDk4QTUzN0QzMjZERUZBMDVEMzE1MDNDREIxOEU2PC9yZGY6bGk+IDxyZGY6bGk+RDkyRDMzN0U1Rjg0Q0Y5MjAzMDVGN0U4MEFDNTAzMzg8L3JkZjpsaT4gPHJkZjpsaT5FMjcyNTI4NDMxNzRENjU1NTY3RUZGMUJFNjg0ODQxNjwvcmRmOmxpPiA8cmRmOmxpPkUzMUY5M0EwNkZBNjE4NTZCRjBERENDRDVCMTQ2RjgzPC9yZGY6bGk+IDxyZGY6bGk+RTk0RDQ3MjBDRjYyNDMxQTFFQTZFNTNDNDYwMjNGOEU8L3JkZjpsaT4gPHJkZjpsaT5GNDlGNzU3RDE1N0I3RTIzNjg2MTY4MDIwOEExMThBRjwvcmRmOmxpPiA8cmRmOmxpPkZBNTM1N0IyNTc3N0RGMzA3QzFENzUxREU4RUMzQThBPC9yZGY6bGk+IDxyZGY6bGk+RkQ1REVDNUE5NThGQjQ5NTdFNzg2N0ZBNUEyMjA5Q0Y8L3JkZjpsaT4gPHJkZjpsaT54bXAuZGlkOjYyRjI1NTBCN0E5Q0U3MTE4MDM4ODRCRUVFQjI0MkI2PC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg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"

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(20);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./loginReg.scss", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./loginReg.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "#login-wrap {\n  width: 100%;\n  background: #000;\n  overflow: hidden; }\n\n#con {\n  width: 1200px;\n  margin: 68px auto;\n  overflow: hidden;\n  background: url(" + __webpack_require__(21) + ") no-repeat left top; }\n  #con form {\n    float: right;\n    position: relative;\n    width: 462px;\n    height: 442px;\n    border: 1px solid #aeaeae;\n    margin-top: 12px; }\n    #con form .login-con {\n      width: 374px;\n      margin: 50px auto 0; }\n      #con form .login-con h3 {\n        overflow: hidden;\n        width: 100%; }\n        #con form .login-con h3 a {\n          display: inherit;\n          float: left;\n          height: 52px;\n          line-height: 52px;\n          width: 50%;\n          text-align: center;\n          color: #717171;\n          border-bottom: 1px solid #717171; }\n        #con form .login-con h3 .login-active {\n          color: #ff9263;\n          border-bottom: 1px solid #ff9263; }\n      #con form .login-con #login {\n        width: 100%;\n        overflow: hidden; }\n        #con form .login-con #login input {\n          display: block;\n          height: 42px;\n          width: 340px;\n          border: 1px solid #a9a9a9;\n          margin: 30px auto 15px;\n          text-indent: 25px; }\n        #con form .login-con #login #login-login {\n          color: #903401;\n          background: #ff8e4f;\n          font-size: 20px;\n          text-indent: 0;\n          margin: 20px auto 8px; }\n        #con form .login-con #login .login-pwd {\n          width: 340px;\n          margin: 0 auto;\n          overflow: hidden; }\n          #con form .login-con #login .login-pwd a {\n            float: right;\n            color: #989898;\n            font-size: 18px; }\n        #con form .login-con #login .login-bottom {\n          width: 100%;\n          overflow: hidden; }\n          #con form .login-con #login .login-bottom a {\n            float: left;\n            display: block;\n            width: 100px;\n            height: 20px;\n            text-indent: 25px;\n            font-size: 16px;\n            line-height: 20px;\n            margin-left: 25px;\n            background: url(" + __webpack_require__(22) + ") no-repeat left 2px; }\n          #con form .login-con #login .login-bottom #qqLogin {\n            background-position-y: -30px; }\n        #con form .login-con #login #username-judge {\n          position: absolute;\n          top: 182px;\n          left: 60px;\n          color: red; }\n        #con form .login-con #login #password-judge {\n          position: absolute;\n          top: 256px;\n          left: 60px;\n          color: red; }\n      #con form .login-con #register {\n        display: none;\n        width: 100%;\n        overflow: hidden; }\n        #con form .login-con #register .reg {\n          width: 100%;\n          overflow: hidden;\n          margin-top: 18px; }\n          #con form .login-con #register .reg label {\n            float: left;\n            display: block;\n            width: 115px;\n            color: 848484;\n            font-size: 18px;\n            height: 28px;\n            line-height: 28px;\n            text-indent: 22px; }\n          #con form .login-con #register .reg input {\n            float: left;\n            width: 232px;\n            height: 28px;\n            border: 1px solid #979797; }\n        #con form .login-con #register .code input {\n          float: left;\n          width: 166px;\n          margin-left: 20px; }\n        #con form .login-con #register .code a {\n          float: left;\n          display: block;\n          height: 28px;\n          line-height: 28px;\n          background: #999999;\n          margin-left: 22px;\n          font-size: 12px;\n          padding: 0 5px;\n          text-align: center;\n          color: black; }\n        #con form .login-con #register .agreement {\n          width: 100%;\n          overflow: hidden;\n          margin-top: 10px; }\n          #con form .login-con #register .agreement input {\n            float: left;\n            width: 20px;\n            height: 20px;\n            border: 1px solid #000000;\n            margin-left: 20px;\n            color: #f5b788; }\n          #con form .login-con #register .agreement p {\n            float: left;\n            width: 300px;\n            margin-left: 12px;\n            height: 20px;\n            line-height: 20px;\n            font-size: 14px;\n            color: #777777; }\n        #con form .login-con #register #register-register {\n          width: 348px;\n          height: 40px;\n          background: #ff8e4f;\n          font-size: 18px;\n          color: #662600;\n          margin: 5px 20px 0;\n          border: 0; }\n      #con form .login-con #usnJudge {\n        position: absolute;\n        top: 155px;\n        left: 160px;\n        color: red;\n        font-size: 12px; }\n      #con form .login-con #pwd1Judge {\n        position: absolute;\n        top: 206px;\n        left: 160px;\n        color: red;\n        font-size: 12px; }\n      #con form .login-con #pwd2Judge {\n        position: absolute;\n        top: 255px;\n        left: 160px;\n        color: red;\n        font-size: 12px; }\n      #con form .login-con #phoneJudge {\n        position: absolute;\n        top: 305px;\n        left: 160px;\n        color: red;\n        font-size: 12px; }\n", ""]);

// exports


/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = "data:image/jpeg;base64,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"

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,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"

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(24);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./termsOfService.scss", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./termsOfService.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "#termsCon {\n  width: 1200px;\n  margin: 5px auto 100px; }\n  #termsCon h3 {\n    font-weight: 100;\n    width: 100%;\n    height: 44px;\n    font-size: 20px;\n    line-height: 44px;\n    color: #737373;\n    border-bottom: 2px solid #999999;\n    margin-bottom: 15px; }\n  #termsCon p {\n    line-height: 22px;\n    color: #737373;\n    font-size: 16px;\n    margin-bottom: 25px; }\n", ""]);

// exports


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(26);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./riji.scss", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/sass-loader/lib/loader.js!./riji.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(undefined);
// imports


// module
exports.push([module.i, "section {\n  float: left;\n  width: 964px;\n  height: 200px; }\n  section .tits {\n    height: 32px;\n    margin-top: 34px;\n    border-bottom: 2px solid #c4c4c4;\n    color: #737373; }\n    section .tits span {\n      float: left;\n      padding: 0 30px;\n      height: 32px;\n      line-height: 32px;\n      font-size: 18px; }\n  section .con {\n    padding: 30px 0;\n    overflow: hidden; }\n    section .con dl {\n      overflow: hidden;\n      border-bottom: 1px dashed #656565;\n      padding-top: 10px; }\n      section .con dl dt {\n        float: left;\n        width: 92px;\n        height: 92px;\n        margin-right: 15px; }\n        section .con dl dt img {\n          width: 100%;\n          height: 100%;\n          border-radius: 50%; }\n      section .con dl dd {\n        float: left;\n        width: 809px; }\n        section .con dl dd p {\n          width: 100%;\n          overflow: hidden;\n          line-height: 20px; }\n        section .con dl dd p:nth-of-type(1) {\n          line-height: 30px; }\n          section .con dl dd p:nth-of-type(1) span:first-child {\n            float: left;\n            font-size: 18px; }\n          section .con dl dd p:nth-of-type(1) span:last-child {\n            float: right; }\n            section .con dl dd p:nth-of-type(1) span:last-child em {\n              float: left;\n              padding: 0 10px 0 40px;\n              line-height: 30px;\n              background: url(" + __webpack_require__(27) + ") no-repeat 9px top;\n              font-style: normal; }\n            section .con dl dd p:nth-of-type(1) span:last-child em:nth-of-type(2) {\n              background-position-y: -25px; }\n            section .con dl dd p:nth-of-type(1) span:last-child em:nth-of-type(3) {\n              background-position-y: -50px; }\n        section .con dl dd p:nth-of-type(2) em {\n          font-style: normal;\n          padding-right: 10px; }\n        section .con dl dd p:nth-of-type(4) {\n          color: #a3a3a3;\n          margin: 10px 0; }\n    section .con dl:last-child {\n      border-bottom: 0; }\n\naside {\n  float: right;\n  width: 234px;\n  height: 300px; }\n  aside h2 {\n    height: 40px;\n    line-height: 40px;\n    color: #fff;\n    padding-left: 80px;\n    margin: 50px 0 13px 0;\n    background: #f27021 url(" + __webpack_require__(28) + ") no-repeat left top; }\n  aside ul {\n    width: 200px;\n    padding: 0px 13px  10px;\n    border: 1px solid #d1d1d1;\n    overflow: hidden;\n    margin: 0 auto; }\n    aside ul li {\n      height: 79px;\n      border-bottom: 1px dashed #bdbdbd; }\n      aside ul li img {\n        float: left;\n        width: 50px;\n        height: 50px;\n        margin: 14px;\n        border-radius: 50%; }\n      aside ul li div {\n        float: left;\n        width: 111px;\n        margin-top: 8px;\n        color: #969696; }\n        aside ul li div h3 {\n          line-height: 32px; }\n    aside ul li:first-child {\n      line-height: 79px;\n      text-align: center;\n      font-size: 29px;\n      color: #747474; }\n    aside ul li:last-child {\n      border-bottom: 0; }\n", ""]);

// exports


/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = "data:image/jpeg;base64,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TVlLADhCSU0EOwAAAAACLQAAABAAAAABAAAAAAAScHJpbnRPdXRwdXRPcHRpb25zAAAAFwAAAABDcHRuYm9vbAAAAAAAQ2xicmJvb2wAAAAAAFJnc01ib29sAAAAAABDcm5DYm9vbAAAAAAAQ250Q2Jvb2wAAAAAAExibHNib29sAAAAAABOZ3R2Ym9vbAAAAAAARW1sRGJvb2wAAAAAAEludHJib29sAAAAAABCY2tnT2JqYwAAAAEAAAAAAABSR0JDAAAAAwAAAABSZCAgZG91YkBv4AAAAAAAAAAAAEdybiBkb3ViQG/gAAAAAAAAAAAAQmwgIGRvdWJAb+AAAAAAAAAAAABCcmRUVW50RiNSbHQAAAAAAAAAAAAAAABCbGQgVW50RiNSbHQAAAAAAAAAAAAAAABSc2x0VW50RiNQeGxAUgAAAAAAAAAAAAp2ZWN0b3JEYXRhYm9vbAEAAAAAUGdQc2VudW0AAAAAUGdQcwAAAABQZ1BDAAAAAExlZnRVbnRGI1JsdAAAAAAAAAAAAAAAAFRvcCBVbnRGI1JsdAAAAAAAAAAAAAAAAFNjbCBVbnRGI1ByY0BZAAAAAAAAAAAAEGNyb3BXaGVuUHJpbnRpbmdib29sAAAAAA5jcm9wUmVjdEJvdHRvbWxvbmcAAAAAAAAADGNyb3BSZWN0TGVmdGxvbmcAAAAAAAAADWNyb3BSZWN0UmlnaHRsb25nAAAAAAAAAAtjcm9wUmVjdFRvcGxvbmcAAAAAADhCSU0D7QAAAAAAEABIAAAAAQACAEgAAAABAAI4QklNBCYAAAAAAA4AAAAAAAAAAAAAP4AAADhCSU0EDQAAAAAABAAAAFo4QklNBBkAAAAAAAQAAAAeOEJJTQPzAAAAAAAJAAAAAAAAAAABADhCSU0nEAAAAAAACgABAAAAAAAAAAI4QklNA/UAAAAAAEgAL2ZmAAEAbGZmAAYAAAAAAAEAL2ZmAAEAoZmaAAYAAAAAAAEAMgAAAAEAWgAAAAYAAAAAAAEANQAAAAEALQAAAAYAAAAAAAE4QklNA/gAAAAAAHAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAAAAP//////////////////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YWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNy0xMC0wNlQxNTo1ODozMyswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxNy0xMC0wNlQxNTo1ODozMyswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTctMTAtMDZUMTU6NTg6MzMrMDg6MDAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MjE2NzJkZjctY2MxNy04NjRiLTk3YjMtYjZkZGY5MzliYmE1IiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MWJjNTYyNGYtYWE2Yy0xMWU3LTkzMjEtZjgyODUwYjZjNjJmIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6OWE0YTMzMzEtYTgyYS00MjQyLWEwOGYtNDc3NjM5YjUwYjQ2IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIGRjOmZvcm1hdD0iaW1hZ2UvanBlZyI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6OWE0YTMzMzEtYTgyYS00MjQyLWEwOGYtNDc3NjM5YjUwYjQ2IiBzdEV2dDp3aGVuPSIyMDE3LTEwLTA2VDE1OjU4OjMzKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjIxNjcyZGY3LWNjMTctODY0Yi05N2IzLWI2ZGRmOTM5YmJhNSIgc3RFdnQ6d2hlbj0iMjAxNy0xMC0wNlQxNTo1ODozMyswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT4wNUM5QTkzQ0Y1MzMyM0UyMUE0QjZCN0RBRjk1RkE0NzwvcmRmOmxpPiA8cmRmOmxpPjA5MjUxOTdFRDVCQkMzN0IyODcyNzU0Nzc1RUM1QzBBPC9yZGY6bGk+IDxyZGY6bGk+MDk5RTI1NDlBRUNBQ0JBNjcyN0M1RkFCOTk3NTQxNDM8L3JkZjpsaT4gPHJkZjpsaT4wQUE3N0JEQTE2NDA1RjhFNkI1NTc2RkM0QUMwNTVBMzwvcmRmOmxpPiA8cmRmOmxpPjI2Nzg2N0YxQzcyM0YyMTRFRTNFRjI0ODFCRUJBQjU2PC9yZGY6bGk+IDxyZGY6bGk+MjhEMEIwQjlBNDZERDhEMzVBRjYyRjYzRDhENEFDREU8L3JkZjpsaT4gPHJkZjpsaT4yOUMzQjg0OTJENkI3QUEyMTlDOUNGMDkzQzI2N0U4NzwvcmRmOmxpPiA8cmRmOmxpPjJGODFDRjI5RTNCRUQxODRBNUZDMUExNTgyNzc4M0VDPC9yZGY6bGk+IDxyZGY6bGk+NDI5MUY3QjlCMzg0MzBGNDI4MTZBRDhEOUQzODI1Qjc8L3JkZjpsaT4gPHJkZjpsaT40MzJDODgwNjNDQjk3QzlFOTU3NzFCNTczRTc3OEIxMzwvcmRmOmxpPiA8cmRmOmxpPjREMUVDNUNEMDA1NTJBNkE5QjE3NkE5NDQ5Qjk0QzMxPC9yZGY6bGk+IDxyZGY6bGk+NTdDMDY4NzIzOTk2REE3NEEwMkY4NTUzOURDQTI3NTE8L3JkZjpsaT4gPHJkZjpsaT41Qjk5ODdEQ0QwNjk4RjQ2MUQ4ODkyRkU3MTdGNDA1OTwvcmRmOmxpPiA8cmRmOmxpPjVEOEFBODBGODY1QzA3MTQ5Q0MyNEEwNkYxM0U0QkVFPC9yZGY6bGk+IDxyZGY6bGk+NjhFQjdCMTg3RjAyMUJCN0FGMjMxOTM1MTVEQThFRTM8L3JkZjpsaT4gPHJkZjpsaT42QTQyNUQ4QzlDMTY3NzkwNDg0QTY4QkNEMjJENTQwMTwvcmRmOmxpPiA8cmRmOmxpPjc0QzNBNzY4MzI2N0RDQzU0QjQ2RUJCODAxOENFQTExPC9yZGY6bGk+IDxyZGY6bGk+N0QyQjI2OERDQjdBMkJEMEZBNDZGOUMwRDU0QkQzRDk8L3JkZjpsaT4gPHJkZjpsaT43RTY0QTBBMkEyQTUwMkRGNUIwNTRBMzIyNjQ0QzQzMjwvcmRmOmxpPiA8cmRmOmxpPkExNjdBOURDNTY1Q0I3MzhBRjQ3RjA5MDIyRDZFQzg1PC9yZGY6bGk+IDxyZGY6bGk+QTU3RTRGQjMwODkxNkU4N0U3RjAyMUE2ODkzRUIzOTg8L3JkZjpsaT4gPHJkZjpsaT5BRUJCNzRFRkM1MDhBMEI4MDg5QzQxNTQwMTVDOTJCMDwvcmRmOmxpPiA8cmRmOmxpPkIwMDVFQTE0NTY2MkI4NDUxMjY1MjA5N0YyRUNGNEI1PC9yZGY6bGk+IDxyZGY6bGk+QjJFNEM2OTZGQzA3OUVBMkQ4NzY5RjVDMkREMzM5REQ8L3JkZjpsaT4gPHJkZjpsaT5CMzU2QTE0N0Q0REQxRDZDNUQyMTRFMTRERDZDMUYzOTwvcmRmOmxpPiA8cmRmOmxpPkI5QjFCNDc0MzE3M0UwNTI2QzJBNjM4N0EzREJBNUE3PC9yZGY6bGk+IDxyZGY6bGk+QkQwMjZBQTEwNDc2MDg0NzhEMjE1NkJGMTJGNjdBQzk8L3JkZjpsaT4gPHJkZjpsaT5DNEVGRjY4NzAzODkyRDZEREMzQkE2MzYwMzI5MkQ5RDwvcmRmOmxpPiA8cmRmOmxpPkQ1QTc3NDM5OTk4QzY2ODFGMkE1MjFFNDgyRTRDOUUyPC9yZGY6bGk+IDxyZGY6bGk+RDYwM0MzRTM3QkU2MjBCRThDMEU4NjVBMUVFNzNDMDA8L3JkZjpsaT4gPHJkZjpsaT5EODA5OEE1MzdEMzI2REVGQTA1RDMxNTAzQ0RCMThFNjwvcmRmOmxpPiA8cmRmOmxpPkQ4RDM4RkEzNjc1QTQ2NjAwN0I0RUQ2MDEzNDNCMjc5PC9yZGY6bGk+IDxyZGY6bGk+RDkyRDMzN0U1Rjg0Q0Y5MjAzMDVGN0U4MEFDNTAzMzg8L3JkZjpsaT4gPHJkZjpsaT5ERjA5RjRERTU4QUQyQUQwRThERUM2M0Y2NTZGQkNFMTwvcmRmOmxpPiA8cmRmOmxpPkUyNzI1Mjg0MzE3NEQ2NTU1NjdFRkYxQkU2ODQ4NDE2PC9yZGY6bGk+IDxyZGY6bGk+RTMxRjkzQTA2RkE2MTg1NkJGMEREQ0NENUIxNDZGODM8L3JkZjpsaT4gPHJkZjpsaT5FNThFOTI4QkE4MEE1RUM0NTIzRTczRjk5RDg4OERBNTwvcmRmOmxpPiA8cmRmOmxpPkU5NEQ0NzIwQ0Y2MjQzMUExRUE2RTUzQzQ2MDIzRjhFPC9yZGY6bGk+IDxyZGY6bGk+RUU3QTE5RjIwREQzOUUxM0Q5OTBCNzU2MzZFNjc1M0Y8L3JkZjpsaT4gPHJkZjpsaT5GNDlGNzU3RDE1N0I3RTIzNjg2MTY4MDIwOEExMThBRjwvcmRmOmxpPiA8cmRmOmxpPkY5QzU4MjA2REEzRjgwNkM5OUQwNDRDNDBCQTY2QkNDPC9yZGY6bGk+IDxyZGY6bGk+RkE1MzU3QjI1Nzc3REYzMDdDMUQ3NTFERThFQzNBOEE8L3JkZjpsaT4gPHJkZjpsaT5GRDVERUM1QTk1OEZCNDk1N0U3ODY3RkE1QTIyMDlDRjwvcmRmOmxpPiA8cmRmOmxpPnhtcC5kaWQ6NTZENDNDNEREMUE5RTcxMTk1RDFFQzg2MEI4NkRBOEE8L3JkZjpsaT4gPHJkZjpsaT54bXAuZGlkOjYyRjI1NTBCN0E5Q0U3MTE4MDM4ODRCRUVFQjI0MkI2PC9yZGY6bGk+IDxyZGY6bGk+eG1wLmRpZDo5NUVGRDAyQjRFQTBFNzExQjMzMkU3NjQ1OTFBQzUxQzwvcmRmOmxpPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8P3hwYWNrZXQgZW5kPSJ3Ij8+/+IMWElDQ19QUk9GSUxFAAEBAAAMSExpbm8CEAAAbW50clJHQiBYWVogB84AAgAJAAYAMQAAYWNzcE1TRlQAAAAASUVDIHNSR0IAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1IUCAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARY3BydAAAAVAAAAAzZGVzYwAAAYQAAABsd3RwdAAAAfAAAAAUYmtwdAAAAgQAAAAUclhZWgAAAhgAAAAUZ1hZWgAAAiwAAAAUYlhZWgAAAkAAAAAUZG1uZAAAAlQAAABwZG1kZAAAAsQAAACIdnVlZAAAA0wAAACGdmlldwAAA9QAAAAkbHVtaQAAA/gAAAAUbWVhcwAABAwAAAAkdGVjaAAABDAAAAAMclRSQwAABDwAAAgMZ1RSQwAABDwAAAgMYlRSQwAABDwAAAgMdGV4dAAAAABDb3B5cmlnaHQgKGMpIDE5OTggSGV3bGV0dC1QYWNrYXJkIENvbXBhbnkAAGRlc2MAAAAAAAAAEnNSR0IgSUVDNjE5NjYtMi4xAAAAAAAAAAAAAAASc1JHQiBJRUM2MTk2Ni0yLjEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAADzUQABAAAAARbMWFlaIAAAAAAAAAAAAAAAAAAAAABYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9kZXNj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xP7l3B3b1ZPn91U2HbcW1937k6+zG4trTPVbH3zW7Ump6eTe2xK50jNdtfNioHjkCqoqI5kUBVHvPb2g533HnvlKTcd3ih/edpez2ck0BLWt01uQDdWjkDXBLXtalNauowB1zf8Ae/2/2v2650j2zZJrgbTe2FvfRQXIC3lmlyGYWl4gJ0XEOnuWpOho2OWPRmfcp9Q/1737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/0d/j37r3RVvkH8Sdgd+VmK3Z/FNwdb9sbajKbX7W2HWPid049VSYU9HkXgeA5fGQTSl0QyQ1UPqWCohWSUPEnuP7O8u+4c1pvH1dztnN9qKQbhaN4c6YNFcgjxEBNQKq65EciBn1TX7We+fNHtjBe7H9Fa7vyReGtxtt6gltnyNTxgg+FIwFCdLxtgyRSFEKlA2R/Kvx+LrZqPsDvzdW79h5CqoK/P7B2ltWn6wxm7azEzSTY592VGL3LnFzKweeVfIYI61RM5iqImYt7hfYfuk21pPJBzH7h3l7y9I6PNaW9uLGO4aMkobgxzy+LSrDVpEo1MUlQmvU8cx/fUur23jn5W9sbKw5miR0gvbq5bcZLVJQBILZZLeHwq6VOnW0J0qHidQB1aXtjbG3tl7fxG1dqYeg2/tzA0UOOxGHxdOlLQ0FHALJFDEgAuWJZ2N3kdizEsSTlntW1bbse3We0bRZR222W8YSOOMBURRwAA/aTxJJJJJJ6wu3ned15h3S+3ve7+W63a5kMkssjFndjxJJ/YAKBQAoAAA6ffZh0W9e9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3X//S3+Pfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/9Pf49+691X52t899t7b3V2H051v1d3Pv/u3bFHnKDG4XC9dz1+Jjz1NB4cVlMnF/FaXPTbRkrKmmmNZT0ckdRRypJCzLIjHHPm77w217Zu/MnJXLHKe+bjz3aJKiRRWZeMSqKRyOPEWU25ZkbxEjIeNlZCQyk5R8k/dj3fd9l5V5+5t5z5f2v26vJIXkmlvgkphY1kjjPhNCLoIsieE8qskqsrgFGALf0t3P2h8Fdv7n2h8otj9ubq2lmKnb3YmD7J2xgot14bCbi7Cx8OR7C2xubcVXuCjxVFUUG9qiRUjjkeWprpKmo0tHUwO8Y8jc8c1+wG3brs3uxsO83mzztDeRXsEQuI4prxA95BPM0yxqUumIADFnlaWShWWMmW/cL2+5N+8pumzb97M8x7FZb7bpPYzWFxMbaWaCxcx2NxbwLA8jq9oqkllCxwrDFUPFIq2s9Z9hYPtbYm2uxNtU2bpMBuzH/xTExbhxNTg8s1C1RNBBUzY6rHlSnrFh81PKpaKopnjmiZ45EY5d8rcx2HN/L+18y7XFOm3XkfiRiaNopNNSAxRsgNTUjCquhV1JVgThNzhyruXJHM28cqbvNbvuljL4cpglWaLXpBKiRcFkrpdTRo5A0bhXVgF17P+g11737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf//U3+PfuvdVYfP+rqdn9xfEbfPX3Xea3b25Sb4zmSgOyIchFu/c2ytmx4Wqzmw6mqxUFU8mBzabiaKeSop6laKmmqCq+OaoSXEr7xU0uy86+ze/8uctT3nOSX8rj6UOLme1thE0tozRhiYpfGKszo4iRpSBpeRXzT+69BDv3IPvry3zTzXb2PIr7bDG31ZQ2tvd3ZmWG9VZCoE0PgBkVHjMsixAnUkTIDXc2+O6+zO8fiZtf5PfG+p2ZseDtuKCrxsWfbePWe8KzfkuMw2zafP1GIeXCjcezaqCUtSVNRKK2KonDU6U0jxzAjnffueuaeffZ7afdb2xex2Bd5AZBN9TY3LXZSK2ExjJi8a2YNWN3bxVeQGNYmZXkD2/5c9vOT/bj3x3n2b9203DmRtiJWQwfS7harZCSW6aBZQJfAu1K0ljRfBaOMiVplV47s1VUVURQqKAqqoCqqqLKqqLAAAcD3nWAFAVRQDrnaSWJZjVj13731rr3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de6//V3+Pfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/9bf49+690Tnub5M9hbG7pwfRfU/QVb3VvHJ9bns/IaOxcF19RYnbx3FkNtKz1edw+QopSlfQWdpJqf1TwogkZyFhTnf3T5k2Dnmw5A5P9vJN93qXbPrn/xyKzWOHxng+KWN1PemSzJl0C6iTSffb/2e5V5k9vdy9yeePc+Pl3YId3/dyVsJr55Z/AS4wsMqOKo9QFR8JIzFQoqw/wCnn5pf94Ef+zS9Uf8A1n9l/wDrg++X/svP/de2/wD619Gf+tn93r/2Zz/yHNy/629Cv8Zu+635BbO3ZnsxsCt6z3Hsbsjc3WG6No12cg3FJj9w7WpsRU5BUysGNxCzCP8AjCxOpp00TROAXUK7C/2s9w5/cbZd43C95dk2rc7Dc57Ge3eUTFJoFjZ6SBI608QKRoFGVgKijEEe8Ptjbe1u/wCx7ZYc0R7xtO5bRb7jb3SQmAPBctKqVjaSWlfCLA6zVGUkKaqDG+5M6ibr3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de6//X3+PfuvdVM/J3d3Wu0fmflpO1O1t29M7bznwvwuFg3zsLI5XF72pMqnyKjztNQbbq8JhtwZNanI02EmjqVipJdVB9wG0rdlw991d55X2b3wvG5t5uvNj2u45HiiF1aPJHdLIN5EqpC0UUz6nWJg4WNqxeIDQVIzi9nNi5v337vlivJXJNjzBu9t7hTSmzvY45LRojsRhZ7hZpYI9MbTI0ZaVaTeERU0Uu+6Pl18Ld0f6U/wDnMDuvbv8ApR/uR/x69N2vif8AR1/cn7f/AJlZ/wAYwqP7o/3u+3/3Of8AAj7/AFv/AJu/CzdveX2N3b+tv/MaN9tv3t9L/YLuEf0f0tP9wP8AET9P9RT/ABr4/Gqfhr0h2X2J+8Ls39S/+YDcu3f7l+s/3JbbZfrvq9X/ACUf92K/VfS6v8T+DwaL8VOhQ/l7Z+h3js75F77w8db/AHc398uu5d57Xq66inoZMjt7PU20qnH1qQ1CqwDDVG4F9E0bxk6kYAWfdw3GDetl9y+YLJZP3ZuPOW5XMDMpQvDKtuyMAfzB9GVlOQegZ96fbLnYN/8Aaflq/aP97bXyJtVpcKjhxHPC10roSv5MPVGVhhgej/8AvIrrF7r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de6/9Df49+690HeQ6l62y3YdB2vltmYPK9h4rB0W3MRunKUn8Rr8NicdkcrlaSLCpWNNSYerjrs1VM1VTRxVUiy6HkaNVVQ1c8ncr3nMlvzfebHbzcyQ26wxzyLreKNHkkURBqrGwaVyZEVZCG0lioAArteeebrHlW55IseYLmDlSe5eeW2jbw0llkjjjYylKNKpSGMCORmjUrqVAxJIiexL0FOve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de6//R3+Pfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/9Lf49+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691//09/j37r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3X//U3+Pfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/9Xf49+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691//1t/j37r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3X//X3+Pfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/9Df49+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691//0d/j37r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3X//S3+Pfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/9Pf49+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691//1N/j37r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3X//V3+Pfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/9bf49+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691//19/j37r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3X//Q3+Pfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/9Hf49+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691//0t/j37r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3X//T3+Pfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/9Tf49+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691//1d/j37r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3X//W3+Pfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/9ff49+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691//0N/j37r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3X//R3+Pfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/9Lf49+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691//09/j37r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3X//U3+Pfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvde9+691737r3Xvfuvdf/9k="

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = "data:image/jpeg;base64,/9j/4QSmRXhpZgAATU0AKgAAAAgABwESAAMAAAABAAEAAAEaAAUAAAABAAAAYgEbAAUAAAABAAAAagEoAAMAAAABAAIAAAExAAIAAAAiAAAAcgEyAAIAAAAUAAAAlIdpAAQAAAABAAAAqAAAANQACvyAAAAnEAAK/IAAACcQQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpADIwMTc6MTA6MDYgMTQ6NDQ6MzgAAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAEigAwAEAAAAAQAAACkAAAAAAAAABgEDAAMAAAABAAYAAAEaAAUAAAABAAABIgEbAAUAAAABAAABKgEoAAMAAAABAAIAAAIBAAQAAAABAAABMgICAAQAAAABAAADbAAAAAAAAABIAAAAAQAAAEgAAAAB/9j/7QAMQWRvYmVfQ00AAf/uAA5BZG9iZQBkgAAAAAH/2wCEAAwICAgJCAwJCQwRCwoLERUPDAwPFRgTExUTExgRDAwMDAwMEQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwBDQsLDQ4NEA4OEBQODg4UFA4ODg4UEQwMDAwMEREMDAwMDAwRDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/AABEIACkASAMBIgACEQEDEQH/3QAEAAX/xAE/AAABBQEBAQEBAQAAAAAAAAADAAECBAUGBwgJCgsBAAEFAQEBAQEBAAAAAAAAAAEAAgMEBQYHCAkKCxAAAQQBAwIEAgUHBggFAwwzAQACEQMEIRIxBUFRYRMicYEyBhSRobFCIyQVUsFiMzRygtFDByWSU/Dh8WNzNRaisoMmRJNUZEXCo3Q2F9JV4mXys4TD03Xj80YnlKSFtJXE1OT0pbXF1eX1VmZ2hpamtsbW5vY3R1dnd4eXp7fH1+f3EQACAgECBAQDBAUGBwcGBTUBAAIRAyExEgRBUWFxIhMFMoGRFKGxQiPBUtHwMyRi4XKCkkNTFWNzNPElBhaisoMHJjXC0kSTVKMXZEVVNnRl4vKzhMPTdePzRpSkhbSVxNTk9KW1xdXl9VZmdoaWprbG1ub2JzdHV2d3h5ent8f/2gAMAwEAAhEDEQA/ALKSSS5l6xSSSSSlJJJJKUkkt/ofQr7axnvADmw7GreJa8j86z/g3fmf9uf15MWKWWXDEX1PgGLNmhihxTNdB4ycJ7HscWvaWuHLSIISW19ZrsG99T62uZmxF7DpAGm2z/hP/Rf/AFtJSexH3/a4xw/v+H/f/wBVZ94l93932zxV8nj8v+J/Wf/QspJJLmXrFJJJJKUkkkkp2Pq90hmdebbyPRqg+n3ef/Sf763+t9Yr6ZQK6oOS8fo2dmjj1HD/AKhYvTs51WBQ2ltYvqc5zLX31s+kffW+p7vU9J//AKkVLJxczKvffdfQ6x5kn16vuHvWhDL7WDhxRJyT1lOv5fK5uTD73McWaQGLGSI47Gtf980bLH2PdZY4ue8y5x1JJSR7MC2thebKSGiSG3VuPya1+5ySpcE72N7t/jx1uOHbw8n/0bKSSS5l6xSSSSSlJJJJKUkkkkpSSSSSn//Z/+0MjFBob3Rvc2hvcCAzLjAAOEJJTQQlAAAAAAAQAAAAAAAAAAAAAAAAAAAAADhCSU0EOgAAAAAA1wAAABAAAAABAAAAAAALcHJpbnRPdXRwdXQAAAAFAAAAAFBzdFNib29sAQAAAABJbnRlZW51bQAAAABJbnRlAAAAAEltZyAAAAAPcHJpbnRTaXh0ZWVuQml0Ym9vbAAAAAALcHJpbnRlck5hbWVURVhUAAAAAQAAAAAAD3ByaW50UHJvb2ZTZXR1cE9iamMAAAAFaCFoN4u+f24AAAAAAApwcm9vZlNldHVwAAAAAQAAAABCbHRuZW51bQAAAAxidWlsdGluUHJvb2YAAAAJcHJvb2ZDTVlLADhCSU0EOwAAAAACLQAAABAAAAABAAAAAAAScHJpbnRPdXRwdXRPcHRpb25zAAAAFwAAAABDcHRuYm9vbAAAAAAAQ2xicmJvb2wAAAAAAFJnc01ib29sAAAAAABDcm5DYm9vbAAAAAAAQ250Q2Jvb2wAAAAAAExibHNib29sAAAAAABOZ3R2Ym9vbAAAAAAARW1sRGJvb2wAAAAAAEludHJib29sAAAAAABCY2tnT2JqYwAAAAEAAAAAAABSR0JDAAAAAwAAAABSZCAgZG91YkBv4AAAAAAAAAAAAEdybiBkb3ViQG/gAAAAAAAAAAAAQmwgIGRvdWJAb+AAAAAAAAAAAABCcmRUVW50RiNSbHQAAAAAAAAAAAAAAABCbGQgVW50RiNSbHQAAAAAAAAAAAAAAABSc2x0VW50RiNQeGxAUgAAAAAAAAAAAAp2ZWN0b3JEYXRhYm9vbAEAAAAAUGdQc2VudW0AAAAAUGdQcwAAAABQZ1BDAAAAAExlZnRVbnRGI1JsdAAAAAAAAAAAAAAAAFRvcCBVbnRGI1JsdAAAAAAAAAAAAAAAAFNjbCBVbnRGI1ByY0BZAAAAAAAAAAAAEGNyb3BXaGVuUHJpbnRpbmdib29sAAAAAA5jcm9wUmVjdEJvdHRvbWxvbmcAAAAAAAAADGNyb3BSZWN0TGVmdGxvbmcAAAAAAAAADWNyb3BSZWN0UmlnaHRsb25nAAAAAAAAAAtjcm9wUmVjdFRvcGxvbmcAAAAAADhCSU0D7QAAAAAAEABIAAAAAQACAEgAAAABAAI4QklNBCYAAAAAAA4AAAAAAAAAAAAAP4AAADhCSU0EDQAAAAAABAAAAFo4QklNBBkAAAAAAAQAAAAeOEJJTQPzAAAAAAAJAAAAAAAAAAABADhCSU0nEAAAAAAACgABAAAAAAAAAAI4QklNA/UAAAAAAEgAL2ZmAAEAbGZmAAYAAAAAAAEAL2ZmAAEAoZmaAAYAAAAAAAEAMgAAAAEAWgAAAAYAAAAAAAEANQAAAAEALQAAAAYAAAAAAAE4QklNA/gAAAAAAHAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAOEJJTQQAAAAAAAACAAE4QklNBAIAAAAAAAQAAAAAOEJJTQQwAAAAAAACAQE4QklNBC0AAAAAAAYAAQAAAAI4QklNBAgAAAAAABAAAAABAAACQAAAAkAAAAAAOEJJTQQeAAAAAAAEAAAAADhCSU0EGgAAAAADPwAAAAYAAAAAAAAAAAAAACkAAABIAAAABWcqaAeYmAAtADEAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAEgAAAApAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAEAAAAAAABudWxsAAAAAgAAAAZib3VuZHNPYmpjAAAAAQAAAAAAAFJjdDEAAAAEAAAAAFRvcCBsb25nAAAAAAAAAABMZWZ0bG9uZwAAAAAAAAAAQnRvbWxvbmcA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cG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNy0xMC0wNlQxNDo0NDozOCswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxNy0xMC0wNlQxNDo0NDozOCswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMTctMTAtMDZUMTQ6NDQ6MzgrMDg6MDAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6YzMwMzI0YTMtM2I0OS0zMzQ2LTgwZmYtZmE0MDM4N2I1NjNlIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YzdhOWE0MDMtYWE2MS0xMWU3LTkzMjEtZjgyODUwYjZjNjJmIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NzgxOWVkZjQtYjI3Yy1kODQxLTljM2ItMDEzMGNmZWVmM2Q4IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIGRjOmZvcm1hdD0iaW1hZ2UvanBlZyI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NzgxOWVkZjQtYjI3Yy1kODQxLTljM2ItMDEzMGNmZWVmM2Q4IiBzdEV2dDp3aGVuPSIyMDE3LTEwLTA2VDE0OjQ0OjM4KzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmMzMDMyNGEzLTNiNDktMzM0Ni04MGZmLWZhNDAzODdiNTYzZSIgc3RFdnQ6d2hlbj0iMjAxNy0xMC0wNlQxNDo0NDozOCswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT4wNUM5QTkzQ0Y1MzMyM0UyMUE0QjZCN0RBRjk1RkE0NzwvcmRmOmxpPiA8cmRmOmxpPjA5MjUxOTdFRDVCQkMzN0IyODcyNzU0Nzc1RUM1QzBBPC9yZGY6bGk+IDxyZGY6bGk+MDk5RTI1NDlBRUNBQ0JBNjcyN0M1RkFCOTk3NTQxNDM8L3JkZjpsaT4gPHJkZjpsaT4wQUE3N0JEQTE2NDA1RjhFNkI1NTc2RkM0QUMwNTVBMzwvcmRmOmxpPiA8cmRmOmxpPjI2Nzg2N0YxQzcyM0YyMTRFRTNFRjI0ODFCRUJBQjU2PC9yZGY6bGk+IDxyZGY6bGk+MjhEMEIwQjlBNDZERDhEMzVBRjYyRjYzRDhENEFDREU8L3JkZjpsaT4gPHJkZjpsaT4yOUMzQjg0OTJENkI3QUEyMTlDOUNGMDkzQzI2N0U4NzwvcmRmOmxpPiA8cmRmOmxpPjJGODFDRjI5RTNCRUQxODRBNUZDMUExNTgyNzc4M0VDPC9yZGY6bGk+IDxyZGY6bGk+NDI5MUY3QjlCMzg0MzBGNDI4MTZBRDhEOUQzODI1Qjc8L3JkZjpsaT4gPHJkZjpsaT40MzJDODgwNjNDQjk3QzlFOTU3NzFCNTczRTc3OEIxMzwvcmRmOmxpPiA8cmRmOmxpPjREMUVDNUNEMDA1NTJBNkE5QjE3NkE5NDQ5Qjk0QzMxPC9yZGY6bGk+IDxyZGY6bGk+NTdDMDY4NzIzOTk2REE3NEEwMkY4NTUzOURDQTI3NTE8L3JkZjpsaT4gPHJkZjpsaT41Qjk5ODdEQ0QwNjk4RjQ2MUQ4ODkyRkU3MTdGNDA1OTwvcmRmOmxpPiA8cmRmOmxpPjVEOEFBODBGODY1QzA3MTQ5Q0MyNEEwNkYxM0U0QkVFPC9yZGY6bGk+IDxyZGY6bGk+NjhFQjdCMTg3RjAyMUJCN0FGMjMxOTM1MTVEQThFRTM8L3JkZjpsaT4gPHJkZjpsaT42QTQyNUQ4QzlDMTY3NzkwNDg0QTY4QkNEMjJENTQwMTwvcmRmOmxpPiA8cmRmOmxpPjc0QzNBNzY4MzI2N0RDQzU0QjQ2RUJCODAxOENFQTExPC9yZGY6bGk+IDxyZGY6bGk+N0QyQjI2OERDQjdBMkJEMEZBNDZGOUMwRDU0QkQzRDk8L3JkZjpsaT4gPHJkZjpsaT43RTY0QTBBMkEyQTUwMkRGNUIwNTRBMzIyNjQ0QzQzMjwvcmRmOmxpPiA8cmRmOmxpPkExNjdBOURDNTY1Q0I3MzhBRjQ3RjA5MDIyRDZFQzg1PC9yZGY6bGk+IDxyZGY6bGk+QTU3RTRGQjMwODkxNkU4N0U3RjAyMUE2ODkzRUIzOTg8L3JkZjpsaT4gPHJkZjpsaT5BRUJCNzRFRkM1MDhBMEI4MDg5QzQxNTQwMTVDOTJCMDwvcmRmOmxpPiA8cmRmOmxpPkIwMDVFQTE0NTY2MkI4NDUxMjY1MjA5N0YyRUNGNEI1PC9yZGY6bGk+IDxyZGY6bGk+QjJFNEM2OTZGQzA3OUVBMkQ4NzY5RjVDMkREMzM5REQ8L3JkZjpsaT4gPHJkZjpsaT5CMzU2QTE0N0Q0REQxRDZDNUQyMTRFMTRERDZDMUYzOTwvcmRmOmxpPiA8cmRmOmxpPkI5QjFCNDc0MzE3M0UwNTI2QzJBNjM4N0EzREJBNUE3PC9yZGY6bGk+IDxyZGY6bGk+QkQwMjZBQTEwNDc2MDg0NzhEMjE1NkJGMTJGNjdBQzk8L3JkZjpsaT4gPHJkZjpsaT5DNEVGRjY4NzAzODkyRDZEREMzQkE2MzYwMzI5MkQ5RDwvcmRmOmxpPiA8cmRmOmxpPkQ1QTc3NDM5OTk4QzY2ODFGMkE1MjFFNDgyRTRDOUUyPC9yZGY6bGk+IDxyZGY6bGk+RDYwM0MzRTM3QkU2MjBCRThDMEU4NjVBMUVFNzNDMDA8L3JkZjpsaT4gPHJkZjpsaT5EODA5OEE1MzdEMzI2REVGQTA1RDMxNTAzQ0RCMThFNjwvcmRmOmxpPiA8cmRmOmxpPkQ4RDM4RkEzNjc1QTQ2NjAwN0I0RUQ2MDEzNDNCMjc5PC9yZGY6bGk+IDxyZGY6bGk+RDkyRDMzN0U1Rjg0Q0Y5MjAzMDVGN0U4MEFDNTAzMzg8L3JkZjpsaT4gPHJkZjpsaT5ERjA5RjRERTU4QUQyQUQwRThERUM2M0Y2NTZGQkNFMTwvcmRmOmxpPiA8cmRmOmxpPkUyNzI1Mjg0MzE3NEQ2NTU1NjdFRkYxQkU2ODQ4NDE2PC9yZGY6bGk+IDxyZGY6bGk+RTMxRjkzQTA2RkE2MTg1NkJGMEREQ0NENUIxNDZGODM8L3JkZjpsaT4gPHJkZjpsaT5FNThFOTI4QkE4MEE1RUM0NTIzRTczRjk5RDg4OERBNTwvcmRmOmxpPiA8cmRmOmxpPkU5NEQ0NzIwQ0Y2MjQzMUExRUE2RTUzQzQ2MDIzRjhFPC9yZGY6bGk+IDxyZGY6bGk+RUU3QTE5RjIwREQzOUUxM0Q5OTBCNzU2MzZFNjc1M0Y8L3JkZjpsaT4gPHJkZjpsaT5GNDlGNzU3RDE1N0I3RTIzNjg2MTY4MDIwOEExMThBRjwvcmRmOmxpPiA8cmRmOmxpPkY5QzU4MjA2REEzRjgwNkM5OUQwNDRDNDBCQTY2QkNDPC9yZGY6bGk+IDxyZGY6bGk+RkE1MzU3QjI1Nzc3REYzMDdDMUQ3NTFERThFQzNBOEE8L3JkZjpsaT4gPHJkZjpsaT5GRDVERUM1QTk1OEZCNDk1N0U3ODY3RkE1QTIyMDlDRjwvcmRmOmxpPiA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5MTUyNzlhMS1hYTYxLTExZTctOTMyMS1mODI4NTBiNmM2MmY8L3JkZjpsaT4gPHJkZjpsaT54bXAuZGlkOjYyRjI1NTBCN0E5Q0U3MTE4MDM4ODRCRUVFQjI0MkI2PC9yZGY6bGk+IDxyZGY6bGk+eG1wLmRpZDo5NUVGRDAyQjRFQTBFNzExQjMzMkU3NjQ1OTFBQzUxQzwvcmRmOmxpPiA8L3JkZjpCYWc+IDwvcGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8P3hwYWNrZXQgZW5kPSJ3Ij8+/+IMWElDQ19QUk9GSUxFAAEBAAAMSExpbm8CEAAAbW50clJHQiBYWVogB84AAgAJAAYAMQAAYWNzcE1TRlQAAAAASUVDIHNSR0IAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1IUCAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARY3BydAAAAVAAAAAzZGVzYwAAAYQAAABsd3RwdAAAAfAAAAAUYmtwdAAAAgQAAAAUclhZWgAAAhgAAAAUZ1hZWgAAAiwAAAAUYlhZWgAAAkAAAAAUZG1uZAAAAlQAAABwZG1kZAAAAsQAAACIdnVlZAAAA0wAAACGdmlldwAAA9QAAAAkbHVtaQAAA/gAAAAUbWVhcwAABAwAAAAkdGVjaAAABDAAAAAMclRSQwAABDwAAAgMZ1RSQwAABDwAAAgMYlRSQwAABDwAAAgMdGV4dAAAAABDb3B5cmlnaHQgKGMpIDE5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y0rS1FPDX0kyTRU0yZb+23P0+x+33Kttsdht8fMu33VzJFd3G9bZaALNL+rby2c8yXD2s6IgljbwyzpHcQurpE64T+63tvb7/wC5fOd3zBue6S8pbnZWsU9na7Bu17VoIQIbmC+t4HtkvLd3dopVMgVHktp42jeaNix9j9Y9udsb1z/YG+u1Ogs1ujclc9dkK2b5IdJCNLBYqWhooP79FKLHY2kijgpoE9EEESIosvuKOZ+VucecN+3PmTf+b+XZ91upCzsd62ug4AKg+r7URQEjQGioAo4dTFylzlyJyPy7tXK3LPJXM9vs1nGERBsG71Pmzu30VXkkYl5JDlnYsePQZ53obc23sNks5V706SrqbF0klZNSYLvjqTcGaqUi/wB047CYbd9blcpVt/Zhgikkb+yp9hbcfb3dNss7rcJt82CSKJC5WHdtvmlanERxR3DvIf6KqzHyB6GO2e5uz7ruFntsHL/Mcc07hA02zbnBEpP4pJpbVI419WdlUeZHX//THD3wX6+jvr3v3Xuve/de697917r3v3Xuve/de69z/X/fcm5P1vyfp/tvdNJz9n+r/Vn+QHW8cMj/AIvrvj/H37SfQf6vy69q+X8+uP8AX+ht/wAb4sBz/T6e9gY4eXy/lT+X+HrdRSnz6//UHD3wX6+jvr3v3Xuve/de697917r3v3Xuve/de697917r3v3Xuve/de6//9k="

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * jQuery JavaScript Library v1.11.0
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-01-23T21:02Z
 */

(function (global, factory) {

	if (( false ? "undefined" : _typeof(module)) === "object" && _typeof(module.exports) === "object") {
		// For CommonJS and CommonJS-like environments where a proper window is present,
		// execute the factory and get jQuery
		// For environments that do not inherently posses a window with a document
		// (such as Node.js), expose a jQuery-making factory as module.exports
		// This accentuates the need for the creation of a real window
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info
		module.exports = global.document ? factory(global, true) : function (w) {
			if (!w.document) {
				throw new Error("jQuery requires a window with a document");
			}
			return factory(w);
		};
	} else {
		factory(global);
	}

	// Pass this if window is not defined yet
})(typeof window !== "undefined" ? window : undefined, function (window, noGlobal) {

	// Can't do this because several apps including ASP.NET trace
	// the stack via arguments.caller.callee and Firefox dies if
	// you try to trace through "use strict" call chains. (#13335)
	// Support: Firefox 18+
	//

	var deletedIds = [];

	var _slice = deletedIds.slice;

	var concat = deletedIds.concat;

	var push = deletedIds.push;

	var indexOf = deletedIds.indexOf;

	var class2type = {};

	var toString = class2type.toString;

	var hasOwn = class2type.hasOwnProperty;

	var trim = "".trim;

	var support = {};

	var version = "1.11.0",


	// Define a local copy of jQuery
	jQuery = function jQuery(selector, context) {
		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init(selector, context);
	},


	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,


	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	    rdashAlpha = /-([\da-z])/gi,


	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function fcamelCase(all, letter) {
		return letter.toUpperCase();
	};

	jQuery.fn = jQuery.prototype = {
		// The current version of jQuery being used
		jquery: version,

		constructor: jQuery,

		// Start with an empty selector
		selector: "",

		// The default length of a jQuery object is 0
		length: 0,

		toArray: function toArray() {
			return _slice.call(this);
		},

		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function get(num) {
			return num != null ?

			// Return a 'clean' array
			num < 0 ? this[num + this.length] : this[num] :

			// Return just the object
			_slice.call(this);
		},

		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function pushStack(elems) {

			// Build a new jQuery matched element set
			var ret = jQuery.merge(this.constructor(), elems);

			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;
			ret.context = this.context;

			// Return the newly-formed element set
			return ret;
		},

		// Execute a callback for every element in the matched set.
		// (You can seed the arguments with an array of args, but this is
		// only used internally.)
		each: function each(callback, args) {
			return jQuery.each(this, callback, args);
		},

		map: function map(callback) {
			return this.pushStack(jQuery.map(this, function (elem, i) {
				return callback.call(elem, i, elem);
			}));
		},

		slice: function slice() {
			return this.pushStack(_slice.apply(this, arguments));
		},

		first: function first() {
			return this.eq(0);
		},

		last: function last() {
			return this.eq(-1);
		},

		eq: function eq(i) {
			var len = this.length,
			    j = +i + (i < 0 ? len : 0);
			return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
		},

		end: function end() {
			return this.prevObject || this.constructor(null);
		},

		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: deletedIds.sort,
		splice: deletedIds.splice
	};

	jQuery.extend = jQuery.fn.extend = function () {
		var src,
		    copyIsArray,
		    copy,
		    name,
		    options,
		    clone,
		    target = arguments[0] || {},
		    i = 1,
		    length = arguments.length,
		    deep = false;

		// Handle a deep copy situation
		if (typeof target === "boolean") {
			deep = target;

			// skip the boolean and the target
			target = arguments[i] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ((typeof target === "undefined" ? "undefined" : _typeof(target)) !== "object" && !jQuery.isFunction(target)) {
			target = {};
		}

		// extend jQuery itself if only one argument is passed
		if (i === length) {
			target = this;
			i--;
		}

		for (; i < length; i++) {
			// Only deal with non-null/undefined values
			if ((options = arguments[i]) != null) {
				// Extend the base object
				for (name in options) {
					src = target[name];
					copy = options[name];

					// Prevent never-ending loop
					if (target === copy) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && jQuery.isArray(src) ? src : [];
						} else {
							clone = src && jQuery.isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = jQuery.extend(deep, clone, copy);

						// Don't bring in undefined values
					} else if (copy !== undefined) {
						target[name] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	jQuery.extend({
		// Unique for each copy of jQuery on the page
		expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),

		// Assume jQuery is ready without the ready module
		isReady: true,

		error: function error(msg) {
			throw new Error(msg);
		},

		noop: function noop() {},

		// See test/unit/core.js for details concerning isFunction.
		// Since version 1.3, DOM methods and functions like alert
		// aren't supported. They return false on IE (#2968).
		isFunction: function isFunction(obj) {
			return jQuery.type(obj) === "function";
		},

		isArray: Array.isArray || function (obj) {
			return jQuery.type(obj) === "array";
		},

		isWindow: function isWindow(obj) {
			/* jshint eqeqeq: false */
			return obj != null && obj == obj.window;
		},

		isNumeric: function isNumeric(obj) {
			// parseFloat NaNs numeric-cast false positives (null|true|false|"")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			return obj - parseFloat(obj) >= 0;
		},

		isEmptyObject: function isEmptyObject(obj) {
			var name;
			for (name in obj) {
				return false;
			}
			return true;
		},

		isPlainObject: function isPlainObject(obj) {
			var key;

			// Must be an Object.
			// Because of IE, we also have to check the presence of the constructor property.
			// Make sure that DOM nodes and window objects don't pass through, as well
			if (!obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
				return false;
			}

			try {
				// Not own constructor property must be Object
				if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
					return false;
				}
			} catch (e) {
				// IE8,9 Will throw exceptions on certain host objects #9897
				return false;
			}

			// Support: IE<9
			// Handle iteration over inherited properties before own properties.
			if (support.ownLast) {
				for (key in obj) {
					return hasOwn.call(obj, key);
				}
			}

			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own.
			for (key in obj) {}

			return key === undefined || hasOwn.call(obj, key);
		},

		type: function type(obj) {
			if (obj == null) {
				return obj + "";
			}
			return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
		},

		// Evaluates a script in a global context
		// Workarounds based on findings by Jim Driscoll
		// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
		globalEval: function globalEval(data) {
			if (data && jQuery.trim(data)) {
				// We use execScript on Internet Explorer
				// We use an anonymous function so that context is window
				// rather than jQuery in Firefox
				(window.execScript || function (data) {
					window["eval"].call(window, data);
				})(data);
			}
		},

		// Convert dashed to camelCase; used by the css and data modules
		// Microsoft forgot to hump their vendor prefix (#9572)
		camelCase: function camelCase(string) {
			return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
		},

		nodeName: function nodeName(elem, name) {
			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
		},

		// args is for internal usage only
		each: function each(obj, callback, args) {
			var value,
			    i = 0,
			    length = obj.length,
			    isArray = isArraylike(obj);

			if (args) {
				if (isArray) {
					for (; i < length; i++) {
						value = callback.apply(obj[i], args);

						if (value === false) {
							break;
						}
					}
				} else {
					for (i in obj) {
						value = callback.apply(obj[i], args);

						if (value === false) {
							break;
						}
					}
				}

				// A special, fast, case for the most common use of each
			} else {
				if (isArray) {
					for (; i < length; i++) {
						value = callback.call(obj[i], i, obj[i]);

						if (value === false) {
							break;
						}
					}
				} else {
					for (i in obj) {
						value = callback.call(obj[i], i, obj[i]);

						if (value === false) {
							break;
						}
					}
				}
			}

			return obj;
		},

		// Use native String.trim function wherever possible
		trim: trim && !trim.call("\uFEFF\xA0") ? function (text) {
			return text == null ? "" : trim.call(text);
		} :

		// Otherwise use our own trimming functionality
		function (text) {
			return text == null ? "" : (text + "").replace(rtrim, "");
		},

		// results is for internal usage only
		makeArray: function makeArray(arr, results) {
			var ret = results || [];

			if (arr != null) {
				if (isArraylike(Object(arr))) {
					jQuery.merge(ret, typeof arr === "string" ? [arr] : arr);
				} else {
					push.call(ret, arr);
				}
			}

			return ret;
		},

		inArray: function inArray(elem, arr, i) {
			var len;

			if (arr) {
				if (indexOf) {
					return indexOf.call(arr, elem, i);
				}

				len = arr.length;
				i = i ? i < 0 ? Math.max(0, len + i) : i : 0;

				for (; i < len; i++) {
					// Skip accessing in sparse arrays
					if (i in arr && arr[i] === elem) {
						return i;
					}
				}
			}

			return -1;
		},

		merge: function merge(first, second) {
			var len = +second.length,
			    j = 0,
			    i = first.length;

			while (j < len) {
				first[i++] = second[j++];
			}

			// Support: IE<9
			// Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
			if (len !== len) {
				while (second[j] !== undefined) {
					first[i++] = second[j++];
				}
			}

			first.length = i;

			return first;
		},

		grep: function grep(elems, callback, invert) {
			var callbackInverse,
			    matches = [],
			    i = 0,
			    length = elems.length,
			    callbackExpect = !invert;

			// Go through the array, only saving the items
			// that pass the validator function
			for (; i < length; i++) {
				callbackInverse = !callback(elems[i], i);
				if (callbackInverse !== callbackExpect) {
					matches.push(elems[i]);
				}
			}

			return matches;
		},

		// arg is for internal usage only
		map: function map(elems, callback, arg) {
			var value,
			    i = 0,
			    length = elems.length,
			    isArray = isArraylike(elems),
			    ret = [];

			// Go through the array, translating each of the items to their new values
			if (isArray) {
				for (; i < length; i++) {
					value = callback(elems[i], i, arg);

					if (value != null) {
						ret.push(value);
					}
				}

				// Go through every key on the object,
			} else {
				for (i in elems) {
					value = callback(elems[i], i, arg);

					if (value != null) {
						ret.push(value);
					}
				}
			}

			// Flatten any nested arrays
			return concat.apply([], ret);
		},

		// A global GUID counter for objects
		guid: 1,

		// Bind a function to a context, optionally partially applying any
		// arguments.
		proxy: function proxy(fn, context) {
			var args, proxy, tmp;

			if (typeof context === "string") {
				tmp = fn[context];
				context = fn;
				fn = tmp;
			}

			// Quick check to determine if target is callable, in the spec
			// this throws a TypeError, but we will just return undefined.
			if (!jQuery.isFunction(fn)) {
				return undefined;
			}

			// Simulated bind
			args = _slice.call(arguments, 2);
			proxy = function proxy() {
				return fn.apply(context || this, args.concat(_slice.call(arguments)));
			};

			// Set the guid of unique handler to the same of original handler, so it can be removed
			proxy.guid = fn.guid = fn.guid || jQuery.guid++;

			return proxy;
		},

		now: function now() {
			return +new Date();
		},

		// jQuery.support is not used in Core but other projects attach their
		// properties to it so it needs to exist.
		support: support
	});

	// Populate the class2type map
	jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
		class2type["[object " + name + "]"] = name.toLowerCase();
	});

	function isArraylike(obj) {
		var length = obj.length,
		    type = jQuery.type(obj);

		if (type === "function" || jQuery.isWindow(obj)) {
			return false;
		}

		if (obj.nodeType === 1 && length) {
			return true;
		}

		return type === "array" || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;
	}
	var Sizzle =
	/*!
  * Sizzle CSS Selector Engine v1.10.16
  * http://sizzlejs.com/
  *
  * Copyright 2013 jQuery Foundation, Inc. and other contributors
  * Released under the MIT license
  * http://jquery.org/license
  *
  * Date: 2014-01-13
  */
	function (window) {

		var i,
		    support,
		    Expr,
		    getText,
		    isXML,
		    compile,
		    outermostContext,
		    sortInput,
		    hasDuplicate,


		// Local document vars
		setDocument,
		    document,
		    docElem,
		    documentIsHTML,
		    rbuggyQSA,
		    rbuggyMatches,
		    matches,
		    contains,


		// Instance-specific data
		expando = "sizzle" + -new Date(),
		    preferredDoc = window.document,
		    dirruns = 0,
		    done = 0,
		    classCache = createCache(),
		    tokenCache = createCache(),
		    compilerCache = createCache(),
		    sortOrder = function sortOrder(a, b) {
			if (a === b) {
				hasDuplicate = true;
			}
			return 0;
		},


		// General-purpose constants
		strundefined =  true ? "undefined" : _typeof(undefined),
		    MAX_NEGATIVE = 1 << 31,


		// Instance methods
		hasOwn = {}.hasOwnProperty,
		    arr = [],
		    pop = arr.pop,
		    push_native = arr.push,
		    push = arr.push,
		    slice = arr.slice,

		// Use a stripped-down indexOf if we can't use a native one
		indexOf = arr.indexOf || function (elem) {
			var i = 0,
			    len = this.length;
			for (; i < len; i++) {
				if (this[i] === elem) {
					return i;
				}
			}
			return -1;
		},
		    booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",


		// Regular expressions

		// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
		whitespace = "[\\x20\\t\\r\\n\\f]",

		// http://www.w3.org/TR/css3-syntax/#characters
		characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",


		// Loosely modeled on CSS identifier characters
		// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
		// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		identifier = characterEncoding.replace("w", "w#"),


		// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace + "*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",


		// Prefer arguments quoted,
		//   then not containing pseudos/brackets,
		//   then attribute selectors/non-parenthetical expressions,
		//   then anything else
		// These preferences are here to reduce the number of selectors
		//   needing tokenize in the PSEUDO preFilter
		pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace(3, 8) + ")*)|.*)\\)|)",


		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),
		    rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
		    rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),
		    rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),
		    rpseudo = new RegExp(pseudos),
		    ridentifier = new RegExp("^" + identifier + "$"),
		    matchExpr = {
			"ID": new RegExp("^#(" + characterEncoding + ")"),
			"CLASS": new RegExp("^\\.(" + characterEncoding + ")"),
			"TAG": new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
			"ATTR": new RegExp("^" + attributes),
			"PSEUDO": new RegExp("^" + pseudos),
			"CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
			"bool": new RegExp("^(?:" + booleans + ")$", "i"),
			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			"needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
		},
		    rinputs = /^(?:input|select|textarea|button)$/i,
		    rheader = /^h\d$/i,
		    rnative = /^[^{]+\{\s*\[native \w/,


		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
		    rsibling = /[+~]/,
		    rescape = /'|\\/g,


		// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
		    funescape = function funescape(_, escaped, escapedWhitespace) {
			var high = "0x" + escaped - 0x10000;
			// NaN means non-codepoint
			// Support: Firefox
			// Workaround erroneous numeric interpretation of +"0x"
			return high !== high || escapedWhitespace ? escaped : high < 0 ?
			// BMP codepoint
			String.fromCharCode(high + 0x10000) :
			// Supplemental Plane codepoint (surrogate pair)
			String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
		};

		// Optimize for push.apply( _, NodeList )
		try {
			push.apply(arr = slice.call(preferredDoc.childNodes), preferredDoc.childNodes);
			// Support: Android<4.0
			// Detect silently failing push.apply
			arr[preferredDoc.childNodes.length].nodeType;
		} catch (e) {
			push = { apply: arr.length ?

				// Leverage slice if possible
				function (target, els) {
					push_native.apply(target, slice.call(els));
				} :

				// Support: IE<9
				// Otherwise append directly
				function (target, els) {
					var j = target.length,
					    i = 0;
					// Can't trust NodeList.length
					while (target[j++] = els[i++]) {}
					target.length = j - 1;
				}
			};
		}

		function Sizzle(selector, context, results, seed) {
			var match, elem, m, nodeType,
			// QSA vars
			i, groups, old, nid, newContext, newSelector;

			if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
				setDocument(context);
			}

			context = context || document;
			results = results || [];

			if (!selector || typeof selector !== "string") {
				return results;
			}

			if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
				return [];
			}

			if (documentIsHTML && !seed) {

				// Shortcuts
				if (match = rquickExpr.exec(selector)) {
					// Speed-up: Sizzle("#ID")
					if (m = match[1]) {
						if (nodeType === 9) {
							elem = context.getElementById(m);
							// Check parentNode to catch when Blackberry 4.6 returns
							// nodes that are no longer in the document (jQuery #6963)
							if (elem && elem.parentNode) {
								// Handle the case where IE, Opera, and Webkit return items
								// by name instead of ID
								if (elem.id === m) {
									results.push(elem);
									return results;
								}
							} else {
								return results;
							}
						} else {
							// Context is not a document
							if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context, elem) && elem.id === m) {
								results.push(elem);
								return results;
							}
						}

						// Speed-up: Sizzle("TAG")
					} else if (match[2]) {
						push.apply(results, context.getElementsByTagName(selector));
						return results;

						// Speed-up: Sizzle(".CLASS")
					} else if ((m = match[3]) && support.getElementsByClassName && context.getElementsByClassName) {
						push.apply(results, context.getElementsByClassName(m));
						return results;
					}
				}

				// QSA path
				if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
					nid = old = expando;
					newContext = context;
					newSelector = nodeType === 9 && selector;

					// qSA works strangely on Element-rooted queries
					// We can work around this by specifying an extra ID on the root
					// and working up from there (Thanks to Andrew Dupont for the technique)
					// IE 8 doesn't work on object elements
					if (nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
						groups = tokenize(selector);

						if (old = context.getAttribute("id")) {
							nid = old.replace(rescape, "\\$&");
						} else {
							context.setAttribute("id", nid);
						}
						nid = "[id='" + nid + "'] ";

						i = groups.length;
						while (i--) {
							groups[i] = nid + toSelector(groups[i]);
						}
						newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
						newSelector = groups.join(",");
					}

					if (newSelector) {
						try {
							push.apply(results, newContext.querySelectorAll(newSelector));
							return results;
						} catch (qsaError) {} finally {
							if (!old) {
								context.removeAttribute("id");
							}
						}
					}
				}
			}

			// All others
			return select(selector.replace(rtrim, "$1"), context, results, seed);
		}

		/**
   * Create key-value caches of limited size
   * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
   *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
   *	deleting the oldest entry
   */
		function createCache() {
			var keys = [];

			function cache(key, value) {
				// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
				if (keys.push(key + " ") > Expr.cacheLength) {
					// Only keep the most recent entries
					delete cache[keys.shift()];
				}
				return cache[key + " "] = value;
			}
			return cache;
		}

		/**
   * Mark a function for special use by Sizzle
   * @param {Function} fn The function to mark
   */
		function markFunction(fn) {
			fn[expando] = true;
			return fn;
		}

		/**
   * Support testing using an element
   * @param {Function} fn Passed the created div and expects a boolean result
   */
		function assert(fn) {
			var div = document.createElement("div");

			try {
				return !!fn(div);
			} catch (e) {
				return false;
			} finally {
				// Remove from its parent by default
				if (div.parentNode) {
					div.parentNode.removeChild(div);
				}
				// release memory in IE
				div = null;
			}
		}

		/**
   * Adds the same handler for all of the specified attrs
   * @param {String} attrs Pipe-separated list of attributes
   * @param {Function} handler The method that will be applied
   */
		function addHandle(attrs, handler) {
			var arr = attrs.split("|"),
			    i = attrs.length;

			while (i--) {
				Expr.attrHandle[arr[i]] = handler;
			}
		}

		/**
   * Checks document order of two siblings
   * @param {Element} a
   * @param {Element} b
   * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
   */
		function siblingCheck(a, b) {
			var cur = b && a,
			    diff = cur && a.nodeType === 1 && b.nodeType === 1 && (~b.sourceIndex || MAX_NEGATIVE) - (~a.sourceIndex || MAX_NEGATIVE);

			// Use IE sourceIndex if available on both nodes
			if (diff) {
				return diff;
			}

			// Check if b follows a
			if (cur) {
				while (cur = cur.nextSibling) {
					if (cur === b) {
						return -1;
					}
				}
			}

			return a ? 1 : -1;
		}

		/**
   * Returns a function to use in pseudos for input types
   * @param {String} type
   */
		function createInputPseudo(type) {
			return function (elem) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === type;
			};
		}

		/**
   * Returns a function to use in pseudos for buttons
   * @param {String} type
   */
		function createButtonPseudo(type) {
			return function (elem) {
				var name = elem.nodeName.toLowerCase();
				return (name === "input" || name === "button") && elem.type === type;
			};
		}

		/**
   * Returns a function to use in pseudos for positionals
   * @param {Function} fn
   */
		function createPositionalPseudo(fn) {
			return markFunction(function (argument) {
				argument = +argument;
				return markFunction(function (seed, matches) {
					var j,
					    matchIndexes = fn([], seed.length, argument),
					    i = matchIndexes.length;

					// Match elements found at the specified indexes
					while (i--) {
						if (seed[j = matchIndexes[i]]) {
							seed[j] = !(matches[j] = seed[j]);
						}
					}
				});
			});
		}

		/**
   * Checks a node for validity as a Sizzle context
   * @param {Element|Object=} context
   * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
   */
		function testContext(context) {
			return context && _typeof(context.getElementsByTagName) !== strundefined && context;
		}

		// Expose support vars for convenience
		support = Sizzle.support = {};

		/**
   * Detects XML nodes
   * @param {Element|Object} elem An element or a document
   * @returns {Boolean} True iff elem is a non-HTML XML node
   */
		isXML = Sizzle.isXML = function (elem) {
			// documentElement is verified for cases where it doesn't yet exist
			// (such as loading iframes in IE - #4833)
			var documentElement = elem && (elem.ownerDocument || elem).documentElement;
			return documentElement ? documentElement.nodeName !== "HTML" : false;
		};

		/**
   * Sets document-related variables once based on the current document
   * @param {Element|Object} [doc] An element or document object to use to set the document
   * @returns {Object} Returns the current document
   */
		setDocument = Sizzle.setDocument = function (node) {
			var hasCompare,
			    doc = node ? node.ownerDocument || node : preferredDoc,
			    parent = doc.defaultView;

			// If no document and documentElement is available, return
			if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
				return document;
			}

			// Set our document
			document = doc;
			docElem = doc.documentElement;

			// Support tests
			documentIsHTML = !isXML(doc);

			// Support: IE>8
			// If iframe document is assigned to "document" variable and if iframe has been reloaded,
			// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
			// IE6-8 do not support the defaultView property so parent will be undefined
			if (parent && parent !== parent.top) {
				// IE11 does not have attachEvent, so all must suffer
				if (parent.addEventListener) {
					parent.addEventListener("unload", function () {
						setDocument();
					}, false);
				} else if (parent.attachEvent) {
					parent.attachEvent("onunload", function () {
						setDocument();
					});
				}
			}

			/* Attributes
   ---------------------------------------------------------------------- */

			// Support: IE<8
			// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
			support.attributes = assert(function (div) {
				div.className = "i";
				return !div.getAttribute("className");
			});

			/* getElement(s)By*
   ---------------------------------------------------------------------- */

			// Check if getElementsByTagName("*") returns only elements
			support.getElementsByTagName = assert(function (div) {
				div.appendChild(doc.createComment(""));
				return !div.getElementsByTagName("*").length;
			});

			// Check if getElementsByClassName can be trusted
			support.getElementsByClassName = rnative.test(doc.getElementsByClassName) && assert(function (div) {
				div.innerHTML = "<div class='a'></div><div class='a i'></div>";

				// Support: Safari<4
				// Catch class over-caching
				div.firstChild.className = "i";
				// Support: Opera<10
				// Catch gEBCN failure to find non-leading classes
				return div.getElementsByClassName("i").length === 2;
			});

			// Support: IE<10
			// Check if getElementById returns elements by name
			// The broken getElementById methods don't pick up programatically-set names,
			// so use a roundabout getElementsByName test
			support.getById = assert(function (div) {
				docElem.appendChild(div).id = expando;
				return !doc.getElementsByName || !doc.getElementsByName(expando).length;
			});

			// ID find and filter
			if (support.getById) {
				Expr.find["ID"] = function (id, context) {
					if (_typeof(context.getElementById) !== strundefined && documentIsHTML) {
						var m = context.getElementById(id);
						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						return m && m.parentNode ? [m] : [];
					}
				};
				Expr.filter["ID"] = function (id) {
					var attrId = id.replace(runescape, funescape);
					return function (elem) {
						return elem.getAttribute("id") === attrId;
					};
				};
			} else {
				// Support: IE6/7
				// getElementById is not reliable as a find shortcut
				delete Expr.find["ID"];

				Expr.filter["ID"] = function (id) {
					var attrId = id.replace(runescape, funescape);
					return function (elem) {
						var node = _typeof(elem.getAttributeNode) !== strundefined && elem.getAttributeNode("id");
						return node && node.value === attrId;
					};
				};
			}

			// Tag
			Expr.find["TAG"] = support.getElementsByTagName ? function (tag, context) {
				if (_typeof(context.getElementsByTagName) !== strundefined) {
					return context.getElementsByTagName(tag);
				}
			} : function (tag, context) {
				var elem,
				    tmp = [],
				    i = 0,
				    results = context.getElementsByTagName(tag);

				// Filter out possible comments
				if (tag === "*") {
					while (elem = results[i++]) {
						if (elem.nodeType === 1) {
							tmp.push(elem);
						}
					}

					return tmp;
				}
				return results;
			};

			// Class
			Expr.find["CLASS"] = support.getElementsByClassName && function (className, context) {
				if (_typeof(context.getElementsByClassName) !== strundefined && documentIsHTML) {
					return context.getElementsByClassName(className);
				}
			};

			/* QSA/matchesSelector
   ---------------------------------------------------------------------- */

			// QSA and matchesSelector support

			// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
			rbuggyMatches = [];

			// qSa(:focus) reports false when true (Chrome 21)
			// We allow this because of a bug in IE8/9 that throws an error
			// whenever `document.activeElement` is accessed on an iframe
			// So, we allow :focus to pass through QSA all the time to avoid the IE error
			// See http://bugs.jquery.com/ticket/13378
			rbuggyQSA = [];

			if (support.qsa = rnative.test(doc.querySelectorAll)) {
				// Build QSA regex
				// Regex strategy adopted from Diego Perini
				assert(function (div) {
					// Select is set to empty string on purpose
					// This is to test IE's treatment of not explicitly
					// setting a boolean content attribute,
					// since its presence should be enough
					// http://bugs.jquery.com/ticket/12359
					div.innerHTML = "<select t=''><option selected=''></option></select>";

					// Support: IE8, Opera 10-12
					// Nothing should be selected when empty strings follow ^= or $= or *=
					if (div.querySelectorAll("[t^='']").length) {
						rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
					}

					// Support: IE8
					// Boolean attributes and "value" are not treated correctly
					if (!div.querySelectorAll("[selected]").length) {
						rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
					}

					// Webkit/Opera - :checked should return selected option elements
					// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
					// IE8 throws error here and will not see later tests
					if (!div.querySelectorAll(":checked").length) {
						rbuggyQSA.push(":checked");
					}
				});

				assert(function (div) {
					// Support: Windows 8 Native Apps
					// The type and name attributes are restricted during .innerHTML assignment
					var input = doc.createElement("input");
					input.setAttribute("type", "hidden");
					div.appendChild(input).setAttribute("name", "D");

					// Support: IE8
					// Enforce case-sensitivity of name attribute
					if (div.querySelectorAll("[name=d]").length) {
						rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
					}

					// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
					// IE8 throws error here and will not see later tests
					if (!div.querySelectorAll(":enabled").length) {
						rbuggyQSA.push(":enabled", ":disabled");
					}

					// Opera 10-11 does not throw on post-comma invalid pseudos
					div.querySelectorAll("*,:x");
					rbuggyQSA.push(",.*:");
				});
			}

			if (support.matchesSelector = rnative.test(matches = docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)) {

				assert(function (div) {
					// Check to see if it's possible to do matchesSelector
					// on a disconnected node (IE 9)
					support.disconnectedMatch = matches.call(div, "div");

					// This should fail with an exception
					// Gecko does not error, returns false instead
					matches.call(div, "[s!='']:x");
					rbuggyMatches.push("!=", pseudos);
				});
			}

			rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
			rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));

			/* Contains
   ---------------------------------------------------------------------- */
			hasCompare = rnative.test(docElem.compareDocumentPosition);

			// Element contains another
			// Purposefully does not implement inclusive descendent
			// As in, an element does not contain itself
			contains = hasCompare || rnative.test(docElem.contains) ? function (a, b) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
				    bup = b && b.parentNode;
				return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
			} : function (a, b) {
				if (b) {
					while (b = b.parentNode) {
						if (b === a) {
							return true;
						}
					}
				}
				return false;
			};

			/* Sorting
   ---------------------------------------------------------------------- */

			// Document order sorting
			sortOrder = hasCompare ? function (a, b) {

				// Flag for duplicate removal
				if (a === b) {
					hasDuplicate = true;
					return 0;
				}

				// Sort on method existence if only one input has compareDocumentPosition
				var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
				if (compare) {
					return compare;
				}

				// Calculate position if both inputs belong to the same document
				compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) :

				// Otherwise we know they are disconnected
				1;

				// Disconnected nodes
				if (compare & 1 || !support.sortDetached && b.compareDocumentPosition(a) === compare) {

					// Choose the first element that is related to our preferred document
					if (a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
						return -1;
					}
					if (b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
						return 1;
					}

					// Maintain original order
					return sortInput ? indexOf.call(sortInput, a) - indexOf.call(sortInput, b) : 0;
				}

				return compare & 4 ? -1 : 1;
			} : function (a, b) {
				// Exit early if the nodes are identical
				if (a === b) {
					hasDuplicate = true;
					return 0;
				}

				var cur,
				    i = 0,
				    aup = a.parentNode,
				    bup = b.parentNode,
				    ap = [a],
				    bp = [b];

				// Parentless nodes are either documents or disconnected
				if (!aup || !bup) {
					return a === doc ? -1 : b === doc ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf.call(sortInput, a) - indexOf.call(sortInput, b) : 0;

					// If the nodes are siblings, we can do a quick check
				} else if (aup === bup) {
					return siblingCheck(a, b);
				}

				// Otherwise we need full lists of their ancestors for comparison
				cur = a;
				while (cur = cur.parentNode) {
					ap.unshift(cur);
				}
				cur = b;
				while (cur = cur.parentNode) {
					bp.unshift(cur);
				}

				// Walk down the tree looking for a discrepancy
				while (ap[i] === bp[i]) {
					i++;
				}

				return i ?
				// Do a sibling check if the nodes have a common ancestor
				siblingCheck(ap[i], bp[i]) :

				// Otherwise nodes in our document sort first
				ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
			};

			return doc;
		};

		Sizzle.matches = function (expr, elements) {
			return Sizzle(expr, null, null, elements);
		};

		Sizzle.matchesSelector = function (elem, expr) {
			// Set document vars if needed
			if ((elem.ownerDocument || elem) !== document) {
				setDocument(elem);
			}

			// Make sure that attribute selectors are quoted
			expr = expr.replace(rattributeQuotes, "='$1']");

			if (support.matchesSelector && documentIsHTML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {

				try {
					var ret = matches.call(elem, expr);

					// IE 9's matchesSelector returns false on disconnected nodes
					if (ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11) {
						return ret;
					}
				} catch (e) {}
			}

			return Sizzle(expr, document, null, [elem]).length > 0;
		};

		Sizzle.contains = function (context, elem) {
			// Set document vars if needed
			if ((context.ownerDocument || context) !== document) {
				setDocument(context);
			}
			return contains(context, elem);
		};

		Sizzle.attr = function (elem, name) {
			// Set document vars if needed
			if ((elem.ownerDocument || elem) !== document) {
				setDocument(elem);
			}

			var fn = Expr.attrHandle[name.toLowerCase()],

			// Don't get fooled by Object.prototype properties (jQuery #13807)
			val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : undefined;

			return val !== undefined ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
		};

		Sizzle.error = function (msg) {
			throw new Error("Syntax error, unrecognized expression: " + msg);
		};

		/**
   * Document sorting and removing duplicates
   * @param {ArrayLike} results
   */
		Sizzle.uniqueSort = function (results) {
			var elem,
			    duplicates = [],
			    j = 0,
			    i = 0;

			// Unless we *know* we can detect duplicates, assume their presence
			hasDuplicate = !support.detectDuplicates;
			sortInput = !support.sortStable && results.slice(0);
			results.sort(sortOrder);

			if (hasDuplicate) {
				while (elem = results[i++]) {
					if (elem === results[i]) {
						j = duplicates.push(i);
					}
				}
				while (j--) {
					results.splice(duplicates[j], 1);
				}
			}

			// Clear input after sorting to release objects
			// See https://github.com/jquery/sizzle/pull/225
			sortInput = null;

			return results;
		};

		/**
   * Utility function for retrieving the text value of an array of DOM nodes
   * @param {Array|Element} elem
   */
		getText = Sizzle.getText = function (elem) {
			var node,
			    ret = "",
			    i = 0,
			    nodeType = elem.nodeType;

			if (!nodeType) {
				// If no nodeType, this is expected to be an array
				while (node = elem[i++]) {
					// Do not traverse comment nodes
					ret += getText(node);
				}
			} else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
				// Use textContent for elements
				// innerText usage removed for consistency of new lines (jQuery #11153)
				if (typeof elem.textContent === "string") {
					return elem.textContent;
				} else {
					// Traverse its children
					for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
						ret += getText(elem);
					}
				}
			} else if (nodeType === 3 || nodeType === 4) {
				return elem.nodeValue;
			}
			// Do not include comment or processing instruction nodes

			return ret;
		};

		Expr = Sizzle.selectors = {

			// Can be adjusted by the user
			cacheLength: 50,

			createPseudo: markFunction,

			match: matchExpr,

			attrHandle: {},

			find: {},

			relative: {
				">": { dir: "parentNode", first: true },
				" ": { dir: "parentNode" },
				"+": { dir: "previousSibling", first: true },
				"~": { dir: "previousSibling" }
			},

			preFilter: {
				"ATTR": function ATTR(match) {
					match[1] = match[1].replace(runescape, funescape);

					// Move the given value to match[3] whether quoted or unquoted
					match[3] = (match[4] || match[5] || "").replace(runescape, funescape);

					if (match[2] === "~=") {
						match[3] = " " + match[3] + " ";
					}

					return match.slice(0, 4);
				},

				"CHILD": function CHILD(match) {
					/* matches from matchExpr["CHILD"]
     	1 type (only|nth|...)
     	2 what (child|of-type)
     	3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
     	4 xn-component of xn+y argument ([+-]?\d*n|)
     	5 sign of xn-component
     	6 x of xn-component
     	7 sign of y-component
     	8 y of y-component
     */
					match[1] = match[1].toLowerCase();

					if (match[1].slice(0, 3) === "nth") {
						// nth-* requires argument
						if (!match[3]) {
							Sizzle.error(match[0]);
						}

						// numeric x and y parameters for Expr.filter.CHILD
						// remember that false/true cast respectively to 0/1
						match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
						match[5] = +(match[7] + match[8] || match[3] === "odd");

						// other types prohibit arguments
					} else if (match[3]) {
						Sizzle.error(match[0]);
					}

					return match;
				},

				"PSEUDO": function PSEUDO(match) {
					var excess,
					    unquoted = !match[5] && match[2];

					if (matchExpr["CHILD"].test(match[0])) {
						return null;
					}

					// Accept quoted arguments as-is
					if (match[3] && match[4] !== undefined) {
						match[2] = match[4];

						// Strip excess characters from unquoted arguments
					} else if (unquoted && rpseudo.test(unquoted) && (
					// Get excess from tokenize (recursively)
					excess = tokenize(unquoted, true)) && (
					// advance to the next closing parenthesis
					excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {

						// excess is a negative index
						match[0] = match[0].slice(0, excess);
						match[2] = unquoted.slice(0, excess);
					}

					// Return only captures needed by the pseudo filter method (type and argument)
					return match.slice(0, 3);
				}
			},

			filter: {

				"TAG": function TAG(nodeNameSelector) {
					var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
					return nodeNameSelector === "*" ? function () {
						return true;
					} : function (elem) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
					};
				},

				"CLASS": function CLASS(className) {
					var pattern = classCache[className + " "];

					return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function (elem) {
						return pattern.test(typeof elem.className === "string" && elem.className || _typeof(elem.getAttribute) !== strundefined && elem.getAttribute("class") || "");
					});
				},

				"ATTR": function ATTR(name, operator, check) {
					return function (elem) {
						var result = Sizzle.attr(elem, name);

						if (result == null) {
							return operator === "!=";
						}
						if (!operator) {
							return true;
						}

						result += "";

						return operator === "=" ? result === check : operator === "!=" ? result !== check : operator === "^=" ? check && result.indexOf(check) === 0 : operator === "*=" ? check && result.indexOf(check) > -1 : operator === "$=" ? check && result.slice(-check.length) === check : operator === "~=" ? (" " + result + " ").indexOf(check) > -1 : operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" : false;
					};
				},

				"CHILD": function CHILD(type, what, argument, first, last) {
					var simple = type.slice(0, 3) !== "nth",
					    forward = type.slice(-4) !== "last",
					    ofType = what === "of-type";

					return first === 1 && last === 0 ?

					// Shortcut for :nth-*(n)
					function (elem) {
						return !!elem.parentNode;
					} : function (elem, context, xml) {
						var cache,
						    outerCache,
						    node,
						    diff,
						    nodeIndex,
						    start,
						    dir = simple !== forward ? "nextSibling" : "previousSibling",
						    parent = elem.parentNode,
						    name = ofType && elem.nodeName.toLowerCase(),
						    useCache = !xml && !ofType;

						if (parent) {

							// :(first|last|only)-(child|of-type)
							if (simple) {
								while (dir) {
									node = elem;
									while (node = node[dir]) {
										if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
											return false;
										}
									}
									// Reverse direction for :only-* (if we haven't yet done so)
									start = dir = type === "only" && !start && "nextSibling";
								}
								return true;
							}

							start = [forward ? parent.firstChild : parent.lastChild];

							// non-xml :nth-child(...) stores cache data on `parent`
							if (forward && useCache) {
								// Seek `elem` from a previously-cached index
								outerCache = parent[expando] || (parent[expando] = {});
								cache = outerCache[type] || [];
								nodeIndex = cache[0] === dirruns && cache[1];
								diff = cache[0] === dirruns && cache[2];
								node = nodeIndex && parent.childNodes[nodeIndex];

								while (node = ++nodeIndex && node && node[dir] || (

								// Fallback to seeking `elem` from the start
								diff = nodeIndex = 0) || start.pop()) {

									// When found, cache indexes on `parent` and break
									if (node.nodeType === 1 && ++diff && node === elem) {
										outerCache[type] = [dirruns, nodeIndex, diff];
										break;
									}
								}

								// Use previously-cached element index if available
							} else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
								diff = cache[1];

								// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
							} else {
								// Use the same loop as above to seek `elem` from the start
								while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) {

									if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
										// Cache the index of each encountered element
										if (useCache) {
											(node[expando] || (node[expando] = {}))[type] = [dirruns, diff];
										}

										if (node === elem) {
											break;
										}
									}
								}
							}

							// Incorporate the offset, then check against cycle size
							diff -= last;
							return diff === first || diff % first === 0 && diff / first >= 0;
						}
					};
				},

				"PSEUDO": function PSEUDO(pseudo, argument) {
					// pseudo-class names are case-insensitive
					// http://www.w3.org/TR/selectors/#pseudo-classes
					// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
					// Remember that setFilters inherits from pseudos
					var args,
					    fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo);

					// The user may use createPseudo to indicate that
					// arguments are needed to create the filter function
					// just as Sizzle does
					if (fn[expando]) {
						return fn(argument);
					}

					// But maintain support for old signatures
					if (fn.length > 1) {
						args = [pseudo, pseudo, "", argument];
						return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function (seed, matches) {
							var idx,
							    matched = fn(seed, argument),
							    i = matched.length;
							while (i--) {
								idx = indexOf.call(seed, matched[i]);
								seed[idx] = !(matches[idx] = matched[i]);
							}
						}) : function (elem) {
							return fn(elem, 0, args);
						};
					}

					return fn;
				}
			},

			pseudos: {
				// Potentially complex pseudos
				"not": markFunction(function (selector) {
					// Trim the selector passed to compile
					// to avoid treating leading and trailing
					// spaces as combinators
					var input = [],
					    results = [],
					    matcher = compile(selector.replace(rtrim, "$1"));

					return matcher[expando] ? markFunction(function (seed, matches, context, xml) {
						var elem,
						    unmatched = matcher(seed, null, xml, []),
						    i = seed.length;

						// Match elements unmatched by `matcher`
						while (i--) {
							if (elem = unmatched[i]) {
								seed[i] = !(matches[i] = elem);
							}
						}
					}) : function (elem, context, xml) {
						input[0] = elem;
						matcher(input, null, xml, results);
						return !results.pop();
					};
				}),

				"has": markFunction(function (selector) {
					return function (elem) {
						return Sizzle(selector, elem).length > 0;
					};
				}),

				"contains": markFunction(function (text) {
					return function (elem) {
						return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
					};
				}),

				// "Whether an element is represented by a :lang() selector
				// is based solely on the element's language value
				// being equal to the identifier C,
				// or beginning with the identifier C immediately followed by "-".
				// The matching of C against the element's language value is performed case-insensitively.
				// The identifier C does not have to be a valid language name."
				// http://www.w3.org/TR/selectors/#lang-pseudo
				"lang": markFunction(function (lang) {
					// lang value must be a valid identifier
					if (!ridentifier.test(lang || "")) {
						Sizzle.error("unsupported lang: " + lang);
					}
					lang = lang.replace(runescape, funescape).toLowerCase();
					return function (elem) {
						var elemLang;
						do {
							if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) {

								elemLang = elemLang.toLowerCase();
								return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
							}
						} while ((elem = elem.parentNode) && elem.nodeType === 1);
						return false;
					};
				}),

				// Miscellaneous
				"target": function target(elem) {
					var hash = window.location && window.location.hash;
					return hash && hash.slice(1) === elem.id;
				},

				"root": function root(elem) {
					return elem === docElem;
				},

				"focus": function focus(elem) {
					return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
				},

				// Boolean properties
				"enabled": function enabled(elem) {
					return elem.disabled === false;
				},

				"disabled": function disabled(elem) {
					return elem.disabled === true;
				},

				"checked": function checked(elem) {
					// In CSS3, :checked should return both checked and selected elements
					// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
					var nodeName = elem.nodeName.toLowerCase();
					return nodeName === "input" && !!elem.checked || nodeName === "option" && !!elem.selected;
				},

				"selected": function selected(elem) {
					// Accessing this property makes selected-by-default
					// options in Safari work properly
					if (elem.parentNode) {
						elem.parentNode.selectedIndex;
					}

					return elem.selected === true;
				},

				// Contents
				"empty": function empty(elem) {
					// http://www.w3.org/TR/selectors/#empty-pseudo
					// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
					//   but not by others (comment: 8; processing instruction: 7; etc.)
					// nodeType < 6 works because attributes (2) do not appear as children
					for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
						if (elem.nodeType < 6) {
							return false;
						}
					}
					return true;
				},

				"parent": function parent(elem) {
					return !Expr.pseudos["empty"](elem);
				},

				// Element/input types
				"header": function header(elem) {
					return rheader.test(elem.nodeName);
				},

				"input": function input(elem) {
					return rinputs.test(elem.nodeName);
				},

				"button": function button(elem) {
					var name = elem.nodeName.toLowerCase();
					return name === "input" && elem.type === "button" || name === "button";
				},

				"text": function text(elem) {
					var attr;
					return elem.nodeName.toLowerCase() === "input" && elem.type === "text" && (

					// Support: IE<8
					// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
					(attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
				},

				// Position-in-collection
				"first": createPositionalPseudo(function () {
					return [0];
				}),

				"last": createPositionalPseudo(function (matchIndexes, length) {
					return [length - 1];
				}),

				"eq": createPositionalPseudo(function (matchIndexes, length, argument) {
					return [argument < 0 ? argument + length : argument];
				}),

				"even": createPositionalPseudo(function (matchIndexes, length) {
					var i = 0;
					for (; i < length; i += 2) {
						matchIndexes.push(i);
					}
					return matchIndexes;
				}),

				"odd": createPositionalPseudo(function (matchIndexes, length) {
					var i = 1;
					for (; i < length; i += 2) {
						matchIndexes.push(i);
					}
					return matchIndexes;
				}),

				"lt": createPositionalPseudo(function (matchIndexes, length, argument) {
					var i = argument < 0 ? argument + length : argument;
					for (; --i >= 0;) {
						matchIndexes.push(i);
					}
					return matchIndexes;
				}),

				"gt": createPositionalPseudo(function (matchIndexes, length, argument) {
					var i = argument < 0 ? argument + length : argument;
					for (; ++i < length;) {
						matchIndexes.push(i);
					}
					return matchIndexes;
				})
			}
		};

		Expr.pseudos["nth"] = Expr.pseudos["eq"];

		// Add button/input type pseudos
		for (i in { radio: true, checkbox: true, file: true, password: true, image: true }) {
			Expr.pseudos[i] = createInputPseudo(i);
		}
		for (i in { submit: true, reset: true }) {
			Expr.pseudos[i] = createButtonPseudo(i);
		}

		// Easy API for creating new setFilters
		function setFilters() {}
		setFilters.prototype = Expr.filters = Expr.pseudos;
		Expr.setFilters = new setFilters();

		function tokenize(selector, parseOnly) {
			var matched,
			    match,
			    tokens,
			    type,
			    soFar,
			    groups,
			    preFilters,
			    cached = tokenCache[selector + " "];

			if (cached) {
				return parseOnly ? 0 : cached.slice(0);
			}

			soFar = selector;
			groups = [];
			preFilters = Expr.preFilter;

			while (soFar) {

				// Comma and first run
				if (!matched || (match = rcomma.exec(soFar))) {
					if (match) {
						// Don't consume trailing commas as valid
						soFar = soFar.slice(match[0].length) || soFar;
					}
					groups.push(tokens = []);
				}

				matched = false;

				// Combinators
				if (match = rcombinators.exec(soFar)) {
					matched = match.shift();
					tokens.push({
						value: matched,
						// Cast descendant combinators to space
						type: match[0].replace(rtrim, " ")
					});
					soFar = soFar.slice(matched.length);
				}

				// Filters
				for (type in Expr.filter) {
					if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
						matched = match.shift();
						tokens.push({
							value: matched,
							type: type,
							matches: match
						});
						soFar = soFar.slice(matched.length);
					}
				}

				if (!matched) {
					break;
				}
			}

			// Return the length of the invalid excess
			// if we're just parsing
			// Otherwise, throw an error or return tokens
			return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) :
			// Cache the tokens
			tokenCache(selector, groups).slice(0);
		}

		function toSelector(tokens) {
			var i = 0,
			    len = tokens.length,
			    selector = "";
			for (; i < len; i++) {
				selector += tokens[i].value;
			}
			return selector;
		}

		function addCombinator(matcher, combinator, base) {
			var dir = combinator.dir,
			    checkNonElements = base && dir === "parentNode",
			    doneName = done++;

			return combinator.first ?
			// Check against closest ancestor/preceding element
			function (elem, context, xml) {
				while (elem = elem[dir]) {
					if (elem.nodeType === 1 || checkNonElements) {
						return matcher(elem, context, xml);
					}
				}
			} :

			// Check against all ancestor/preceding elements
			function (elem, context, xml) {
				var oldCache,
				    outerCache,
				    newCache = [dirruns, doneName];

				// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
				if (xml) {
					while (elem = elem[dir]) {
						if (elem.nodeType === 1 || checkNonElements) {
							if (matcher(elem, context, xml)) {
								return true;
							}
						}
					}
				} else {
					while (elem = elem[dir]) {
						if (elem.nodeType === 1 || checkNonElements) {
							outerCache = elem[expando] || (elem[expando] = {});
							if ((oldCache = outerCache[dir]) && oldCache[0] === dirruns && oldCache[1] === doneName) {

								// Assign to newCache so results back-propagate to previous elements
								return newCache[2] = oldCache[2];
							} else {
								// Reuse newcache so results back-propagate to previous elements
								outerCache[dir] = newCache;

								// A match means we're done; a fail means we have to keep checking
								if (newCache[2] = matcher(elem, context, xml)) {
									return true;
								}
							}
						}
					}
				}
			};
		}

		function elementMatcher(matchers) {
			return matchers.length > 1 ? function (elem, context, xml) {
				var i = matchers.length;
				while (i--) {
					if (!matchers[i](elem, context, xml)) {
						return false;
					}
				}
				return true;
			} : matchers[0];
		}

		function condense(unmatched, map, filter, context, xml) {
			var elem,
			    newUnmatched = [],
			    i = 0,
			    len = unmatched.length,
			    mapped = map != null;

			for (; i < len; i++) {
				if (elem = unmatched[i]) {
					if (!filter || filter(elem, context, xml)) {
						newUnmatched.push(elem);
						if (mapped) {
							map.push(i);
						}
					}
				}
			}

			return newUnmatched;
		}

		function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
			if (postFilter && !postFilter[expando]) {
				postFilter = setMatcher(postFilter);
			}
			if (postFinder && !postFinder[expando]) {
				postFinder = setMatcher(postFinder, postSelector);
			}
			return markFunction(function (seed, results, context, xml) {
				var temp,
				    i,
				    elem,
				    preMap = [],
				    postMap = [],
				    preexisting = results.length,


				// Get initial elements from seed or context
				elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),


				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems,
				    matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || (seed ? preFilter : preexisting || postFilter) ?

				// ...intermediate processing is necessary
				[] :

				// ...otherwise use results directly
				results : matcherIn;

				// Find primary matches
				if (matcher) {
					matcher(matcherIn, matcherOut, context, xml);
				}

				// Apply postFilter
				if (postFilter) {
					temp = condense(matcherOut, postMap);
					postFilter(temp, [], context, xml);

					// Un-match failing elements by moving them back to matcherIn
					i = temp.length;
					while (i--) {
						if (elem = temp[i]) {
							matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
						}
					}
				}

				if (seed) {
					if (postFinder || preFilter) {
						if (postFinder) {
							// Get the final matcherOut by condensing this intermediate into postFinder contexts
							temp = [];
							i = matcherOut.length;
							while (i--) {
								if (elem = matcherOut[i]) {
									// Restore matcherIn since elem is not yet a final match
									temp.push(matcherIn[i] = elem);
								}
							}
							postFinder(null, matcherOut = [], temp, xml);
						}

						// Move matched elements from seed to results to keep them synchronized
						i = matcherOut.length;
						while (i--) {
							if ((elem = matcherOut[i]) && (temp = postFinder ? indexOf.call(seed, elem) : preMap[i]) > -1) {

								seed[temp] = !(results[temp] = elem);
							}
						}
					}

					// Add elements to results, through postFinder if defined
				} else {
					matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);
					if (postFinder) {
						postFinder(null, results, matcherOut, xml);
					} else {
						push.apply(results, matcherOut);
					}
				}
			});
		}

		function matcherFromTokens(tokens) {
			var checkContext,
			    matcher,
			    j,
			    len = tokens.length,
			    leadingRelative = Expr.relative[tokens[0].type],
			    implicitRelative = leadingRelative || Expr.relative[" "],
			    i = leadingRelative ? 1 : 0,


			// The foundational matcher ensures that elements are reachable from top-level context(s)
			matchContext = addCombinator(function (elem) {
				return elem === checkContext;
			}, implicitRelative, true),
			    matchAnyContext = addCombinator(function (elem) {
				return indexOf.call(checkContext, elem) > -1;
			}, implicitRelative, true),
			    matchers = [function (elem, context, xml) {
				return !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
			}];

			for (; i < len; i++) {
				if (matcher = Expr.relative[tokens[i].type]) {
					matchers = [addCombinator(elementMatcher(matchers), matcher)];
				} else {
					matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);

					// Return special upon seeing a positional matcher
					if (matcher[expando]) {
						// Find the next relative operator (if any) for proper handling
						j = ++i;
						for (; j < len; j++) {
							if (Expr.relative[tokens[j].type]) {
								break;
							}
						}
						return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice(0, i - 1).concat({ value: tokens[i - 2].type === " " ? "*" : "" })).replace(rtrim, "$1"), matcher, i < j && matcherFromTokens(tokens.slice(i, j)), j < len && matcherFromTokens(tokens = tokens.slice(j)), j < len && toSelector(tokens));
					}
					matchers.push(matcher);
				}
			}

			return elementMatcher(matchers);
		}

		function matcherFromGroupMatchers(elementMatchers, setMatchers) {
			var bySet = setMatchers.length > 0,
			    byElement = elementMatchers.length > 0,
			    superMatcher = function superMatcher(seed, context, xml, results, outermost) {
				var elem,
				    j,
				    matcher,
				    matchedCount = 0,
				    i = "0",
				    unmatched = seed && [],
				    setMatched = [],
				    contextBackup = outermostContext,

				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]("*", outermost),

				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1,
				    len = elems.length;

				if (outermost) {
					outermostContext = context !== document && context;
				}

				// Add elements passing elementMatchers directly to results
				// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
				// Support: IE<9, Safari
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
				for (; i !== len && (elem = elems[i]) != null; i++) {
					if (byElement && elem) {
						j = 0;
						while (matcher = elementMatchers[j++]) {
							if (matcher(elem, context, xml)) {
								results.push(elem);
								break;
							}
						}
						if (outermost) {
							dirruns = dirrunsUnique;
						}
					}

					// Track unmatched elements for set filters
					if (bySet) {
						// They will have gone through all possible matchers
						if (elem = !matcher && elem) {
							matchedCount--;
						}

						// Lengthen the array for every element, matched or not
						if (seed) {
							unmatched.push(elem);
						}
					}
				}

				// Apply set filters to unmatched elements
				matchedCount += i;
				if (bySet && i !== matchedCount) {
					j = 0;
					while (matcher = setMatchers[j++]) {
						matcher(unmatched, setMatched, context, xml);
					}

					if (seed) {
						// Reintegrate element matches to eliminate the need for sorting
						if (matchedCount > 0) {
							while (i--) {
								if (!(unmatched[i] || setMatched[i])) {
									setMatched[i] = pop.call(results);
								}
							}
						}

						// Discard index placeholder values to get only actual matches
						setMatched = condense(setMatched);
					}

					// Add matches to results
					push.apply(results, setMatched);

					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {

						Sizzle.uniqueSort(results);
					}
				}

				// Override manipulation of globals by nested matchers
				if (outermost) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}

				return unmatched;
			};

			return bySet ? markFunction(superMatcher) : superMatcher;
		}

		compile = Sizzle.compile = function (selector, group /* Internal Use Only */) {
			var i,
			    setMatchers = [],
			    elementMatchers = [],
			    cached = compilerCache[selector + " "];

			if (!cached) {
				// Generate a function of recursive functions that can be used to check each element
				if (!group) {
					group = tokenize(selector);
				}
				i = group.length;
				while (i--) {
					cached = matcherFromTokens(group[i]);
					if (cached[expando]) {
						setMatchers.push(cached);
					} else {
						elementMatchers.push(cached);
					}
				}

				// Cache the compiled function
				cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
			}
			return cached;
		};

		function multipleContexts(selector, contexts, results) {
			var i = 0,
			    len = contexts.length;
			for (; i < len; i++) {
				Sizzle(selector, contexts[i], results);
			}
			return results;
		}

		function select(selector, context, results, seed) {
			var i,
			    tokens,
			    token,
			    type,
			    find,
			    match = tokenize(selector);

			if (!seed) {
				// Try to minimize operations if there is only one group
				if (match.length === 1) {

					// Take a shortcut and set the context if the root selector is an ID
					tokens = match[0] = match[0].slice(0);
					if (tokens.length > 2 && (token = tokens[0]).type === "ID" && support.getById && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {

						context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];
						if (!context) {
							return results;
						}
						selector = selector.slice(tokens.shift().value.length);
					}

					// Fetch a seed set for right-to-left matching
					i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
					while (i--) {
						token = tokens[i];

						// Abort if we hit a combinator
						if (Expr.relative[type = token.type]) {
							break;
						}
						if (find = Expr.find[type]) {
							// Search, expanding context for leading sibling combinators
							if (seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context)) {

								// If seed is empty or no tokens remain, we can return early
								tokens.splice(i, 1);
								selector = seed.length && toSelector(tokens);
								if (!selector) {
									push.apply(results, seed);
									return results;
								}

								break;
							}
						}
					}
				}
			}

			// Compile and execute a filtering function
			// Provide `match` to avoid retokenization if we modified the selector above
			compile(selector, match)(seed, context, !documentIsHTML, results, rsibling.test(selector) && testContext(context.parentNode) || context);
			return results;
		}

		// One-time assignments

		// Sort stability
		support.sortStable = expando.split("").sort(sortOrder).join("") === expando;

		// Support: Chrome<14
		// Always assume duplicates if they aren't passed to the comparison function
		support.detectDuplicates = !!hasDuplicate;

		// Initialize against the default document
		setDocument();

		// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
		// Detached nodes confoundingly follow *each other*
		support.sortDetached = assert(function (div1) {
			// Should return 1, but returns 4 (following)
			return div1.compareDocumentPosition(document.createElement("div")) & 1;
		});

		// Support: IE<8
		// Prevent attribute/property "interpolation"
		// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
		if (!assert(function (div) {
			div.innerHTML = "<a href='#'></a>";
			return div.firstChild.getAttribute("href") === "#";
		})) {
			addHandle("type|href|height|width", function (elem, name, isXML) {
				if (!isXML) {
					return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
				}
			});
		}

		// Support: IE<9
		// Use defaultValue in place of getAttribute("value")
		if (!support.attributes || !assert(function (div) {
			div.innerHTML = "<input/>";
			div.firstChild.setAttribute("value", "");
			return div.firstChild.getAttribute("value") === "";
		})) {
			addHandle("value", function (elem, name, isXML) {
				if (!isXML && elem.nodeName.toLowerCase() === "input") {
					return elem.defaultValue;
				}
			});
		}

		// Support: IE<9
		// Use getAttributeNode to fetch booleans when getAttribute lies
		if (!assert(function (div) {
			return div.getAttribute("disabled") == null;
		})) {
			addHandle(booleans, function (elem, name, isXML) {
				var val;
				if (!isXML) {
					return elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
				}
			});
		}

		return Sizzle;
	}(window);

	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;
	jQuery.expr[":"] = jQuery.expr.pseudos;
	jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = Sizzle.getText;
	jQuery.isXMLDoc = Sizzle.isXML;
	jQuery.contains = Sizzle.contains;

	var rneedsContext = jQuery.expr.match.needsContext;

	var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;

	var risSimple = /^.[^:#\[\.,]*$/;

	// Implement the identical functionality for filter and not
	function winnow(elements, qualifier, not) {
		if (jQuery.isFunction(qualifier)) {
			return jQuery.grep(elements, function (elem, i) {
				/* jshint -W018 */
				return !!qualifier.call(elem, i, elem) !== not;
			});
		}

		if (qualifier.nodeType) {
			return jQuery.grep(elements, function (elem) {
				return elem === qualifier !== not;
			});
		}

		if (typeof qualifier === "string") {
			if (risSimple.test(qualifier)) {
				return jQuery.filter(qualifier, elements, not);
			}

			qualifier = jQuery.filter(qualifier, elements);
		}

		return jQuery.grep(elements, function (elem) {
			return jQuery.inArray(elem, qualifier) >= 0 !== not;
		});
	}

	jQuery.filter = function (expr, elems, not) {
		var elem = elems[0];

		if (not) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 && elem.nodeType === 1 ? jQuery.find.matchesSelector(elem, expr) ? [elem] : [] : jQuery.find.matches(expr, jQuery.grep(elems, function (elem) {
			return elem.nodeType === 1;
		}));
	};

	jQuery.fn.extend({
		find: function find(selector) {
			var i,
			    ret = [],
			    self = this,
			    len = self.length;

			if (typeof selector !== "string") {
				return this.pushStack(jQuery(selector).filter(function () {
					for (i = 0; i < len; i++) {
						if (jQuery.contains(self[i], this)) {
							return true;
						}
					}
				}));
			}

			for (i = 0; i < len; i++) {
				jQuery.find(selector, self[i], ret);
			}

			// Needed because $( selector, context ) becomes $( context ).find( selector )
			ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret);
			ret.selector = this.selector ? this.selector + " " + selector : selector;
			return ret;
		},
		filter: function filter(selector) {
			return this.pushStack(winnow(this, selector || [], false));
		},
		not: function not(selector) {
			return this.pushStack(winnow(this, selector || [], true));
		},
		is: function is(selector) {
			return !!winnow(this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test(selector) ? jQuery(selector) : selector || [], false).length;
		}
	});

	// Initialize a jQuery object


	// A central reference to the root jQuery(document)
	var rootjQuery,


	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,


	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
	    init = jQuery.fn.init = function (selector, context) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if (!selector) {
			return this;
		}

		// Handle HTML strings
		if (typeof selector === "string") {
			if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [null, selector, null];
			} else {
				match = rquickExpr.exec(selector);
			}

			// Match html or make sure no context is specified for #id
			if (match && (match[1] || !context)) {

				// HANDLE: $(html) -> $(array)
				if (match[1]) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, true));

					// HANDLE: $(html, props)
					if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
						for (match in context) {
							// Properties of context are called as methods if possible
							if (jQuery.isFunction(this[match])) {
								this[match](context[match]);

								// ...and otherwise set as attributes
							} else {
								this.attr(match, context[match]);
							}
						}
					}

					return this;

					// HANDLE: $(#id)
				} else {
					elem = document.getElementById(match[2]);

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if (elem && elem.parentNode) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if (elem.id !== match[2]) {
							return rootjQuery.find(selector);
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

				// HANDLE: $(expr, $(...))
			} else if (!context || context.jquery) {
				return (context || rootjQuery).find(selector);

				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor(context).find(selector);
			}

			// HANDLE: $(DOMElement)
		} else if (selector.nodeType) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

			// HANDLE: $(function)
			// Shortcut for document ready
		} else if (jQuery.isFunction(selector)) {
			return typeof rootjQuery.ready !== "undefined" ? rootjQuery.ready(selector) :
			// Execute immediately if ready is not present
			selector(jQuery);
		}

		if (selector.selector !== undefined) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray(selector, this);
	};

	// Give the init function the jQuery prototype for later instantiation
	init.prototype = jQuery.fn;

	// Initialize central reference
	rootjQuery = jQuery(document);

	var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

	jQuery.extend({
		dir: function dir(elem, _dir, until) {
			var matched = [],
			    cur = elem[_dir];

			while (cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery(cur).is(until))) {
				if (cur.nodeType === 1) {
					matched.push(cur);
				}
				cur = cur[_dir];
			}
			return matched;
		},

		sibling: function sibling(n, elem) {
			var r = [];

			for (; n; n = n.nextSibling) {
				if (n.nodeType === 1 && n !== elem) {
					r.push(n);
				}
			}

			return r;
		}
	});

	jQuery.fn.extend({
		has: function has(target) {
			var i,
			    targets = jQuery(target, this),
			    len = targets.length;

			return this.filter(function () {
				for (i = 0; i < len; i++) {
					if (jQuery.contains(this, targets[i])) {
						return true;
					}
				}
			});
		},

		closest: function closest(selectors, context) {
			var cur,
			    i = 0,
			    l = this.length,
			    matched = [],
			    pos = rneedsContext.test(selectors) || typeof selectors !== "string" ? jQuery(selectors, context || this.context) : 0;

			for (; i < l; i++) {
				for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
					// Always skip document fragments
					if (cur.nodeType < 11 && (pos ? pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 && jQuery.find.matchesSelector(cur, selectors))) {

						matched.push(cur);
						break;
					}
				}
			}

			return this.pushStack(matched.length > 1 ? jQuery.unique(matched) : matched);
		},

		// Determine the position of an element within
		// the matched set of elements
		index: function index(elem) {

			// No argument, return index in parent
			if (!elem) {
				return this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
			}

			// index in selector
			if (typeof elem === "string") {
				return jQuery.inArray(this[0], jQuery(elem));
			}

			// Locate the position of the desired element
			return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this);
		},

		add: function add(selector, context) {
			return this.pushStack(jQuery.unique(jQuery.merge(this.get(), jQuery(selector, context))));
		},

		addBack: function addBack(selector) {
			return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
		}
	});

	function sibling(cur, dir) {
		do {
			cur = cur[dir];
		} while (cur && cur.nodeType !== 1);

		return cur;
	}

	jQuery.each({
		parent: function parent(elem) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function parents(elem) {
			return jQuery.dir(elem, "parentNode");
		},
		parentsUntil: function parentsUntil(elem, i, until) {
			return jQuery.dir(elem, "parentNode", until);
		},
		next: function next(elem) {
			return sibling(elem, "nextSibling");
		},
		prev: function prev(elem) {
			return sibling(elem, "previousSibling");
		},
		nextAll: function nextAll(elem) {
			return jQuery.dir(elem, "nextSibling");
		},
		prevAll: function prevAll(elem) {
			return jQuery.dir(elem, "previousSibling");
		},
		nextUntil: function nextUntil(elem, i, until) {
			return jQuery.dir(elem, "nextSibling", until);
		},
		prevUntil: function prevUntil(elem, i, until) {
			return jQuery.dir(elem, "previousSibling", until);
		},
		siblings: function siblings(elem) {
			return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
		},
		children: function children(elem) {
			return jQuery.sibling(elem.firstChild);
		},
		contents: function contents(elem) {
			return jQuery.nodeName(elem, "iframe") ? elem.contentDocument || elem.contentWindow.document : jQuery.merge([], elem.childNodes);
		}
	}, function (name, fn) {
		jQuery.fn[name] = function (until, selector) {
			var ret = jQuery.map(this, fn, until);

			if (name.slice(-5) !== "Until") {
				selector = until;
			}

			if (selector && typeof selector === "string") {
				ret = jQuery.filter(selector, ret);
			}

			if (this.length > 1) {
				// Remove duplicates
				if (!guaranteedUnique[name]) {
					ret = jQuery.unique(ret);
				}

				// Reverse order for parents* and prev-derivatives
				if (rparentsprev.test(name)) {
					ret = ret.reverse();
				}
			}

			return this.pushStack(ret);
		};
	});
	var rnotwhite = /\S+/g;

	// String to Object options format cache
	var optionsCache = {};

	// Convert String-formatted options into Object-formatted ones and store in cache
	function createOptions(options) {
		var object = optionsCache[options] = {};
		jQuery.each(options.match(rnotwhite) || [], function (_, flag) {
			object[flag] = true;
		});
		return object;
	}

	/*
  * Create a callback list using the following parameters:
  *
  *	options: an optional list of space-separated options that will change how
  *			the callback list behaves or a more traditional option object
  *
  * By default a callback list will act like an event callback list and can be
  * "fired" multiple times.
  *
  * Possible options:
  *
  *	once:			will ensure the callback list can only be fired once (like a Deferred)
  *
  *	memory:			will keep track of previous values and will call any callback added
  *					after the list has been fired right away with the latest "memorized"
  *					values (like a Deferred)
  *
  *	unique:			will ensure a callback can only be added once (no duplicate in the list)
  *
  *	stopOnFalse:	interrupt callings when a callback returns false
  *
  */
	jQuery.Callbacks = function (options) {

		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ? optionsCache[options] || createOptions(options) : jQuery.extend({}, options);

		var // Flag to know if list is currently firing
		firing,

		// Last fire value (for non-forgettable lists)
		memory,

		// Flag to know if list was already fired
		_fired,

		// End of the loop when firing
		firingLength,

		// Index of currently firing callback (modified by remove if needed)
		firingIndex,

		// First callback to fire (used internally by add and fireWith)
		firingStart,

		// Actual callback list
		list = [],

		// Stack of fire calls for repeatable lists
		stack = !options.once && [],

		// Fire callbacks
		fire = function fire(data) {
			memory = options.memory && data;
			_fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for (; list && firingIndex < firingLength; firingIndex++) {
				if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if (list) {
				if (stack) {
					if (stack.length) {
						fire(stack.shift());
					}
				} else if (memory) {
					list = [];
				} else {
					self.disable();
				}
			}
		},

		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function add() {
				if (list) {
					// First, we save the current length
					var start = list.length;
					(function add(args) {
						jQuery.each(args, function (_, arg) {
							var type = jQuery.type(arg);
							if (type === "function") {
								if (!options.unique || !self.has(arg)) {
									list.push(arg);
								}
							} else if (arg && arg.length && type !== "string") {
								// Inspect recursively
								add(arg);
							}
						});
					})(arguments);
					// Do we need to add the callbacks to the
					// current firing batch?
					if (firing) {
						firingLength = list.length;
						// With memory, if we're not firing then
						// we should call right away
					} else if (memory) {
						firingStart = start;
						fire(memory);
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function remove() {
				if (list) {
					jQuery.each(arguments, function (_, arg) {
						var index;
						while ((index = jQuery.inArray(arg, list, index)) > -1) {
							list.splice(index, 1);
							// Handle firing indexes
							if (firing) {
								if (index <= firingLength) {
									firingLength--;
								}
								if (index <= firingIndex) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function has(fn) {
				return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
			},
			// Remove all callbacks from the list
			empty: function empty() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function disable() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function disabled() {
				return !list;
			},
			// Lock the list in its current state
			lock: function lock() {
				stack = undefined;
				if (!memory) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function locked() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function fireWith(context, args) {
				if (list && (!_fired || stack)) {
					args = args || [];
					args = [context, args.slice ? args.slice() : args];
					if (firing) {
						stack.push(args);
					} else {
						fire(args);
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function fire() {
				self.fireWith(this, arguments);
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function fired() {
				return !!_fired;
			}
		};

		return self;
	};

	jQuery.extend({

		Deferred: function Deferred(func) {
			var tuples = [
			// action, add listener, listener list, final state
			["resolve", "done", jQuery.Callbacks("once memory"), "resolved"], ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"], ["notify", "progress", jQuery.Callbacks("memory")]],
			    _state = "pending",
			    _promise = {
				state: function state() {
					return _state;
				},
				always: function always() {
					deferred.done(arguments).fail(arguments);
					return this;
				},
				then: function then() /* fnDone, fnFail, fnProgress */{
					var fns = arguments;
					return jQuery.Deferred(function (newDefer) {
						jQuery.each(tuples, function (i, tuple) {
							var fn = jQuery.isFunction(fns[i]) && fns[i];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[tuple[1]](function () {
								var returned = fn && fn.apply(this, arguments);
								if (returned && jQuery.isFunction(returned.promise)) {
									returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify);
								} else {
									newDefer[tuple[0] + "With"](this === _promise ? newDefer.promise() : this, fn ? [returned] : arguments);
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function promise(obj) {
					return obj != null ? jQuery.extend(obj, _promise) : _promise;
				}
			},
			    deferred = {};

			// Keep pipe for back-compat
			_promise.pipe = _promise.then;

			// Add list-specific methods
			jQuery.each(tuples, function (i, tuple) {
				var list = tuple[2],
				    stateString = tuple[3];

				// promise[ done | fail | progress ] = list.add
				_promise[tuple[1]] = list.add;

				// Handle state
				if (stateString) {
					list.add(function () {
						// state = [ resolved | rejected ]
						_state = stateString;

						// [ reject_list | resolve_list ].disable; progress_list.lock
					}, tuples[i ^ 1][2].disable, tuples[2][2].lock);
				}

				// deferred[ resolve | reject | notify ]
				deferred[tuple[0]] = function () {
					deferred[tuple[0] + "With"](this === deferred ? _promise : this, arguments);
					return this;
				};
				deferred[tuple[0] + "With"] = list.fireWith;
			});

			// Make the deferred a promise
			_promise.promise(deferred);

			// Call given func if any
			if (func) {
				func.call(deferred, deferred);
			}

			// All done!
			return deferred;
		},

		// Deferred helper
		when: function when(subordinate /* , ..., subordinateN */) {
			var i = 0,
			    resolveValues = _slice.call(arguments),
			    length = resolveValues.length,


			// the count of uncompleted subordinates
			remaining = length !== 1 || subordinate && jQuery.isFunction(subordinate.promise) ? length : 0,


			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),


			// Update function for both resolve and progress values
			updateFunc = function updateFunc(i, contexts, values) {
				return function (value) {
					contexts[i] = this;
					values[i] = arguments.length > 1 ? _slice.call(arguments) : value;
					if (values === progressValues) {
						deferred.notifyWith(contexts, values);
					} else if (! --remaining) {
						deferred.resolveWith(contexts, values);
					}
				};
			},
			    progressValues,
			    progressContexts,
			    resolveContexts;

			// add listeners to Deferred subordinates; treat others as resolved
			if (length > 1) {
				progressValues = new Array(length);
				progressContexts = new Array(length);
				resolveContexts = new Array(length);
				for (; i < length; i++) {
					if (resolveValues[i] && jQuery.isFunction(resolveValues[i].promise)) {
						resolveValues[i].promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFunc(i, progressContexts, progressValues));
					} else {
						--remaining;
					}
				}
			}

			// if we're not waiting on anything, resolve the master
			if (!remaining) {
				deferred.resolveWith(resolveContexts, resolveValues);
			}

			return deferred.promise();
		}
	});

	// The deferred used on DOM ready
	var readyList;

	jQuery.fn.ready = function (fn) {
		// Add the callback
		jQuery.ready.promise().done(fn);

		return this;
	};

	jQuery.extend({
		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,

		// A counter to track how many items to wait for before
		// the ready event fires. See #6781
		readyWait: 1,

		// Hold (or release) the ready event
		holdReady: function holdReady(hold) {
			if (hold) {
				jQuery.readyWait++;
			} else {
				jQuery.ready(true);
			}
		},

		// Handle when the DOM is ready
		ready: function ready(wait) {

			// Abort if there are pending holds or we're already ready
			if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
				return;
			}

			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if (!document.body) {
				return setTimeout(jQuery.ready);
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if (wait !== true && --jQuery.readyWait > 0) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith(document, [jQuery]);

			// Trigger any bound ready events
			if (jQuery.fn.trigger) {
				jQuery(document).trigger("ready").off("ready");
			}
		}
	});

	/**
  * Clean-up method for dom ready events
  */
	function detach() {
		if (document.addEventListener) {
			document.removeEventListener("DOMContentLoaded", completed, false);
			window.removeEventListener("load", completed, false);
		} else {
			document.detachEvent("onreadystatechange", completed);
			window.detachEvent("onload", completed);
		}
	}

	/**
  * The ready event handler and self cleanup method
  */
	function completed() {
		// readyState === "complete" is good enough for us to call the dom ready in oldIE
		if (document.addEventListener || event.type === "load" || document.readyState === "complete") {
			detach();
			jQuery.ready();
		}
	}

	jQuery.ready.promise = function (obj) {
		if (!readyList) {

			readyList = jQuery.Deferred();

			// Catch cases where $(document).ready() is called after the browser event has already occurred.
			// we once tried to use readyState "interactive" here, but it caused issues like the one
			// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
			if (document.readyState === "complete") {
				// Handle it asynchronously to allow scripts the opportunity to delay ready
				setTimeout(jQuery.ready);

				// Standards-based browsers support DOMContentLoaded
			} else if (document.addEventListener) {
				// Use the handy event callback
				document.addEventListener("DOMContentLoaded", completed, false);

				// A fallback to window.onload, that will always work
				window.addEventListener("load", completed, false);

				// If IE event model is used
			} else {
				// Ensure firing before onload, maybe late but safe also for iframes
				document.attachEvent("onreadystatechange", completed);

				// A fallback to window.onload, that will always work
				window.attachEvent("onload", completed);

				// If IE and not a frame
				// continually check to see if the document is ready
				var top = false;

				try {
					top = window.frameElement == null && document.documentElement;
				} catch (e) {}

				if (top && top.doScroll) {
					(function doScrollCheck() {
						if (!jQuery.isReady) {

							try {
								// Use the trick by Diego Perini
								// http://javascript.nwbox.com/IEContentLoaded/
								top.doScroll("left");
							} catch (e) {
								return setTimeout(doScrollCheck, 50);
							}

							// detach all dom ready events
							detach();

							// and execute any waiting functions
							jQuery.ready();
						}
					})();
				}
			}
		}
		return readyList.promise(obj);
	};

	var strundefined =  true ? "undefined" : _typeof(undefined);

	// Support: IE<9
	// Iteration over object's inherited properties before its own
	var i;
	for (i in jQuery(support)) {
		break;
	}
	support.ownLast = i !== "0";

	// Note: most support tests are defined in their respective modules.
	// false until the test is run
	support.inlineBlockNeedsLayout = false;

	jQuery(function () {
		// We need to execute this one support test ASAP because we need to know
		// if body.style.zoom needs to be set.

		var container,
		    div,
		    body = document.getElementsByTagName("body")[0];

		if (!body) {
			// Return for frameset docs that don't have a body
			return;
		}

		// Setup
		container = document.createElement("div");
		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

		div = document.createElement("div");
		body.appendChild(container).appendChild(div);

		if (_typeof(div.style.zoom) !== strundefined) {
			// Support: IE<8
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			div.style.cssText = "border:0;margin:0;width:1px;padding:1px;display:inline;zoom:1";

			if (support.inlineBlockNeedsLayout = div.offsetWidth === 3) {
				// Prevent IE 6 from affecting layout for positioned elements #11048
				// Prevent IE from shrinking the body in IE 7 mode #12869
				// Support: IE<8
				body.style.zoom = 1;
			}
		}

		body.removeChild(container);

		// Null elements to avoid leaks in IE
		container = div = null;
	});

	(function () {
		var div = document.createElement("div");

		// Execute the test only if not already executed in another module.
		if (support.deleteExpando == null) {
			// Support: IE<9
			support.deleteExpando = true;
			try {
				delete div.test;
			} catch (e) {
				support.deleteExpando = false;
			}
		}

		// Null elements to avoid leaks in IE.
		div = null;
	})();

	/**
  * Determines whether an object can have data
  */
	jQuery.acceptData = function (elem) {
		var noData = jQuery.noData[(elem.nodeName + " ").toLowerCase()],
		    nodeType = +elem.nodeType || 1;

		// Do not set data on non-element DOM nodes because it will not be cleared (#8335).
		return nodeType !== 1 && nodeType !== 9 ? false :

		// Nodes accept data unless otherwise specified; rejection can be conditional
		!noData || noData !== true && elem.getAttribute("classid") === noData;
	};

	var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	    rmultiDash = /([A-Z])/g;

	function dataAttr(elem, key, data) {
		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if (data === undefined && elem.nodeType === 1) {

			var name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();

			data = elem.getAttribute(name);

			if (typeof data === "string") {
				try {
					data = data === "true" ? true : data === "false" ? false : data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data;
				} catch (e) {}

				// Make sure we set the data so it isn't changed later
				jQuery.data(elem, key, data);
			} else {
				data = undefined;
			}
		}

		return data;
	}

	// checks a cache object for emptiness
	function isEmptyDataObject(obj) {
		var name;
		for (name in obj) {

			// if the public data object is empty, the private is still empty
			if (name === "data" && jQuery.isEmptyObject(obj[name])) {
				continue;
			}
			if (name !== "toJSON") {
				return false;
			}
		}

		return true;
	}

	function internalData(elem, name, data, pvt /* Internal Use Only */) {
		if (!jQuery.acceptData(elem)) {
			return;
		}

		var ret,
		    thisCache,
		    internalKey = jQuery.expando,


		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,


		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,


		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[internalKey] : elem[internalKey] && internalKey;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ((!id || !cache[id] || !pvt && !cache[id].data) && data === undefined && typeof name === "string") {
			return;
		}

		if (!id) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if (isNode) {
				id = elem[internalKey] = deletedIds.pop() || jQuery.guid++;
			} else {
				id = internalKey;
			}
		}

		if (!cache[id]) {
			// Avoid exposing jQuery metadata on plain JS objects when the object
			// is serialized using JSON.stringify
			cache[id] = isNode ? {} : { toJSON: jQuery.noop };
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ((typeof name === "undefined" ? "undefined" : _typeof(name)) === "object" || typeof name === "function") {
			if (pvt) {
				cache[id] = jQuery.extend(cache[id], name);
			} else {
				cache[id].data = jQuery.extend(cache[id].data, name);
			}
		}

		thisCache = cache[id];

		// jQuery data() is stored in a separate object inside the object's internal data
		// cache in order to avoid key collisions between internal data and user-defined
		// data.
		if (!pvt) {
			if (!thisCache.data) {
				thisCache.data = {};
			}

			thisCache = thisCache.data;
		}

		if (data !== undefined) {
			thisCache[jQuery.camelCase(name)] = data;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if (typeof name === "string") {

			// First Try to find as-is property data
			ret = thisCache[name];

			// Test for null|undefined property data
			if (ret == null) {

				// Try to find the camelCased property
				ret = thisCache[jQuery.camelCase(name)];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	}

	function internalRemoveData(elem, name, pvt) {
		if (!jQuery.acceptData(elem)) {
			return;
		}

		var thisCache,
		    i,
		    isNode = elem.nodeType,


		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		    id = isNode ? elem[jQuery.expando] : jQuery.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if (!cache[id]) {
			return;
		}

		if (name) {

			thisCache = pvt ? cache[id] : cache[id].data;

			if (thisCache) {

				// Support array or space separated string names for data keys
				if (!jQuery.isArray(name)) {

					// try the string as a key before any manipulation
					if (name in thisCache) {
						name = [name];
					} else {

						// split the camel cased version by spaces unless a key with the spaces exists
						name = jQuery.camelCase(name);
						if (name in thisCache) {
							name = [name];
						} else {
							name = name.split(" ");
						}
					}
				} else {
					// If "name" is an array of keys...
					// When data is initially created, via ("key", "val") signature,
					// keys will be converted to camelCase.
					// Since there is no way to tell _how_ a key was added, remove
					// both plain key and camelCase key. #12786
					// This will only penalize the array argument path.
					name = name.concat(jQuery.map(name, jQuery.camelCase));
				}

				i = name.length;
				while (i--) {
					delete thisCache[name[i]];
				}

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if (pvt ? !isEmptyDataObject(thisCache) : !jQuery.isEmptyObject(thisCache)) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if (!pvt) {
			delete cache[id].data;

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if (!isEmptyDataObject(cache[id])) {
				return;
			}
		}

		// Destroy the cache
		if (isNode) {
			jQuery.cleanData([elem], true);

			// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
			/* jshint eqeqeq: false */
		} else if (support.deleteExpando || cache != cache.window) {
			/* jshint eqeqeq: true */
			delete cache[id];

			// When all else fails, null
		} else {
			cache[id] = null;
		}
	}

	jQuery.extend({
		cache: {},

		// The following elements (space-suffixed to avoid Object.prototype collisions)
		// throw uncatchable exceptions if you attempt to set expando properties
		noData: {
			"applet ": true,
			"embed ": true,
			// ...but Flash objects (which have this classid) *can* handle expandos
			"object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
		},

		hasData: function hasData(elem) {
			elem = elem.nodeType ? jQuery.cache[elem[jQuery.expando]] : elem[jQuery.expando];
			return !!elem && !isEmptyDataObject(elem);
		},

		data: function data(elem, name, _data) {
			return internalData(elem, name, _data);
		},

		removeData: function removeData(elem, name) {
			return internalRemoveData(elem, name);
		},

		// For internal use only.
		_data: function _data(elem, name, data) {
			return internalData(elem, name, data, true);
		},

		_removeData: function _removeData(elem, name) {
			return internalRemoveData(elem, name, true);
		}
	});

	jQuery.fn.extend({
		data: function data(key, value) {
			var i,
			    name,
			    data,
			    elem = this[0],
			    attrs = elem && elem.attributes;

			// Special expections of .data basically thwart jQuery.access,
			// so implement the relevant behavior ourselves

			// Gets all values
			if (key === undefined) {
				if (this.length) {
					data = jQuery.data(elem);

					if (elem.nodeType === 1 && !jQuery._data(elem, "parsedAttrs")) {
						i = attrs.length;
						while (i--) {
							name = attrs[i].name;

							if (name.indexOf("data-") === 0) {
								name = jQuery.camelCase(name.slice(5));

								dataAttr(elem, name, data[name]);
							}
						}
						jQuery._data(elem, "parsedAttrs", true);
					}
				}

				return data;
			}

			// Sets multiple values
			if ((typeof key === "undefined" ? "undefined" : _typeof(key)) === "object") {
				return this.each(function () {
					jQuery.data(this, key);
				});
			}

			return arguments.length > 1 ?

			// Sets one value
			this.each(function () {
				jQuery.data(this, key, value);
			}) :

			// Gets one value
			// Try to fetch any internally stored data first
			elem ? dataAttr(elem, key, jQuery.data(elem, key)) : undefined;
		},

		removeData: function removeData(key) {
			return this.each(function () {
				jQuery.removeData(this, key);
			});
		}
	});

	jQuery.extend({
		queue: function queue(elem, type, data) {
			var queue;

			if (elem) {
				type = (type || "fx") + "queue";
				queue = jQuery._data(elem, type);

				// Speed up dequeue by getting out quickly if this is just a lookup
				if (data) {
					if (!queue || jQuery.isArray(data)) {
						queue = jQuery._data(elem, type, jQuery.makeArray(data));
					} else {
						queue.push(data);
					}
				}
				return queue || [];
			}
		},

		dequeue: function dequeue(elem, type) {
			type = type || "fx";

			var queue = jQuery.queue(elem, type),
			    startLength = queue.length,
			    fn = queue.shift(),
			    hooks = jQuery._queueHooks(elem, type),
			    next = function next() {
				jQuery.dequeue(elem, type);
			};

			// If the fx queue is dequeued, always remove the progress sentinel
			if (fn === "inprogress") {
				fn = queue.shift();
				startLength--;
			}

			if (fn) {

				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if (type === "fx") {
					queue.unshift("inprogress");
				}

				// clear up the last queue stop function
				delete hooks.stop;
				fn.call(elem, next, hooks);
			}

			if (!startLength && hooks) {
				hooks.empty.fire();
			}
		},

		// not intended for public consumption - generates a queueHooks object, or returns the current one
		_queueHooks: function _queueHooks(elem, type) {
			var key = type + "queueHooks";
			return jQuery._data(elem, key) || jQuery._data(elem, key, {
				empty: jQuery.Callbacks("once memory").add(function () {
					jQuery._removeData(elem, type + "queue");
					jQuery._removeData(elem, key);
				})
			});
		}
	});

	jQuery.fn.extend({
		queue: function queue(type, data) {
			var setter = 2;

			if (typeof type !== "string") {
				data = type;
				type = "fx";
				setter--;
			}

			if (arguments.length < setter) {
				return jQuery.queue(this[0], type);
			}

			return data === undefined ? this : this.each(function () {
				var queue = jQuery.queue(this, type, data);

				// ensure a hooks for this queue
				jQuery._queueHooks(this, type);

				if (type === "fx" && queue[0] !== "inprogress") {
					jQuery.dequeue(this, type);
				}
			});
		},
		dequeue: function dequeue(type) {
			return this.each(function () {
				jQuery.dequeue(this, type);
			});
		},
		clearQueue: function clearQueue(type) {
			return this.queue(type || "fx", []);
		},
		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function promise(type, obj) {
			var tmp,
			    count = 1,
			    defer = jQuery.Deferred(),
			    elements = this,
			    i = this.length,
			    resolve = function resolve() {
				if (! --count) {
					defer.resolveWith(elements, [elements]);
				}
			};

			if (typeof type !== "string") {
				obj = type;
				type = undefined;
			}
			type = type || "fx";

			while (i--) {
				tmp = jQuery._data(elements[i], type + "queueHooks");
				if (tmp && tmp.empty) {
					count++;
					tmp.empty.add(resolve);
				}
			}
			resolve();
			return defer.promise(obj);
		}
	});
	var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;

	var cssExpand = ["Top", "Right", "Bottom", "Left"];

	var isHidden = function isHidden(elem, el) {
		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css(elem, "display") === "none" || !jQuery.contains(elem.ownerDocument, elem);
	};

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access = jQuery.access = function (elems, fn, key, value, chainable, emptyGet, raw) {
		var i = 0,
		    length = elems.length,
		    bulk = key == null;

		// Sets many values
		if (jQuery.type(key) === "object") {
			chainable = true;
			for (i in key) {
				jQuery.access(elems, fn, i, key[i], true, emptyGet, raw);
			}

			// Sets one value
		} else if (value !== undefined) {
			chainable = true;

			if (!jQuery.isFunction(value)) {
				raw = true;
			}

			if (bulk) {
				// Bulk operations run against the entire set
				if (raw) {
					fn.call(elems, value);
					fn = null;

					// ...except when executing function values
				} else {
					bulk = fn;
					fn = function fn(elem, key, value) {
						return bulk.call(jQuery(elem), value);
					};
				}
			}

			if (fn) {
				for (; i < length; i++) {
					fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
				}
			}
		}

		return chainable ? elems :

		// Gets
		bulk ? fn.call(elems) : length ? fn(elems[0], key) : emptyGet;
	};
	var rcheckableType = /^(?:checkbox|radio)$/i;

	(function () {
		var fragment = document.createDocumentFragment(),
		    div = document.createElement("div"),
		    input = document.createElement("input");

		// Setup
		div.setAttribute("className", "t");
		div.innerHTML = "  <link/><table></table><a href='/a'>a</a>";

		// IE strips leading whitespace when .innerHTML is used
		support.leadingWhitespace = div.firstChild.nodeType === 3;

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		support.tbody = !div.getElementsByTagName("tbody").length;

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		support.htmlSerialize = !!div.getElementsByTagName("link").length;

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		support.html5Clone = document.createElement("nav").cloneNode(true).outerHTML !== "<:nav></:nav>";

		// Check if a disconnected checkbox will retain its checked
		// value of true after appended to the DOM (IE6/7)
		input.type = "checkbox";
		input.checked = true;
		fragment.appendChild(input);
		support.appendChecked = input.checked;

		// Make sure textarea (and checkbox) defaultValue is properly cloned
		// Support: IE6-IE11+
		div.innerHTML = "<textarea>x</textarea>";
		support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;

		// #11217 - WebKit loses check when the name is after the checked attribute
		fragment.appendChild(div);
		div.innerHTML = "<input type='radio' checked='checked' name='t'/>";

		// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
		// old WebKit doesn't clone checked state correctly in fragments
		support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;

		// Support: IE<9
		// Opera does not clone events (and typeof div.attachEvent === undefined).
		// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
		support.noCloneEvent = true;
		if (div.attachEvent) {
			div.attachEvent("onclick", function () {
				support.noCloneEvent = false;
			});

			div.cloneNode(true).click();
		}

		// Execute the test only if not already executed in another module.
		if (support.deleteExpando == null) {
			// Support: IE<9
			support.deleteExpando = true;
			try {
				delete div.test;
			} catch (e) {
				support.deleteExpando = false;
			}
		}

		// Null elements to avoid leaks in IE.
		fragment = div = input = null;
	})();

	(function () {
		var i,
		    eventName,
		    div = document.createElement("div");

		// Support: IE<9 (lack submit/change bubble), Firefox 23+ (lack focusin event)
		for (i in { submit: true, change: true, focusin: true }) {
			eventName = "on" + i;

			if (!(support[i + "Bubbles"] = eventName in window)) {
				// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
				div.setAttribute(eventName, "t");
				support[i + "Bubbles"] = div.attributes[eventName].expando === false;
			}
		}

		// Null elements to avoid leaks in IE.
		div = null;
	})();

	var rformElems = /^(?:input|select|textarea)$/i,
	    rkeyEvent = /^key/,
	    rmouseEvent = /^(?:mouse|contextmenu)|click/,
	    rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	    rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

	function returnTrue() {
		return true;
	}

	function returnFalse() {
		return false;
	}

	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch (err) {}
	}

	/*
  * Helper functions for managing events -- not part of the public interface.
  * Props to Dean Edwards' addEvent library for many of the ideas.
  */
	jQuery.event = {

		global: {},

		add: function add(elem, types, handler, data, selector) {
			var tmp,
			    events,
			    t,
			    handleObjIn,
			    special,
			    eventHandle,
			    handleObj,
			    handlers,
			    type,
			    namespaces,
			    origType,
			    elemData = jQuery._data(elem);

			// Don't attach events to noData or text/comment nodes (but allow plain objects)
			if (!elemData) {
				return;
			}

			// Caller can pass in an object of custom data in lieu of the handler
			if (handler.handler) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}

			// Make sure that the handler has a unique ID, used to find/remove it later
			if (!handler.guid) {
				handler.guid = jQuery.guid++;
			}

			// Init the element's event structure and main handler, if this is the first
			if (!(events = elemData.events)) {
				events = elemData.events = {};
			}
			if (!(eventHandle = elemData.handle)) {
				eventHandle = elemData.handle = function (e) {
					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return (typeof jQuery === "undefined" ? "undefined" : _typeof(jQuery)) !== strundefined && (!e || jQuery.event.triggered !== e.type) ? jQuery.event.dispatch.apply(eventHandle.elem, arguments) : undefined;
				};
				// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
				eventHandle.elem = elem;
			}

			// Handle multiple events separated by a space
			types = (types || "").match(rnotwhite) || [""];
			t = types.length;
			while (t--) {
				tmp = rtypenamespace.exec(types[t]) || [];
				type = origType = tmp[1];
				namespaces = (tmp[2] || "").split(".").sort();

				// There *must* be a type, no attaching namespace-only handlers
				if (!type) {
					continue;
				}

				// If event changes its type, use the special event handlers for the changed type
				special = jQuery.event.special[type] || {};

				// If selector defined, determine special event api type, otherwise given type
				type = (selector ? special.delegateType : special.bindType) || type;

				// Update special based on newly reset type
				special = jQuery.event.special[type] || {};

				// handleObj is passed to all event handlers
				handleObj = jQuery.extend({
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && jQuery.expr.match.needsContext.test(selector),
					namespace: namespaces.join(".")
				}, handleObjIn);

				// Init the event handler queue if we're the first
				if (!(handlers = events[type])) {
					handlers = events[type] = [];
					handlers.delegateCount = 0;

					// Only use addEventListener/attachEvent if the special events handler returns false
					if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
						// Bind the global event handler to the element
						if (elem.addEventListener) {
							elem.addEventListener(type, eventHandle, false);
						} else if (elem.attachEvent) {
							elem.attachEvent("on" + type, eventHandle);
						}
					}
				}

				if (special.add) {
					special.add.call(elem, handleObj);

					if (!handleObj.handler.guid) {
						handleObj.handler.guid = handler.guid;
					}
				}

				// Add to the element's handler list, delegates in front
				if (selector) {
					handlers.splice(handlers.delegateCount++, 0, handleObj);
				} else {
					handlers.push(handleObj);
				}

				// Keep track of which events have ever been used, for event optimization
				jQuery.event.global[type] = true;
			}

			// Nullify elem to prevent memory leaks in IE
			elem = null;
		},

		// Detach an event or set of events from an element
		remove: function remove(elem, types, handler, selector, mappedTypes) {
			var j,
			    handleObj,
			    tmp,
			    origCount,
			    t,
			    events,
			    special,
			    handlers,
			    type,
			    namespaces,
			    origType,
			    elemData = jQuery.hasData(elem) && jQuery._data(elem);

			if (!elemData || !(events = elemData.events)) {
				return;
			}

			// Once for each type.namespace in types; type may be omitted
			types = (types || "").match(rnotwhite) || [""];
			t = types.length;
			while (t--) {
				tmp = rtypenamespace.exec(types[t]) || [];
				type = origType = tmp[1];
				namespaces = (tmp[2] || "").split(".").sort();

				// Unbind all events (on this namespace, if provided) for the element
				if (!type) {
					for (type in events) {
						jQuery.event.remove(elem, type + types[t], handler, selector, true);
					}
					continue;
				}

				special = jQuery.event.special[type] || {};
				type = (selector ? special.delegateType : special.bindType) || type;
				handlers = events[type] || [];
				tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");

				// Remove matching events
				origCount = j = handlers.length;
				while (j--) {
					handleObj = handlers[j];

					if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
						handlers.splice(j, 1);

						if (handleObj.selector) {
							handlers.delegateCount--;
						}
						if (special.remove) {
							special.remove.call(elem, handleObj);
						}
					}
				}

				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if (origCount && !handlers.length) {
					if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
						jQuery.removeEvent(elem, type, elemData.handle);
					}

					delete events[type];
				}
			}

			// Remove the expando if it's no longer used
			if (jQuery.isEmptyObject(events)) {
				delete elemData.handle;

				// removeData also checks for emptiness and clears the expando if empty
				// so use it instead of delete
				jQuery._removeData(elem, "events");
			}
		},

		trigger: function trigger(event, data, elem, onlyHandlers) {
			var handle,
			    ontype,
			    cur,
			    bubbleType,
			    special,
			    tmp,
			    i,
			    eventPath = [elem || document],
			    type = hasOwn.call(event, "type") ? event.type : event,
			    namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];

			cur = tmp = elem = elem || document;

			// Don't do events on text and comment nodes
			if (elem.nodeType === 3 || elem.nodeType === 8) {
				return;
			}

			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if (rfocusMorph.test(type + jQuery.event.triggered)) {
				return;
			}

			if (type.indexOf(".") >= 0) {
				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split(".");
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf(":") < 0 && "on" + type;

			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[jQuery.expando] ? event : new jQuery.Event(type, (typeof event === "undefined" ? "undefined" : _typeof(event)) === "object" && event);

			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join(".");
			event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;

			// Clean up the event in case it is being reused
			event.result = undefined;
			if (!event.target) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ? [event] : jQuery.makeArray(data, [event]);

			// Allow special events to draw outside the lines
			special = jQuery.event.special[type] || {};
			if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
				return;
			}

			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {

				bubbleType = special.delegateType || type;
				if (!rfocusMorph.test(bubbleType + type)) {
					cur = cur.parentNode;
				}
				for (; cur; cur = cur.parentNode) {
					eventPath.push(cur);
					tmp = cur;
				}

				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if (tmp === (elem.ownerDocument || document)) {
					eventPath.push(tmp.defaultView || tmp.parentWindow || window);
				}
			}

			// Fire handlers on the event path
			i = 0;
			while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {

				event.type = i > 1 ? bubbleType : special.bindType || type;

				// jQuery handler
				handle = (jQuery._data(cur, "events") || {})[event.type] && jQuery._data(cur, "handle");
				if (handle) {
					handle.apply(cur, data);
				}

				// Native handler
				handle = ontype && cur[ontype];
				if (handle && handle.apply && jQuery.acceptData(cur)) {
					event.result = handle.apply(cur, data);
					if (event.result === false) {
						event.preventDefault();
					}
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			if (!onlyHandlers && !event.isDefaultPrevented()) {

				if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && jQuery.acceptData(elem)) {

					// Call a native DOM method on the target with the same name name as the event.
					// Can't use an .isFunction() check here because IE6/7 fails that test.
					// Don't do default actions on window, that's where global variables be (#6170)
					if (ontype && elem[type] && !jQuery.isWindow(elem)) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ontype];

						if (tmp) {
							elem[ontype] = null;
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;
						try {
							elem[type]();
						} catch (e) {
							// IE<9 dies on focus/blur to hidden element (#1486,#12518)
							// only reproducible on winXP IE8 native, not IE9 in IE8 mode
						}
						jQuery.event.triggered = undefined;

						if (tmp) {
							elem[ontype] = tmp;
						}
					}
				}
			}

			return event.result;
		},

		dispatch: function dispatch(event) {

			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix(event);

			var i,
			    ret,
			    handleObj,
			    matched,
			    j,
			    handlerQueue = [],
			    args = _slice.call(arguments),
			    handlers = (jQuery._data(this, "events") || {})[event.type] || [],
			    special = jQuery.event.special[event.type] || {};

			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[0] = event;
			event.delegateTarget = this;

			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if (special.preDispatch && special.preDispatch.call(this, event) === false) {
				return;
			}

			// Determine handlers
			handlerQueue = jQuery.event.handlers.call(this, event, handlers);

			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
				event.currentTarget = matched.elem;

				j = 0;
				while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {

					// Triggered event must either 1) have no namespace, or
					// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
					if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {

						event.handleObj = handleObj;
						event.data = handleObj.data;

						ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);

						if (ret !== undefined) {
							if ((event.result = ret) === false) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}

			// Call the postDispatch hook for the mapped type
			if (special.postDispatch) {
				special.postDispatch.call(this, event);
			}

			return event.result;
		},

		handlers: function handlers(event, _handlers) {
			var sel,
			    handleObj,
			    matches,
			    i,
			    handlerQueue = [],
			    delegateCount = _handlers.delegateCount,
			    cur = event.target;

			// Find delegate handlers
			// Black-hole SVG <use> instance trees (#13180)
			// Avoid non-left-click bubbling in Firefox (#3861)
			if (delegateCount && cur.nodeType && (!event.button || event.type !== "click")) {

				/* jshint eqeqeq: false */
				for (; cur != this; cur = cur.parentNode || this) {
					/* jshint eqeqeq: true */

					// Don't check non-elements (#13208)
					// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
					if (cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click")) {
						matches = [];
						for (i = 0; i < delegateCount; i++) {
							handleObj = _handlers[i];

							// Don't conflict with Object.prototype properties (#13203)
							sel = handleObj.selector + " ";

							if (matches[sel] === undefined) {
								matches[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) >= 0 : jQuery.find(sel, this, null, [cur]).length;
							}
							if (matches[sel]) {
								matches.push(handleObj);
							}
						}
						if (matches.length) {
							handlerQueue.push({ elem: cur, handlers: matches });
						}
					}
				}
			}

			// Add the remaining (directly-bound) handlers
			if (delegateCount < _handlers.length) {
				handlerQueue.push({ elem: this, handlers: _handlers.slice(delegateCount) });
			}

			return handlerQueue;
		},

		fix: function fix(event) {
			if (event[jQuery.expando]) {
				return event;
			}

			// Create a writable copy of the event object and normalize some properties
			var i,
			    prop,
			    copy,
			    type = event.type,
			    originalEvent = event,
			    fixHook = this.fixHooks[type];

			if (!fixHook) {
				this.fixHooks[type] = fixHook = rmouseEvent.test(type) ? this.mouseHooks : rkeyEvent.test(type) ? this.keyHooks : {};
			}
			copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;

			event = new jQuery.Event(originalEvent);

			i = copy.length;
			while (i--) {
				prop = copy[i];
				event[prop] = originalEvent[prop];
			}

			// Support: IE<9
			// Fix target property (#1925)
			if (!event.target) {
				event.target = originalEvent.srcElement || document;
			}

			// Support: Chrome 23+, Safari?
			// Target should not be a text node (#504, #13143)
			if (event.target.nodeType === 3) {
				event.target = event.target.parentNode;
			}

			// Support: IE<9
			// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
			event.metaKey = !!event.metaKey;

			return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
		},

		// Includes some event props shared by KeyEvent and MouseEvent
		props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

		fixHooks: {},

		keyHooks: {
			props: "char charCode key keyCode".split(" "),
			filter: function filter(event, original) {

				// Add which for key events
				if (event.which == null) {
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}

				return event;
			}
		},

		mouseHooks: {
			props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
			filter: function filter(event, original) {
				var body,
				    eventDoc,
				    doc,
				    button = original.button,
				    fromElement = original.fromElement;

				// Calculate pageX/Y if missing and clientX/Y available
				if (event.pageX == null && original.clientX != null) {
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;

					event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
					event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
				}

				// Add relatedTarget, if necessary
				if (!event.relatedTarget && fromElement) {
					event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
				}

				// Add which for click: 1 === left; 2 === middle; 3 === right
				// Note: button is not normalized, so don't use it
				if (!event.which && button !== undefined) {
					event.which = button & 1 ? 1 : button & 2 ? 3 : button & 4 ? 2 : 0;
				}

				return event;
			}
		},

		special: {
			load: {
				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {
				// Fire native event if possible so blur/focus sequence is correct
				trigger: function trigger() {
					if (this !== safeActiveElement() && this.focus) {
						try {
							this.focus();
							return false;
						} catch (e) {
							// Support: IE<9
							// If we error on focus to hidden element (#1486, #12518),
							// let .trigger() run the handlers
						}
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function trigger() {
					if (this === safeActiveElement() && this.blur) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {
				// For checkbox, fire native event so checked state will be right
				trigger: function trigger() {
					if (jQuery.nodeName(this, "input") && this.type === "checkbox" && this.click) {
						this.click();
						return false;
					}
				},

				// For cross-browser consistency, don't fire native .click() on links
				_default: function _default(event) {
					return jQuery.nodeName(event.target, "a");
				}
			},

			beforeunload: {
				postDispatch: function postDispatch(event) {

					// Even when returnValue equals to undefined Firefox will still show alert
					if (event.result !== undefined) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		},

		simulate: function simulate(type, elem, event, bubble) {
			// Piggyback on a donor event to simulate a different one.
			// Fake originalEvent to avoid donor's stopPropagation, but if the
			// simulated event prevents default then we do the same on the donor.
			var e = jQuery.extend(new jQuery.Event(), event, {
				type: type,
				isSimulated: true,
				originalEvent: {}
			});
			if (bubble) {
				jQuery.event.trigger(e, null, elem);
			} else {
				jQuery.event.dispatch.call(elem, e);
			}
			if (e.isDefaultPrevented()) {
				event.preventDefault();
			}
		}
	};

	jQuery.removeEvent = document.removeEventListener ? function (elem, type, handle) {
		if (elem.removeEventListener) {
			elem.removeEventListener(type, handle, false);
		}
	} : function (elem, type, handle) {
		var name = "on" + type;

		if (elem.detachEvent) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if (_typeof(elem[name]) === strundefined) {
				elem[name] = null;
			}

			elem.detachEvent(name, handle);
		}
	};

	jQuery.Event = function (src, props) {
		// Allow instantiation without the 'new' keyword
		if (!(this instanceof jQuery.Event)) {
			return new jQuery.Event(src, props);
		}

		// Event object
		if (src && src.type) {
			this.originalEvent = src;
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === undefined && (
			// Support: IE < 9
			src.returnValue === false ||
			// Support: Android < 4.0
			src.getPreventDefault && src.getPreventDefault()) ? returnTrue : returnFalse;

			// Event type
		} else {
			this.type = src;
		}

		// Put explicitly provided properties onto the event object
		if (props) {
			jQuery.extend(this, props);
		}

		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || jQuery.now();

		// Mark it as fixed
		this[jQuery.expando] = true;
	};

	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,

		preventDefault: function preventDefault() {
			var e = this.originalEvent;

			this.isDefaultPrevented = returnTrue;
			if (!e) {
				return;
			}

			// If preventDefault exists, run it on the original event
			if (e.preventDefault) {
				e.preventDefault();

				// Support: IE
				// Otherwise set the returnValue property of the original event to false
			} else {
				e.returnValue = false;
			}
		},
		stopPropagation: function stopPropagation() {
			var e = this.originalEvent;

			this.isPropagationStopped = returnTrue;
			if (!e) {
				return;
			}
			// If stopPropagation exists, run it on the original event
			if (e.stopPropagation) {
				e.stopPropagation();
			}

			// Support: IE
			// Set the cancelBubble property of the original event to true
			e.cancelBubble = true;
		},
		stopImmediatePropagation: function stopImmediatePropagation() {
			this.isImmediatePropagationStopped = returnTrue;
			this.stopPropagation();
		}
	};

	// Create mouseenter/leave events using mouseover/out and event-time checks
	jQuery.each({
		mouseenter: "mouseover",
		mouseleave: "mouseout"
	}, function (orig, fix) {
		jQuery.event.special[orig] = {
			delegateType: fix,
			bindType: fix,

			handle: function handle(event) {
				var ret,
				    target = this,
				    related = event.relatedTarget,
				    handleObj = event.handleObj;

				// For mousenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if (!related || related !== target && !jQuery.contains(target, related)) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply(this, arguments);
					event.type = fix;
				}
				return ret;
			}
		};
	});

	// IE submit delegation
	if (!support.submitBubbles) {

		jQuery.event.special.submit = {
			setup: function setup() {
				// Only need this for delegated form submit events
				if (jQuery.nodeName(this, "form")) {
					return false;
				}

				// Lazy-add a submit handler when a descendant form may potentially be submitted
				jQuery.event.add(this, "click._submit keypress._submit", function (e) {
					// Node name check avoids a VML-related crash in IE (#9807)
					var elem = e.target,
					    form = jQuery.nodeName(elem, "input") || jQuery.nodeName(elem, "button") ? elem.form : undefined;
					if (form && !jQuery._data(form, "submitBubbles")) {
						jQuery.event.add(form, "submit._submit", function (event) {
							event._submit_bubble = true;
						});
						jQuery._data(form, "submitBubbles", true);
					}
				});
				// return undefined since we don't need an event listener
			},

			postDispatch: function postDispatch(event) {
				// If form was submitted by the user, bubble the event up the tree
				if (event._submit_bubble) {
					delete event._submit_bubble;
					if (this.parentNode && !event.isTrigger) {
						jQuery.event.simulate("submit", this.parentNode, event, true);
					}
				}
			},

			teardown: function teardown() {
				// Only need this for delegated form submit events
				if (jQuery.nodeName(this, "form")) {
					return false;
				}

				// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
				jQuery.event.remove(this, "._submit");
			}
		};
	}

	// IE change delegation and checkbox/radio fix
	if (!support.changeBubbles) {

		jQuery.event.special.change = {

			setup: function setup() {

				if (rformElems.test(this.nodeName)) {
					// IE doesn't fire change on a check/radio until blur; trigger it on click
					// after a propertychange. Eat the blur-change in special.change.handle.
					// This still fires onchange a second time for check/radio after blur.
					if (this.type === "checkbox" || this.type === "radio") {
						jQuery.event.add(this, "propertychange._change", function (event) {
							if (event.originalEvent.propertyName === "checked") {
								this._just_changed = true;
							}
						});
						jQuery.event.add(this, "click._change", function (event) {
							if (this._just_changed && !event.isTrigger) {
								this._just_changed = false;
							}
							// Allow triggered, simulated change events (#11500)
							jQuery.event.simulate("change", this, event, true);
						});
					}
					return false;
				}
				// Delegated event; lazy-add a change handler on descendant inputs
				jQuery.event.add(this, "beforeactivate._change", function (e) {
					var elem = e.target;

					if (rformElems.test(elem.nodeName) && !jQuery._data(elem, "changeBubbles")) {
						jQuery.event.add(elem, "change._change", function (event) {
							if (this.parentNode && !event.isSimulated && !event.isTrigger) {
								jQuery.event.simulate("change", this.parentNode, event, true);
							}
						});
						jQuery._data(elem, "changeBubbles", true);
					}
				});
			},

			handle: function handle(event) {
				var elem = event.target;

				// Swallow native change events from checkbox/radio, we already triggered them above
				if (this !== elem || event.isSimulated || event.isTrigger || elem.type !== "radio" && elem.type !== "checkbox") {
					return event.handleObj.handler.apply(this, arguments);
				}
			},

			teardown: function teardown() {
				jQuery.event.remove(this, "._change");

				return !rformElems.test(this.nodeName);
			}
		};
	}

	// Create "bubbling" focus and blur events
	if (!support.focusinBubbles) {
		jQuery.each({ focus: "focusin", blur: "focusout" }, function (orig, fix) {

			// Attach a single capturing handler on the document while someone wants focusin/focusout
			var handler = function handler(event) {
				jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
			};

			jQuery.event.special[fix] = {
				setup: function setup() {
					var doc = this.ownerDocument || this,
					    attaches = jQuery._data(doc, fix);

					if (!attaches) {
						doc.addEventListener(orig, handler, true);
					}
					jQuery._data(doc, fix, (attaches || 0) + 1);
				},
				teardown: function teardown() {
					var doc = this.ownerDocument || this,
					    attaches = jQuery._data(doc, fix) - 1;

					if (!attaches) {
						doc.removeEventListener(orig, handler, true);
						jQuery._removeData(doc, fix);
					} else {
						jQuery._data(doc, fix, attaches);
					}
				}
			};
		});
	}

	jQuery.fn.extend({

		on: function on(types, selector, data, fn, /*INTERNAL*/one) {
			var type, origFn;

			// Types can be a map of types/handlers
			if ((typeof types === "undefined" ? "undefined" : _typeof(types)) === "object") {
				// ( types-Object, selector, data )
				if (typeof selector !== "string") {
					// ( types-Object, data )
					data = data || selector;
					selector = undefined;
				}
				for (type in types) {
					this.on(type, selector, data, types[type], one);
				}
				return this;
			}

			if (data == null && fn == null) {
				// ( types, fn )
				fn = selector;
				data = selector = undefined;
			} else if (fn == null) {
				if (typeof selector === "string") {
					// ( types, selector, fn )
					fn = data;
					data = undefined;
				} else {
					// ( types, data, fn )
					fn = data;
					data = selector;
					selector = undefined;
				}
			}
			if (fn === false) {
				fn = returnFalse;
			} else if (!fn) {
				return this;
			}

			if (one === 1) {
				origFn = fn;
				fn = function fn(event) {
					// Can use an empty set, since event contains the info
					jQuery().off(event);
					return origFn.apply(this, arguments);
				};
				// Use same guid so caller can remove using origFn
				fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
			}
			return this.each(function () {
				jQuery.event.add(this, types, fn, data, selector);
			});
		},
		one: function one(types, selector, data, fn) {
			return this.on(types, selector, data, fn, 1);
		},
		off: function off(types, selector, fn) {
			var handleObj, type;
			if (types && types.preventDefault && types.handleObj) {
				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
				return this;
			}
			if ((typeof types === "undefined" ? "undefined" : _typeof(types)) === "object") {
				// ( types-object [, selector] )
				for (type in types) {
					this.off(type, selector, types[type]);
				}
				return this;
			}
			if (selector === false || typeof selector === "function") {
				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if (fn === false) {
				fn = returnFalse;
			}
			return this.each(function () {
				jQuery.event.remove(this, types, fn, selector);
			});
		},

		trigger: function trigger(type, data) {
			return this.each(function () {
				jQuery.event.trigger(type, data, this);
			});
		},
		triggerHandler: function triggerHandler(type, data) {
			var elem = this[0];
			if (elem) {
				return jQuery.event.trigger(type, data, elem, true);
			}
		}
	});

	function createSafeFragment(document) {
		var list = nodeNames.split("|"),
		    safeFrag = document.createDocumentFragment();

		if (safeFrag.createElement) {
			while (list.length) {
				safeFrag.createElement(list.pop());
			}
		}
		return safeFrag;
	}

	var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" + "header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	    rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	    rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	    rleadingWhitespace = /^\s+/,
	    rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	    rtagName = /<([\w:]+)/,
	    rtbody = /<tbody/i,
	    rhtml = /<|&#?\w+;/,
	    rnoInnerhtml = /<(?:script|style|link)/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	    rscriptType = /^$|\/(?:java|ecma)script/i,
	    rscriptTypeMasked = /^true\/(.*)/,
	    rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,


	// We have to close these tags to support XHTML (#13200)
	wrapMap = {
		option: [1, "<select multiple='multiple'>", "</select>"],
		legend: [1, "<fieldset>", "</fieldset>"],
		area: [1, "<map>", "</map>"],
		param: [1, "<object>", "</object>"],
		thead: [1, "<table>", "</table>"],
		tr: [2, "<table><tbody>", "</tbody></table>"],
		col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
		td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],

		// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
		// unless wrapped in a div with non-breaking characters in front of it.
		_default: support.htmlSerialize ? [0, "", ""] : [1, "X<div>", "</div>"]
	},
	    safeFragment = createSafeFragment(document),
	    fragmentDiv = safeFragment.appendChild(document.createElement("div"));

	wrapMap.optgroup = wrapMap.option;
	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;

	function getAll(context, tag) {
		var elems,
		    elem,
		    i = 0,
		    found = _typeof(context.getElementsByTagName) !== strundefined ? context.getElementsByTagName(tag || "*") : _typeof(context.querySelectorAll) !== strundefined ? context.querySelectorAll(tag || "*") : undefined;

		if (!found) {
			for (found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++) {
				if (!tag || jQuery.nodeName(elem, tag)) {
					found.push(elem);
				} else {
					jQuery.merge(found, getAll(elem, tag));
				}
			}
		}

		return tag === undefined || tag && jQuery.nodeName(context, tag) ? jQuery.merge([context], found) : found;
	}

	// Used in buildFragment, fixes the defaultChecked property
	function fixDefaultChecked(elem) {
		if (rcheckableType.test(elem.type)) {
			elem.defaultChecked = elem.checked;
		}
	}

	// Support: IE<8
	// Manipulating tables requires a tbody
	function manipulationTarget(elem, content) {
		return jQuery.nodeName(elem, "table") && jQuery.nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr") ? elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody")) : elem;
	}

	// Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript(elem) {
		elem.type = (jQuery.find.attr(elem, "type") !== null) + "/" + elem.type;
		return elem;
	}
	function restoreScript(elem) {
		var match = rscriptTypeMasked.exec(elem.type);
		if (match) {
			elem.type = match[1];
		} else {
			elem.removeAttribute("type");
		}
		return elem;
	}

	// Mark scripts as having already been evaluated
	function setGlobalEval(elems, refElements) {
		var elem,
		    i = 0;
		for (; (elem = elems[i]) != null; i++) {
			jQuery._data(elem, "globalEval", !refElements || jQuery._data(refElements[i], "globalEval"));
		}
	}

	function cloneCopyEvent(src, dest) {

		if (dest.nodeType !== 1 || !jQuery.hasData(src)) {
			return;
		}

		var type,
		    i,
		    l,
		    oldData = jQuery._data(src),
		    curData = jQuery._data(dest, oldData),
		    events = oldData.events;

		if (events) {
			delete curData.handle;
			curData.events = {};

			for (type in events) {
				for (i = 0, l = events[type].length; i < l; i++) {
					jQuery.event.add(dest, type, events[type][i]);
				}
			}
		}

		// make the cloned public data object a copy from the original
		if (curData.data) {
			curData.data = jQuery.extend({}, curData.data);
		}
	}

	function fixCloneNodeIssues(src, dest) {
		var nodeName, e, data;

		// We do not need to do anything for non-Elements
		if (dest.nodeType !== 1) {
			return;
		}

		nodeName = dest.nodeName.toLowerCase();

		// IE6-8 copies events bound via attachEvent when using cloneNode.
		if (!support.noCloneEvent && dest[jQuery.expando]) {
			data = jQuery._data(dest);

			for (e in data.events) {
				jQuery.removeEvent(dest, e, data.handle);
			}

			// Event data gets referenced instead of copied if the expando gets copied too
			dest.removeAttribute(jQuery.expando);
		}

		// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
		if (nodeName === "script" && dest.text !== src.text) {
			disableScript(dest).text = src.text;
			restoreScript(dest);

			// IE6-10 improperly clones children of object elements using classid.
			// IE10 throws NoModificationAllowedError if parent is null, #12132.
		} else if (nodeName === "object") {
			if (dest.parentNode) {
				dest.outerHTML = src.outerHTML;
			}

			// This path appears unavoidable for IE9. When cloning an object
			// element in IE9, the outerHTML strategy above is not sufficient.
			// If the src has innerHTML and the destination does not,
			// copy the src.innerHTML into the dest.innerHTML. #10324
			if (support.html5Clone && src.innerHTML && !jQuery.trim(dest.innerHTML)) {
				dest.innerHTML = src.innerHTML;
			}
		} else if (nodeName === "input" && rcheckableType.test(src.type)) {
			// IE6-8 fails to persist the checked state of a cloned checkbox
			// or radio button. Worse, IE6-7 fail to give the cloned element
			// a checked appearance if the defaultChecked value isn't also set

			dest.defaultChecked = dest.checked = src.checked;

			// IE6-7 get confused and end up setting the value of a cloned
			// checkbox/radio button to an empty string instead of "on"
			if (dest.value !== src.value) {
				dest.value = src.value;
			}

			// IE6-8 fails to return the selected option to the default selected
			// state when cloning options
		} else if (nodeName === "option") {
			dest.defaultSelected = dest.selected = src.defaultSelected;

			// IE6-8 fails to set the defaultValue to the correct value when
			// cloning other types of input fields
		} else if (nodeName === "input" || nodeName === "textarea") {
			dest.defaultValue = src.defaultValue;
		}
	}

	jQuery.extend({
		clone: function clone(elem, dataAndEvents, deepDataAndEvents) {
			var destElements,
			    node,
			    clone,
			    i,
			    srcElements,
			    inPage = jQuery.contains(elem.ownerDocument, elem);

			if (support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test("<" + elem.nodeName + ">")) {
				clone = elem.cloneNode(true);

				// IE<=8 does not properly clone detached, unknown element nodes
			} else {
				fragmentDiv.innerHTML = elem.outerHTML;
				fragmentDiv.removeChild(clone = fragmentDiv.firstChild);
			}

			if ((!support.noCloneEvent || !support.noCloneChecked) && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem)) {

				// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
				destElements = getAll(clone);
				srcElements = getAll(elem);

				// Fix all IE cloning issues
				for (i = 0; (node = srcElements[i]) != null; ++i) {
					// Ensure that the destination node is not null; Fixes #9587
					if (destElements[i]) {
						fixCloneNodeIssues(node, destElements[i]);
					}
				}
			}

			// Copy the events from the original to the clone
			if (dataAndEvents) {
				if (deepDataAndEvents) {
					srcElements = srcElements || getAll(elem);
					destElements = destElements || getAll(clone);

					for (i = 0; (node = srcElements[i]) != null; i++) {
						cloneCopyEvent(node, destElements[i]);
					}
				} else {
					cloneCopyEvent(elem, clone);
				}
			}

			// Preserve script evaluation history
			destElements = getAll(clone, "script");
			if (destElements.length > 0) {
				setGlobalEval(destElements, !inPage && getAll(elem, "script"));
			}

			destElements = srcElements = node = null;

			// Return the cloned set
			return clone;
		},

		buildFragment: function buildFragment(elems, context, scripts, selection) {
			var j,
			    elem,
			    contains,
			    tmp,
			    tag,
			    tbody,
			    wrap,
			    l = elems.length,


			// Ensure a safe fragment
			safe = createSafeFragment(context),
			    nodes = [],
			    i = 0;

			for (; i < l; i++) {
				elem = elems[i];

				if (elem || elem === 0) {

					// Add nodes directly
					if (jQuery.type(elem) === "object") {
						jQuery.merge(nodes, elem.nodeType ? [elem] : elem);

						// Convert non-html into a text node
					} else if (!rhtml.test(elem)) {
						nodes.push(context.createTextNode(elem));

						// Convert html into DOM nodes
					} else {
						tmp = tmp || safe.appendChild(context.createElement("div"));

						// Deserialize a standard representation
						tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
						wrap = wrapMap[tag] || wrapMap._default;

						tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2];

						// Descend through wrappers to the right content
						j = wrap[0];
						while (j--) {
							tmp = tmp.lastChild;
						}

						// Manually add leading whitespace removed by IE
						if (!support.leadingWhitespace && rleadingWhitespace.test(elem)) {
							nodes.push(context.createTextNode(rleadingWhitespace.exec(elem)[0]));
						}

						// Remove IE's autoinserted <tbody> from table fragments
						if (!support.tbody) {

							// String was a <table>, *may* have spurious <tbody>
							elem = tag === "table" && !rtbody.test(elem) ? tmp.firstChild :

							// String was a bare <thead> or <tfoot>
							wrap[1] === "<table>" && !rtbody.test(elem) ? tmp : 0;

							j = elem && elem.childNodes.length;
							while (j--) {
								if (jQuery.nodeName(tbody = elem.childNodes[j], "tbody") && !tbody.childNodes.length) {
									elem.removeChild(tbody);
								}
							}
						}

						jQuery.merge(nodes, tmp.childNodes);

						// Fix #12392 for WebKit and IE > 9
						tmp.textContent = "";

						// Fix #12392 for oldIE
						while (tmp.firstChild) {
							tmp.removeChild(tmp.firstChild);
						}

						// Remember the top-level container for proper cleanup
						tmp = safe.lastChild;
					}
				}
			}

			// Fix #11356: Clear elements from fragment
			if (tmp) {
				safe.removeChild(tmp);
			}

			// Reset defaultChecked for any radios and checkboxes
			// about to be appended to the DOM in IE 6/7 (#8060)
			if (!support.appendChecked) {
				jQuery.grep(getAll(nodes, "input"), fixDefaultChecked);
			}

			i = 0;
			while (elem = nodes[i++]) {

				// #4087 - If origin and destination elements are the same, and this is
				// that element, do not do anything
				if (selection && jQuery.inArray(elem, selection) !== -1) {
					continue;
				}

				contains = jQuery.contains(elem.ownerDocument, elem);

				// Append to fragment
				tmp = getAll(safe.appendChild(elem), "script");

				// Preserve script evaluation history
				if (contains) {
					setGlobalEval(tmp);
				}

				// Capture executables
				if (scripts) {
					j = 0;
					while (elem = tmp[j++]) {
						if (rscriptType.test(elem.type || "")) {
							scripts.push(elem);
						}
					}
				}
			}

			tmp = null;

			return safe;
		},

		cleanData: function cleanData(elems, /* internal */acceptData) {
			var elem,
			    type,
			    id,
			    data,
			    i = 0,
			    internalKey = jQuery.expando,
			    cache = jQuery.cache,
			    deleteExpando = support.deleteExpando,
			    special = jQuery.event.special;

			for (; (elem = elems[i]) != null; i++) {
				if (acceptData || jQuery.acceptData(elem)) {

					id = elem[internalKey];
					data = id && cache[id];

					if (data) {
						if (data.events) {
							for (type in data.events) {
								if (special[type]) {
									jQuery.event.remove(elem, type);

									// This is a shortcut to avoid jQuery.event.remove's overhead
								} else {
									jQuery.removeEvent(elem, type, data.handle);
								}
							}
						}

						// Remove cache only if it was not already removed by jQuery.event.remove
						if (cache[id]) {

							delete cache[id];

							// IE does not allow us to delete expando properties from nodes,
							// nor does it have a removeAttribute function on Document nodes;
							// we must handle all of these cases
							if (deleteExpando) {
								delete elem[internalKey];
							} else if (_typeof(elem.removeAttribute) !== strundefined) {
								elem.removeAttribute(internalKey);
							} else {
								elem[internalKey] = null;
							}

							deletedIds.push(id);
						}
					}
				}
			}
		}
	});

	jQuery.fn.extend({
		text: function text(value) {
			return access(this, function (value) {
				return value === undefined ? jQuery.text(this) : this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(value));
			}, null, value, arguments.length);
		},

		append: function append() {
			return this.domManip(arguments, function (elem) {
				if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
					var target = manipulationTarget(this, elem);
					target.appendChild(elem);
				}
			});
		},

		prepend: function prepend() {
			return this.domManip(arguments, function (elem) {
				if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
					var target = manipulationTarget(this, elem);
					target.insertBefore(elem, target.firstChild);
				}
			});
		},

		before: function before() {
			return this.domManip(arguments, function (elem) {
				if (this.parentNode) {
					this.parentNode.insertBefore(elem, this);
				}
			});
		},

		after: function after() {
			return this.domManip(arguments, function (elem) {
				if (this.parentNode) {
					this.parentNode.insertBefore(elem, this.nextSibling);
				}
			});
		},

		remove: function remove(selector, keepData /* Internal Use Only */) {
			var elem,
			    elems = selector ? jQuery.filter(selector, this) : this,
			    i = 0;

			for (; (elem = elems[i]) != null; i++) {

				if (!keepData && elem.nodeType === 1) {
					jQuery.cleanData(getAll(elem));
				}

				if (elem.parentNode) {
					if (keepData && jQuery.contains(elem.ownerDocument, elem)) {
						setGlobalEval(getAll(elem, "script"));
					}
					elem.parentNode.removeChild(elem);
				}
			}

			return this;
		},

		empty: function empty() {
			var elem,
			    i = 0;

			for (; (elem = this[i]) != null; i++) {
				// Remove element nodes and prevent memory leaks
				if (elem.nodeType === 1) {
					jQuery.cleanData(getAll(elem, false));
				}

				// Remove any remaining nodes
				while (elem.firstChild) {
					elem.removeChild(elem.firstChild);
				}

				// If this is a select, ensure that it displays empty (#12336)
				// Support: IE<9
				if (elem.options && jQuery.nodeName(elem, "select")) {
					elem.options.length = 0;
				}
			}

			return this;
		},

		clone: function clone(dataAndEvents, deepDataAndEvents) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

			return this.map(function () {
				return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
			});
		},

		html: function html(value) {
			return access(this, function (value) {
				var elem = this[0] || {},
				    i = 0,
				    l = this.length;

				if (value === undefined) {
					return elem.nodeType === 1 ? elem.innerHTML.replace(rinlinejQuery, "") : undefined;
				}

				// See if we can take a shortcut and just use innerHTML
				if (typeof value === "string" && !rnoInnerhtml.test(value) && (support.htmlSerialize || !rnoshimcache.test(value)) && (support.leadingWhitespace || !rleadingWhitespace.test(value)) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {

					value = value.replace(rxhtmlTag, "<$1></$2>");

					try {
						for (; i < l; i++) {
							// Remove element nodes and prevent memory leaks
							elem = this[i] || {};
							if (elem.nodeType === 1) {
								jQuery.cleanData(getAll(elem, false));
								elem.innerHTML = value;
							}
						}

						elem = 0;

						// If using innerHTML throws an exception, use the fallback method
					} catch (e) {}
				}

				if (elem) {
					this.empty().append(value);
				}
			}, null, value, arguments.length);
		},

		replaceWith: function replaceWith() {
			var arg = arguments[0];

			// Make the changes, replacing each context element with the new content
			this.domManip(arguments, function (elem) {
				arg = this.parentNode;

				jQuery.cleanData(getAll(this));

				if (arg) {
					arg.replaceChild(elem, this);
				}
			});

			// Force removal if there was no new content (e.g., from empty arguments)
			return arg && (arg.length || arg.nodeType) ? this : this.remove();
		},

		detach: function detach(selector) {
			return this.remove(selector, true);
		},

		domManip: function domManip(args, callback) {

			// Flatten any nested arrays
			args = concat.apply([], args);

			var first,
			    node,
			    hasScripts,
			    scripts,
			    doc,
			    fragment,
			    i = 0,
			    l = this.length,
			    set = this,
			    iNoClone = l - 1,
			    value = args[0],
			    isFunction = jQuery.isFunction(value);

			// We can't cloneNode fragments that contain checked, in WebKit
			if (isFunction || l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value)) {
				return this.each(function (index) {
					var self = set.eq(index);
					if (isFunction) {
						args[0] = value.call(this, index, self.html());
					}
					self.domManip(args, callback);
				});
			}

			if (l) {
				fragment = jQuery.buildFragment(args, this[0].ownerDocument, false, this);
				first = fragment.firstChild;

				if (fragment.childNodes.length === 1) {
					fragment = first;
				}

				if (first) {
					scripts = jQuery.map(getAll(fragment, "script"), disableScript);
					hasScripts = scripts.length;

					// Use the original fragment for the last item instead of the first because it can end up
					// being emptied incorrectly in certain situations (#8070).
					for (; i < l; i++) {
						node = fragment;

						if (i !== iNoClone) {
							node = jQuery.clone(node, true, true);

							// Keep references to cloned scripts for later restoration
							if (hasScripts) {
								jQuery.merge(scripts, getAll(node, "script"));
							}
						}

						callback.call(this[i], node, i);
					}

					if (hasScripts) {
						doc = scripts[scripts.length - 1].ownerDocument;

						// Reenable scripts
						jQuery.map(scripts, restoreScript);

						// Evaluate executable scripts on first document insertion
						for (i = 0; i < hasScripts; i++) {
							node = scripts[i];
							if (rscriptType.test(node.type || "") && !jQuery._data(node, "globalEval") && jQuery.contains(doc, node)) {

								if (node.src) {
									// Optional AJAX dependency, but won't run scripts if not present
									if (jQuery._evalUrl) {
										jQuery._evalUrl(node.src);
									}
								} else {
									jQuery.globalEval((node.text || node.textContent || node.innerHTML || "").replace(rcleanScript, ""));
								}
							}
						}
					}

					// Fix #11809: Avoid leaking memory
					fragment = first = null;
				}
			}

			return this;
		}
	});

	jQuery.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function (name, original) {
		jQuery.fn[name] = function (selector) {
			var elems,
			    i = 0,
			    ret = [],
			    insert = jQuery(selector),
			    last = insert.length - 1;

			for (; i <= last; i++) {
				elems = i === last ? this : this.clone(true);
				jQuery(insert[i])[original](elems);

				// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
				push.apply(ret, elems.get());
			}

			return this.pushStack(ret);
		};
	});

	var iframe,
	    elemdisplay = {};

	/**
  * Retrieve the actual display of a element
  * @param {String} name nodeName of the element
  * @param {Object} doc Document object
  */
	// Called only from within defaultDisplay
	function actualDisplay(name, doc) {
		var elem = jQuery(doc.createElement(name)).appendTo(doc.body),


		// getDefaultComputedStyle might be reliably used only on attached element
		display = window.getDefaultComputedStyle ?

		// Use of this method is a temporary fix (more like optmization) until something better comes along,
		// since it was removed from specification and supported only in FF
		window.getDefaultComputedStyle(elem[0]).display : jQuery.css(elem[0], "display");

		// We don't have any data stored on the element,
		// so use "detach" method as fast way to get rid of the element
		elem.detach();

		return display;
	}

	/**
  * Try to determine the default display value of an element
  * @param {String} nodeName
  */
	function defaultDisplay(nodeName) {
		var doc = document,
		    display = elemdisplay[nodeName];

		if (!display) {
			display = actualDisplay(nodeName, doc);

			// If the simple way fails, read from inside an iframe
			if (display === "none" || !display) {

				// Use the already-created iframe if possible
				iframe = (iframe || jQuery("<iframe frameborder='0' width='0' height='0'/>")).appendTo(doc.documentElement);

				// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
				doc = (iframe[0].contentWindow || iframe[0].contentDocument).document;

				// Support: IE
				doc.write();
				doc.close();

				display = actualDisplay(nodeName, doc);
				iframe.detach();
			}

			// Store the correct default display
			elemdisplay[nodeName] = display;
		}

		return display;
	}

	(function () {
		var a,
		    shrinkWrapBlocksVal,
		    div = document.createElement("div"),
		    divReset = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;" + "display:block;padding:0;margin:0;border:0";

		// Setup
		div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
		a = div.getElementsByTagName("a")[0];

		a.style.cssText = "float:left;opacity:.5";

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		support.opacity = /^0.5/.test(a.style.opacity);

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		support.cssFloat = !!a.style.cssFloat;

		div.style.backgroundClip = "content-box";
		div.cloneNode(true).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";

		// Null elements to avoid leaks in IE.
		a = div = null;

		support.shrinkWrapBlocks = function () {
			var body, container, div, containerStyles;

			if (shrinkWrapBlocksVal == null) {
				body = document.getElementsByTagName("body")[0];
				if (!body) {
					// Test fired too early or in an unsupported environment, exit.
					return;
				}

				containerStyles = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px";
				container = document.createElement("div");
				div = document.createElement("div");

				body.appendChild(container).appendChild(div);

				// Will be changed later if needed.
				shrinkWrapBlocksVal = false;

				if (_typeof(div.style.zoom) !== strundefined) {
					// Support: IE6
					// Check if elements with layout shrink-wrap their children
					div.style.cssText = divReset + ";width:1px;padding:1px;zoom:1";
					div.innerHTML = "<div></div>";
					div.firstChild.style.width = "5px";
					shrinkWrapBlocksVal = div.offsetWidth !== 3;
				}

				body.removeChild(container);

				// Null elements to avoid leaks in IE.
				body = container = div = null;
			}

			return shrinkWrapBlocksVal;
		};
	})();
	var rmargin = /^margin/;

	var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");

	var getStyles,
	    curCSS,
	    rposition = /^(top|right|bottom|left)$/;

	if (window.getComputedStyle) {
		getStyles = function getStyles(elem) {
			return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
		};

		curCSS = function curCSS(elem, name, computed) {
			var width,
			    minWidth,
			    maxWidth,
			    ret,
			    style = elem.style;

			computed = computed || getStyles(elem);

			// getPropertyValue is only needed for .css('filter') in IE9, see #12537
			ret = computed ? computed.getPropertyValue(name) || computed[name] : undefined;

			if (computed) {

				if (ret === "" && !jQuery.contains(elem.ownerDocument, elem)) {
					ret = jQuery.style(elem, name);
				}

				// A tribute to the "awesome hack by Dean Edwards"
				// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
				// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
				// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
				if (rnumnonpx.test(ret) && rmargin.test(name)) {

					// Remember the original values
					width = style.width;
					minWidth = style.minWidth;
					maxWidth = style.maxWidth;

					// Put in the new values to get a computed value out
					style.minWidth = style.maxWidth = style.width = ret;
					ret = computed.width;

					// Revert the changed values
					style.width = width;
					style.minWidth = minWidth;
					style.maxWidth = maxWidth;
				}
			}

			// Support: IE
			// IE returns zIndex value as an integer.
			return ret === undefined ? ret : ret + "";
		};
	} else if (document.documentElement.currentStyle) {
		getStyles = function getStyles(elem) {
			return elem.currentStyle;
		};

		curCSS = function curCSS(elem, name, computed) {
			var left,
			    rs,
			    rsLeft,
			    ret,
			    style = elem.style;

			computed = computed || getStyles(elem);
			ret = computed ? computed[name] : undefined;

			// Avoid setting ret to empty string here
			// so we don't default to auto
			if (ret == null && style && style[name]) {
				ret = style[name];
			}

			// From the awesome hack by Dean Edwards
			// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

			// If we're not dealing with a regular pixel number
			// but a number that has a weird ending, we need to convert it to pixels
			// but not position css attributes, as those are proportional to the parent element instead
			// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
			if (rnumnonpx.test(ret) && !rposition.test(name)) {

				// Remember the original values
				left = style.left;
				rs = elem.runtimeStyle;
				rsLeft = rs && rs.left;

				// Put in the new values to get a computed value out
				if (rsLeft) {
					rs.left = elem.currentStyle.left;
				}
				style.left = name === "fontSize" ? "1em" : ret;
				ret = style.pixelLeft + "px";

				// Revert the changed values
				style.left = left;
				if (rsLeft) {
					rs.left = rsLeft;
				}
			}

			// Support: IE
			// IE returns zIndex value as an integer.
			return ret === undefined ? ret : ret + "" || "auto";
		};
	}

	function addGetHookIf(conditionFn, hookFn) {
		// Define the hook, we'll check on the first run if it's really needed.
		return {
			get: function get() {
				var condition = conditionFn();

				if (condition == null) {
					// The test was not ready at this point; screw the hook this time
					// but check again when needed next time.
					return;
				}

				if (condition) {
					// Hook not needed (or it's not possible to use it due to missing dependency),
					// remove it.
					// Since there are no other hooks for marginRight, remove the whole object.
					delete this.get;
					return;
				}

				// Hook needed; redefine it so that the support test is not executed again.

				return (this.get = hookFn).apply(this, arguments);
			}
		};
	}

	(function () {
		var a,
		    reliableHiddenOffsetsVal,
		    boxSizingVal,
		    boxSizingReliableVal,
		    pixelPositionVal,
		    reliableMarginRightVal,
		    div = document.createElement("div"),
		    containerStyles = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px",
		    divReset = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;" + "display:block;padding:0;margin:0;border:0";

		// Setup
		div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
		a = div.getElementsByTagName("a")[0];

		a.style.cssText = "float:left;opacity:.5";

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		support.opacity = /^0.5/.test(a.style.opacity);

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		support.cssFloat = !!a.style.cssFloat;

		div.style.backgroundClip = "content-box";
		div.cloneNode(true).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";

		// Null elements to avoid leaks in IE.
		a = div = null;

		jQuery.extend(support, {
			reliableHiddenOffsets: function reliableHiddenOffsets() {
				if (reliableHiddenOffsetsVal != null) {
					return reliableHiddenOffsetsVal;
				}

				var container,
				    tds,
				    isSupported,
				    div = document.createElement("div"),
				    body = document.getElementsByTagName("body")[0];

				if (!body) {
					// Return for frameset docs that don't have a body
					return;
				}

				// Setup
				div.setAttribute("className", "t");
				div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

				container = document.createElement("div");
				container.style.cssText = containerStyles;

				body.appendChild(container).appendChild(div);

				// Support: IE8
				// Check if table cells still have offsetWidth/Height when they are set
				// to display:none and there are still other visible table cells in a
				// table row; if so, offsetWidth/Height are not reliable for use when
				// determining if an element has been hidden directly using
				// display:none (it is still safe to use offsets if a parent element is
				// hidden; don safety goggles and see bug #4512 for more information).
				div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
				tds = div.getElementsByTagName("td");
				tds[0].style.cssText = "padding:0;margin:0;border:0;display:none";
				isSupported = tds[0].offsetHeight === 0;

				tds[0].style.display = "";
				tds[1].style.display = "none";

				// Support: IE8
				// Check if empty table cells still have offsetWidth/Height
				reliableHiddenOffsetsVal = isSupported && tds[0].offsetHeight === 0;

				body.removeChild(container);

				// Null elements to avoid leaks in IE.
				div = body = null;

				return reliableHiddenOffsetsVal;
			},

			boxSizing: function boxSizing() {
				if (boxSizingVal == null) {
					computeStyleTests();
				}
				return boxSizingVal;
			},

			boxSizingReliable: function boxSizingReliable() {
				if (boxSizingReliableVal == null) {
					computeStyleTests();
				}
				return boxSizingReliableVal;
			},

			pixelPosition: function pixelPosition() {
				if (pixelPositionVal == null) {
					computeStyleTests();
				}
				return pixelPositionVal;
			},

			reliableMarginRight: function reliableMarginRight() {
				var body, container, div, marginDiv;

				// Use window.getComputedStyle because jsdom on node.js will break without it.
				if (reliableMarginRightVal == null && window.getComputedStyle) {
					body = document.getElementsByTagName("body")[0];
					if (!body) {
						// Test fired too early or in an unsupported environment, exit.
						return;
					}

					container = document.createElement("div");
					div = document.createElement("div");
					container.style.cssText = containerStyles;

					body.appendChild(container).appendChild(div);

					// Check if div with explicit width and no margin-right incorrectly
					// gets computed margin-right based on width of container. (#3333)
					// Fails in WebKit before Feb 2011 nightlies
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					marginDiv = div.appendChild(document.createElement("div"));
					marginDiv.style.cssText = div.style.cssText = divReset;
					marginDiv.style.marginRight = marginDiv.style.width = "0";
					div.style.width = "1px";

					reliableMarginRightVal = !parseFloat((window.getComputedStyle(marginDiv, null) || {}).marginRight);

					body.removeChild(container);
				}

				return reliableMarginRightVal;
			}
		});

		function computeStyleTests() {
			var container,
			    div,
			    body = document.getElementsByTagName("body")[0];

			if (!body) {
				// Test fired too early or in an unsupported environment, exit.
				return;
			}

			container = document.createElement("div");
			div = document.createElement("div");
			container.style.cssText = containerStyles;

			body.appendChild(container).appendChild(div);

			div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;" + "position:absolute;display:block;padding:1px;border:1px;width:4px;" + "margin-top:1%;top:1%";

			// Workaround failing boxSizing test due to offsetWidth returning wrong value
			// with some non-1 values of body zoom, ticket #13543
			jQuery.swap(body, body.style.zoom != null ? { zoom: 1 } : {}, function () {
				boxSizingVal = div.offsetWidth === 4;
			});

			// Will be changed later if needed.
			boxSizingReliableVal = true;
			pixelPositionVal = false;
			reliableMarginRightVal = true;

			// Use window.getComputedStyle because jsdom on node.js will break without it.
			if (window.getComputedStyle) {
				pixelPositionVal = (window.getComputedStyle(div, null) || {}).top !== "1%";
				boxSizingReliableVal = (window.getComputedStyle(div, null) || { width: "4px" }).width === "4px";
			}

			body.removeChild(container);

			// Null elements to avoid leaks in IE.
			div = body = null;
		}
	})();

	// A method for quickly swapping in/out CSS properties to get correct calculations.
	jQuery.swap = function (elem, options, callback, args) {
		var ret,
		    name,
		    old = {};

		// Remember the old values, and insert the new ones
		for (name in options) {
			old[name] = elem.style[name];
			elem.style[name] = options[name];
		}

		ret = callback.apply(elem, args || []);

		// Revert the old values
		for (name in options) {
			elem.style[name] = old[name];
		}

		return ret;
	};

	var ralpha = /alpha\([^)]*\)/i,
	    ropacity = /opacity\s*=\s*([^)]*)/,


	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	    rnumsplit = new RegExp("^(" + pnum + ")(.*)$", "i"),
	    rrelNum = new RegExp("^([+-])=(" + pnum + ")", "i"),
	    cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	    cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},
	    cssPrefixes = ["Webkit", "O", "Moz", "ms"];

	// return a css property mapped to a potentially vendor prefixed property
	function vendorPropName(style, name) {

		// shortcut for names that are not vendor prefixed
		if (name in style) {
			return name;
		}

		// check for vendor prefixed names
		var capName = name.charAt(0).toUpperCase() + name.slice(1),
		    origName = name,
		    i = cssPrefixes.length;

		while (i--) {
			name = cssPrefixes[i] + capName;
			if (name in style) {
				return name;
			}
		}

		return origName;
	}

	function showHide(elements, show) {
		var display,
		    elem,
		    hidden,
		    values = [],
		    index = 0,
		    length = elements.length;

		for (; index < length; index++) {
			elem = elements[index];
			if (!elem.style) {
				continue;
			}

			values[index] = jQuery._data(elem, "olddisplay");
			display = elem.style.display;
			if (show) {
				// Reset the inline display of this element to learn if it is
				// being hidden by cascaded rules or not
				if (!values[index] && display === "none") {
					elem.style.display = "";
				}

				// Set elements which have been overridden with display: none
				// in a stylesheet to whatever the default browser style is
				// for such an element
				if (elem.style.display === "" && isHidden(elem)) {
					values[index] = jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName));
				}
			} else {

				if (!values[index]) {
					hidden = isHidden(elem);

					if (display && display !== "none" || !hidden) {
						jQuery._data(elem, "olddisplay", hidden ? display : jQuery.css(elem, "display"));
					}
				}
			}
		}

		// Set the display of most of the elements in a second loop
		// to avoid the constant reflow
		for (index = 0; index < length; index++) {
			elem = elements[index];
			if (!elem.style) {
				continue;
			}
			if (!show || elem.style.display === "none" || elem.style.display === "") {
				elem.style.display = show ? values[index] || "" : "none";
			}
		}

		return elements;
	}

	function setPositiveNumber(elem, value, subtract) {
		var matches = rnumsplit.exec(value);
		return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") : value;
	}

	function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
		var i = extra === (isBorderBox ? "border" : "content") ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,
		    val = 0;

		for (; i < 4; i += 2) {
			// both box models exclude margin, so add it if we want it
			if (extra === "margin") {
				val += jQuery.css(elem, extra + cssExpand[i], true, styles);
			}

			if (isBorderBox) {
				// border-box includes padding, so remove it if we want content
				if (extra === "content") {
					val -= jQuery.css(elem, "padding" + cssExpand[i], true, styles);
				}

				// at this point, extra isn't border nor margin, so remove border
				if (extra !== "margin") {
					val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
				}
			} else {
				// at this point, extra isn't content, so add padding
				val += jQuery.css(elem, "padding" + cssExpand[i], true, styles);

				// at this point, extra isn't content nor padding, so add border
				if (extra !== "padding") {
					val += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
				}
			}
		}

		return val;
	}

	function getWidthOrHeight(elem, name, extra) {

		// Start with offset property, which is equivalent to the border-box value
		var valueIsBorderBox = true,
		    val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		    styles = getStyles(elem),
		    isBorderBox = support.boxSizing() && jQuery.css(elem, "boxSizing", false, styles) === "border-box";

		// some non-html elements return undefined for offsetWidth, so check for null/undefined
		// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
		// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
		if (val <= 0 || val == null) {
			// Fall back to computed then uncomputed css if necessary
			val = curCSS(elem, name, styles);
			if (val < 0 || val == null) {
				val = elem.style[name];
			}

			// Computed unit is not pixels. Stop here and return.
			if (rnumnonpx.test(val)) {
				return val;
			}

			// we need the check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable elem.style
			valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]);

			// Normalize "", auto, and prepare for extra
			val = parseFloat(val) || 0;
		}

		// use the active box-sizing model to add/subtract irrelevant styles
		return val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles) + "px";
	}

	jQuery.extend({
		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function get(elem, computed) {
					if (computed) {
						// We should always get a number back from opacity
						var ret = curCSS(elem, "opacity");
						return ret === "" ? "1" : ret;
					}
				}
			}
		},

		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			"columnCount": true,
			"fillOpacity": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"order": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},

		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {
			// normalize float css property
			"float": support.cssFloat ? "cssFloat" : "styleFloat"
		},

		// Get and set the style property on a DOM Node
		style: function style(elem, name, value, extra) {
			// Don't set styles on text and comment nodes
			if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
				return;
			}

			// Make sure that we're working with the right name
			var ret,
			    type,
			    hooks,
			    origName = jQuery.camelCase(name),
			    style = elem.style;

			name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style, origName));

			// gets hook for the prefixed version
			// followed by the unprefixed version
			hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

			// Check if we're setting a value
			if (value !== undefined) {
				type = typeof value === "undefined" ? "undefined" : _typeof(value);

				// convert relative number strings (+= or -=) to relative numbers. #7345
				if (type === "string" && (ret = rrelNum.exec(value))) {
					value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem, name));
					// Fixes bug #9237
					type = "number";
				}

				// Make sure that null and NaN values aren't set. See: #7116
				if (value == null || value !== value) {
					return;
				}

				// If a number was passed in, add 'px' to the (except for certain CSS properties)
				if (type === "number" && !jQuery.cssNumber[origName]) {
					value += "px";
				}

				// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
				// but it would mean to define eight (for every problematic property) identical functions
				if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
					style[name] = "inherit";
				}

				// If a hook was provided, use that value, otherwise just set the specified value
				if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {

					// Support: IE
					// Swallow errors from 'invalid' CSS values (#5509)
					try {
						// Support: Chrome, Safari
						// Setting style to blank string required to delete "style: x !important;"
						style[name] = "";
						style[name] = value;
					} catch (e) {}
				}
			} else {
				// If a hook was provided get the non-computed value from there
				if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) {
					return ret;
				}

				// Otherwise just get the value from the style object
				return style[name];
			}
		},

		css: function css(elem, name, extra, styles) {
			var num,
			    val,
			    hooks,
			    origName = jQuery.camelCase(name);

			// Make sure that we're working with the right name
			name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(elem.style, origName));

			// gets hook for the prefixed version
			// followed by the unprefixed version
			hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

			// If a hook was provided get the computed value from there
			if (hooks && "get" in hooks) {
				val = hooks.get(elem, true, extra);
			}

			// Otherwise, if a way to get the computed value exists, use that
			if (val === undefined) {
				val = curCSS(elem, name, styles);
			}

			//convert "normal" to computed value
			if (val === "normal" && name in cssNormalTransform) {
				val = cssNormalTransform[name];
			}

			// Return, converting to number if forced or a qualifier was provided and val looks numeric
			if (extra === "" || extra) {
				num = parseFloat(val);
				return extra === true || jQuery.isNumeric(num) ? num || 0 : val;
			}
			return val;
		}
	});

	jQuery.each(["height", "width"], function (i, name) {
		jQuery.cssHooks[name] = {
			get: function get(elem, computed, extra) {
				if (computed) {
					// certain elements can have dimension info if we invisibly show them
					// however, it must have a current display style that would benefit from this
					return elem.offsetWidth === 0 && rdisplayswap.test(jQuery.css(elem, "display")) ? jQuery.swap(elem, cssShow, function () {
						return getWidthOrHeight(elem, name, extra);
					}) : getWidthOrHeight(elem, name, extra);
				}
			},

			set: function set(elem, value, extra) {
				var styles = extra && getStyles(elem);
				return setPositiveNumber(elem, value, extra ? augmentWidthOrHeight(elem, name, extra, support.boxSizing() && jQuery.css(elem, "boxSizing", false, styles) === "border-box", styles) : 0);
			}
		};
	});

	if (!support.opacity) {
		jQuery.cssHooks.opacity = {
			get: function get(elem, computed) {
				// IE uses filters for opacity
				return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ? 0.01 * parseFloat(RegExp.$1) + "" : computed ? "1" : "";
			},

			set: function set(elem, value) {
				var style = elem.style,
				    currentStyle = elem.currentStyle,
				    opacity = jQuery.isNumeric(value) ? "alpha(opacity=" + value * 100 + ")" : "",
				    filter = currentStyle && currentStyle.filter || style.filter || "";

				// IE has trouble with opacity if it does not have layout
				// Force it by setting the zoom level
				style.zoom = 1;

				// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
				// if value === "", then remove inline opacity #12685
				if ((value >= 1 || value === "") && jQuery.trim(filter.replace(ralpha, "")) === "" && style.removeAttribute) {

					// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
					// if "filter:" is present at all, clearType is disabled, we want to avoid this
					// style.removeAttribute is IE Only, but so apparently is this code path...
					style.removeAttribute("filter");

					// if there is no filter style applied in a css rule or unset inline opacity, we are done
					if (value === "" || currentStyle && !currentStyle.filter) {
						return;
					}
				}

				// otherwise, set new filter values
				style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : filter + " " + opacity;
			}
		};
	}

	jQuery.cssHooks.marginRight = addGetHookIf(support.reliableMarginRight, function (elem, computed) {
		if (computed) {
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			// Work around by temporarily setting element display to inline-block
			return jQuery.swap(elem, { "display": "inline-block" }, curCSS, [elem, "marginRight"]);
		}
	});

	// These hooks are used by animate to expand properties
	jQuery.each({
		margin: "",
		padding: "",
		border: "Width"
	}, function (prefix, suffix) {
		jQuery.cssHooks[prefix + suffix] = {
			expand: function expand(value) {
				var i = 0,
				    expanded = {},


				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [value];

				for (; i < 4; i++) {
					expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
				}

				return expanded;
			}
		};

		if (!rmargin.test(prefix)) {
			jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
		}
	});

	jQuery.fn.extend({
		css: function css(name, value) {
			return access(this, function (elem, name, value) {
				var styles,
				    len,
				    map = {},
				    i = 0;

				if (jQuery.isArray(name)) {
					styles = getStyles(elem);
					len = name.length;

					for (; i < len; i++) {
						map[name[i]] = jQuery.css(elem, name[i], false, styles);
					}

					return map;
				}

				return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
			}, name, value, arguments.length > 1);
		},
		show: function show() {
			return showHide(this, true);
		},
		hide: function hide() {
			return showHide(this);
		},
		toggle: function toggle(state) {
			if (typeof state === "boolean") {
				return state ? this.show() : this.hide();
			}

			return this.each(function () {
				if (isHidden(this)) {
					jQuery(this).show();
				} else {
					jQuery(this).hide();
				}
			});
		}
	});

	function Tween(elem, options, prop, end, easing) {
		return new Tween.prototype.init(elem, options, prop, end, easing);
	}
	jQuery.Tween = Tween;

	Tween.prototype = {
		constructor: Tween,
		init: function init(elem, options, prop, end, easing, unit) {
			this.elem = elem;
			this.prop = prop;
			this.easing = easing || "swing";
			this.options = options;
			this.start = this.now = this.cur();
			this.end = end;
			this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
		},
		cur: function cur() {
			var hooks = Tween.propHooks[this.prop];

			return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
		},
		run: function run(percent) {
			var eased,
			    hooks = Tween.propHooks[this.prop];

			if (this.options.duration) {
				this.pos = eased = jQuery.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration);
			} else {
				this.pos = eased = percent;
			}
			this.now = (this.end - this.start) * eased + this.start;

			if (this.options.step) {
				this.options.step.call(this.elem, this.now, this);
			}

			if (hooks && hooks.set) {
				hooks.set(this);
			} else {
				Tween.propHooks._default.set(this);
			}
			return this;
		}
	};

	Tween.prototype.init.prototype = Tween.prototype;

	Tween.propHooks = {
		_default: {
			get: function get(tween) {
				var result;

				if (tween.elem[tween.prop] != null && (!tween.elem.style || tween.elem.style[tween.prop] == null)) {
					return tween.elem[tween.prop];
				}

				// passing an empty string as a 3rd parameter to .css will automatically
				// attempt a parseFloat and fallback to a string if the parse fails
				// so, simple values such as "10px" are parsed to Float.
				// complex values such as "rotate(1rad)" are returned as is.
				result = jQuery.css(tween.elem, tween.prop, "");
				// Empty strings, null, undefined and "auto" are converted to 0.
				return !result || result === "auto" ? 0 : result;
			},
			set: function set(tween) {
				// use step hook for back compat - use cssHook if its there - use .style if its
				// available and use plain properties where available
				if (jQuery.fx.step[tween.prop]) {
					jQuery.fx.step[tween.prop](tween);
				} else if (tween.elem.style && (tween.elem.style[jQuery.cssProps[tween.prop]] != null || jQuery.cssHooks[tween.prop])) {
					jQuery.style(tween.elem, tween.prop, tween.now + tween.unit);
				} else {
					tween.elem[tween.prop] = tween.now;
				}
			}
		}
	};

	// Support: IE <=9
	// Panic based approach to setting things on disconnected nodes

	Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
		set: function set(tween) {
			if (tween.elem.nodeType && tween.elem.parentNode) {
				tween.elem[tween.prop] = tween.now;
			}
		}
	};

	jQuery.easing = {
		linear: function linear(p) {
			return p;
		},
		swing: function swing(p) {
			return 0.5 - Math.cos(p * Math.PI) / 2;
		}
	};

	jQuery.fx = Tween.prototype.init;

	// Back Compat <1.8 extension point
	jQuery.fx.step = {};

	var fxNow,
	    timerId,
	    rfxtypes = /^(?:toggle|show|hide)$/,
	    rfxnum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i"),
	    rrun = /queueHooks$/,
	    animationPrefilters = [defaultPrefilter],
	    tweeners = {
		"*": [function (prop, value) {
			var tween = this.createTween(prop, value),
			    target = tween.cur(),
			    parts = rfxnum.exec(value),
			    unit = parts && parts[3] || (jQuery.cssNumber[prop] ? "" : "px"),


			// Starting value computation is required for potential unit mismatches
			start = (jQuery.cssNumber[prop] || unit !== "px" && +target) && rfxnum.exec(jQuery.css(tween.elem, prop)),
			    scale = 1,
			    maxIterations = 20;

			if (start && start[3] !== unit) {
				// Trust units reported by jQuery.css
				unit = unit || start[3];

				// Make sure we update the tween properties later on
				parts = parts || [];

				// Iteratively approximate from a nonzero starting point
				start = +target || 1;

				do {
					// If previous iteration zeroed out, double until we get *something*
					// Use a string for doubling factor so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					start = start / scale;
					jQuery.style(tween.elem, prop, start + unit);

					// Update scale, tolerating zero or NaN from tween.cur()
					// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
				} while (scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations);
			}

			// Update tween properties
			if (parts) {
				start = tween.start = +start || +target || 0;
				tween.unit = unit;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + (parts[1] + 1) * parts[2] : +parts[2];
			}

			return tween;
		}]
	};

	// Animations created synchronously will run synchronously
	function createFxNow() {
		setTimeout(function () {
			fxNow = undefined;
		});
		return fxNow = jQuery.now();
	}

	// Generate parameters to create a standard animation
	function genFx(type, includeWidth) {
		var which,
		    attrs = { height: type },
		    i = 0;

		// if we include width, step value is 1 to do all cssExpand values,
		// if we don't include width, step value is 2 to skip over Left and Right
		includeWidth = includeWidth ? 1 : 0;
		for (; i < 4; i += 2 - includeWidth) {
			which = cssExpand[i];
			attrs["margin" + which] = attrs["padding" + which] = type;
		}

		if (includeWidth) {
			attrs.opacity = attrs.width = type;
		}

		return attrs;
	}

	function createTween(value, prop, animation) {
		var tween,
		    collection = (tweeners[prop] || []).concat(tweeners["*"]),
		    index = 0,
		    length = collection.length;
		for (; index < length; index++) {
			if (tween = collection[index].call(animation, prop, value)) {

				// we're done with this property
				return tween;
			}
		}
	}

	function defaultPrefilter(elem, props, opts) {
		/* jshint validthis: true */
		var prop,
		    value,
		    toggle,
		    tween,
		    hooks,
		    oldfire,
		    display,
		    dDisplay,
		    anim = this,
		    orig = {},
		    style = elem.style,
		    hidden = elem.nodeType && isHidden(elem),
		    dataShow = jQuery._data(elem, "fxshow");

		// handle queue: false promises
		if (!opts.queue) {
			hooks = jQuery._queueHooks(elem, "fx");
			if (hooks.unqueued == null) {
				hooks.unqueued = 0;
				oldfire = hooks.empty.fire;
				hooks.empty.fire = function () {
					if (!hooks.unqueued) {
						oldfire();
					}
				};
			}
			hooks.unqueued++;

			anim.always(function () {
				// doing this makes sure that the complete handler will be called
				// before this completes
				anim.always(function () {
					hooks.unqueued--;
					if (!jQuery.queue(elem, "fx").length) {
						hooks.empty.fire();
					}
				});
			});
		}

		// height/width overflow pass
		if (elem.nodeType === 1 && ("height" in props || "width" in props)) {
			// Make sure that nothing sneaks out
			// Record all 3 overflow attributes because IE does not
			// change the overflow attribute when overflowX and
			// overflowY are set to the same value
			opts.overflow = [style.overflow, style.overflowX, style.overflowY];

			// Set display property to inline-block for height/width
			// animations on inline elements that are having width/height animated
			display = jQuery.css(elem, "display");
			dDisplay = defaultDisplay(elem.nodeName);
			if (display === "none") {
				display = dDisplay;
			}
			if (display === "inline" && jQuery.css(elem, "float") === "none") {

				// inline-level elements accept inline-block;
				// block-level elements need to be inline with layout
				if (!support.inlineBlockNeedsLayout || dDisplay === "inline") {
					style.display = "inline-block";
				} else {
					style.zoom = 1;
				}
			}
		}

		if (opts.overflow) {
			style.overflow = "hidden";
			if (!support.shrinkWrapBlocks()) {
				anim.always(function () {
					style.overflow = opts.overflow[0];
					style.overflowX = opts.overflow[1];
					style.overflowY = opts.overflow[2];
				});
			}
		}

		// show/hide pass
		for (prop in props) {
			value = props[prop];
			if (rfxtypes.exec(value)) {
				delete props[prop];
				toggle = toggle || value === "toggle";
				if (value === (hidden ? "hide" : "show")) {

					// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
					if (value === "show" && dataShow && dataShow[prop] !== undefined) {
						hidden = true;
					} else {
						continue;
					}
				}
				orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop);
			}
		}

		if (!jQuery.isEmptyObject(orig)) {
			if (dataShow) {
				if ("hidden" in dataShow) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = jQuery._data(elem, "fxshow", {});
			}

			// store state if its toggle - enables .stop().toggle() to "reverse"
			if (toggle) {
				dataShow.hidden = !hidden;
			}
			if (hidden) {
				jQuery(elem).show();
			} else {
				anim.done(function () {
					jQuery(elem).hide();
				});
			}
			anim.done(function () {
				var prop;
				jQuery._removeData(elem, "fxshow");
				for (prop in orig) {
					jQuery.style(elem, prop, orig[prop]);
				}
			});
			for (prop in orig) {
				tween = createTween(hidden ? dataShow[prop] : 0, prop, anim);

				if (!(prop in dataShow)) {
					dataShow[prop] = tween.start;
					if (hidden) {
						tween.end = tween.start;
						tween.start = prop === "width" || prop === "height" ? 1 : 0;
					}
				}
			}
		}
	}

	function propFilter(props, specialEasing) {
		var index, name, easing, value, hooks;

		// camelCase, specialEasing and expand cssHook pass
		for (index in props) {
			name = jQuery.camelCase(index);
			easing = specialEasing[name];
			value = props[index];
			if (jQuery.isArray(value)) {
				easing = value[1];
				value = props[index] = value[0];
			}

			if (index !== name) {
				props[name] = value;
				delete props[index];
			}

			hooks = jQuery.cssHooks[name];
			if (hooks && "expand" in hooks) {
				value = hooks.expand(value);
				delete props[name];

				// not quite $.extend, this wont overwrite keys already present.
				// also - reusing 'index' from above because we have the correct "name"
				for (index in value) {
					if (!(index in props)) {
						props[index] = value[index];
						specialEasing[index] = easing;
					}
				}
			} else {
				specialEasing[name] = easing;
			}
		}
	}

	function Animation(elem, properties, options) {
		var result,
		    stopped,
		    index = 0,
		    length = animationPrefilters.length,
		    deferred = jQuery.Deferred().always(function () {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		    tick = function tick() {
			if (stopped) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
			    remaining = Math.max(0, animation.startTime + animation.duration - currentTime),

			// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
			temp = remaining / animation.duration || 0,
			    percent = 1 - temp,
			    index = 0,
			    length = animation.tweens.length;

			for (; index < length; index++) {
				animation.tweens[index].run(percent);
			}

			deferred.notifyWith(elem, [animation, percent, remaining]);

			if (percent < 1 && length) {
				return remaining;
			} else {
				deferred.resolveWith(elem, [animation]);
				return false;
			}
		},
		    animation = deferred.promise({
			elem: elem,
			props: jQuery.extend({}, properties),
			opts: jQuery.extend(true, { specialEasing: {} }, options),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function createTween(prop, end) {
				var tween = jQuery.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
				animation.tweens.push(tween);
				return tween;
			},
			stop: function stop(gotoEnd) {
				var index = 0,

				// if we are going to the end, we want to run all the tweens
				// otherwise we skip this part
				length = gotoEnd ? animation.tweens.length : 0;
				if (stopped) {
					return this;
				}
				stopped = true;
				for (; index < length; index++) {
					animation.tweens[index].run(1);
				}

				// resolve when we played the last frame
				// otherwise, reject
				if (gotoEnd) {
					deferred.resolveWith(elem, [animation, gotoEnd]);
				} else {
					deferred.rejectWith(elem, [animation, gotoEnd]);
				}
				return this;
			}
		}),
		    props = animation.props;

		propFilter(props, animation.opts.specialEasing);

		for (; index < length; index++) {
			result = animationPrefilters[index].call(animation, elem, props, animation.opts);
			if (result) {
				return result;
			}
		}

		jQuery.map(props, createTween, animation);

		if (jQuery.isFunction(animation.opts.start)) {
			animation.opts.start.call(elem, animation);
		}

		jQuery.fx.timer(jQuery.extend(tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		}));

		// attach callbacks from options
		return animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
	}

	jQuery.Animation = jQuery.extend(Animation, {
		tweener: function tweener(props, callback) {
			if (jQuery.isFunction(props)) {
				callback = props;
				props = ["*"];
			} else {
				props = props.split(" ");
			}

			var prop,
			    index = 0,
			    length = props.length;

			for (; index < length; index++) {
				prop = props[index];
				tweeners[prop] = tweeners[prop] || [];
				tweeners[prop].unshift(callback);
			}
		},

		prefilter: function prefilter(callback, prepend) {
			if (prepend) {
				animationPrefilters.unshift(callback);
			} else {
				animationPrefilters.push(callback);
			}
		}
	});

	jQuery.speed = function (speed, easing, fn) {
		var opt = speed && (typeof speed === "undefined" ? "undefined" : _typeof(speed)) === "object" ? jQuery.extend({}, speed) : {
			complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;

		// normalize opt.queue - true/undefined/null -> "fx"
		if (opt.queue == null || opt.queue === true) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function () {
			if (jQuery.isFunction(opt.old)) {
				opt.old.call(this);
			}

			if (opt.queue) {
				jQuery.dequeue(this, opt.queue);
			}
		};

		return opt;
	};

	jQuery.fn.extend({
		fadeTo: function fadeTo(speed, to, easing, callback) {

			// show any hidden elements after setting opacity to 0
			return this.filter(isHidden).css("opacity", 0).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback);
		},
		animate: function animate(prop, speed, easing, callback) {
			var empty = jQuery.isEmptyObject(prop),
			    optall = jQuery.speed(speed, easing, callback),
			    doAnimation = function doAnimation() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation(this, jQuery.extend({}, prop), optall);

				// Empty animations, or finishing resolves immediately
				if (empty || jQuery._data(this, "finish")) {
					anim.stop(true);
				}
			};
			doAnimation.finish = doAnimation;

			return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
		},
		stop: function stop(type, clearQueue, gotoEnd) {
			var stopQueue = function stopQueue(hooks) {
				var stop = hooks.stop;
				delete hooks.stop;
				stop(gotoEnd);
			};

			if (typeof type !== "string") {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if (clearQueue && type !== false) {
				this.queue(type || "fx", []);
			}

			return this.each(function () {
				var dequeue = true,
				    index = type != null && type + "queueHooks",
				    timers = jQuery.timers,
				    data = jQuery._data(this);

				if (index) {
					if (data[index] && data[index].stop) {
						stopQueue(data[index]);
					}
				} else {
					for (index in data) {
						if (data[index] && data[index].stop && rrun.test(index)) {
							stopQueue(data[index]);
						}
					}
				}

				for (index = timers.length; index--;) {
					if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
						timers[index].anim.stop(gotoEnd);
						dequeue = false;
						timers.splice(index, 1);
					}
				}

				// start the next in the queue if the last step wasn't forced
				// timers currently will call their complete callbacks, which will dequeue
				// but only if they were gotoEnd
				if (dequeue || !gotoEnd) {
					jQuery.dequeue(this, type);
				}
			});
		},
		finish: function finish(type) {
			if (type !== false) {
				type = type || "fx";
			}
			return this.each(function () {
				var index,
				    data = jQuery._data(this),
				    queue = data[type + "queue"],
				    hooks = data[type + "queueHooks"],
				    timers = jQuery.timers,
				    length = queue ? queue.length : 0;

				// enable finishing flag on private data
				data.finish = true;

				// empty the queue first
				jQuery.queue(this, type, []);

				if (hooks && hooks.stop) {
					hooks.stop.call(this, true);
				}

				// look for any active animations, and finish them
				for (index = timers.length; index--;) {
					if (timers[index].elem === this && timers[index].queue === type) {
						timers[index].anim.stop(true);
						timers.splice(index, 1);
					}
				}

				// look for any animations in the old queue and finish them
				for (index = 0; index < length; index++) {
					if (queue[index] && queue[index].finish) {
						queue[index].finish.call(this);
					}
				}

				// turn off finishing flag
				delete data.finish;
			});
		}
	});

	jQuery.each(["toggle", "show", "hide"], function (i, name) {
		var cssFn = jQuery.fn[name];
		jQuery.fn[name] = function (speed, easing, callback) {
			return speed == null || typeof speed === "boolean" ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
		};
	});

	// Generate shortcuts for custom animations
	jQuery.each({
		slideDown: genFx("show"),
		slideUp: genFx("hide"),
		slideToggle: genFx("toggle"),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function (name, props) {
		jQuery.fn[name] = function (speed, easing, callback) {
			return this.animate(props, speed, easing, callback);
		};
	});

	jQuery.timers = [];
	jQuery.fx.tick = function () {
		var timer,
		    timers = jQuery.timers,
		    i = 0;

		fxNow = jQuery.now();

		for (; i < timers.length; i++) {
			timer = timers[i];
			// Checks the timer has not already been removed
			if (!timer() && timers[i] === timer) {
				timers.splice(i--, 1);
			}
		}

		if (!timers.length) {
			jQuery.fx.stop();
		}
		fxNow = undefined;
	};

	jQuery.fx.timer = function (timer) {
		jQuery.timers.push(timer);
		if (timer()) {
			jQuery.fx.start();
		} else {
			jQuery.timers.pop();
		}
	};

	jQuery.fx.interval = 13;

	jQuery.fx.start = function () {
		if (!timerId) {
			timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval);
		}
	};

	jQuery.fx.stop = function () {
		clearInterval(timerId);
		timerId = null;
	};

	jQuery.fx.speeds = {
		slow: 600,
		fast: 200,
		// Default speed
		_default: 400
	};

	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	jQuery.fn.delay = function (time, type) {
		time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
		type = type || "fx";

		return this.queue(type, function (next, hooks) {
			var timeout = setTimeout(next, time);
			hooks.stop = function () {
				clearTimeout(timeout);
			};
		});
	};

	(function () {
		var a,
		    input,
		    select,
		    opt,
		    div = document.createElement("div");

		// Setup
		div.setAttribute("className", "t");
		div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
		a = div.getElementsByTagName("a")[0];

		// First batch of tests.
		select = document.createElement("select");
		opt = select.appendChild(document.createElement("option"));
		input = div.getElementsByTagName("input")[0];

		a.style.cssText = "top:1px";

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		support.getSetAttribute = div.className !== "t";

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		support.style = /top/.test(a.getAttribute("style"));

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		support.hrefNormalized = a.getAttribute("href") === "/a";

		// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
		support.checkOn = !!input.value;

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		support.optSelected = opt.selected;

		// Tests for enctype support on a form (#6743)
		support.enctype = !!document.createElement("form").enctype;

		// Make sure that the options inside disabled selects aren't marked as disabled
		// (WebKit marks them as disabled)
		select.disabled = true;
		support.optDisabled = !opt.disabled;

		// Support: IE8 only
		// Check if we can trust getAttribute("value")
		input = document.createElement("input");
		input.setAttribute("value", "");
		support.input = input.getAttribute("value") === "";

		// Check if an input maintains its value after becoming a radio
		input.value = "t";
		input.setAttribute("type", "radio");
		support.radioValue = input.value === "t";

		// Null elements to avoid leaks in IE.
		a = input = select = opt = div = null;
	})();

	var rreturn = /\r/g;

	jQuery.fn.extend({
		val: function val(value) {
			var hooks,
			    ret,
			    isFunction,
			    elem = this[0];

			if (!arguments.length) {
				if (elem) {
					hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];

					if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) {
						return ret;
					}

					ret = elem.value;

					return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
				}

				return;
			}

			isFunction = jQuery.isFunction(value);

			return this.each(function (i) {
				var val;

				if (this.nodeType !== 1) {
					return;
				}

				if (isFunction) {
					val = value.call(this, i, jQuery(this).val());
				} else {
					val = value;
				}

				// Treat null/undefined as ""; convert numbers to string
				if (val == null) {
					val = "";
				} else if (typeof val === "number") {
					val += "";
				} else if (jQuery.isArray(val)) {
					val = jQuery.map(val, function (value) {
						return value == null ? "" : value + "";
					});
				}

				hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];

				// If set returns undefined, fall back to normal setting
				if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
					this.value = val;
				}
			});
		}
	});

	jQuery.extend({
		valHooks: {
			option: {
				get: function get(elem) {
					var val = jQuery.find.attr(elem, "value");
					return val != null ? val : jQuery.text(elem);
				}
			},
			select: {
				get: function get(elem) {
					var value,
					    option,
					    options = elem.options,
					    index = elem.selectedIndex,
					    one = elem.type === "select-one" || index < 0,
					    values = one ? null : [],
					    max = one ? index + 1 : options.length,
					    i = index < 0 ? max : one ? index : 0;

					// Loop through all the selected options
					for (; i < max; i++) {
						option = options[i];

						// oldIE doesn't update selected after form reset (#2551)
						if ((option.selected || i === index) && (
						// Don't return options that are disabled or in a disabled optgroup
						support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {

							// Get the specific value for the option
							value = jQuery(option).val();

							// We don't need an array for one selects
							if (one) {
								return value;
							}

							// Multi-Selects return an array
							values.push(value);
						}
					}

					return values;
				},

				set: function set(elem, value) {
					var optionSet,
					    option,
					    options = elem.options,
					    values = jQuery.makeArray(value),
					    i = options.length;

					while (i--) {
						option = options[i];

						if (jQuery.inArray(jQuery.valHooks.option.get(option), values) >= 0) {

							// Support: IE6
							// When new option element is added to select box we need to
							// force reflow of newly added node in order to workaround delay
							// of initialization properties
							try {
								option.selected = optionSet = true;
							} catch (_) {

								// Will be executed only in IE6
								option.scrollHeight;
							}
						} else {
							option.selected = false;
						}
					}

					// Force browsers to behave consistently when non-matching value is set
					if (!optionSet) {
						elem.selectedIndex = -1;
					}

					return options;
				}
			}
		}
	});

	// Radios and checkboxes getter/setter
	jQuery.each(["radio", "checkbox"], function () {
		jQuery.valHooks[this] = {
			set: function set(elem, value) {
				if (jQuery.isArray(value)) {
					return elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0;
				}
			}
		};
		if (!support.checkOn) {
			jQuery.valHooks[this].get = function (elem) {
				// Support: Webkit
				// "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			};
		}
	});

	var nodeHook,
	    boolHook,
	    attrHandle = jQuery.expr.attrHandle,
	    ruseDefault = /^(?:checked|selected)$/i,
	    getSetAttribute = support.getSetAttribute,
	    getSetInput = support.input;

	jQuery.fn.extend({
		attr: function attr(name, value) {
			return access(this, jQuery.attr, name, value, arguments.length > 1);
		},

		removeAttr: function removeAttr(name) {
			return this.each(function () {
				jQuery.removeAttr(this, name);
			});
		}
	});

	jQuery.extend({
		attr: function attr(elem, name, value) {
			var hooks,
			    ret,
			    nType = elem.nodeType;

			// don't get/set attributes on text, comment and attribute nodes
			if (!elem || nType === 3 || nType === 8 || nType === 2) {
				return;
			}

			// Fallback to prop when attributes are not supported
			if (_typeof(elem.getAttribute) === strundefined) {
				return jQuery.prop(elem, name, value);
			}

			// All attributes are lowercase
			// Grab necessary hook if one is defined
			if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
				name = name.toLowerCase();
				hooks = jQuery.attrHooks[name] || (jQuery.expr.match.bool.test(name) ? boolHook : nodeHook);
			}

			if (value !== undefined) {

				if (value === null) {
					jQuery.removeAttr(elem, name);
				} else if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) {
					return ret;
				} else {
					elem.setAttribute(name, value + "");
					return value;
				}
			} else if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
				return ret;
			} else {
				ret = jQuery.find.attr(elem, name);

				// Non-existent attributes return null, we normalize to undefined
				return ret == null ? undefined : ret;
			}
		},

		removeAttr: function removeAttr(elem, value) {
			var name,
			    propName,
			    i = 0,
			    attrNames = value && value.match(rnotwhite);

			if (attrNames && elem.nodeType === 1) {
				while (name = attrNames[i++]) {
					propName = jQuery.propFix[name] || name;

					// Boolean attributes get special treatment (#10870)
					if (jQuery.expr.match.bool.test(name)) {
						// Set corresponding property to false
						if (getSetInput && getSetAttribute || !ruseDefault.test(name)) {
							elem[propName] = false;
							// Support: IE<9
							// Also clear defaultChecked/defaultSelected (if appropriate)
						} else {
							elem[jQuery.camelCase("default-" + name)] = elem[propName] = false;
						}

						// See #9699 for explanation of this approach (setting first, then removal)
					} else {
						jQuery.attr(elem, name, "");
					}

					elem.removeAttribute(getSetAttribute ? name : propName);
				}
			}
		},

		attrHooks: {
			type: {
				set: function set(elem, value) {
					if (!support.radioValue && value === "radio" && jQuery.nodeName(elem, "input")) {
						// Setting the type on a radio button after the value resets the value in IE6-9
						// Reset value to default in case type is set after value during creation
						var val = elem.value;
						elem.setAttribute("type", value);
						if (val) {
							elem.value = val;
						}
						return value;
					}
				}
			}
		}
	});

	// Hook for boolean attributes
	boolHook = {
		set: function set(elem, value, name) {
			if (value === false) {
				// Remove boolean attributes when set to false
				jQuery.removeAttr(elem, name);
			} else if (getSetInput && getSetAttribute || !ruseDefault.test(name)) {
				// IE<8 needs the *property* name
				elem.setAttribute(!getSetAttribute && jQuery.propFix[name] || name, name);

				// Use defaultChecked and defaultSelected for oldIE
			} else {
				elem[jQuery.camelCase("default-" + name)] = elem[name] = true;
			}

			return name;
		}
	};

	// Retrieve booleans specially
	jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function (i, name) {

		var getter = attrHandle[name] || jQuery.find.attr;

		attrHandle[name] = getSetInput && getSetAttribute || !ruseDefault.test(name) ? function (elem, name, isXML) {
			var ret, handle;
			if (!isXML) {
				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[name];
				attrHandle[name] = ret;
				ret = getter(elem, name, isXML) != null ? name.toLowerCase() : null;
				attrHandle[name] = handle;
			}
			return ret;
		} : function (elem, name, isXML) {
			if (!isXML) {
				return elem[jQuery.camelCase("default-" + name)] ? name.toLowerCase() : null;
			}
		};
	});

	// fix oldIE attroperties
	if (!getSetInput || !getSetAttribute) {
		jQuery.attrHooks.value = {
			set: function set(elem, value, name) {
				if (jQuery.nodeName(elem, "input")) {
					// Does not return so that setAttribute is also used
					elem.defaultValue = value;
				} else {
					// Use nodeHook if defined (#1954); otherwise setAttribute is fine
					return nodeHook && nodeHook.set(elem, value, name);
				}
			}
		};
	}

	// IE6/7 do not support getting/setting some attributes with get/setAttribute
	if (!getSetAttribute) {

		// Use this for any attribute in IE6/7
		// This fixes almost every IE6/7 issue
		nodeHook = {
			set: function set(elem, value, name) {
				// Set the existing or create a new attribute node
				var ret = elem.getAttributeNode(name);
				if (!ret) {
					elem.setAttributeNode(ret = elem.ownerDocument.createAttribute(name));
				}

				ret.value = value += "";

				// Break association with cloned elements by also using setAttribute (#9646)
				if (name === "value" || value === elem.getAttribute(name)) {
					return value;
				}
			}
		};

		// Some attributes are constructed with empty-string values when not defined
		attrHandle.id = attrHandle.name = attrHandle.coords = function (elem, name, isXML) {
			var ret;
			if (!isXML) {
				return (ret = elem.getAttributeNode(name)) && ret.value !== "" ? ret.value : null;
			}
		};

		// Fixing value retrieval on a button requires this module
		jQuery.valHooks.button = {
			get: function get(elem, name) {
				var ret = elem.getAttributeNode(name);
				if (ret && ret.specified) {
					return ret.value;
				}
			},
			set: nodeHook.set
		};

		// Set contenteditable to false on removals(#10429)
		// Setting to empty string throws an error as an invalid value
		jQuery.attrHooks.contenteditable = {
			set: function set(elem, value, name) {
				nodeHook.set(elem, value === "" ? false : value, name);
			}
		};

		// Set width and height to auto instead of 0 on empty string( Bug #8150 )
		// This is for removals
		jQuery.each(["width", "height"], function (i, name) {
			jQuery.attrHooks[name] = {
				set: function set(elem, value) {
					if (value === "") {
						elem.setAttribute(name, "auto");
						return value;
					}
				}
			};
		});
	}

	if (!support.style) {
		jQuery.attrHooks.style = {
			get: function get(elem) {
				// Return undefined in the case of empty string
				// Note: IE uppercases css property names, but if we were to .toLowerCase()
				// .cssText, that would destroy case senstitivity in URL's, like in "background"
				return elem.style.cssText || undefined;
			},
			set: function set(elem, value) {
				return elem.style.cssText = value + "";
			}
		};
	}

	var rfocusable = /^(?:input|select|textarea|button|object)$/i,
	    rclickable = /^(?:a|area)$/i;

	jQuery.fn.extend({
		prop: function prop(name, value) {
			return access(this, jQuery.prop, name, value, arguments.length > 1);
		},

		removeProp: function removeProp(name) {
			name = jQuery.propFix[name] || name;
			return this.each(function () {
				// try/catch handles cases where IE balks (such as removing a property on window)
				try {
					this[name] = undefined;
					delete this[name];
				} catch (e) {}
			});
		}
	});

	jQuery.extend({
		propFix: {
			"for": "htmlFor",
			"class": "className"
		},

		prop: function prop(elem, name, value) {
			var ret,
			    hooks,
			    notxml,
			    nType = elem.nodeType;

			// don't get/set properties on text, comment and attribute nodes
			if (!elem || nType === 3 || nType === 8 || nType === 2) {
				return;
			}

			notxml = nType !== 1 || !jQuery.isXMLDoc(elem);

			if (notxml) {
				// Fix name and attach hooks
				name = jQuery.propFix[name] || name;
				hooks = jQuery.propHooks[name];
			}

			if (value !== undefined) {
				return hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined ? ret : elem[name] = value;
			} else {
				return hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null ? ret : elem[name];
			}
		},

		propHooks: {
			tabIndex: {
				get: function get(elem) {
					// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					// Use proper attribute retrieval(#12072)
					var tabindex = jQuery.find.attr(elem, "tabindex");

					return tabindex ? parseInt(tabindex, 10) : rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ? 0 : -1;
				}
			}
		}
	});

	// Some attributes require a special call on IE
	// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
	if (!support.hrefNormalized) {
		// href/src property should get the full normalized URL (#10299/#12915)
		jQuery.each(["href", "src"], function (i, name) {
			jQuery.propHooks[name] = {
				get: function get(elem) {
					return elem.getAttribute(name, 4);
				}
			};
		});
	}

	// Support: Safari, IE9+
	// mis-reports the default selected property of an option
	// Accessing the parent's selectedIndex property fixes it
	if (!support.optSelected) {
		jQuery.propHooks.selected = {
			get: function get(elem) {
				var parent = elem.parentNode;

				if (parent) {
					parent.selectedIndex;

					// Make sure that it also works with optgroups, see #5701
					if (parent.parentNode) {
						parent.parentNode.selectedIndex;
					}
				}
				return null;
			}
		};
	}

	jQuery.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function () {
		jQuery.propFix[this.toLowerCase()] = this;
	});

	// IE6/7 call enctype encoding
	if (!support.enctype) {
		jQuery.propFix.enctype = "encoding";
	}

	var rclass = /[\t\r\n\f]/g;

	jQuery.fn.extend({
		addClass: function addClass(value) {
			var classes,
			    elem,
			    cur,
			    clazz,
			    j,
			    finalValue,
			    i = 0,
			    len = this.length,
			    proceed = typeof value === "string" && value;

			if (jQuery.isFunction(value)) {
				return this.each(function (j) {
					jQuery(this).addClass(value.call(this, j, this.className));
				});
			}

			if (proceed) {
				// The disjunction here is for better compressibility (see removeClass)
				classes = (value || "").match(rnotwhite) || [];

				for (; i < len; i++) {
					elem = this[i];
					cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : " ");

					if (cur) {
						j = 0;
						while (clazz = classes[j++]) {
							if (cur.indexOf(" " + clazz + " ") < 0) {
								cur += clazz + " ";
							}
						}

						// only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim(cur);
						if (elem.className !== finalValue) {
							elem.className = finalValue;
						}
					}
				}
			}

			return this;
		},

		removeClass: function removeClass(value) {
			var classes,
			    elem,
			    cur,
			    clazz,
			    j,
			    finalValue,
			    i = 0,
			    len = this.length,
			    proceed = arguments.length === 0 || typeof value === "string" && value;

			if (jQuery.isFunction(value)) {
				return this.each(function (j) {
					jQuery(this).removeClass(value.call(this, j, this.className));
				});
			}
			if (proceed) {
				classes = (value || "").match(rnotwhite) || [];

				for (; i < len; i++) {
					elem = this[i];
					// This expression is here for better compressibility (see addClass)
					cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : "");

					if (cur) {
						j = 0;
						while (clazz = classes[j++]) {
							// Remove *all* instances
							while (cur.indexOf(" " + clazz + " ") >= 0) {
								cur = cur.replace(" " + clazz + " ", " ");
							}
						}

						// only assign if different to avoid unneeded rendering.
						finalValue = value ? jQuery.trim(cur) : "";
						if (elem.className !== finalValue) {
							elem.className = finalValue;
						}
					}
				}
			}

			return this;
		},

		toggleClass: function toggleClass(value, stateVal) {
			var type = typeof value === "undefined" ? "undefined" : _typeof(value);

			if (typeof stateVal === "boolean" && type === "string") {
				return stateVal ? this.addClass(value) : this.removeClass(value);
			}

			if (jQuery.isFunction(value)) {
				return this.each(function (i) {
					jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
				});
			}

			return this.each(function () {
				if (type === "string") {
					// toggle individual class names
					var className,
					    i = 0,
					    self = jQuery(this),
					    classNames = value.match(rnotwhite) || [];

					while (className = classNames[i++]) {
						// check each className given, space separated list
						if (self.hasClass(className)) {
							self.removeClass(className);
						} else {
							self.addClass(className);
						}
					}

					// Toggle whole class name
				} else if (type === strundefined || type === "boolean") {
					if (this.className) {
						// store className if set
						jQuery._data(this, "__className__", this.className);
					}

					// If the element has a class name or if we're passed "false",
					// then remove the whole classname (if there was one, the above saved it).
					// Otherwise bring back whatever was previously saved (if anything),
					// falling back to the empty string if nothing was stored.
					this.className = this.className || value === false ? "" : jQuery._data(this, "__className__") || "";
				}
			});
		},

		hasClass: function hasClass(selector) {
			var className = " " + selector + " ",
			    i = 0,
			    l = this.length;
			for (; i < l; i++) {
				if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) >= 0) {
					return true;
				}
			}

			return false;
		}
	});

	// Return jQuery for attributes-only inclusion


	jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick " + "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + "change select submit keydown keypress keyup error contextmenu").split(" "), function (i, name) {

		// Handle event binding
		jQuery.fn[name] = function (data, fn) {
			return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
		};
	});

	jQuery.fn.extend({
		hover: function hover(fnOver, fnOut) {
			return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
		},

		bind: function bind(types, data, fn) {
			return this.on(types, null, data, fn);
		},
		unbind: function unbind(types, fn) {
			return this.off(types, null, fn);
		},

		delegate: function delegate(selector, types, data, fn) {
			return this.on(types, selector, data, fn);
		},
		undelegate: function undelegate(selector, types, fn) {
			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
		}
	});

	var nonce = jQuery.now();

	var rquery = /\?/;

	var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;

	jQuery.parseJSON = function (data) {
		// Attempt to parse using the native JSON parser first
		if (window.JSON && window.JSON.parse) {
			// Support: Android 2.3
			// Workaround failure to string-cast null input
			return window.JSON.parse(data + "");
		}

		var requireNonComma,
		    depth = null,
		    str = jQuery.trim(data + "");

		// Guard against invalid (and possibly dangerous) input by ensuring that nothing remains
		// after removing valid tokens
		return str && !jQuery.trim(str.replace(rvalidtokens, function (token, comma, open, close) {

			// Force termination if we see a misplaced comma
			if (requireNonComma && comma) {
				depth = 0;
			}

			// Perform no more replacements after returning to outermost depth
			if (depth === 0) {
				return token;
			}

			// Commas must not follow "[", "{", or ","
			requireNonComma = open || comma;

			// Determine new depth
			// array/object open ("[" or "{"): depth += true - false (increment)
			// array/object close ("]" or "}"): depth += false - true (decrement)
			// other cases ("," or primitive): depth += true - true (numeric cast)
			depth += !close - !open;

			// Remove this token
			return "";
		})) ? Function("return " + str)() : jQuery.error("Invalid JSON: " + data);
	};

	// Cross-browser xml parsing
	jQuery.parseXML = function (data) {
		var xml, tmp;
		if (!data || typeof data !== "string") {
			return null;
		}
		try {
			if (window.DOMParser) {
				// Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString(data, "text/xml");
			} else {
				// IE
				xml = new ActiveXObject("Microsoft.XMLDOM");
				xml.async = "false";
				xml.loadXML(data);
			}
		} catch (e) {
			xml = undefined;
		}
		if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
			jQuery.error("Invalid XML: " + data);
		}
		return xml;
	};

	var
	// Document location
	ajaxLocParts,
	    ajaxLocation,
	    rhash = /#.*$/,
	    rts = /([?&])_=[^&]*/,
	    rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,
	    // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	    rnoContent = /^(?:GET|HEAD)$/,
	    rprotocol = /^\/\//,
	    rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,


	/* Prefilters
  * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
  * 2) These are called:
  *    - BEFORE asking for a transport
  *    - AFTER param serialization (s.data is a string if s.processData is true)
  * 3) key is the dataType
  * 4) the catchall symbol "*" can be used
  * 5) execution will start with transport dataType and THEN continue down to "*" if needed
  */
	prefilters = {},


	/* Transports bindings
  * 1) key is the dataType
  * 2) the catchall symbol "*" can be used
  * 3) selection will start with transport dataType and THEN go to "*" if needed
  */
	transports = {},


	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

	// #8138, IE may throw an exception when accessing
	// a field from window.location if document.domain has been set
	try {
		ajaxLocation = location.href;
	} catch (e) {
		// Use the href attribute of an A element
		// since IE will modify it given document.location
		ajaxLocation = document.createElement("a");
		ajaxLocation.href = "";
		ajaxLocation = ajaxLocation.href;
	}

	// Segment location into parts
	ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];

	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports(structure) {

		// dataTypeExpression is optional and defaults to "*"
		return function (dataTypeExpression, func) {

			if (typeof dataTypeExpression !== "string") {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}

			var dataType,
			    i = 0,
			    dataTypes = dataTypeExpression.toLowerCase().match(rnotwhite) || [];

			if (jQuery.isFunction(func)) {
				// For each dataType in the dataTypeExpression
				while (dataType = dataTypes[i++]) {
					// Prepend if requested
					if (dataType.charAt(0) === "+") {
						dataType = dataType.slice(1) || "*";
						(structure[dataType] = structure[dataType] || []).unshift(func);

						// Otherwise append
					} else {
						(structure[dataType] = structure[dataType] || []).push(func);
					}
				}
			}
		};
	}

	// Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {

		var inspected = {},
		    seekingTransport = structure === transports;

		function inspect(dataType) {
			var selected;
			inspected[dataType] = true;
			jQuery.each(structure[dataType] || [], function (_, prefilterOrFactory) {
				var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
				if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
					options.dataTypes.unshift(dataTypeOrTransport);
					inspect(dataTypeOrTransport);
					return false;
				} else if (seekingTransport) {
					return !(selected = dataTypeOrTransport);
				}
			});
			return selected;
		}

		return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
	}

	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	function ajaxExtend(target, src) {
		var deep,
		    key,
		    flatOptions = jQuery.ajaxSettings.flatOptions || {};

		for (key in src) {
			if (src[key] !== undefined) {
				(flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
			}
		}
		if (deep) {
			jQuery.extend(true, target, deep);
		}

		return target;
	}

	/* Handles responses to an ajax request:
  * - finds the right dataType (mediates between content-type and expected dataType)
  * - returns the corresponding response
  */
	function ajaxHandleResponses(s, jqXHR, responses) {
		var firstDataType,
		    ct,
		    finalDataType,
		    type,
		    contents = s.contents,
		    dataTypes = s.dataTypes;

		// Remove auto dataType and get content-type in the process
		while (dataTypes[0] === "*") {
			dataTypes.shift();
			if (ct === undefined) {
				ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
			}
		}

		// Check if we're dealing with a known content-type
		if (ct) {
			for (type in contents) {
				if (contents[type] && contents[type].test(ct)) {
					dataTypes.unshift(type);
					break;
				}
			}
		}

		// Check to see if we have a response for the expected dataType
		if (dataTypes[0] in responses) {
			finalDataType = dataTypes[0];
		} else {
			// Try convertible dataTypes
			for (type in responses) {
				if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
					finalDataType = type;
					break;
				}
				if (!firstDataType) {
					firstDataType = type;
				}
			}
			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}

		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if (finalDataType) {
			if (finalDataType !== dataTypes[0]) {
				dataTypes.unshift(finalDataType);
			}
			return responses[finalDataType];
		}
	}

	/* Chain conversions given the request and the original response
  * Also sets the responseXXX fields on the jqXHR instance
  */
	function ajaxConvert(s, response, jqXHR, isSuccess) {
		var conv2,
		    current,
		    conv,
		    tmp,
		    prev,
		    converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

		// Create converters map with lowercased keys
		if (dataTypes[1]) {
			for (conv in s.converters) {
				converters[conv.toLowerCase()] = s.converters[conv];
			}
		}

		current = dataTypes.shift();

		// Convert to each sequential dataType
		while (current) {

			if (s.responseFields[current]) {
				jqXHR[s.responseFields[current]] = response;
			}

			// Apply the dataFilter if provided
			if (!prev && isSuccess && s.dataFilter) {
				response = s.dataFilter(response, s.dataType);
			}

			prev = current;
			current = dataTypes.shift();

			if (current) {

				// There's only work to do if current dataType is non-auto
				if (current === "*") {

					current = prev;

					// Convert response if prev dataType is non-auto and differs from current
				} else if (prev !== "*" && prev !== current) {

					// Seek a direct converter
					conv = converters[prev + " " + current] || converters["* " + current];

					// If none found, seek a pair
					if (!conv) {
						for (conv2 in converters) {

							// If conv2 outputs current
							tmp = conv2.split(" ");
							if (tmp[1] === current) {

								// If prev can be converted to accepted input
								conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
								if (conv) {
									// Condense equivalence converters
									if (conv === true) {
										conv = converters[conv2];

										// Otherwise, insert the intermediate dataType
									} else if (converters[conv2] !== true) {
										current = tmp[0];
										dataTypes.unshift(tmp[1]);
									}
									break;
								}
							}
						}
					}

					// Apply converter (if not an equivalence)
					if (conv !== true) {

						// Unless errors are allowed to bubble, catch and return them
						if (conv && s["throws"]) {
							response = conv(response);
						} else {
							try {
								response = conv(response);
							} catch (e) {
								return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
							}
						}
					}
				}
			}
		}

		return { state: "success", data: response };
	}

	jQuery.extend({

		// Counter for holding the number of active queries
		active: 0,

		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},

		ajaxSettings: {
			url: ajaxLocation,
			type: "GET",
			isLocal: rlocalProtocol.test(ajaxLocParts[1]),
			global: true,
			processData: true,
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			/*
   timeout: 0,
   data: null,
   dataType: null,
   username: null,
   password: null,
   cache: null,
   throws: false,
   traditional: false,
   headers: {},
   */

			accepts: {
				"*": allTypes,
				text: "text/plain",
				html: "text/html",
				xml: "application/xml, text/xml",
				json: "application/json, text/javascript"
			},

			contents: {
				xml: /xml/,
				html: /html/,
				json: /json/
			},

			responseFields: {
				xml: "responseXML",
				text: "responseText",
				json: "responseJSON"
			},

			// Data converters
			// Keys separate source (or catchall "*") and destination types with a single space
			converters: {

				// Convert anything to text
				"* text": String,

				// Text to html (true = no transformation)
				"text html": true,

				// Evaluate text as a json expression
				"text json": jQuery.parseJSON,

				// Parse text as xml
				"text xml": jQuery.parseXML
			},

			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				url: true,
				context: true
			}
		},

		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup: function ajaxSetup(target, settings) {
			return settings ?

			// Building a settings object
			ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) :

			// Extending ajaxSettings
			ajaxExtend(jQuery.ajaxSettings, target);
		},

		ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
		ajaxTransport: addToPrefiltersOrTransports(transports),

		// Main method
		ajax: function ajax(url, options) {

			// If url is an object, simulate pre-1.5 signature
			if ((typeof url === "undefined" ? "undefined" : _typeof(url)) === "object") {
				options = url;
				url = undefined;
			}

			// Force options to be an object
			options = options || {};

			var // Cross-domain detection vars
			parts,

			// Loop variable
			i,

			// URL without anti-cache param
			cacheURL,

			// Response headers as string
			responseHeadersString,

			// timeout handle
			timeoutTimer,


			// To know if global events are to be dispatched
			fireGlobals,
			    transport,

			// Response headers
			responseHeaders,

			// Create the final options object
			s = jQuery.ajaxSetup({}, options),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery(callbackContext) : jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			    completeDeferred = jQuery.Callbacks("once memory"),

			// Status-dependent callbacks
			_statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			    requestHeadersNames = {},

			// The jqXHR state
			state = 0,

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function getResponseHeader(key) {
					var match;
					if (state === 2) {
						if (!responseHeaders) {
							responseHeaders = {};
							while (match = rheaders.exec(responseHeadersString)) {
								responseHeaders[match[1].toLowerCase()] = match[2];
							}
						}
						match = responseHeaders[key.toLowerCase()];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function getAllResponseHeaders() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function setRequestHeader(name, value) {
					var lname = name.toLowerCase();
					if (!state) {
						name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
						requestHeaders[name] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function overrideMimeType(type) {
					if (!state) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function statusCode(map) {
					var code;
					if (map) {
						if (state < 2) {
							for (code in map) {
								// Lazy-add the new callback in a way that preserves old ones
								_statusCode[code] = [_statusCode[code], map[code]];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always(map[jqXHR.status]);
						}
					}
					return this;
				},

				// Cancel the request
				abort: function abort(statusText) {
					var finalText = statusText || strAbort;
					if (transport) {
						transport.abort(finalText);
					}
					done(0, finalText);
					return this;
				}
			};

			// Attach deferreds
			deferred.promise(jqXHR).complete = completeDeferred.add;
			jqXHR.success = jqXHR.done;
			jqXHR.error = jqXHR.fail;

			// Remove hash character (#7531: and string promotion)
			// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
			// Handle falsy url in the settings object (#10093: consistency with old signature)
			// We also use the url parameter if available
			s.url = ((url || s.url || ajaxLocation) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");

			// Alias method option to type as per ticket #12004
			s.type = options.method || options.type || s.method || s.type;

			// Extract dataTypes list
			s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(rnotwhite) || [""];

			// A cross-domain request is in order when we have a protocol:host:port mismatch
			if (s.crossDomain == null) {
				parts = rurl.exec(s.url.toLowerCase());
				s.crossDomain = !!(parts && (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] || (parts[3] || (parts[1] === "http:" ? "80" : "443")) !== (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? "80" : "443"))));
			}

			// Convert data if not already a string
			if (s.data && s.processData && typeof s.data !== "string") {
				s.data = jQuery.param(s.data, s.traditional);
			}

			// Apply prefilters
			inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

			// If request was aborted inside a prefilter, stop there
			if (state === 2) {
				return jqXHR;
			}

			// We can fire global events as of now if asked to
			fireGlobals = s.global;

			// Watch for a new set of requests
			if (fireGlobals && jQuery.active++ === 0) {
				jQuery.event.trigger("ajaxStart");
			}

			// Uppercase the type
			s.type = s.type.toUpperCase();

			// Determine if request has content
			s.hasContent = !rnoContent.test(s.type);

			// Save the URL in case we're toying with the If-Modified-Since
			// and/or If-None-Match header later on
			cacheURL = s.url;

			// More options handling for requests with no content
			if (!s.hasContent) {

				// If data is available, append data to url
				if (s.data) {
					cacheURL = s.url += (rquery.test(cacheURL) ? "&" : "?") + s.data;
					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}

				// Add anti-cache in url if needed
				if (s.cache === false) {
					s.url = rts.test(cacheURL) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace(rts, "$1_=" + nonce++) :

					// Otherwise add one to the end
					cacheURL + (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce++;
				}
			}

			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if (s.ifModified) {
				if (jQuery.lastModified[cacheURL]) {
					jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]);
				}
				if (jQuery.etag[cacheURL]) {
					jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
				}
			}

			// Set the correct header, if data is being sent
			if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
				jqXHR.setRequestHeader("Content-Type", s.contentType);
			}

			// Set the Accepts header for the server, depending on the dataType
			jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);

			// Check for headers option
			for (i in s.headers) {
				jqXHR.setRequestHeader(i, s.headers[i]);
			}

			// Allow custom headers/mimetypes and early abort
			if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
				// Abort if not done already and return
				return jqXHR.abort();
			}

			// aborting is no longer a cancellation
			strAbort = "abort";

			// Install callbacks on deferreds
			for (i in { success: 1, error: 1, complete: 1 }) {
				jqXHR[i](s[i]);
			}

			// Get transport
			transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

			// If no transport, we auto-abort
			if (!transport) {
				done(-1, "No Transport");
			} else {
				jqXHR.readyState = 1;

				// Send global event
				if (fireGlobals) {
					globalEventContext.trigger("ajaxSend", [jqXHR, s]);
				}
				// Timeout
				if (s.async && s.timeout > 0) {
					timeoutTimer = setTimeout(function () {
						jqXHR.abort("timeout");
					}, s.timeout);
				}

				try {
					state = 1;
					transport.send(requestHeaders, done);
				} catch (e) {
					// Propagate exception as error if not done
					if (state < 2) {
						done(-1, e);
						// Simply rethrow otherwise
					} else {
						throw e;
					}
				}
			}

			// Callback for when everything is done
			function done(status, nativeStatusText, responses, headers) {
				var isSuccess,
				    success,
				    error,
				    response,
				    modified,
				    statusText = nativeStatusText;

				// Called once
				if (state === 2) {
					return;
				}

				// State is "done" now
				state = 2;

				// Clear timeout if it exists
				if (timeoutTimer) {
					clearTimeout(timeoutTimer);
				}

				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;

				// Cache response headers
				responseHeadersString = headers || "";

				// Set readyState
				jqXHR.readyState = status > 0 ? 4 : 0;

				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;

				// Get response data
				if (responses) {
					response = ajaxHandleResponses(s, jqXHR, responses);
				}

				// Convert no matter what (that way responseXXX fields are always set)
				response = ajaxConvert(s, response, jqXHR, isSuccess);

				// If successful, handle type chaining
				if (isSuccess) {

					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if (s.ifModified) {
						modified = jqXHR.getResponseHeader("Last-Modified");
						if (modified) {
							jQuery.lastModified[cacheURL] = modified;
						}
						modified = jqXHR.getResponseHeader("etag");
						if (modified) {
							jQuery.etag[cacheURL] = modified;
						}
					}

					// if no content
					if (status === 204 || s.type === "HEAD") {
						statusText = "nocontent";

						// if not modified
					} else if (status === 304) {
						statusText = "notmodified";

						// If we have data, let's convert it
					} else {
						statusText = response.state;
						success = response.data;
						error = response.error;
						isSuccess = !error;
					}
				} else {
					// We extract error from statusText
					// then normalize statusText and status for non-aborts
					error = statusText;
					if (status || !statusText) {
						statusText = "error";
						if (status < 0) {
							status = 0;
						}
					}
				}

				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = (nativeStatusText || statusText) + "";

				// Success/Error
				if (isSuccess) {
					deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
				} else {
					deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
				}

				// Status-dependent callbacks
				jqXHR.statusCode(_statusCode);
				_statusCode = undefined;

				if (fireGlobals) {
					globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [jqXHR, s, isSuccess ? success : error]);
				}

				// Complete
				completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);

				if (fireGlobals) {
					globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
					// Handle the global AJAX counter
					if (! --jQuery.active) {
						jQuery.event.trigger("ajaxStop");
					}
				}
			}

			return jqXHR;
		},

		getJSON: function getJSON(url, data, callback) {
			return jQuery.get(url, data, callback, "json");
		},

		getScript: function getScript(url, callback) {
			return jQuery.get(url, undefined, callback, "script");
		}
	});

	jQuery.each(["get", "post"], function (i, method) {
		jQuery[method] = function (url, data, callback, type) {
			// shift arguments if data argument was omitted
			if (jQuery.isFunction(data)) {
				type = type || callback;
				callback = data;
				data = undefined;
			}

			return jQuery.ajax({
				url: url,
				type: method,
				dataType: type,
				data: data,
				success: callback
			});
		};
	});

	// Attach a bunch of functions for handling common AJAX events
	jQuery.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function (i, type) {
		jQuery.fn[type] = function (fn) {
			return this.on(type, fn);
		};
	});

	jQuery._evalUrl = function (url) {
		return jQuery.ajax({
			url: url,
			type: "GET",
			dataType: "script",
			async: false,
			global: false,
			"throws": true
		});
	};

	jQuery.fn.extend({
		wrapAll: function wrapAll(html) {
			if (jQuery.isFunction(html)) {
				return this.each(function (i) {
					jQuery(this).wrapAll(html.call(this, i));
				});
			}

			if (this[0]) {
				// The elements to wrap the target around
				var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);

				if (this[0].parentNode) {
					wrap.insertBefore(this[0]);
				}

				wrap.map(function () {
					var elem = this;

					while (elem.firstChild && elem.firstChild.nodeType === 1) {
						elem = elem.firstChild;
					}

					return elem;
				}).append(this);
			}

			return this;
		},

		wrapInner: function wrapInner(html) {
			if (jQuery.isFunction(html)) {
				return this.each(function (i) {
					jQuery(this).wrapInner(html.call(this, i));
				});
			}

			return this.each(function () {
				var self = jQuery(this),
				    contents = self.contents();

				if (contents.length) {
					contents.wrapAll(html);
				} else {
					self.append(html);
				}
			});
		},

		wrap: function wrap(html) {
			var isFunction = jQuery.isFunction(html);

			return this.each(function (i) {
				jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
			});
		},

		unwrap: function unwrap() {
			return this.parent().each(function () {
				if (!jQuery.nodeName(this, "body")) {
					jQuery(this).replaceWith(this.childNodes);
				}
			}).end();
		}
	});

	jQuery.expr.filters.hidden = function (elem) {
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 || !support.reliableHiddenOffsets() && (elem.style && elem.style.display || jQuery.css(elem, "display")) === "none";
	};

	jQuery.expr.filters.visible = function (elem) {
		return !jQuery.expr.filters.hidden(elem);
	};

	var r20 = /%20/g,
	    rbracket = /\[\]$/,
	    rCRLF = /\r?\n/g,
	    rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	    rsubmittable = /^(?:input|select|textarea|keygen)/i;

	function buildParams(prefix, obj, traditional, add) {
		var name;

		if (jQuery.isArray(obj)) {
			// Serialize array item.
			jQuery.each(obj, function (i, v) {
				if (traditional || rbracket.test(prefix)) {
					// Treat each array item as a scalar.
					add(prefix, v);
				} else {
					// Item is non-scalar (array or object), encode its numeric index.
					buildParams(prefix + "[" + ((typeof v === "undefined" ? "undefined" : _typeof(v)) === "object" ? i : "") + "]", v, traditional, add);
				}
			});
		} else if (!traditional && jQuery.type(obj) === "object") {
			// Serialize object item.
			for (name in obj) {
				buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
			}
		} else {
			// Serialize scalar item.
			add(prefix, obj);
		}
	}

	// Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param = function (a, traditional) {
		var prefix,
		    s = [],
		    add = function add(key, value) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction(value) ? value() : value == null ? "" : value;
			s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
		};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if (traditional === undefined) {
			traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if (jQuery.isArray(a) || a.jquery && !jQuery.isPlainObject(a)) {
			// Serialize the form elements
			jQuery.each(a, function () {
				add(this.name, this.value);
			});
		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for (prefix in a) {
				buildParams(prefix, a[prefix], traditional, add);
			}
		}

		// Return the resulting serialization
		return s.join("&").replace(r20, "+");
	};

	jQuery.fn.extend({
		serialize: function serialize() {
			return jQuery.param(this.serializeArray());
		},
		serializeArray: function serializeArray() {
			return this.map(function () {
				// Can add propHook for "elements" to filter or add form elements
				var elements = jQuery.prop(this, "elements");
				return elements ? jQuery.makeArray(elements) : this;
			}).filter(function () {
				var type = this.type;
				// Use .is(":disabled") so that fieldset[disabled] works
				return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
			}).map(function (i, elem) {
				var val = jQuery(this).val();

				return val == null ? null : jQuery.isArray(val) ? jQuery.map(val, function (val) {
					return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
				}) : { name: elem.name, value: val.replace(rCRLF, "\r\n") };
			}).get();
		}
	});

	// Create the request object
	// (This is still attached to ajaxSettings for backward compatibility)
	jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ?
	// Support: IE6+
	function () {

		// XHR cannot access local files, always use ActiveX for that case
		return !this.isLocal &&

		// Support: IE7-8
		// oldIE XHR does not support non-RFC2616 methods (#13240)
		// See http://msdn.microsoft.com/en-us/library/ie/ms536648(v=vs.85).aspx
		// and http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9
		// Although this check for six methods instead of eight
		// since IE also does not support "trace" and "connect"
		/^(get|post|head|put|delete|options)$/i.test(this.type) && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

	var xhrId = 0,
	    xhrCallbacks = {},
	    xhrSupported = jQuery.ajaxSettings.xhr();

	// Support: IE<10
	// Open requests must be manually aborted on unload (#5280)
	if (window.ActiveXObject) {
		jQuery(window).on("unload", function () {
			for (var key in xhrCallbacks) {
				xhrCallbacks[key](undefined, true);
			}
		});
	}

	// Determine support properties
	support.cors = !!xhrSupported && "withCredentials" in xhrSupported;
	xhrSupported = support.ajax = !!xhrSupported;

	// Create transport if the browser can provide an xhr
	if (xhrSupported) {

		jQuery.ajaxTransport(function (options) {
			// Cross domain only allowed if supported through XMLHttpRequest
			if (!options.crossDomain || support.cors) {

				var _callback;

				return {
					send: function send(headers, complete) {
						var i,
						    xhr = options.xhr(),
						    id = ++xhrId;

						// Open the socket
						xhr.open(options.type, options.url, options.async, options.username, options.password);

						// Apply custom fields if provided
						if (options.xhrFields) {
							for (i in options.xhrFields) {
								xhr[i] = options.xhrFields[i];
							}
						}

						// Override mime type if needed
						if (options.mimeType && xhr.overrideMimeType) {
							xhr.overrideMimeType(options.mimeType);
						}

						// X-Requested-With header
						// For cross-domain requests, seeing as conditions for a preflight are
						// akin to a jigsaw puzzle, we simply never set it to be sure.
						// (it can always be set on a per-request basis or even using ajaxSetup)
						// For same-domain requests, won't change header if already provided.
						if (!options.crossDomain && !headers["X-Requested-With"]) {
							headers["X-Requested-With"] = "XMLHttpRequest";
						}

						// Set headers
						for (i in headers) {
							// Support: IE<9
							// IE's ActiveXObject throws a 'Type Mismatch' exception when setting
							// request header to a null-value.
							//
							// To keep consistent with other XHR implementations, cast the value
							// to string and ignore `undefined`.
							if (headers[i] !== undefined) {
								xhr.setRequestHeader(i, headers[i] + "");
							}
						}

						// Do send the request
						// This may raise an exception which is actually
						// handled in jQuery.ajax (so no try/catch here)
						xhr.send(options.hasContent && options.data || null);

						// Listener
						_callback = function callback(_, isAbort) {
							var status, statusText, responses;

							// Was never called and is aborted or complete
							if (_callback && (isAbort || xhr.readyState === 4)) {
								// Clean up
								delete xhrCallbacks[id];
								_callback = undefined;
								xhr.onreadystatechange = jQuery.noop;

								// Abort manually if needed
								if (isAbort) {
									if (xhr.readyState !== 4) {
										xhr.abort();
									}
								} else {
									responses = {};
									status = xhr.status;

									// Support: IE<10
									// Accessing binary-data responseText throws an exception
									// (#11426)
									if (typeof xhr.responseText === "string") {
										responses.text = xhr.responseText;
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch (e) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if (!status && options.isLocal && !options.crossDomain) {
										status = responses.text ? 200 : 404;
										// IE - #1450: sometimes returns 1223 when it should be 204
									} else if (status === 1223) {
										status = 204;
									}
								}
							}

							// Call complete if needed
							if (responses) {
								complete(status, statusText, responses, xhr.getAllResponseHeaders());
							}
						};

						if (!options.async) {
							// if we're in sync mode we fire the callback
							_callback();
						} else if (xhr.readyState === 4) {
							// (IE6 & IE7) if it's in cache and has been
							// retrieved directly we need to fire the callback
							setTimeout(_callback);
						} else {
							// Add to the list of active xhr callbacks
							xhr.onreadystatechange = xhrCallbacks[id] = _callback;
						}
					},

					abort: function abort() {
						if (_callback) {
							_callback(undefined, true);
						}
					}
				};
			}
		});
	}

	// Functions to create xhrs
	function createStandardXHR() {
		try {
			return new window.XMLHttpRequest();
		} catch (e) {}
	}

	function createActiveXHR() {
		try {
			return new window.ActiveXObject("Microsoft.XMLHTTP");
		} catch (e) {}
	}

	// Install script dataType
	jQuery.ajaxSetup({
		accepts: {
			script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /(?:java|ecma)script/
		},
		converters: {
			"text script": function textScript(text) {
				jQuery.globalEval(text);
				return text;
			}
		}
	});

	// Handle cache's special case and global
	jQuery.ajaxPrefilter("script", function (s) {
		if (s.cache === undefined) {
			s.cache = false;
		}
		if (s.crossDomain) {
			s.type = "GET";
			s.global = false;
		}
	});

	// Bind script tag hack transport
	jQuery.ajaxTransport("script", function (s) {

		// This transport only deals with cross domain requests
		if (s.crossDomain) {

			var script,
			    head = document.head || jQuery("head")[0] || document.documentElement;

			return {

				send: function send(_, callback) {

					script = document.createElement("script");

					script.async = true;

					if (s.scriptCharset) {
						script.charset = s.scriptCharset;
					}

					script.src = s.url;

					// Attach handlers for all browsers
					script.onload = script.onreadystatechange = function (_, isAbort) {

						if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {

							// Handle memory leak in IE
							script.onload = script.onreadystatechange = null;

							// Remove the script
							if (script.parentNode) {
								script.parentNode.removeChild(script);
							}

							// Dereference the script
							script = null;

							// Callback if not abort
							if (!isAbort) {
								callback(200, "success");
							}
						}
					};

					// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
					// Use native DOM manipulation to avoid our domManip AJAX trickery
					head.insertBefore(script, head.firstChild);
				},

				abort: function abort() {
					if (script) {
						script.onload(undefined, true);
					}
				}
			};
		}
	});

	var oldCallbacks = [],
	    rjsonp = /(=)\?(?=&|$)|\?\?/;

	// Default jsonp settings
	jQuery.ajaxSetup({
		jsonp: "callback",
		jsonpCallback: function jsonpCallback() {
			var callback = oldCallbacks.pop() || jQuery.expando + "_" + nonce++;
			this[callback] = true;
			return callback;
		}
	});

	// Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter("json jsonp", function (s, originalSettings, jqXHR) {

		var callbackName,
		    overwritten,
		    responseContainer,
		    jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : typeof s.data === "string" && !(s.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(s.data) && "data");

		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if (jsonProp || s.dataTypes[0] === "jsonp") {

			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;

			// Insert callback into url or form data
			if (jsonProp) {
				s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
			} else if (s.jsonp !== false) {
				s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
			}

			// Use data converter to retrieve json after script execution
			s.converters["script json"] = function () {
				if (!responseContainer) {
					jQuery.error(callbackName + " was not called");
				}
				return responseContainer[0];
			};

			// force json dataType
			s.dataTypes[0] = "json";

			// Install callback
			overwritten = window[callbackName];
			window[callbackName] = function () {
				responseContainer = arguments;
			};

			// Clean-up function (fires after converters)
			jqXHR.always(function () {
				// Restore preexisting value
				window[callbackName] = overwritten;

				// Save back as free
				if (s[callbackName]) {
					// make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;

					// save the callback name for future use
					oldCallbacks.push(callbackName);
				}

				// Call if it was a function and we have a response
				if (responseContainer && jQuery.isFunction(overwritten)) {
					overwritten(responseContainer[0]);
				}

				responseContainer = overwritten = undefined;
			});

			// Delegate to script
			return "script";
		}
	});

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML = function (data, context, keepScripts) {
		if (!data || typeof data !== "string") {
			return null;
		}
		if (typeof context === "boolean") {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec(data),
		    scripts = !keepScripts && [];

		// Single tag
		if (parsed) {
			return [context.createElement(parsed[1])];
		}

		parsed = jQuery.buildFragment([data], context, scripts);

		if (scripts && scripts.length) {
			jQuery(scripts).remove();
		}

		return jQuery.merge([], parsed.childNodes);
	};

	// Keep a copy of the old load method
	var _load = jQuery.fn.load;

	/**
  * Load a url into a page
  */
	jQuery.fn.load = function (url, params, callback) {
		if (typeof url !== "string" && _load) {
			return _load.apply(this, arguments);
		}

		var selector,
		    response,
		    type,
		    self = this,
		    off = url.indexOf(" ");

		if (off >= 0) {
			selector = url.slice(off, url.length);
			url = url.slice(0, off);
		}

		// If it's a function
		if (jQuery.isFunction(params)) {

			// We assume that it's the callback
			callback = params;
			params = undefined;

			// Otherwise, build a param string
		} else if (params && (typeof params === "undefined" ? "undefined" : _typeof(params)) === "object") {
			type = "POST";
		}

		// If we have elements to modify, make the request
		if (self.length > 0) {
			jQuery.ajax({
				url: url,

				// if "type" variable is undefined, then "GET" method will be used
				type: type,
				dataType: "html",
				data: params
			}).done(function (responseText) {

				// Save response for use in complete callback
				response = arguments;

				self.html(selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) :

				// Otherwise use the full result
				responseText);
			}).complete(callback && function (jqXHR, status) {
				self.each(callback, response || [jqXHR.responseText, status, jqXHR]);
			});
		}

		return this;
	};

	jQuery.expr.filters.animated = function (elem) {
		return jQuery.grep(jQuery.timers, function (fn) {
			return elem === fn.elem;
		}).length;
	};

	var docElem = window.document.documentElement;

	/**
  * Gets a window from an element
  */
	function getWindow(elem) {
		return jQuery.isWindow(elem) ? elem : elem.nodeType === 9 ? elem.defaultView || elem.parentWindow : false;
	}

	jQuery.offset = {
		setOffset: function setOffset(elem, options, i) {
			var curPosition,
			    curLeft,
			    curCSSTop,
			    curTop,
			    curOffset,
			    curCSSLeft,
			    calculatePosition,
			    position = jQuery.css(elem, "position"),
			    curElem = jQuery(elem),
			    props = {};

			// set position first, in-case top/left are set even on static elem
			if (position === "static") {
				elem.style.position = "relative";
			}

			curOffset = curElem.offset();
			curCSSTop = jQuery.css(elem, "top");
			curCSSLeft = jQuery.css(elem, "left");
			calculatePosition = (position === "absolute" || position === "fixed") && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1;

			// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
			if (calculatePosition) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;
			} else {
				curTop = parseFloat(curCSSTop) || 0;
				curLeft = parseFloat(curCSSLeft) || 0;
			}

			if (jQuery.isFunction(options)) {
				options = options.call(elem, i, curOffset);
			}

			if (options.top != null) {
				props.top = options.top - curOffset.top + curTop;
			}
			if (options.left != null) {
				props.left = options.left - curOffset.left + curLeft;
			}

			if ("using" in options) {
				options.using.call(elem, props);
			} else {
				curElem.css(props);
			}
		}
	};

	jQuery.fn.extend({
		offset: function offset(options) {
			if (arguments.length) {
				return options === undefined ? this : this.each(function (i) {
					jQuery.offset.setOffset(this, options, i);
				});
			}

			var docElem,
			    win,
			    box = { top: 0, left: 0 },
			    elem = this[0],
			    doc = elem && elem.ownerDocument;

			if (!doc) {
				return;
			}

			docElem = doc.documentElement;

			// Make sure it's not a disconnected DOM node
			if (!jQuery.contains(docElem, elem)) {
				return box;
			}

			// If we don't have gBCR, just use 0,0 rather than error
			// BlackBerry 5, iOS 3 (original iPhone)
			if (_typeof(elem.getBoundingClientRect) !== strundefined) {
				box = elem.getBoundingClientRect();
			}
			win = getWindow(doc);
			return {
				top: box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
				left: box.left + (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
			};
		},

		position: function position() {
			if (!this[0]) {
				return;
			}

			var offsetParent,
			    offset,
			    parentOffset = { top: 0, left: 0 },
			    elem = this[0];

			// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
			if (jQuery.css(elem, "position") === "fixed") {
				// we assume that getBoundingClientRect is available when computed position is fixed
				offset = elem.getBoundingClientRect();
			} else {
				// Get *real* offsetParent
				offsetParent = this.offsetParent();

				// Get correct offsets
				offset = this.offset();
				if (!jQuery.nodeName(offsetParent[0], "html")) {
					parentOffset = offsetParent.offset();
				}

				// Add offsetParent borders
				parentOffset.top += jQuery.css(offsetParent[0], "borderTopWidth", true);
				parentOffset.left += jQuery.css(offsetParent[0], "borderLeftWidth", true);
			}

			// Subtract parent offsets and element margins
			// note: when an element has margin: auto the offsetLeft and marginLeft
			// are the same in Safari causing offset.left to incorrectly be 0
			return {
				top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", true),
				left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", true)
			};
		},

		offsetParent: function offsetParent() {
			return this.map(function () {
				var offsetParent = this.offsetParent || docElem;

				while (offsetParent && !jQuery.nodeName(offsetParent, "html") && jQuery.css(offsetParent, "position") === "static") {
					offsetParent = offsetParent.offsetParent;
				}
				return offsetParent || docElem;
			});
		}
	});

	// Create scrollLeft and scrollTop methods
	jQuery.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function (method, prop) {
		var top = /Y/.test(prop);

		jQuery.fn[method] = function (val) {
			return access(this, function (elem, method, val) {
				var win = getWindow(elem);

				if (val === undefined) {
					return win ? prop in win ? win[prop] : win.document.documentElement[method] : elem[method];
				}

				if (win) {
					win.scrollTo(!top ? val : jQuery(win).scrollLeft(), top ? val : jQuery(win).scrollTop());
				} else {
					elem[method] = val;
				}
			}, method, val, arguments.length, null);
		};
	});

	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	jQuery.each(["top", "left"], function (i, prop) {
		jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition, function (elem, computed) {
			if (computed) {
				computed = curCSS(elem, prop);
				// if curCSS returns percentage, fallback to offset
				return rnumnonpx.test(computed) ? jQuery(elem).position()[prop] + "px" : computed;
			}
		});
	});

	// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each({ Height: "height", Width: "width" }, function (name, type) {
		jQuery.each({ padding: "inner" + name, content: type, "": "outer" + name }, function (defaultExtra, funcName) {
			// margin is only for outerHeight, outerWidth
			jQuery.fn[funcName] = function (margin, value) {
				var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"),
				    extra = defaultExtra || (margin === true || value === true ? "margin" : "border");

				return access(this, function (elem, type, value) {
					var doc;

					if (jQuery.isWindow(elem)) {
						// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
						// isn't a whole lot we can do. See pull request at this URL for discussion:
						// https://github.com/jquery/jquery/pull/764
						return elem.document.documentElement["client" + name];
					}

					// Get document width or height
					if (elem.nodeType === 9) {
						doc = elem.documentElement;

						// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
						// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
						return Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name]);
					}

					return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css(elem, type, extra) :

					// Set width or height on the element
					jQuery.style(elem, type, value, extra);
				}, type, chainable ? margin : undefined, chainable, null);
			};
		});
	});

	// The number of elements contained in the matched element set
	jQuery.fn.size = function () {
		return this.length;
	};

	jQuery.fn.andSelf = jQuery.fn.addBack;

	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.
	if (true) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
			return jQuery;
		}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}

	var
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,


	// Map over the $ in case of overwrite
	_$ = window.$;

	jQuery.noConflict = function (deep) {
		if (window.$ === jQuery) {
			window.$ = _$;
		}

		if (deep && window.jQuery === jQuery) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	};

	// Expose jQuery and $ identifiers, even in
	// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	if ((typeof noGlobal === "undefined" ? "undefined" : _typeof(noGlobal)) === strundefined) {
		window.jQuery = window.$ = jQuery;
	}

	return jQuery;
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(30)(module)))

/***/ }),
/* 30 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = {

	login: function login() {
		//登录样式显现与影藏
		$('#login-tunp a').on('click', function () {
			var i = $(this).index();
			$(this).addClass('login-active').siblings().removeClass('login-active');
			switch (i) {
				case 0:
					{
						$('#login').css('display', 'block');
						$('#register').css('display', 'none');
					};
					break;
				case 1:
					{
						$('#login').css('display', 'none');
						$('#register').css('display', 'block');
					}
					break;
			}
		});

		//登录验证
		$('#login-login').on('click', function () {
			if ($('#username').val().toString().trim() === '') {
				$('#username-judge').html('请输入用户名');
				return false;
			} else {
				$('#username-judge').html('');
			}
			if ($('#password').val().toString().trim() == '') {
				$('#password-judge').html('请输入密码');
				return false;
			} else {
				$('#password-judge').html('');
			}
			return false;
		});

		//注册验证
		$('#register-register').on('click', function () {
			var phon = /^1[34578]\d{9}$/;
			if ($('#usn').val().toString().trim() === '') {
				$('#usnJudge').html('请输入用户名');
				return false;
			} else {
				$('#usnJudge').html('');
			}
			if ($('#pwd1').val().toString().trim() === '') {
				$('#pwd1Judge').html('请输入密码');
				return false;
			} else {
				$('#pwd1Judge').html('');
			}
			if ($('#pwd2').val().toString().trim() === '') {
				$('#pwd2Judge').html('请输入密码');
				return false;
			} else {
				$('#pwd2Judge').html('');
			}

			if ($('#pwd1').val() !== $('#pwd2').val()) {
				$('#pwd2Judge').html('您输入的两次密码不一致');
				return false;
			}
			if ($('#phone').val().toString().trim() === '') {
				$('#phoneJudge').html('请输入手机号');
				return false;
			} else {
				$('#phoneJudge').html('');
			}

			if (phon.test($('#phone').val().toString().trim()) == false) {
				$('#phoneJudge').html('请输入正确的手机号');
				return false;
			} else {
				$('#phoneJudge').html('');
			}

			if ($('#verificationCode').val().toString().trim() === '') {
				alert('请输入验证码');
				$('#verificationCode').html('');
				return false;
			}
			if ($('#checkbox').prop('checked') !== true) {
				alert('你还未同意用户协议');
				return false;
			}
			alert('chenggong ');
			return false;
		});

		//发送验证码

	}

};

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map