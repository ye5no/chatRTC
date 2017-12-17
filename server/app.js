import Koa from 'koa';
import inits from './inits';
import pages from './pages';
import modules from './modules';

const app = new Koa();
inits(app);

app.use(pages);
app.use(modules);

export default app;
