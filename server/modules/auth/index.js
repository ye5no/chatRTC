import Router from 'koa-router';
import controller from './auth-controller.js';
import jwtUser from '../../utils/getUser.js';

const router = new Router({ prefix: '/auth' });

router
  .post('/reg', jwtUser(), controller.reg)
  .post('/login', jwtUser(), controller.login)
  .get('/logout', jwtUser(), controller.logout)
  .get('/user', jwtUser(), controller.currentUser);

export default router.routes();
