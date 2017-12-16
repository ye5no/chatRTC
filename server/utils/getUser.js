import passport from 'koa-passport';
import e1 from './e1.js';

export default () => async (ctx, next) => {
  await passport.authenticate('jwt', async (err, user) => {
    try {
      if (err) throw (err);
      ctx.user = user;
      await next(ctx, next);
    } catch (err) {
      console.error(err);
      e1.sendError(ctx, err);
    }
  })(ctx, next);
};
