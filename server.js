var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var swig = require('swig');
var models = require('./models');
var routes = require('./routes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.use('/stylesheets', express.static(__dirname + '/stylesheets'));
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.engine('html', swig.renderFile);
swig.setDefaults({ cache: false });
swig.setDefaults({ autoescape: false });

app.use('/', routes);
app.use( ( err,req,res,next ) => {
  res.render('error', { message: err.message, error: err })
})

let port = process.env.port || 3000;

models.db.sync({ force: true })
.then( ()=> {
  app.listen( port, ()=> {
    console.log(`db synced. Server listening on port ${ port }`)
  })
 })
 .catch( console.error )

