const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;

router.get('/', async (req, res) => {
    res.render('home', { title: "Home Page" })
});

module.exports = router;