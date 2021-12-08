const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const savedPlateData = data.savedPlates;
const foodData = data.foods;

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
        for(let savedPlate of savedPlateList) {
            for(let i = 0; i <savedPlate.foods.length; i++) {
                savedPlate.foods[i] = await foodData.get(savedPlate.foods[i]);
                if((Math.round(savedPlate.foods[i].servingSizeNumber * savedPlate.servings[i] * 10) / 10) <= 1) {
                    savedPlate.foods[i].servings = (Math.round(savedPlate.foods[i].servingSizeNumber * savedPlate.servings[i] * 10) / 10) + ' ' + savedPlate.foods[i].servingSizeUnitSingular;
                }
                else {
                    savedPlate.foods[i].servings = (Math.round(savedPlate.foods[i].servingSizeNumber * savedPlate.servings[i] * 10) / 10) + ' ' + savedPlate.foods[i].servingSizeUnitPlural;
                }
            }
        }
        res.status(200).render('user', {title: 'User Profile', user: user, savedPlateList: savedPlateList});
    } catch (e) {
        res.status(404).json({error: 'User not found.'});
    }
});

router.get('/users/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).json({error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const user = await userData.get(req.params.id);
        const savedPlateList = await savedPlateData.getAll(req.params.id);
        for(let savedPlate of savedPlateList) {
            for(let i = 0; i <savedPlate.foods.length; i++) {
                savedPlate.foods[i] = await foodData.get(savedPlate.foods[i]);
                if((Math.round(savedPlate.foods[i].servingSizeNumber * savedPlate.servings[i] * 10) / 10) <= 1) {
                    savedPlate.foods[i].servings = (Math.round(savedPlate.foods[i].servingSizeNumber * savedPlate.servings[i] * 10) / 10) + ' ' + savedPlate.foods[i].servingSizeUnitSingular;
                }
                else {
                    savedPlate.foods[i].servings = (Math.round(savedPlate.foods[i].servingSizeNumber * savedPlate.servings[i] * 10) / 10) + ' ' + savedPlate.foods[i].servingSizeUnitPlural;
                }
            }
        }
        res.status(200).render('user', {title: 'User Profile', 
        user: user, 
        savedPlateList: savedPlateList,
        username: req.session.user.username,
        userId: req.session.user.userId,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        isAdmin: req.session.user.isAdmin,
        savedPlates: req.session.user.savedPlates,
        authenticated: req.session.user.authenticated
    });
    } catch (e) {
        res.status(404).json({error: 'User not found.'});
    }
});

module.exports = router;
