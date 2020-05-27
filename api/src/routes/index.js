const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('mainIndex', '/', async (ctx) => {
  ctx.response.json = { ldv: 'v0.1' };
});



module.exports = router;
