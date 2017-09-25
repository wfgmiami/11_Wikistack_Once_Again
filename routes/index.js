const router = require('express').Router();
const models = require('../models');
const wikiRouter = require('./wiki');
const userRouter = require('./user');
const path = require('path');

router.get('/', (req,res,next)=>{
  models.Page.getAllPages()
  .then( ( allPages ) => {
    res.render(path.join(__dirname, '..', 'views/index.html'), { allPages })
  })
})

router.get('/about', (req,res,next) => {
  res.redirect('/')
})

router.use('/wiki', wikiRouter);
router.use('/users', userRouter);

module.exports = router;

