import Router from 'koa-router';
import auth from './auth';
import act from './act';

const router = new Router({ prefix: '/api' });

router.use(auth);
router.use(act);

export default router.routes();
