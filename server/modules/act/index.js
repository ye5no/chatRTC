import Router from 'koa-router';
import controller from './act-controller.js';
import jwtUser from '../../utils/getUser.js';

const router = new Router({ prefix: '/action' });

router
  .get('/state', jwtUser(), controller.getState)
  .post('/reserv', jwtUser(), controller.setReserv);

export default router.routes();
