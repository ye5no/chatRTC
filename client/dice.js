import crypto from 'crypto';
import {user, broadcastMessage} from './chat.js';

const diceGames = {};

function Witness() {
  this.hashedOffset = false;
  this.keyOffset = false;
  this.confirm = false;
  this.result = () => {
    const values = [0, 1, 2, 3, 4, 5];
    const matches = values.filter((el) => {
      return this.hashedOffset == crypto.createHmac('sha256', this.keyOffset+'').update(el+'').digest('hex');
    }, this);
    return (matches.length==0) ? false : matches[0];
  }
}

function Witnesses(users) {
  users.forEach((witness) => {
    this[witness] = new Witness();
  });
}

function Dice(player, users) {
  this.player = player;
  this.base = false;
  this.witnesses = new Witnesses(users);
  this.result = () => {
    if (this.base===false) return false;
    let result = this.base;
    for (let witness in this.witnesses) {
      if (this.witnesses[witness].result()===false) return false;
      result += this.witnesses[witness].result();
    }
    return result % 6 + 1;
  };
  this.confirmed = () => {
    for (let witness in this.witnesses) {
      if (!this.witnesses[witness].confirm) return false;
    }
    return true;
  };
}

export default {
  start(player, id, users) {
    if (diceGames[id]!=undefined) return false;
    const witnesses = (user==player) ? users : users.map((el) => {
      return (el==player) ? user : el;
    });

    diceGames[id] = new Dice(player, witnesses);
    if (player!=user) {
      const myOffset = Math.floor(Math.random() * 6);
      console.log(myOffset);
      const myKeyOffset = Math.random();
      diceGames[id].witnesses[user].keyOffset = myKeyOffset;
      diceGames[id].witnesses[user].hashedOffset = crypto.createHmac('sha256', myKeyOffset + '').update(myOffset + '').digest('hex');
      broadcastMessage('dice.hashedOffset', {
        id: id,
        hashedOffset: diceGames[id].witnesses[user].hashedOffset,
      });
    }
  },
  hashedOffset(wetness, data) {
    diceGames[data.id].witnesses[wetness].hashedOffset = data.hashedOffset;
    if (user==diceGames[data.id].player) {
      let allHashedOffsetsReceived = true;
      for (let witness in diceGames[data.id].witnesses) {
        allHashedOffsetsReceived = (diceGames[data.id].witnesses[witness].hashedOffset != false) && allHashedOffsetsReceived;
      }
      if (allHashedOffsetsReceived) {
        const base = Math.floor(Math.random()*6);
        diceGames[data.id].base = base;
        broadcastMessage('dice.base', {
          id: data.id,
          base: base,
        });
      }
    }
  },
  base(data) {
    diceGames[data.id].base = data.base;
    broadcastMessage('dice.keyOffset', {
      id: data.id,
      keyOffset: diceGames[data.id].witnesses[user].keyOffset,
    });
  },
  keyOffset(wetness, data) {
    diceGames[data.id].witnesses[wetness].keyOffset = data.keyOffset;
    if (user==diceGames[data.id].player) {
      const result = diceGames[data.id].result();
      if (result!==false) {
        broadcastMessage('dice.result', {
          id: data.id,
          result: result,
        });
      }
    }
  },
  result(data) {
    if (data.result == diceGames[data.id].result()) {
      broadcastMessage('dice.confirm', data.id);
    }
  },
  confirm(wetness, id) {
    diceGames[id].witnesses[wetness].confirm = true;
    if (user==diceGames[id].player) {
      if (diceGames[id].confirmed()) {
        broadcastMessage('simple message', 'Dice result (№'+id+'): ' + diceGames[id].result());
        delete diceGames[id];
      }
    }
  },
  verify(message) {
    const data = message.replace(/[a-z\s\(\№\)]/gi,'').split(':');
    const id = data[0];
    const result = Number(data[1]);
    const verifiedResult = result==diceGames[id].result();
    delete diceGames[id];
    return verifiedResult;
  }
};
