const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.status(200).render('home', {title: 'Home'});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

module.exports = router;