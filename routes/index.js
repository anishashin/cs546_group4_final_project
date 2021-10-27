const userRoutes = require('./users');
const foodRoutes = require('./foods');
const savedPlateRoutes = require('./savedPlates');
const commentRoutes = require('./comments');

const constructorMethod = (app) => {
  app.use('/users', userRoutes);
  app.use('/foods', foodRoutes);
  app.use('/savedPlates', savedPlateRoutes);
  app.use('/comments', commentRoutes);
  
  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;