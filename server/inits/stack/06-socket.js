import IO from 'koa-socket';

exports.init = (app) => {
  const io = new IO();
  io.attach(app);
  app.online = 0;
  let sockets = {};
  let users = [];
  
  app.io.on('connection', ({socket}) => {
    socket.on('login', (us) => {
      if (users.indexOf(us)==-1) {
        users.push(us);
        app.online=users.length;
      }
      sockets[us] = socket;
      socket.broadcast.emit('new', us);
    });
    
    socket.on('webrtc', (mess) => {
      const {to, from} = JSON.parse(mess);
      if (to !== undefined && sockets[to] !== undefined) {
        sockets[to].emit('webrtc', mess);
      } else {
        socket.broadcast.emit('webrtc', mess);
      }
    });

    socket.on('logout', (us) => {
      if (users.indexOf(us)!=-1) {
        users.splice(users.indexOf(us), 1);
        app.online=users.length;
      }
      socket.broadcast.emit('leave', us);
      delete sockets[us];
    });
  });
};
