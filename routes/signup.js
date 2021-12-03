const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;

router.get('/', async (req, res) => {
  res.render('signup', { title: "Signup Page" })
});

router.post('/', async (req, res) => {
  let username = req.body["username"];
  let password = req.body["password"];
  let firstName = req.body["firstname"];
  let lastName = req.body["lastname"];

  try {
    await userData.create(
      firstName,
      lastName,
      username,
      password
    );
    res.redirect('/');
  } catch (e) {
    res.render('signup', { title: "Signup Page", error: e.message });
    //alert(e);
    //res.sendStatus(400);
  }
});

module.exports = router;