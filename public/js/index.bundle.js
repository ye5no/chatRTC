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
function defaultResult() {
  switch (this.status) {
    case 200:
      window.location.reload();
      break;
    default:
      window.alert('Ошибка ' + this.responseText);
  }
}

exports.default = function (but) {
  var xhr = new window.XMLHttpRequest();
  var sending = void 0;
  switch (but.getAttribute('data-auth')) {
    case 'signUp':
      sending = {
        email: document.getElementById('inpEmail').value,
        password: document.getElementById('inpPass').value
      };
      xhr.open('POST', '/api/auth/reg');
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.send(JSON.stringify(sending));
      break;
    case 'logIn':
      sending = {
        email: document.getElementById('inpEmail').value,
        password: document.getElementById('inpPass').value
      };
      xhr.open('POST', '/api/auth/login');
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.send(JSON.stringify(sending));
      break;
    case 'logOut':
      xhr.open('GET', '/api/auth/logout');
      xhr.send();
      break;
  }
  xhr.onload = defaultResult;
};

/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _auth = __webpack_require__(0);

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var socket = window.io();
var onlineUsers = document.getElementById('onlineUsers');
var inButton = document.getElementById('inButton');
var upButton = document.getElementById('upButton');

socket.on('connect', function () {
  socket.on('new', function () {
    onlineUsers.innerHTML = parseInt(onlineUsers.innerHTML) + 1;
  });
  socket.on('leave', function () {
    onlineUsers.innerHTML = parseInt(onlineUsers.innerHTML) - 1;
  });
});

inButton.addEventListener('click', function () {
  (0, _auth2.default)(inButton);
});
upButton.addEventListener('click', function () {
  (0, _auth2.default)(upButton);
});

/***/ })
/******/ ]);