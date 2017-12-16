import Router from 'koa-router';
import getUser from '../utils/getUser.js';
import Users from '../models/users.js';
import app from '../app.js';

const router = new Router();

router
  .get('/', getUser(), async (ctx, next) => {
    if (ctx.user) ctx.redirect('/chat');
    let count = await Users.findAndCountAll();
    ctx.state.allUsers = count.count;
    ctx.state.onlineUsers = app.online;
    await ctx.render('index');
  })
  .get('/chat', getUser(), async (ctx, next) => {
    if (!ctx.user) ctx.redirect('/');
    ctx.state.user = ctx.user.email;
    await ctx.render('chat');
  });

export default router.routes();
