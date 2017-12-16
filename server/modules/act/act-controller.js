import e1 from '../../utils/e1.js';
import Seats from '../../models/seats.js';
import {MAX_SEATS} from '../../config.js';
import app from '../../app.js';

let currentReservation = [];

function validTryReservation(tryReserv) {
  if (!Array.isArray(tryReserv)) throw new e1.OwnError(406, 600);
  const len = tryReserv.length;
  if (len>5) throw new e1.OwnError(406, 601);
  let allTryReserv = true;
  let addToCurrentReservation = [];
  for (let i=0; i<len; i++) {
    if (Number.isInteger(tryReserv[i]) &&
      tryReserv[i] >= 1 &&
      tryReserv[i] <= MAX_SEATS &&
      addToCurrentReservation.indexOf(tryReserv[i]) == -1) {
      addToCurrentReservation.push(tryReserv[i]);
    } else {
      allTryReserv = false;
      break;
    }
  }
  if (!allTryReserv) throw new e1.OwnError(406, 600);
  addToCurrentReservation.forEach((elem) => {
    if (currentReservation.indexOf(elem) != -1) {
      allTryReserv = false;
    }
  });
  if (!allTryReserv) throw new e1.OwnError(406, 603);
  currentReservation.concat(addToCurrentReservation);
  return addToCurrentReservation;
}

export default {
  async getState(ctx, next) { // получить текущую картину резерва и подписаться на события
    const user = ctx.user;
    console.log(`${new Date().toLocaleString()} user=${user.userID || undefined} getReserv`);
    const currentState = await Seats.findAll();
    ctx.res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
    });
    ctx.res.write(JSON.stringify(currentState));
    ctx.res.end();
  },

  async setReserv(ctx, next) { // осуществить бронирование
    const user = ctx.user;
    if (ctx.request.header['content-type'] != 'application/json') throw new e1.OwnError(400, 10);
    if (!user) throw new e1.OwnError(401, 101);
    let body = ctx.request.body;
    if (body.reserv == undefined || body.flag == undefined) throw new e1.OwnError(406, 601);
    if (body.flag != true && body.flag != false) throw new e1.OwnError(406, 601);
    const tryReservation = body.reserv;
    const forReservation = validTryReservation(tryReservation);
    if (body.flag === true) {
      await Seats.update({reserv: user.userID, color: user.color}, {where: {seatID: {$in: forReservation}, reserv: 0}});
      app.io.broadcast('reserv', {seats: forReservation, userRes: user.userID, color: user.color});
    } else {
      await Seats.update({reserv: 0, color: '#FFFFFF'}, {where: {seatID: {$in: forReservation}, reserv: user.userID}});
      app.io.broadcast('free', forReservation);
    }
    console.log(`${new Date().toLocaleString()} user=${user.userID} reserved ${forReservation} success!`);
    ctx.res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
    });
    ctx.res.end();
  },
};
