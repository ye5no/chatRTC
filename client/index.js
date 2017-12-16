import authUser from './auth.js';

const socket = window.io();
const onlineUsers = document.getElementById('onlineUsers');
const inButton = document.getElementById('inButton');
const upButton = document.getElementById('upButton');

socket.on('connect', () => {
  socket.on('new', () => {
    onlineUsers.innerHTML = parseInt(onlineUsers.innerHTML) + 1;
  });
  socket.on('leave', () => {
    onlineUsers.innerHTML = parseInt(onlineUsers.innerHTML) - 1;
  });
});

inButton.addEventListener('click', () => {
  authUser(inButton);
});
upButton.addEventListener('click', () => {
  authUser(upButton);
});
