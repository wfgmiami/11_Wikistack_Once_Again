const router = require('express').Router();
const Page = require('../models').Page;
const User = require('../models').User;

router.get('/', (req,res,next) => {
  res.redirect('/');
})

router.get('/search', (req, res, next) => {

  if(req.param('search')){
    Page.findByTag(req.param('search'))
    .then( ( pages ) => {

      res.render('index', { allPages: pages })
    })
  }else{
    res.render('search');
  }

})

router.get('/:urlTitle/delete', (req,res,next)=> {
  Page.findOne({
    where: {
      urlTitle: req.params.urlTitle
    }
  })
  .then( (pageToDelete) => {
    return pageToDelete.destroy();
  })
  .then( () => res.redirect('/'))
  .catch( next )
})

router.post('/', (req,res,next) => {
  var page = Page.build({
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags
  })
  page.save()
  .then( () => User.findOrCreate({
    where: {
      name: req.body.name,
      email: req.body.email
    }
  }))
  .spread(( user, wasCreatedBool )=>{
    return page.setAuthor(user)
  })
  //.then( values => page.setAuthor( values[0] ) )
  .then( (savedPage) => res.redirect(savedPage.route))
  .catch(next)
})

router.post('/:urlTitle/edit', (req,res,next) => {
  let updatedPage;

  Page.findOne({
    where: {
      urlTitle: req.params.urlTitle
    }
  })
  .then( (page)=> {
    updatedPage = page;
    return page.update({
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags,
    })
  })
  .then( (page) => {
    page.save()
    return User.findById( page.authorId )
  })
  .then( (user) => {
    return user.update({
      name: req.body.name,
      email: req.body.email
    })
  })
  .then( () => {
    return Page.findOne({
      where: {
        urlTitle: updatedPage.urlTitle
      },
      include: [{
        model: User, as: 'author'
      }]
    })
  })
  .then( (wikipage) => {
    res.redirect(wikipage.route)
  })
})

router.get('/add', (req,res,next) => {
  res.render('../views/addpage.html');
})

router.get('/:urlTitle', (req,res,next) => {
  Page.findOne({
    where: {
      urlTitle: req.params.urlTitle
    },
    include: [{
      model: User, as: 'author'
    }]
  })
  .then( (wikipage) => {
    if( wikipage === null ){
      return next(new Error('No page was found'));
    }else{
      wikipage.tags = wikipage.tags.join(',');
      res.render('wikipage', { wikipage })
    }
  })
  .catch(next)
})

router.get('/:urlTitle/similar', (req,res,next) => {
  Page.findOne({
    where: { urlTitle: req.params.urlTitle }
  })
  .then( (page) => {
    if(!page){
      return next(new Error(`No page with title ${ req.params.urlTitle } was found`));
    }else{
      return page.findSimilar()
    }
  })
  .then( ( similarPages ) => {
    if(similarPages.length === 0){
      let er = new Error();
      er.status = 500;
      er.message = 'No similar page was found';
      return next(er);
    }else{
      res.render('index', { allPages: similarPages } )
    }
  })
})

router.get('/:urlTitle/edit', (req,res,next) => {
  let wikipage;
  Page.findOne({
    where: { urlTitle: req.params.urlTitle }
  })
  .then( ( _wikipage ) => {
    wikipage = _wikipage;

    return User.findOne({
      where: { id: wikipage.authorId }
    })
  })
  .then( ( author ) => {
    res.render('addpage', { wikipage, author })
  })
  .catch(next)
})


module.exports = router;

