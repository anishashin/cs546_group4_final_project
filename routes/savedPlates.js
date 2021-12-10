const express = require('express');
const router = express.Router();
const data = require('../data');
const savedPlateData = data.savedPlates;
const foodData = data.foods;
const userData = data.users;

router.get('/', async (req, res) => {
    try {
        const foodList = await foodData.getAll();
        for(let food of foodList) {
            if(food.servingSizeNumber <= 1) {
                food.servingSizeUnit = food.servingSizeUnitSingular;
            }
            else {
                food.servingSizeUnit = food.servingSizeUnitPlural;
            }
        }
        res.status(200).render('build_plate', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            title: 'Build Your Own Plate',
            foodList: foodList});
    } catch (e) {
        res.status(500).render('error', {title: 'Error', error: e.message});
    }
});

router.get('/edit/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).render('error', {title: 'Error', error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const foodList = await foodData.getAll();
        for(let food of foodList) {
            if(food.servingSizeNumber <= 1) {
                food.servingSizeUnit = food.servingSizeUnitSingular;
            }
            else {
                food.servingSizeUnit = food.servingSizeUnitPlural;
            }
        }
        const savedPlate = await savedPlateData.get(req.params.id);
        if(req.session.user._id !== savedPlate.userId) {
            return res.redirect('/');
        }
        res.status(200).render('edit_plate', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            title: 'Edit Saved Plate', 
            foodList: foodList, 
            savedPlate: savedPlate});
    } catch (e) {
        res.status(404).render('error', {title: 'Error', error: 'Saved plate not found.'});
    }
});

router.get('/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).render('error', {title: 'Error', error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const savedPlate = await savedPlateData.get(req.params.id);
        const user = await userData.get(savedPlate.userId);
        savedPlate.userName = user.firstName + ' ' + user.lastName;
        for(let i = 0; i < savedPlate.foods.length; i++) {
            savedPlate.foods[i] = await foodData.get(savedPlate.foods[i]);
            if((Math.round(savedPlate.foods[i].servingSizeNumber * savedPlate.servings[i] * 10) / 10) <= 1) {
                savedPlate.foods[i].servings = (Math.round(savedPlate.foods[i].servingSizeNumber * savedPlate.servings[i] * 10) / 10) + ' ' + savedPlate.foods[i].servingSizeUnitSingular;
            }
            else {
                savedPlate.foods[i].servings = (Math.round(savedPlate.foods[i].servingSizeNumber * savedPlate.servings[i] * 10) / 10) + ' ' + savedPlate.foods[i].servingSizeUnitPlural;
            }
        }
        res.status(200).render('saved_plate', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            isCreator: req.session.user && req.session.user._id === savedPlate.userId ? true : false,
            title: savedPlate.title, 
            savedPlate: savedPlate});
    } catch (e) {
        res.status(404).render('error', {title: 'Error', error: 'Saved plate not found.'});
    }
});

router.get('/json/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).json({error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const savedPlate = await savedPlateData.get(req.params.id);
        res.status(200).json({savedPlate: savedPlate});
    } catch (e) {
        res.status(404).json({error: 'Saved plate not found.'});
    }
});

router.post('/', async (req, res) => {
    let savedPlateInfo = req.body;
    if(!savedPlateInfo) {
        res.status(400).render('error', {title: 'Error', error: 'You must provide data to create a saved plate.'});
        return;
    }
    if(!savedPlateInfo.userId || typeof savedPlateInfo.userId !== 'string' || savedPlateInfo.userId.trim() === '') {
        res.status(400).render('error', {title: 'Error', error: 'User id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const user = await userData.get(savedPlateInfo.userId);
    } catch (e) {
        res.status(400).render('error', {title: 'Error', error: 'No user with that id.'});
        return;
    }
    if(!savedPlateInfo.title || typeof savedPlateInfo.title !== 'string' || savedPlateInfo.title.trim() === '') {
        res.status(400).render('error', {title: 'Error', error: 'Title must be a non-empty string containing more than just spaces.'});
        return;
    }
    if(Array.isArray(savedPlateInfo.foods) === false || savedPlateInfo.foods.length === 0) {
        res.status(400).render('error', {title: 'Error', error: 'Foods must be a non-empty array.'});
        return;
    }
    for(let i = 0; i < savedPlateInfo.foods.length; i++) {
        if(!savedPlateInfo.foods[i] || typeof savedPlateInfo.foods[i] !== 'string' || savedPlateInfo.foods[i].trim() === '') {
            res.status(400).render('error', {title: 'Error', error: 'Foods must only contain non-empty string(s) with more than just spaces.'});
            return;
        }
    }
    try {
        for(let i = 0; i < savedPlateInfo.foods.length; i++) {
            let food = await foodData.get(savedPlateInfo.foods[i]);
        }
    } catch (e) {
        res.status(400).render('error', {title: 'Error', error: 'No food with that id.'});
        return;
    }
    if(Array.isArray(savedPlateInfo.servings) === false || savedPlateInfo.servings.length !== savedPlateInfo.foods.length) {
        res.status(400).render('error', {title: 'Error', error: 'Servings must be an array with the same length as foods.'});
        return;
    }
    for(let i = 0; i < savedPlateInfo.servings.length; i++) {
        if(!savedPlateInfo.servings[i] || typeof savedPlateInfo.servings[i] !== 'number' || savedPlateInfo.servings[i] <= 0) {
            res.status(400).render('error', {title: 'Error', error: 'Servings must only contain numbers greater than 0.'});
            return;
        }
    }
    try {
        const newSavedPlate = await savedPlateData.create(
            savedPlateInfo.userId,
            savedPlateInfo.title,
            savedPlateInfo.foods,
            savedPlateInfo.servings
        );
        res.status(200).send({result: 'redirect', url: '/savedPlates/' + newSavedPlate._id});
    } catch (e) {
        res.status(500).render('error', {title: 'Error', error: e.message});
    }
});

router.put('/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).render('error', {title: 'Error', error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    let savedPlateInfo = req.body;
    if(!savedPlateInfo) {
        res.status(400).render('error', {title: 'Error', error: 'You must provide data to edit a saved plate.'});
        return;
    }
    if(!savedPlateInfo.title || typeof savedPlateInfo.title !== 'string' || savedPlateInfo.title.trim() === '') {
        res.status(400).render('error', {title: 'Error', error: 'Title must be a non-empty string containing more than just spaces.'});
        return;
    }
    if(Array.isArray(savedPlateInfo.foods) === false || savedPlateInfo.foods.length === 0) {
        res.status(400).render('error', {title: 'Error', error: 'Foods must be a non-empty array.'});
        return;
    }
    for(let i = 0; i < savedPlateInfo.foods.length; i++) {
        if(!savedPlateInfo.foods[i] || typeof savedPlateInfo.foods[i] !== 'string' || savedPlateInfo.foods[i].trim() === '') {
            res.status(400).render('error', {title: 'Error', error: 'Foods must only contain non-empty string(s) with more than just spaces.'});
            return;
        }
    }
    try {
        for(let i = 0; i < savedPlateInfo.foods.length; i++) {
            let food = await foodData.get(savedPlateInfo.foods[i]);
        }
    } catch (e) {
        res.status(400).render('error', {title: 'Error', error: 'No food with that id.'});
        return;
    }
    if(Array.isArray(savedPlateInfo.servings) === false || savedPlateInfo.servings.length !== savedPlateInfo.foods.length) {
        res.status(400).render('error', {title: 'Error', error: 'Servings must be an array with the same length as foods.'});
        return;
    }
    for(let i = 0; i < savedPlateInfo.servings.length; i++) {
        if(!savedPlateInfo.servings[i] || typeof savedPlateInfo.servings[i] !== 'number' || savedPlateInfo.servings[i] <= 0) {
            res.status(400).render('error', {title: 'Error', error: 'Servings must only contain numbers greater than 0.'});
            return;
        }
    }
    try {
        const savedPlate = await savedPlateData.get(req.params.id);
        if(req.session.user._id !== savedPlate.userId) {
            return res.redirect('/');
        }
    } catch (e) {
        res.status(404).render('error', {title: 'Error', error: 'Saved plate not found.'});
        return;
    }
    try {
        const updatedSavedPlate = await savedPlateData.update(
            req.params.id,
            savedPlateInfo.title,
            savedPlateInfo.foods,
            savedPlateInfo.servings
        );
        res.status(200).send({result: 'redirect', url: '/savedPlates/' + updatedSavedPlate._id});
    } catch (e) {
        res.status(500).render('error', {title: 'Error', error: e.message});
    }
});

router.delete('/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).render('error', {title: 'Error', error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    let savedPlate;
    try {
        savedPlate = await savedPlateData.get(req.params.id);
        if(req.session.user._id !== savedPlate.userId) {
            return res.redirect('/');
        }
    } catch (e) {
        res.status(404).render('error', {title: 'Error', error: 'Saved plate not found.'});
        return;
    }
    try {
        const result = await savedPlateData.remove(req.params.id);
        res.redirect('/users/' + savedPlate.userId);
    } catch (e) {
        res.status(500).render('error', {title: 'Error', error: e.message});
    }
});

module.exports = router;