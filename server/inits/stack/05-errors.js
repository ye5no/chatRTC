exports.init = (app) => app.use(async (ctx, next) => {
  try {
    await next();
    app.use((ctx) => {
      ctx.throw(404, 'Страница не найдена');
    });
  } catch (e) {
    if (e.status) {
      ctx.state.message = e.message;
      ctx.state.status = e.status;
      console.log(e.status, e.message);
    } else {
      ctx.state.message = 'Внутренняя ошибка. Сервер временно недоступен.';
      ctx.state.status = 500;
      console.error(e.message, e.stack);
    }
    await ctx.render('error');
  }
});
