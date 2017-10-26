(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["p5ml"] = factory();
	else
		root["p5ml"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
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
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NeuralNetwork = undefined;

var _activationFunctions = __webpack_require__(1);

var activation = _interopRequireWildcard(_activationFunctions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /*
                                                                                                                                                          Simple Artificial Neural Network
                                                                                                                                                          Based on https://github.com/shiffman/Neural-Network-p5 by Daniel Shiffman 
                                                                                                                                                          Based on "Make Your Own Neural Network" by Tariq Rashid
                                                                                                                                                          https://github.com/makeyourownneuralnetwork/
                                                                                                                                                          */

var dl = window.deeplearn;

var NeuralNetwork = function NeuralNetwork() {
  _classCallCheck(this, NeuralNetwork);
};

exports.NeuralNetwork = NeuralNetwork;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// Utils
// Activation Functions

// Sigmoid function
var sigmoid = function sigmoid(x) {
  return 1 / (1 + pow(Math.E, -x));
};

// Sigmoid derivative
var dSigmoid = function dSigmoid(x) {
  return x * (1 - x);
};

// Tanh function
var tanh = function tanh(x) {
  return Math.tanh(x);
};

// Tanh derivative
var dtanh = function dtanh(x) {
  return 1 / pow(Math.cosh(x), 2);
};

exports.sigmoid = sigmoid;
exports.dSigmoid = dSigmoid;
exports.tanh = tanh;
exports.dtanh = dtanh;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
p5ML v.0.0.1

p5ML is a high level javascript library for machine learning.
Made @ NYU ITP

*/



var _index = __webpack_require__(0);

// Check if deeplearn.js is imported
if (window.deeplearn) {
  console.log('p5ML loaded!');
} else {
  console.error('You need to import deeplearn.js!\n  Add this to your html page <script src="https://unpkg.com/deeplearn"></script>');
}

module.exports = {
  NeuralNetwork: _index.NeuralNetwork
};

/***/ })
/******/ ]);
});