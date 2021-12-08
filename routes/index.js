const userRoutes = require('./users');
const foodRoutes = require('./foods');
const savedPlateRoutes = require('./savedPlates');
const commentRoutes = require('./comments');
const loginRoutes = require('./login');
const signupRoutes = require('./signup');
const homeRoutes = require('./home');
const logoutRoutes = require('./logout');

const constructorMethod = (app) => {
  app.use('/users', userRoutes);
  app.use('/foods', foodRoutes);
  app.use('/savedPlates', savedPlateRoutes);
  app.use('/comments', commentRoutes);
  app.use('/login', loginRoutes);
  app.use('/signup', signupRoutes);
  app.use('/logout', logoutRoutes);
  app.use('/', homeRoutes);
  
  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;