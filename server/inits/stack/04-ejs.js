import render from 'koa-ejs';
import {DIR} from 'config.js';

let options = {
  root: DIR + 'public',
  layout: false,
  viewExt: 'ejs',
  cache: false,
  debug: false,
};

exports.init = (app) => render(app, options);
