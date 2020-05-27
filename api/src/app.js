// const env = require('dotenv').config();
const path = require('path');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaLogger = require('koa-logger');
const koaStatic = require('koa-static');
const koaStaticCache = require('koa-static-cache');
const override = require('koa-override-method');
const compress = require('koa-compress');
const helmet = require('koa-helmet');
const http = require('http');
const routes = require('./routes');
const orm = require('./models');
const app = new Koa();

const developmentMode = app.env === 'development';
const testMode = app.env === 'test';
const productionMode = app.env === 'production';

let staticOptions = {};

if (testMode || productionMode) {
  console.log('nodevmode');
  app.use(helmet.hidePoweredBy());
  app.use(helmet.noSniff());
  app.use(helmet.ieNoOpen());
  app.use(helmet.xssFilter());
  staticOptions = {
    br: true,
    gzip: true,
    maxAge: 300,
  };
} else if (developmentMode) {
  staticOptions = {
    br: true,
    gzip: true,
    maxAge: 5,
  };
} else {
  process.exit(1);
}

app.keys = [
  process.env.SECRET1,
  process.env.SECRET2,
  process.env.SECRET3,
  process.env.SECRET4,
];

// expose ORM through context's prototype
app.context.orm = orm;

/**
 * Middlewares
 */

// expose running mode in ctx.state

app.use((ctx, next) => {
  ctx.response.meta = {};
  ctx.response.json = {};
  ctx.state.env = ctx.app.env;
  ctx.acceptsEncodings('gzip', 'deflate', 'br');
  return next();
});

app.use(compress({
  threshold: 256,
  flush: require('zlib').Z_SYNC_FLUSH,
}));
// log requests
app.use(koaLogger());

app.use(koaStaticCache(path.join(__dirname, '..', 'build'), staticOptions));

app.use(koaStatic(path.join(__dirname, '..', 'uploads'), staticOptions));

// parse request body
app.use(koaBody({
  multipart: true,
  keepExtensions: true,
  formidable: {
    maxFields: 10,
    maxFieldsSize: 30 * 1024 * 1024,
    maxFileSize: 100 * 1024 * 1024,
    uploadDir: path.join(__dirname, '..', 'uploads'),
    keepExtensions: true,
    multiples: true,
  },
}));

app.use((ctx, next) => {
  ctx.request.method = override.call(ctx, ctx.request.body.fields || ctx.request.body);
  return next();
});

const message_wrapper = async function (ctx, next) {
  await next();
  //GraphQL compatibility
  if (ctx.mountPath != '/graphql') {
    console.log(ctx.status);
    let { status } = ctx;
    ctx.response.body = {};
    if (ctx.response.meta === undefined) {
      ctx.response.meta = {};
    }
    Object.keys(ctx.response.json).length > 0 && status == 404 ? status = 200 : () => {};
    // Object.keys(ctx.response.json).length > 0 && ctx.status == 404 ? status = 200 : status = 404;
    ctx.response.body.meta = ctx.response.meta;
    ctx.response.body.meta.code = status;
    ctx.response.body.meta.message = http.STATUS_CODES[status];
    ctx.response.body.content = ctx.response.json;
    ctx.response.status = status;
  }
};

app.use(message_wrapper);

app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404) {
      ctx.throw(404);
    } else if (ctx.status === 500) {
      ctx.throw(500);
    }
  } catch (error) {
    let message = '';
    ctx.status = error.status || 500;
    await ctx.app.emit('error', error, ctx);
    if (ctx.status === undefined) {
      message = 'Internal Server Error';
    } else {
      message = http.STATUS_CODES[ctx.status];
    }
    ctx.response.meta.message = message;
  }
});

// Graphql stuff
/*
const mount = require('koa-mount');
const graphqlHTTP = require('koa-graphql');
const schema = require('./schemas/index');

app.use(mount('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
})));
*/

app.use(routes.routes());

module.exports = app;
