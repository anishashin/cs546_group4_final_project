const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;

router.get('/', async (req, res) => {
  try {
    res.status(200).render('signup', {title: 'Sign Up'});
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

router.post('/', async (req, res) => {
  let userInfo = req.body;
  if(!userInfo.firstName || typeof userInfo.firstName !== 'string' || userInfo.firstName.trim() === '') {
    res.status(400).render('signup', {title: 'Sign Up', error: 'First name must be a non-empty string containing more than just spaces.'});
    return;
  }
  if(!userInfo.lastName || typeof userInfo.lastName !== 'string' || userInfo.lastName.trim() === '') {
    res.status(400).render('signup', {title: 'Sign Up', error: 'Last name must be a non-empty string containing more than just spaces.'});
    return;
  }
  if(!userInfo.username || typeof userInfo.username !== 'string' || !userInfo.username.match(/^[a-zA-Z0-9]{4,}$/)) {
    res.status(400).render('signup', {title: 'Sign Up', error: 'Username must be at least 4 characters long and only contain alphanumeric characters.'});
    return;
  }
  if(!userInfo.password || typeof userInfo.password !== 'string' || !userInfo.password.match(/^[^\s]{6,}$/)) {
    res.status(400).render('signup', {title: 'Sign Up', error: 'Password must be at least 6 characters long and cannot contain spaces.'});
    return;
  }
  try {
    const newUser = await userData.create(
      userInfo.firstName,
      userInfo.lastName,
      userInfo.username,
      userInfo.password
    );
    res.redirect('/');
  } catch (e) {
    res.status(400).render('signup', {title: 'Sign Up', error: e.message});
  }
});

module.exports = router;