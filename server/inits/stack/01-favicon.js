import favicon from 'koa-favicon';
import {DIR} from 'config.js';

exports.init = (app) => {
  if (process.env.NODE_ENV == 'development') {
    app.use(favicon(DIR + 'public/images/favicon.png'));
  }
};
