import {server, options} from './peerConfig.js';
import {socket, user, outFiles} from './chat.js';
import dice from './dice.js';

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

  channel.onclose = (event) => {
    console.log('channel close with '+ event.target.owner);
    users.splice(users.indexOf(event.target.owner), 1);
    showUsersList();
    delete peers[us];
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
        case 'simple message': {// received plain text message -------------------
          let diceVerify='';
          if (pkg.cont.indexOf('Dice result')==0) {
            diceVerify = (dice.verify(pkg.cont))
            ? '<span style="color: green"> - verified!</span>'
            : '<span style="color: red"> - not verified.</span>';
          }
          elem.innerHTML = event.target.owner + ' : ' + pkg.cont + diceVerify;

          break;
        }
        case 'hey! I have the file!': { // received new file link -------------------
          const but = document.createElement('button');
          but.innerHTML = event.target.owner + ' : ' + pkg.cont;
          but.className = 'btn btn-success';
          but.id = 'owner:'+event.target.owner+'-file:'+pkg.cont;
          but.onclick = downloadFile;
          elem.appendChild(but);
          break;
        }
        case 'give me this file': {// received request for upload file -------------------
          if (outFiles[pkg.cont] != undefined) {
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
            peers[event.target.owner].channel.send(JSON.stringify({
              type: 'simple message',
              cont: 'Sorry: no such file!',
            }));
          }
          break;
        }
        case 'that is all': {// received end of downloaded file -------------------
          if (currentLoad != undefined) {
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
        case 'dice.start': {
          // событие происходит когда один из участников инициировал начало игры - стал игроком (player). а остальные участники стали свидетелями (witness.owner).
          // игрок высылает идентификатор игры (id)
          // создается экземпляр класса Dice {id, player, base, witness {hashedOffset, keyOffset, result, confirm}, result, confirmed}
          // значения сохраняются в dice {id, player}
          // автоматически регистрируются все свидетели игры dice.witness.owner по списку участников
          // свидетель рандомит смещение и рандомит ключ шифрования keyOffset.
          // шифрует смещение в hashedOffset ключом keyOffset и высылает hashedOffset всем участникам
          dice.start(event.target.owner, pkg.cont, users);
          break;
        }
        case 'dice.hashedOffset': {
          // событие происходит когда один из свидетелей (dice.witness.owner) прислал свой hashedOffset
          // значение сохраняется в dice.witness.hashedOffset
          // если игрок получил hashedOffset от всех свидетелей, он рандомит базовое число dice.base и отправляет его свидетелям
          dice.hashedOffset(event.target.owner, pkg.cont);
          break;
        }
        case 'dice.base': {
          // событие происходит когда свидетель получил от игрока базовое число dice.base
          // свидетель отправляет всем участникам свой keyOffset для расшифровки hashedOffset
          dice.base(pkg.cont);
          break;
        }
        case 'dice.keyOffset': {
          // событие происходит когда участник получил keyOffset от свидетеля
          // участник вычисляет dice.witness.result, расшифровкой hashedOffset ключом keyOffset
          // если вычеслены все dice.witness.result, то вычисляется итоговый результат dice.result
          // если игрок вычислил dice.result, то он отправлет запрос свидетелям на подтверждение итогов
          dice.keyOffset(event.target.owner, pkg.cont);
          break;
        }
        case 'dice.result': {
          // событие происходит когда свидетель получил от игрока результат игры playerResult
          // если результат playerResult == вычисленному результату dice.result то свидетель отправляет участникам подтверждение dice.witness.confirm
          dice.result(pkg.cont);
          break;
        }
        case 'dice.confirm': {
          // событие происходит когда участник получает от свидетеля подтверждение
          // подтверждение записывается в dice.witness.confirm
          // получив подтверждения от всех свидетелей dice.confirmed = true - игра считается завершенной
          // выводится результат броска
          dice.confirm(event.target.owner, pkg.cont);
          break;
        }
      }
      chatLog.appendChild(elem);
    }
  };
}

const downloadFile = (ev) => {
  console.log('download request');
  const owner = ev.target.id.split('-file:')[0].replace('owner:', '');
  const file = ev.target.id.split('-file:')[1];
  if (peers[owner] != undefined) {
    if (peers[owner].channel.readyState == 'open') {
      if (currentLoad == undefined) {
        currentLoad = [];
        peers[owner].channel.send(JSON.stringify({type: 'give me this file', cont: file}));
      }
    } else {
      console.log('Channel have not opened');
    }
  } else {
    console.log('No owner here');
  }
  return false;
};

export {
  socketNewPeer,
  socketReceived,
  peers,
  users,
};
