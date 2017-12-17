import favicon from 'koa-favicon';
import {DIR} from 'config.js';

exports.init = (app) => {
  app.use(favicon(DIR + 'public/images/favicon.png'));
};
