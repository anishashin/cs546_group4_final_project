const express = require('express');
const router = express.Router();
const xss = require('xss');
const data = require('../data');
const userData = data.users;
const savedPlateData = data.savedPlates;
const foodData = data.foods;

router.get('/:id', async (req, res) => {
    req.params.id = xss(req.params.id);
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).render('error', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            title: 'Error', 
            error: 'Id must be a non-empty string containing more than just spaces.'
        });
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
        res.status(200).render('user', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            title: 'User Profile', 
            userInfo: user,
            savedPlateList: savedPlateList
        });
    } catch (e) {
        res.status(404).render('error', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            title: 'Error', 
            error: 'User not found.'
        });
    }
});

module.exports = router;