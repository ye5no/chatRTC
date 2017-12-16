import logger from 'koa-logger';

exports.init = (app) => {
  app.use(logger());
};
