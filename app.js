const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');
const session = require('express-session');

const configRoutes = require('./routes');
const exphbs = require('express-handlebars');

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(
    session({
      name: 'AuthCookie',
      secret: "Secret Code",
      saveUninitialized: true,
      resave: false
    })
);

app.get('/', (req, res) => {
  try {
    res.status(200).render('login', {title: 'Pierce Dining Hall Nutrition Calculator'});
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

app.use('/private', (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/');
    } else {
      next();
    }
});


configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});