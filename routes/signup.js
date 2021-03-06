const express = require('express');
const router = express.Router();
const xss = require('xss');
const data = require('../data');
const userData = data.users;

router.get('/', async (req, res) => {
  try {
    res.status(200).render('signup', {
      authenticated: req.session.user ? true : false,
      user: req.session.user,
      title: 'Sign Up'
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
  userInfo.firstName = xss(userInfo.firstName);
  userInfo.lastName = xss(userInfo.lastName);
  userInfo.username = xss(userInfo.username);
  userInfo.password = xss(userInfo.password);
  userInfo.isAdmin = xss(userInfo.isAdmin);
  if(!userInfo.firstName || typeof userInfo.firstName !== 'string' || userInfo.firstName.trim() === '') {
    res.status(400).render('signup', {
      authenticated: req.session.user ? true : false,
      user: req.session.user,
      title: 'Sign Up', 
      userInfo: userInfo, 
      error: 'Invalid first name.'
    });
    return;
  }
  if(!userInfo.lastName || typeof userInfo.lastName !== 'string' || userInfo.lastName.trim() === '') {
    res.status(400).render('signup', {
      authenticated: req.session.user ? true : false,
      user: req.session.user,
      title: 'Sign Up', 
      userInfo: userInfo, 
      error: 'Invalid last name.'
    });
    return;
  }
  if(!userInfo.username || typeof userInfo.username !== 'string' || !userInfo.username.match(/^[a-zA-Z0-9]{4,}$/)) {
    res.status(400).render('signup', {
      authenticated: req.session.user ? true : false,
      user: req.session.user,
      title: 'Sign Up', 
      userInfo: userInfo, 
      error: 'Invalid username.'
    });
    return;
  }
  if(!userInfo.password || typeof userInfo.password !== 'string' || !userInfo.password.match(/^[^\s]{6,}$/)) {
    res.status(400).render('signup', {
      authenticated: req.session.user ? true : false,
      user: req.session.user,
      title: 'Sign Up', 
      userInfo: userInfo, 
      error: 'Invalid password.'
    });
    return;
  }
  if(userInfo.isAdmin === 'true') {
    userInfo.isAdmin = true;
  }
  else {
    userInfo.isAdmin = false;
  }
  try {
    const newUser = await userData.create(
      userInfo.firstName,
      userInfo.lastName,
      userInfo.username,
      userInfo.password,
      userInfo.isAdmin
    );
    res.redirect('/login');
  } catch (e) {
    res.status(400).render('signup', {
      authenticated: req.session.user ? true : false,
      user: req.session.user,
      title: 'Sign Up', 
      userInfo: userInfo, 
      error: e.message
    });
  }
});

module.exports = router;