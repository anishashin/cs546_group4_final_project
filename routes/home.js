const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.status(200).render('home', {title: 'Home'});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.get('/home', async (req, res) => {
    try {
        res.status(200).render('home', {title: 'Logged In', 
        username: req.session.user.username,
        userId: req.session.user.userId,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        isAdmin: req.session.user.isAdmin,
        savedPlates: req.session.user.savedPlates
    });
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

module.exports = router;