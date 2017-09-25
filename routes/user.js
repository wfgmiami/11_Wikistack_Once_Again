const express = require('express');
const router = express.Router();
const User = require('../models').User;
const Page = require('../models').Page;

router.get('/', (req,res,sent) => {

  User.getAllUsers()
  .then( ( users ) => {
    res.render('users', { users })
  })
  .catch( console.error )
})

router.get('/:id', (req,res,next) => {
  // let author;

  // User.findById(req.params.id)
  // .then( (user) => {
  //   author = user;
  //   return Page.findAll({
  //     where: { authorId: user.id }
  //   })
  // })
  // .then( ( authorPages ) => {

  //   res.render('author', { authorPages, author })
  // })

  const userPromise = User.findById(req.params.id);
  const pagesPromise = Page.findAll({
    where: { authorId: req.params.id }
  })
  Promise.all([ pagesPromise, userPromise ])
  .then( (values) => {
    const author = values[1];
    const authorPages = values[0];
    res.render('author', { authorPages, author })
  })
  .catch( next );
})

module.exports = router;
