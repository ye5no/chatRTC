import {server, options} from './peerConfig.js';
import {socket, user, outFiles} from './chat.js';

const chatLog = document.getElementById('chatLog');
const usersList = document.getElementById('usersList');
const onlineUsers = document.getElementById('onlineUsers');

const users = [];
const peers = {};
const chunkSize = 16384;
let currentLoad = undefined;

const PeerConnection = window.RTCPeerConnection;
const SessionDescription = window.RTCSessionDescription;
const IceCandidate = window.RTCIceCandidate;

function showUsersList() {
  usersList.innerHTML = '';
  const len = users.length;
  for (let i=0; i<len; i++) {
    let li = document.createElement('li');
    li.innerHTML = users[i];
    usersList.appendChild(li);
  }
  onlineUsers.innerText = users.length;
}

function socketNewPeer(us) {
  peers[us] = {
    candidateCache: [],
    connection: new PeerConnection(server, options),
  };
  peers[us].channel = peers[us].connection.createDataChannel('RTCchat', {});
  peers[us].channel.owner = us;

  initConnection(us, 'offer');
  bindEvents(us);

  peers[us].connection.createOffer().then((offer) => {
    peers[us].connection.setLocalDescription(offer);
  });
}

function socketReceived(mess) {
  const {from, type, data} = JSON.parse(mess);
  if (peers[from] === undefined) {
    peers[from] = {
      candidateCache: [],
      connection: new PeerConnection(server, options),
    };

    initConnection(from, 'answer');
    peers[from].connection.ondatachannel = function(e) {
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
      peers[from].connection.createAnswer().then((answer) => {
        peers[from].connection.setLocalDescription(answer);
      });
      break;
    case 'answer':
      peers[from].connection.setRemoteDescription(new SessionDescription(data));
      break;
  }
}

function initConnection(us, sdpType) {
  const pc = peers[us].connection;
  pc.onicecandidate = (event) => {
    let mess;
    if (event.candidate) {
      peers[us].candidateCache.push(event.candidate);
    } else {
      mess = {from: user, to: us, type: sdpType, data: pc.localDescription};
      socket.emit('webrtc', JSON.stringify(mess));
      for (let i=0, len=peers[us].candidateCache.length; i<len; i++) {
        mess = {from: user, to: us, type: 'candidate', data: peers[us].candidateCache[i]};
        socket.emit('webrtc', JSON.stringify(mess));
      }
    }
  };
}

function bindEvents(us) {
  const channel = peers[us].channel;
  channel.onopen = (event) => {
    console.log('channel open with '+ event.target.owner);
    if (users.indexOf(event.target.owner) == -1) {
      users.push(event.target.owner);
      showUsersList();
    }
  };

  channel.onmessage = (event) => {
    let chunkEvent = false;
    try {
      JSON.parse(event.data);
    } catch (err) { // received file chunk -------------------
      console.log('chunk received');
      chunkEvent = true;
      if (currentLoad != undefined) currentLoad.push(event.data);
    }

    if (!chunkEvent) {
      const pkg = JSON.parse(event.data);
      const elem = document.createElement('div');
      switch (pkg.type) {
        case 'simple message': // received plain text message -------------------
          elem.innerHTML = event.target.owner + ' : ' + pkg.cont;
          break;
        case 'hey! I have the file!': { // received new file link -------------------
          let but = document.createElement('button');
          but.innerHTML = event.target.owner + ' : ' + pkg.cont;
          but.className = 'btn btn-success';
          but.onclick = () => {
            if (currentLoad == undefined) {
              currentLoad = [];
              peers[event.target.owner].channel.send(JSON.stringify({type: 'give me this file', cont: pkg.cont}));
            }
          };
          elem.appendChild(but);
          break;
        }
        case 'give me this file': // received request for upload file -------------------
          if (outFiles[pkg.cont]!=undefined) {
            const sendChannel = peers[event.target.owner].channel;
            const file = outFiles[pkg.cont];

            const sliceFile = function(offset) {
              const reader = new window.FileReader();
              reader.onload = ((file) => {
                return function(e) {
                  sendChannel.send(e.target.result);
                  if (file.size > offset + e.target.result.byteLength) {
                    sliceFile(offset + chunkSize);
                  } else {
                    sendChannel.send(JSON.stringify({type: 'that is all', cont: file.name}));
                  }
                };
              })(file);
              const slice = file.slice(offset, offset + chunkSize);
              reader.readAsArrayBuffer(slice);
            };

            sliceFile(0);
          } else {
            peers[event.target.owner].channel.send(JSON.stringify({type: 'simple message', data: 'Sorry: no such file!'}));
          }
          break;
        case 'that is all': // received end of downloaded file -------------------
          if (currentLoad!=undefined) {
            const received = new window.Blob(currentLoad);
            const a = document.createElement('a');
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
    }
  };

  channel.onclose = (event) => {
    console.log('channel close with '+ event.target.owner);
    users.splice(users.indexOf(event.target.owner), 1);
    showUsersList();
    delete peers[us];
  };
}

export {
  socketNewPeer,
  socketReceived,
  peers,
};
