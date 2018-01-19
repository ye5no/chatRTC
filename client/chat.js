import authUser from './auth.js';
import {socketReceived, socketNewPeer, peers, users} from './peerActions.js';
import dice from './dice.js';

const socket = window.io();
const user = document.getElementById('username').innerHTML;
const outButton = document.getElementById('outButton');
const chatLog = document.getElementById('chatLog');
const message = document.getElementById('message');
const fileInput = document.getElementById('fileInput');
const openChannels = document.getElementById('openChannels');
const diceButton = document.getElementById('diceButton');

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
  if (type.indexOf('dice.')!=0) {
    const typeData = (type == 'hey! I have the file!') ? data + ' (file)' : data;
    const newDiv = document.createElement('div');
    newDiv.innerHTML = 'Me : ' + typeData;
    chatLog.appendChild(newDiv);
    message.value = '';
  }
}

message.addEventListener('change', (event) => {
  event.preventDefault();
  broadcastMessage('simple message', message.value);
});

fileInput.addEventListener('change', (event) => {
  event.preventDefault();
  const file = event.target.files[0];
  if (file) {
    outFiles[file.name] = file;
    broadcastMessage('hey! I have the file!', file.name);
  }
});

outButton.addEventListener('click', () => {
  authUser(outButton);
});

diceButton.addEventListener('click', () => {
  const id = Math.random()+'';
  dice.start(user, id, users);
  broadcastMessage('dice.start', id);
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
  broadcastMessage,
};
