const KoaRouter = require('koa-router');

const index = require('./routes/index');

const router = new KoaRouter();

router.use('/', index.routes());

module.exports = router;
