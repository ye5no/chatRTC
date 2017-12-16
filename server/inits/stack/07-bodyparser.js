import bodyParser from 'koa-bodyparser';

exports.init = (app) => app.use(bodyParser());

