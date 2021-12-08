const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;

router.get('/', async (req, res) => {
  try {
    res.status(200).render('login', {title: 'Login'});
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

router.post('/', async (req, res) => {
  let username = req.body["username"];
  let userInfo = req.body;
  if(!userInfo.username || typeof userInfo.username !== 'string' || !userInfo.username.match(/^[a-zA-Z0-9]{4,}$/)) {
    res.status(400).render('login', {title: 'Login', userInfo: userInfo, error: 'Invalid username and/or password.'});
    return;
  }
  if(!userInfo.password || typeof userInfo.password !== 'string' || !userInfo.password.match(/^[^\s]{6,}$/)) {
    res.status(400).render('login', {title: 'Login', userInfo: userInfo, error: 'Invalid username and/or password.'});
    return;
  }
  try {
    const result = await userData.check(userInfo.username, userInfo.password);
    if(result.authenticated === true) {
      req.session.user = {authenticated: result.authenticated, username: username, userId: result.id, firstName: result.firstName, lastName: result.lastName, isAdmin: result.isAdmin, savedPlates: result.savedPlates};
      res.redirect('/home');
    }
    else {
      res.status(400).render('login', {title: 'Login', userInfo: userInfo, error: 'Invalid username and/or password.'});
    }
  } catch (e) {
    res.status(400).render('login', {title: 'Login', userInfo: userInfo, error: 'Invalid username and/or password.'});
  }
});

module.exports = router;