const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');
const configRoutes = require('./routes');
const session = require('express-session');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');

const handlebarsInstance = exphbs.create({
  defaultLayout: 'main',
  partialsDir: ['views/partials']
});

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

app.use(session({
  name: 'AuthCookie',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: true
}));

app.use('/comments', async (req, res, next) => {
  if(!req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
});

app.use('/foods/add', async (req, res, next) => {
  if(!req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
});

app.use('/foods/edit', async (req, res, next) => {
  if(!req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
});

app.use('/savedPlates/edit', async (req, res, next) => {
  if(!req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
});

app.use('/login', async (req, res, next) => {
  if(req.session.user) {
      res.redirect('/');
  } else {
      next();
  }
});

app.use('/logout', async (req, res, next) => {
  if(!req.session.user) {
      res.redirect('/');
  } else {
      next();
  }
});

app.use('/signup', async (req, res, next) => {
  if(req.session.user) {
      res.redirect('/');
  } else {
      next();
  }
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});