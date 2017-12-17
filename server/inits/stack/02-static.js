import serve from 'koa-static';
import {DIR} from 'config.js';

exports.init = (app) => {
  app.use(serve(DIR + 'public'));
};
