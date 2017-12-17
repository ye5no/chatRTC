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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.outFiles = exports.user = exports.socket = undefined;

var _auth = __webpack_require__(0);

var _auth2 = _interopRequireDefault(_auth);

var _peerActions = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var socket = window.io();
var user = document.getElementById('username').innerHTML;
var outButton = document.getElementById('outButton');
var chatLog = document.getElementById('chatLog');
var message = document.getElementById('message');
var fileInput = document.getElementById('fileInput');
var openChannels = document.getElementById('openChannels');

var outFiles = {};

socket.on('connect', function () {
  socket.on('new', _peerActions.socketNewPeer);
  socket.on('webrtc', _peerActions.socketReceived);
  socket.on('connect_error', function () {
    openChannels.className = 'btn btn-danger';
    openChannels.innerHTML = 'Socket disconnected';
    socket.close();
  });
  socket.emit('login', user);
});

function broadcastMessage(type, data) {
  for (var peer in _peerActions.peers) {
    if (_peerActions.peers.hasOwnProperty(peer)) {
      if (_peerActions.peers[peer].channel !== undefined) {
        try {
          _peerActions.peers[peer].channel.send(JSON.stringify({ type: type, cont: data }));
        } catch (e) {
          console.log(e);
          _peerActions.peers[peer].channel.close();
        }
      }
    }
  }
  var typeData = type == 'file' ? data + ' (file)' : data;
  chatLog.innerHTML += '<div>Me : ' + typeData + '</div>';
  message.value = '';
}

message.addEventListener('change', function (event) {
  event.preventDefault();
  broadcastMessage('simple message', message.value);
});

fileInput.addEventListener('change', function (event) {
  event.preventDefault();
  var file = event.target.files[0];
  if (file) {
    outFiles[file.name] = file;
    broadcastMessage('hey! I have the file!', file.name);
  }
});

outButton.addEventListener('click', function () {
  (0, _auth2.default)(outButton);
});

window.addEventListener('beforeunload', function () {
  socket.emit('logout', user);
  for (var peer in _peerActions.peers) {
    if (_peerActions.peers.hasOwnProperty(peer)) {
      if (_peerActions.peers[peer].channel !== undefined) {
        try {
          _peerActions.peers[peer].channel.close();
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
});

exports.socket = socket;
exports.user = user;
exports.outFiles = outFiles;

/***/ }),
/* 2 */,
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.peers = exports.socketReceived = exports.socketNewPeer = undefined;

var _peerConfig = __webpack_require__(4);

var _chat = __webpack_require__(1);

var chatLog = document.getElementById('chatLog');
var usersList = document.getElementById('usersList');
var onlineUsers = document.getElementById('onlineUsers');

var users = [];
var peers = {};
var chunkSize = 16384;
var currentLoad = undefined;

var PeerConnection = window.RTCPeerConnection;
var SessionDescription = window.RTCSessionDescription;
var IceCandidate = window.RTCIceCandidate;

function showUsersList() {
  usersList.innerHTML = '';
  var len = users.length;
  for (var i = 0; i < len; i++) {
    var li = document.createElement('li');
    li.innerHTML = users[i];
    usersList.appendChild(li);
  }
  onlineUsers.innerText = users.length;
}

function socketNewPeer(us) {
  peers[us] = {
    candidateCache: [],
    connection: new PeerConnection(_peerConfig.server, _peerConfig.options)
  };
  peers[us].channel = peers[us].connection.createDataChannel('RTCchat', {});
  peers[us].channel.owner = us;

  initConnection(us, 'offer');
  bindEvents(us);

  peers[us].connection.createOffer().then(function (offer) {
    peers[us].connection.setLocalDescription(offer);
  });
}

function socketReceived(mess) {
  var _JSON$parse = JSON.parse(mess),
      from = _JSON$parse.from,
      type = _JSON$parse.type,
      data = _JSON$parse.data;

  if (peers[from] === undefined) {
    peers[from] = {
      candidateCache: [],
      connection: new PeerConnection(_peerConfig.server, _peerConfig.options)
    };

    initConnection(from, 'answer');
    peers[from].connection.ondatachannel = function (e) {
      peers[from].channel = e.channel;
      peers[from].channel.owner = from;
      bindEvents(from);
    };
  }
  switch (type) {
    case 'candidate':
      peers[from].connection.addIceCandidate(new IceCandidate(data));
      break;
    case 'offer':
      peers[from].connection.setRemoteDescription(new SessionDescription(data));
      peers[from].connection.createAnswer().then(function (answer) {
        peers[from].connection.setLocalDescription(answer);
      });
      break;
    case 'answer':
      peers[from].connection.setRemoteDescription(new SessionDescription(data));
      break;
  }
}

function initConnection(us, sdpType) {
  var pc = peers[us].connection;
  pc.onicecandidate = function (event) {
    var mess = void 0;
    if (event.candidate) {
      peers[us].candidateCache.push(event.candidate);
    } else {
      mess = { from: _chat.user, to: us, type: sdpType, data: pc.localDescription };
      _chat.socket.emit('webrtc', JSON.stringify(mess));
      for (var i = 0, len = peers[us].candidateCache.length; i < len; i++) {
        mess = { from: _chat.user, to: us, type: 'candidate', data: peers[us].candidateCache[i] };
        _chat.socket.emit('webrtc', JSON.stringify(mess));
      }
    }
  };
}

function bindEvents(us) {
  var channel = peers[us].channel;
  channel.onopen = function (event) {
    console.log('channel open with ' + event.target.owner);
    if (users.indexOf(event.target.owner) == -1) {
      users.push(event.target.owner);
      showUsersList();
    }
  };

  channel.onclose = function (event) {
    console.log('channel close with ' + event.target.owner);
    users.splice(users.indexOf(event.target.owner), 1);
    showUsersList();
    delete peers[us];
  };

  channel.onmessage = function (event) {
    var chunkEvent = false;
    var addButton = false;
    try {
      JSON.parse(event.data);
    } catch (err) {
      // received file chunk -------------------
      console.log('chunk received');
      chunkEvent = true;
      if (currentLoad != undefined) currentLoad.push(event.data);
    }

    if (!chunkEvent) {
      var pkg = JSON.parse(event.data);
      var elem = document.createElement('div');
      switch (pkg.type) {
        case 'simple message':
          // received plain text message -------------------
          elem.innerHTML = event.target.owner + ' : ' + pkg.cont;
          break;
        case 'hey! I have the file!':
          {
            // received new file link -------------------
            var but = document.createElement('button');
            but.innerHTML = event.target.owner + ' : ' + pkg.cont;
            but.className = 'btn btn-success';
            but.id = 'owner:' + event.target.owner + '-file:' + pkg.cont;
            // but.onclick = downloadFile;
            addButton = but.id;
            elem.appendChild(but);
            break;
          }
        case 'give me this file':
          // received request for upload file -------------------
          if (_chat.outFiles[pkg.cont] != undefined) {
            var sendChannel = peers[event.target.owner].channel;
            var file = _chat.outFiles[pkg.cont];

            var sliceFile = function sliceFile(offset) {
              var reader = new window.FileReader();
              reader.onload = function (file) {
                return function (e) {
                  sendChannel.send(e.target.result);
                  if (file.size > offset + e.target.result.byteLength) {
                    sliceFile(offset + chunkSize);
                  } else {
                    sendChannel.send(JSON.stringify({ type: 'that is all', cont: file.name }));
                  }
                };
              }(file);
              var slice = file.slice(offset, offset + chunkSize);
              reader.readAsArrayBuffer(slice);
            };

            sliceFile(0);
          } else {
            peers[event.target.owner].channel.send(JSON.stringify({ type: 'simple message', data: 'Sorry: no such file!' }));
          }
          break;
        case 'that is all':
          // received end of downloaded file -------------------
          if (currentLoad != undefined) {
            var received = new window.Blob(currentLoad);
            var a = document.createElement('a');
            a.href = window.URL.createObjectURL(received);
            a.download = pkg.cont;
            a.textContent = 'Click to download ' + pkg.cont;
            a.style.display = 'block';
            elem.appendChild(a);
            currentLoad = undefined;
          }
          break;
      }
      chatLog.appendChild(elem);
      if (addButton !== false) {
        document.getElementById(addButton).addEventListener('click', downloadFile, { once: true });
      }
    }
  };
}

var downloadFile = function downloadFile(ev) {
  console.log('request for download');
  var owner = ev.target.id.split('-file:')[0].replace('owner:', '');
  var file = ev.target.id.split('-file:')[1];
  if (peers[owner] != undefined) {
    if (peers[owner].channel.readyState == 'open') {
      if (currentLoad == undefined) {
        currentLoad = [];
        peers[owner].channel.send(JSON.stringify({ type: 'give me this file', cont: file }));
      }
    } else {
      console.log('Channel no open');
    }
  } else {
    console.log('No owner');
  }
  return false;
};

exports.socketNewPeer = socketNewPeer;
exports.socketReceived = socketReceived;
exports.peers = peers;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var server = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

var options = {
  optional: []
};

exports.server = server;
exports.options = options;

/***/ })
/******/ ]);