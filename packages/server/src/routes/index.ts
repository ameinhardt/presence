import Router from '@koa/router';
import { Context } from 'koa';
import compose from 'koa-compose';

export default async (apiPath: string) => {
  const router = new Router()
    .use((context, next) => {
      context.apiPath = apiPath;
      context.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      context.set('Pragma', 'no-cache');
      context.set('Expires', '0');
      return next();
    })
    .all('(.*)', async (context: Context) => context.throw(404))
    .prefix(apiPath);
  return compose([router.routes(), router.allowedMethods({ throw: true })]);
};
