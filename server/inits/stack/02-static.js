import serve from 'koa-static';
import {DIR} from 'config.js';

exports.init = (app) => {
  if (process.env.NODE_ENV == 'development') {
    app.use(serve(DIR + 'public'));
  }
};
