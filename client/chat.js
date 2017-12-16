import authUser from './auth.js';
import {socketReceived, socketNewPeer, peers} from './peerActions.js';

const socket = window.io();
const user = document.getElementById('username').innerHTML;
const outButton = document.getElementById('outButton');
const chatLog = document.getElementById('chatLog');
const message = document.getElementById('message');
const fileInput = document.getElementById('fileInput');
const openChannels = document.getElementById('openChannels');

const outFiles = {};

socket.on('connect', () => {
  socket.on('new', socketNewPeer);
  socket.on('webrtc', socketReceived);
  socket.on('connect_error', () => {
    openChannels.className = 'btn btn-danger';
    openChannels.innerHTML = 'Socket disconnected';
    socket.close();
  });
  socket.emit('login', user);
});

function broadcastMessage(type, data) {
  for (let peer in peers) {
    if (peers.hasOwnProperty(peer)) {
      if (peers[peer].channel !== undefined) {
        try {
          peers[peer].channel.send(JSON.stringify({type: type, cont: data}));
        } catch (e) {
          console.log(e);
          peers[peer].channel.close();
        }
      }
    }
  }
  const typeData = (type == 'file') ? data + ' (file)' : data;
  chatLog.innerHTML += '<div>Me : ' + typeData + '</div>';
  message.value = '';
}

message.addEventListener('change', () => {
  broadcastMessage('simple message', message.value);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    outFiles[file.name] = file;
    broadcastMessage('hey! I have the file!', file.name);
  }
}, false);

outButton.addEventListener('click', () => {
  authUser(outButton);
});

window.addEventListener('beforeunload', () => {
  socket.emit('logout', user);
  for (let peer in peers) {
    if (peers.hasOwnProperty(peer)) {
      if (peers[peer].channel !== undefined) {
        try {
          peers[peer].channel.close();
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
});

export {
  socket,
  user,
  outFiles,
};
