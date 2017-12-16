import Koa from 'koa';
import inits from './inits';
import pages from './pages';
import modules from './modules';

const app = new Koa();
inits(app);

app.use(pages);
app.use(modules);
app.use(async (ctx) => {
  ctx.throw(404, 'Страница не найдена');
});

export default app;
