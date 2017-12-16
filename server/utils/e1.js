const errs = {
  10: 'Неверный запрос',
  100: 'Неверное имя пользователя или пароль',
  101: 'Требуется авторизация',
  102: 'Повторная авторизация невозможна',
  103: 'На данном e-mail уже зарегистрирован другой пользователь',
  401: 'userID не найден',
  600: 'Неверный запрос',
  601: 'В запросе отсутствует необходимый параметр',
  602: 'Нельзя осуществить резерв более 5 мест',
  603: 'Некоторые места уже заняты. Попробуйте снова',
};

function OwnError(httpError, appError) {
  this.name = 'ApplicationError';
  this.status = httpError;
  this.message = appError + ' : ' + errs[appError];
  this.stack = (new Error()).stack;
}
OwnError.prototype = Object.create(Error.prototype);
OwnError.prototype.constructor = OwnError;

function sendError(ctx, err) {
  switch (err.name) {
    case 'SequelizeValidationError': {
      ctx.res.writeHead(400, {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      });
      ctx.res.end(err.message);
      break;
    }
    case 'SequelizeUniqueConstraintError': {
      ctx.res.writeHead(409, {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      });
      ctx.res.end(err.message);
      break;
    }
    case 'ApplicationError': {
      ctx.res.writeHead(err.status, {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      });
      ctx.res.end(err.message);
      break;
    }
    default: {
      ctx.res.writeHead(500, {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      });
      ctx.res.end();
    }
  }
}

export default {
  OwnError,
  sendError,
};
