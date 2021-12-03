const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;

router.get('/', async (req, res) => {
  res.render('login', { title: "Login Page" })
});

router.post('/', async (req, res) => {
  let username = req.body["username"];
  let password = req.body["password"];

  try {
    await userData.check(
      username,
      password
    );
    req.session.user = { username: username };
    res.redirect("/home");
  } catch (e) {
    res.render('login', { title: "Login Page", error: "Either the username or password is invalid" });
    console.log(e);
    //res.sendStatus(400);
  }
});

module.exports = router;