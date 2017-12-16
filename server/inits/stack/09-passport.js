import passport from 'koa-passport';
import passLocal from 'passport-local';
import passJwt from 'passport-jwt';
import Users from '../../models/users';
import crypto from 'crypto';
import {JWT} from '../../config.js';


exports.init = (app) => {
  let cookieExt = function(ctx) {
    return (ctx.header.cookie!=undefined) ? ctx.cookies.get('jwt') : null;
  };
  let bodyExt = function(ctx) {
    return (ctx.body.jwt!=undefined) ? ctx.body.jwt : null;
  };
  let queryExt = function(ctx) {
    return (ctx.query.jwt!=undefined) ? ctx.query.jwt : null;
  };

  // ---local---
  passport.use(new passLocal.Strategy({
      usernameField: 'email',
      passwordField: 'password',
    },
    async function(email, password, done) {
      let user;
      try {
        user = await Users.findOne({where: {email: email.toLowerCase()}});
        if (user != null) {
          if (user.hashedPassword === crypto.createHmac('sha256', user.salt).update(password).digest('hex')) {
            console.log('Logged in');
            return done(null, user);
          } else {
            console.log('Пароль неверен ' + password);
            return done(null, false, {status: 100});
          }
        } else {
          console.log('Такого пользователя не существует ' + email);
          return done(null, false, {status: 100});
        }
      } catch (e) {
        console.error(e);
        return done(e);
      }
    }
  ));

  // ---jwt---
  passport.use(new passJwt.Strategy({
      secretOrKey: JWT.secret,
      timeout: JWT.timeout,
      jwtFromRequest: passJwt.ExtractJwt.fromExtractors([cookieExt, bodyExt, queryExt]),
    },
    async function(payload, done) {
      try {
        let user = await Users.findOne({where: {userID: payload.userID}});
        if (user != null) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (e) {
        console.error(e);
        return done(e);
      }
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
};
