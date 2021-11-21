const express = require('express');
const router = express.Router();
const data = require('../data');
const foodData = data.foods;

router.get('/', async (req, res) => {
    try {
        const foodList = await foodData.getAll();
        res.status(200).json(foodList);
    } catch (e) {
        res.status(500).json({error: e});
    }
});

router.get('/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).json({error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const food = await foodData.get(req.params.id);
        res.status(200).json(food);
    } catch (e) {
        res.status(404).json({error: 'Food not found.'});
    }
});

router.post('/', async (req, res) => {
    let foodInfo = req.body;
    if(!foodInfo) {
        res.status(400).json({error: 'You must provide data to add a food.'});
        return;
    }
    if(!foodInfo.name || typeof foodInfo.name !== 'string' || foodInfo.name.trim() === '') {
        res.status(400).json({error: 'Name must be a non-empty string containing more than just spaces.'});
        return;
    }
    if(!foodInfo.servingSizeNumber || typeof foodInfo.servingSizeNumber !== 'number' || foodInfo.servingSizeNumber <= 0) {
        res.status(400).json({error: 'Serving size number must be a number greater than 0.'});
        return;
    }
    if(!foodInfo.servingSizeUnitSingular || typeof foodInfo.servingSizeUnitSingular !== 'string' || foodInfo.servingSizeUnitSingular.trim() === '') {
        res.status(400).json({error: 'Serving size unit (singular) must be a non-empty string containing more than just spaces.'});
        return;
    }
    if(!foodInfo.servingSizeUnitPlural || typeof foodInfo.servingSizeUnitPlural !== 'string' || foodInfo.servingSizeUnitPlural.trim() === '') {
        res.status(400).json({error: 'Serving size unit (plural) must be a non-empty string containing more than just spaces.'});
        return;
    }
    if(typeof foodInfo.calories !== 'number' || isNaN(foodInfo.calories) || foodInfo.calories < 0) {
        res.status(400).json({error: 'Calories must be a number greater than or equal to 0.'});
        return;
    }
    if(typeof foodInfo.fat !== 'number' || isNaN(foodInfo.fat) || foodInfo.fat < 0) {
        res.status(400).json({error: 'Fat must be a number greater than or equal to 0.'});
        return;
    }
    if(typeof foodInfo.carbs !== 'number' || isNaN(foodInfo.carbs) || foodInfo.carbs < 0) {
        res.status(400).json({error: 'Carbs must be a number greater than or equal to 0.'});
        return;
    }
    if(typeof foodInfo.protein !== 'number' || isNaN(foodInfo.protein) || foodInfo.protein < 0) {
        res.status(400).json({error: 'Protein must be a number greater than or equal to 0.'});
        return;
    }
    try {
        const newFood = await foodData.create(
            foodInfo.name,
            foodInfo.servingSizeNumber,
            foodInfo.servingSizeUnitSingular,
            foodInfo.servingSizeUnitPlural,
            foodInfo.calories,
            foodInfo.fat,
            foodInfo.carbs,
            foodInfo.protein
        );
        res.status(200).json(newFood);
    } catch (e) {
        res.status(500).json({error: e});
    }
});

router.put('/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).json({error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    let foodInfo = req.body;
    if(!foodInfo) {
        res.status(400).json({error: 'You must provide data to edit a food.'});
        return;
    }
    if(!foodInfo.name || typeof foodInfo.name !== 'string' || foodInfo.name.trim() === '') {
        res.status(400).json({error: 'Name must be a non-empty string containing more than just spaces.'});
        return;
    }
    if(!foodInfo.servingSizeNumber || typeof foodInfo.servingSizeNumber !== 'number' || foodInfo.servingSizeNumber <= 0) {
        res.status(400).json({error: 'Serving size number must be a number greater than 0.'});
        return;
    }
    if(!foodInfo.servingSizeUnitSingular || typeof foodInfo.servingSizeUnitSingular !== 'string' || foodInfo.servingSizeUnitSingular.trim() === '') {
        res.status(400).json({error: 'Serving size unit (singular) must be a non-empty string containing more than just spaces.'});
        return;
    }
    if(!foodInfo.servingSizeUnitPlural || typeof foodInfo.servingSizeUnitPlural !== 'string' || foodInfo.servingSizeUnitPlural.trim() === '') {
        res.status(400).json({error: 'Serving size unit (plural) must be a non-empty string containing more than just spaces.'});
        return;
    }
    if(typeof foodInfo.calories !== 'number' || isNaN(foodInfo.calories) || foodInfo.calories < 0) {
        res.status(400).json({error: 'Calories must be a number greater than or equal to 0.'});
        return;
    }
    if(typeof foodInfo.fat !== 'number' || isNaN(foodInfo.fat) || foodInfo.fat < 0) {
        res.status(400).json({error: 'Fat must be a number greater than or equal to 0.'});
        return;
    }
    if(typeof foodInfo.carbs !== 'number' || isNaN(foodInfo.carbs) || foodInfo.carbs < 0) {
        res.status(400).json({error: 'Carbs must be a number greater than or equal to 0.'});
        return;
    }
    if(typeof foodInfo.protein !== 'number' || isNaN(foodInfo.protein) || foodInfo.protein < 0) {
        res.status(400).json({error: 'Protein must be a number greater than or equal to 0.'});
        return;
    }
    try {
        const food = await foodData.get(req.params.id);
    } catch (e) {
        res.status(404).json({error: 'Food not found.'});
        return;
    }
    try {
        const updatedFood = await foodData.update(
            req.params.id,
            foodInfo.name,
            foodInfo.servingSizeNumber,
            foodInfo.servingSizeUnitSingular,
            foodInfo.servingSizeUnitPlural,
            foodInfo.calories,
            foodInfo.fat,
            foodInfo.carbs,
            foodInfo.protein
        );
        res.status(200).json(updatedFood);
    } catch (e) {
        res.status(500).json({error: e});
    }
});

router.delete('/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).json({error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const food = await foodData.get(req.params.id);
    } catch (e) {
        res.status(404).json({error: 'Food not found.'});
        return;
    }
    try {
        const result = await foodData.remove(req.params.id);
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({error: e});
    }
});

module.exports = router;