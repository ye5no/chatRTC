import passport from 'koa-passport';
import jwt from 'jsonwebtoken';
import e1 from 'e1.js';
import {JWT} from 'config.js';
import Users from '../../models/users.js';

function setToken(ctx, user) {
  const payload = {
    userID: user.userID,
    jwtSecret: user.jwtSecret,
    exp: Math.floor(Date.now() / 1000) + JWT.exp,
  };
  const token = jwt.sign(payload, JWT.secret);
  ctx.cookies.set('jwt', token, {httpOnly: true});
  console.log(`${new Date().toLocaleString()} user=${user.userID} (${user.email}) signIn success!`);
}

export default {
  async reg(ctx, next) { // регистрация
    const user = ctx.user;
    if (ctx.request.header['content-type']!='application/json') throw new e1.OwnError(400, 10);
    if (user) throw new e1.OwnError(401, 102);

    const body = ctx.request.body;
    if (body.email == undefined || body.password == undefined) throw new e1.OwnError(406, 601);
    console.log(`${new Date().toLocaleString()} email=${body.email} try signUp`);
    let userCheckMail = await Users.findOne({where: {email: body.email.toLowerCase()}});
    if (userCheckMail != null) throw new e1.OwnError(401, 103);

    let forCreate = {};
    forCreate.email = body.email.toLowerCase();
    forCreate.jwtSecret = body.email.toLowerCase();
    forCreate.password = body.password;
    const newUser = await Users.create(forCreate);
    console.log(`${new Date().toLocaleString()} email=${body.email} signUp success!`);
    setToken(ctx, newUser);
    ctx.res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
    });
    ctx.res.end();
  },

  async login(ctx, next) { // логин
    const user = ctx.user;
    if (ctx.request.header['content-type']!='application/json') throw new e1.OwnError(400, 10);
    if (user) throw new e1.OwnError(401, 102);

    const body = ctx.request.body;
    if (body.email == undefined || body.password == undefined) throw new e1.OwnError(406, 601);
    await passport.authenticate('local', (err, user, info) => {
      try {
        if (err) throw (err);
        if (!user) throw new e1.OwnError(401, info.status);
        setToken(ctx, user);
        ctx.res.writeHead(200, {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache',
        });
        ctx.res.end();
      } catch (e) {
        console.error(e);
        e1.sendError(ctx, e);
      }
    })(ctx, next);
  },

  async logout(ctx, next) { // логаут
    const user = ctx.user;
    if (!user) throw new e1.OwnError(401, 101);
    console.log(`${new Date().toLocaleString()} user=${user.userID} (${user.email}) signOut success!`);
    ctx.cookies.set('jwt', '', {httpOnly: true});
    ctx.redirect('/');
  },

  async currentUser(ctx, next) { // текущий пользователь
    const user = ctx.user;
    if (!user) throw new e1.OwnError(401, 101);
    console.log(`${new Date().toLocaleString()} user=${user.userID} (${user.email}) getUser`);
    ctx.res.writeHead(200, {
      'Content-type': 'application/json',
      'Cache-Control': 'no-cache',
    });
    ctx.res.write(JSON.stringify(user));
    ctx.res.end();
  },
};
