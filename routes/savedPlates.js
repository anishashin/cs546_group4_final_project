const express = require('express');
const router = express.Router();
const data = require('../data');
const savedPlateData = data.savedPlates;
const foodData = data.foods;
const userData = data.users;

router.get('/', async (req, res) => {
    try {
        const foodList = await foodData.getAll();
        res.status(200).render('build_plate', {title: 'Build Your Own Plate', foodList: foodList});
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
        const savedPlate = await savedPlateData.get(req.params.id);
        const user = await userData.get(savedPlate.userId);
        savedPlate.userName = user.firstName + ' ' + user.lastName;
        for(let i = 0; i <savedPlate.foods.length; i++) {
            savedPlate.foods[i] = await foodData.get(savedPlate.foods[i]);
            if(savedPlate.foods[i].servingSizeNumber * savedPlate.servings[i] <= 1) {
                savedPlate.foods[i].servings = savedPlate.foods[i].servingSizeNumber * savedPlate.servings[i] + ' ' + savedPlate.foods[i].servingSizeUnitSingular;
            }
            else {
                savedPlate.foods[i].servings = savedPlate.foods[i].servingSizeNumber * savedPlate.servings[i] + ' ' + savedPlate.foods[i].servingSizeUnitPlural;
            }
        }
        res.status(200).render('saved_plate', {title: savedPlate.title, savedPlate: savedPlate});
    } catch (e) {
        res.status(404).json({error: 'Saved plate not found.'});
    }
});

router.post('/', async (req, res) => {
    let savedPlateInfo = req.body;
    if(!savedPlateInfo) {
        res.status(400).json({error: 'You must provide data to create a saved plate.'});
        return;
    }
    if(!savedPlateInfo.userId || typeof savedPlateInfo.userId !== 'string' || savedPlateInfo.userId.trim() === '') {
        res.status(400).json({error: 'User id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const user = await userData.get(savedPlateInfo.userId);
    } catch (e) {
        res.status(400).json({error: 'No user with that id.'});
        return;
    }
    if(!savedPlateInfo.title || typeof savedPlateInfo.title !== 'string' || savedPlateInfo.title.trim() === '') {
        res.status(400).json({error: 'Title must be a non-empty string containing more than just spaces.'});
        return;
    }
    if(Array.isArray(savedPlateInfo.foods) === false || savedPlateInfo.foods.length === 0) {
        res.status(400).json({error: 'Foods must be a non-empty array.'});
        return;
    }
    for(let i = 0; i < savedPlateInfo.foods.length; i++) {
        if(!savedPlateInfo.foods[i] || typeof savedPlateInfo.foods[i] !== 'string' || savedPlateInfo.foods[i].trim() === '') {
            res.status(400).json({error: 'Foods must only contain non-empty string(s) with more than just spaces.'});
            return;
        }
    }
    try {
        for(let i = 0; i < savedPlateInfo.foods.length; i++) {
            let food = await foodData.get(savedPlateInfo.foods[i]);
        }
    } catch (e) {
        res.status(400).json({error: 'No food with that id.'});
        return;
    }
    if(Array.isArray(savedPlateInfo.servings) === false || savedPlateInfo.servings.length !== savedPlateInfo.foods.length) {
        res.status(400).json({error: 'Servings must be an array with the same length as foods.'});
        return;
    }
    for(let i = 0; i < savedPlateInfo.servings.length; i++) {
        if(!savedPlateInfo.servings[i] || typeof savedPlateInfo.servings[i] !== 'number' || savedPlateInfo.servings[i] <= 0) {
            res.status(400).json({error: 'Servings must only contain numbers greater than 0.'});
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
        res.status(200).json(newSavedPlate);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.put('/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).json({error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    let savedPlateInfo = req.body;
    if(!savedPlateInfo) {
        res.status(400).json({error: 'You must provide data to edit a saved plate.'});
        return;
    }
    if(!savedPlateInfo.title || typeof savedPlateInfo.title !== 'string' || savedPlateInfo.title.trim() === '') {
        res.status(400).json({error: 'Title must be a non-empty string containing more than just spaces.'});
        return;
    }
    if(Array.isArray(savedPlateInfo.foods) === false || savedPlateInfo.foods.length === 0) {
        res.status(400).json({error: 'Foods must be a non-empty array.'});
        return;
    }
    for(let i = 0; i < savedPlateInfo.foods.length; i++) {
        if(!savedPlateInfo.foods[i] || typeof savedPlateInfo.foods[i] !== 'string' || savedPlateInfo.foods[i].trim() === '') {
            res.status(400).json({error: 'Foods must only contain non-empty string(s) with more than just spaces.'});
            return;
        }
    }
    try {
        for(let i = 0; i < savedPlateInfo.foods.length; i++) {
            let food = await foodData.get(savedPlateInfo.foods[i]);
        }
    } catch (e) {
        res.status(400).json({error: 'No food with that id.'});
        return;
    }
    if(Array.isArray(savedPlateInfo.servings) === false || savedPlateInfo.servings.length !== savedPlateInfo.foods.length) {
        res.status(400).json({error: 'Servings must be an array with the same length as foods.'});
        return;
    }
    for(let i = 0; i < savedPlateInfo.servings.length; i++) {
        if(!savedPlateInfo.servings[i] || typeof savedPlateInfo.servings[i] !== 'number' || savedPlateInfo.servings[i] <= 0) {
            res.status(400).json({error: 'Servings must only contain numbers greater than 0.'});
            return;
        }
    }
    try {
        const savedPlate = await savedPlateData.get(req.params.id);
    } catch (e) {
        res.status(404).json({error: 'Saved plate not found.'});
        return;
    }
    try {
        const updatedSavedPlate = await savedPlateData.update(
            req.params.id,
            savedPlateInfo.title,
            savedPlateInfo.foods,
            savedPlateInfo.servings
        );
        res.status(200).json(updatedSavedPlate);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.delete('/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).json({error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    let savedPlate;
    try {
        savedPlate = await savedPlateData.get(req.params.id);
    } catch (e) {
        res.status(404).json({error: 'Saved plate not found.'});
        return;
    }
    try {
        const result = await savedPlateData.remove(req.params.id);
        res.redirect('/users/' + savedPlate.userId);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

module.exports = router;