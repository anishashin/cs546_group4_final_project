const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const savedPlateData = data.savedPlates;

router.get('/', async (req, res) => {
    try {
        const userList = await userData.getAll();
        res.status(200).json(userList);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.get('/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).json({error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const user = await userData.get(req.params.id);
        const savedPlateList = await savedPlateData.getAll(req.params.id);
        res.status(200).render('user', {title: 'User Profile', user: user, savedPlateList: savedPlateList});
    } catch (e) {
        res.status(404).json({error: 'User not found.'});
    }
});

router.post('/', async (req, res) => {
    let userInfo = req.body;
    if(!userInfo) {
        res.status(400).json({error: 'You must provide data to add a user.'});
        return;
    }
    if(!userInfo.firstName || typeof userInfo.firstName !== 'string' || userInfo.firstName.trim() === '') {
        res.status(400).json({error: 'First name must be a non-empty string containing more than just spaces.'});
        return;
    }
    if(!userInfo.lastName || typeof userInfo.lastName !== 'string' || userInfo.lastName.trim() === '') {
        res.status(400).json({error: 'Last name must be a non-empty string containing more than just spaces.'});
        return;
    }
    if(!userInfo.username || typeof userInfo.username !== 'string' || !userInfo.username.match(/^[a-zA-Z0-9]{4,}$/)) {
        res.status(400).json({error: 'Username must be at least 4 characters long and only contain alphanumeric characters.'});
        return;
    }
    if(!userInfo.password || typeof userInfo.password !== 'string' || !userInfo.password.match(/^[^\s]{6,}$/)) {
        res.status(400).json({error: 'Password must be at least 6 characters long and cannot contain spaces.'});
        return;
    }
    try {
        const newUser = await userData.create(
            userInfo.firstName,
            userInfo.lastName,
            userInfo.username,
            userInfo.password
        );
        res.status(200).json(newUser);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

module.exports = router;