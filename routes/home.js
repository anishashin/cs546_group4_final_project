const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.status(200).render('home', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            title: 'Home'
        });
    } catch (e) {
        res.status(500).render('error', {title: 'Error', error: e.message});
    }
});

module.exports = router;