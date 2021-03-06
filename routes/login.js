const express = require('express');
const router = express.Router();
const xss = require('xss');
const data = require('../data');
const userData = data.users;

router.get('/', async (req, res) => {
  try {
    res.status(200).render('login', {
      authenticated: req.session.user ? true : false,
      user: req.session.user,
      title: 'Login'
    });
  } catch (e) {
    res.status(500).render('error', {
      authenticated: req.session.user ? true : false,
      user: req.session.user,
      title: 'Error', 
      error: e.message
    });
  }
});

router.post('/', async (req, res) => {
  let userInfo = req.body;
  userInfo.username = xss(userInfo.username);
  userInfo.password = xss(userInfo.password);
  if(!userInfo.username || typeof userInfo.username !== 'string' || !userInfo.username.match(/^[a-zA-Z0-9]{4,}$/)) {
    res.status(400).render('login', {
      authenticated: req.session.user ? true : false,
      user: req.session.user,
      title: 'Login', 
      userInfo: userInfo, 
      error: 'Invalid username and/or password.'
    });
    return;
  }
  if(!userInfo.password || typeof userInfo.password !== 'string' || !userInfo.password.match(/^[^\s]{6,}$/)) {
    res.status(400).render('login', {
      authenticated: req.session.user ? true : false,
      user: req.session.user,
      title: 'Login', 
      userInfo: userInfo, 
      error: 'Invalid username and/or password.'
    });
    return;
  }
  try {
    const result = await userData.check(userInfo.username, userInfo.password);
    if(result.authenticated === true) {
      req.session.user = result.user;
      res.redirect('/');
    }
    else {
      res.status(400).render('login', {
        authenticated: req.session.user ? true : false,
        user: req.session.user,
        title: 'Login', 
        userInfo: userInfo, 
        error: 'Invalid username and/or password.'
      });
    }
  } catch (e) {
    res.status(400).render('login', {
      authenticated: req.session.user ? true : false,
      user: req.session.user,
      title: 'Login', 
      userInfo: userInfo, 
      error: 'Invalid username and/or password.'
    });
  }
});

module.exports = router;