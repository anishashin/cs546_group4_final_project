const express = require('express');
const router = express.Router();
const data = require('../data');
const foodData = data.foods;
const commentData = data.comments;
const userData = data.users;

router.get('/', async (req, res) => {
    try {
        const foodList = await foodData.getAll();
        res.status(200).render('foodlistings', {title: 'Food List', foodList: foodList});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.get('/foods', async (req, res) => {
    try {
        const foodList = await foodData.getAll();
        res.status(200).render('foodlistings', {
            title: 'Food List',
            foodList: foodList,
            username: req.session.user.username,
            userId: req.session.user.userId,
            firstName: req.session.user.firstName,
            lastName: req.session.user.lastName,
            isAdmin: req.session.user.isAdmin,
            savedPlates: req.session.user.savedPlates,
            authenticated: req.session.user.authenticated
        });
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.get('/add', async (req, res) => {
    try {
        res.status(200).render('add_food', {
            title: 'Add Food',
            username: req.session.user.username,
            userId: req.session.user.userId,
            firstName: req.session.user.firstName,
            lastName: req.session.user.lastName,
            isAdmin: req.session.user.isAdmin,
            savedPlates: req.session.user.savedPlates,
            authenticated: req.session.user.authenticated
        });
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.get('/edit/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).json({error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const foodInfo = await foodData.get(req.params.id);
        res.status(200).render('edit_food', {
            title: 'Edit Food',
            foodInfo: foodInfo,
            username: req.session.user.username,
            userId: req.session.user.userId,
            firstName: req.session.user.firstName,
            lastName: req.session.user.lastName,
            isAdmin: req.session.user.isAdmin,
            savedPlates: req.session.user.savedPlates,
            authenticated: req.session.user.authenticated
        });
    } catch (e) {
        res.status(404).json({error: 'Food not found.'});
    }
});

router.get('/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).json({error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const food = await foodData.get(req.params.id);
        if(food.servingSizeNumber <= 1) {
            food.servingSizeUnit = food.servingSizeUnitSingular;
        }
        else {
            food.servingSizeUnit = food.servingSizeUnitPlural;
        }
        const commentList = await commentData.getAll(food._id);
        for(let comment of commentList) {
            let user = await userData.get(comment.userId);
            comment.userName = user.firstName + ' ' + user.lastName;
        }
        res.status(200).render('individualfood', {title: food.name, food: food, commentList: commentList});
    } catch (e) {
        res.status(404).json({error: 'Food not found.'});
    }
});

router.get('/foods/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).json({error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const food = await foodData.get(req.params.id);
        if(food.servingSizeNumber <= 1) {
            food.servingSizeUnit = food.servingSizeUnitSingular;
        }
        else {
            food.servingSizeUnit = food.servingSizeUnitPlural;
        }
        const commentList = await commentData.getAll(food._id);
        for(let comment of commentList) {
            let user = await userData.get(comment.userId);
            comment.userName = user.firstName + ' ' + user.lastName;
        }
        res.status(200).render('individualfood', {
            title: food.name,
            food: food,
            commentList: commentList,
            username: req.session.user.username,
            userId: req.session.user.userId,
            firstName: req.session.user.firstName,
            lastName: req.session.user.lastName,
            isAdmin: req.session.user.isAdmin,
            savedPlates: req.session.user.savedPlates,
            authenticated: req.session.user.authenticated
        });
    } catch (e) {
        res.status(404).json({error: 'Food not found.'});
    }
});

router.get('/json/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).json({error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const food = await foodData.get(req.params.id);
        res.status(200).json({food: food});
    } catch (e) {
        res.status(404).json({error: 'Food not found.'});
    }
});

router.post('/', async (req, res) => {
    let foodInfo = req.body;
    if(!foodInfo) {
        res.status(400).render('add_food', {title: 'Add Food', foodInfo: foodInfo, error: 'You must provide data to add a food.'});
        return;
    }
    foodInfo.parsedServingSizeNumber = parseFloat(foodInfo.servingSizeNumber);
    foodInfo.parsedCalories = parseFloat(foodInfo.calories);
    foodInfo.parsedFat = parseFloat(foodInfo.fat);
    foodInfo.parsedCarbs = parseFloat(foodInfo.carbs);
    foodInfo.parsedProtein = parseFloat(foodInfo.protein);
    if(!foodInfo.name || typeof foodInfo.name !== 'string' || foodInfo.name.trim() === '') {
        res.status(400).render('add_food', {title: 'Add Food', foodInfo: foodInfo, error: 'Invalid food name.'});
        return;
    }
    if(!foodInfo.parsedServingSizeNumber || typeof foodInfo.parsedServingSizeNumber !== 'number' || foodInfo.parsedServingSizeNumber <= 0) {
        res.status(400).render('add_food', {title: 'Add Food', foodInfo: foodInfo, error: 'Serving size (number) must be a number greater than 0.'});
        return;
    }
    if(!foodInfo.servingSizeUnitSingular || typeof foodInfo.servingSizeUnitSingular !== 'string' || foodInfo.servingSizeUnitSingular.trim() === '') {
        res.status(400).render('add_food', {title: 'Add Food', foodInfo: foodInfo, error: 'Invalid serving size unit (singular).'});
        return;
    }
    if(!foodInfo.servingSizeUnitPlural || typeof foodInfo.servingSizeUnitPlural !== 'string' || foodInfo.servingSizeUnitPlural.trim() === '') {
        res.status(400).render('add_food', {title: 'Add Food', foodInfo: foodInfo, error: 'Invalid serving size unit (plural).'});
        return;
    }
    if(typeof foodInfo.parsedCalories !== 'number' || isNaN(foodInfo.parsedCalories) || foodInfo.parsedCalories < 0) {
        res.status(400).render('add_food', {title: 'Add Food', foodInfo: foodInfo, error: 'Calories must be a number greater than or equal to 0.'});
        return;
    }
    if(typeof foodInfo.parsedFat !== 'number' || isNaN(foodInfo.parsedFat) || foodInfo.parsedFat < 0) {
        res.status(400).render('add_food', {title: 'Add Food', foodInfo: foodInfo, error: 'Fat must be a number greater than or equal to 0.'});
        return;
    }
    if(typeof foodInfo.parsedCarbs !== 'number' || isNaN(foodInfo.parsedCarbs) || foodInfo.parsedCarbs < 0) {
        res.status(400).render('add_food', {title: 'Add Food', foodInfo: foodInfo, error: 'Carbohydrates must be a number greater than or equal to 0.'});
        return;
    }
    if(typeof foodInfo.parsedProtein !== 'number' || isNaN(foodInfo.parsedProtein) || foodInfo.parsedProtein < 0) {
        res.status(400).render('add_food', {title: 'Add Food', foodInfo: foodInfo, error: 'Protein must be a number greater than or equal to 0.'});
        return;
    }
    try {
        const newFood = await foodData.create(
            foodInfo.name,
            foodInfo.parsedServingSizeNumber,
            foodInfo.servingSizeUnitSingular,
            foodInfo.servingSizeUnitPlural,
            foodInfo.parsedCalories,
            foodInfo.parsedFat,
            foodInfo.parsedCarbs,
            foodInfo.parsedProtein
        );
        res.redirect('/foods/' + newFood._id);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.put('/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).json({error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    let foodInfo = req.body;
    if(!foodInfo) {
        res.status(400).render('edit_food', {title: 'Edit Food', foodInfo: foodInfo, error: 'You must provide data to edit a food.'});
        return;
    }
    foodInfo._id = req.params.id;
    foodInfo.parsedServingSizeNumber = parseFloat(foodInfo.servingSizeNumber);
    foodInfo.parsedCalories = parseFloat(foodInfo.calories);
    foodInfo.parsedFat = parseFloat(foodInfo.fat);
    foodInfo.parsedCarbs = parseFloat(foodInfo.carbs);
    foodInfo.parsedProtein = parseFloat(foodInfo.protein);
    if(!foodInfo.name || typeof foodInfo.name !== 'string' || foodInfo.name.trim() === '') {
        res.status(400).render('edit_food', {title: 'Edit Food', foodInfo: foodInfo, error: 'Invalid food name.'});
        return;
    }
    if(!foodInfo.parsedServingSizeNumber || typeof foodInfo.parsedServingSizeNumber !== 'number' || foodInfo.parsedServingSizeNumber <= 0) {
        res.status(400).render('edit_food', {title: 'Edit Food', foodInfo: foodInfo, error: 'Serving size (number) must be a number greater than 0.'});
        return;
    }
    if(!foodInfo.servingSizeUnitSingular || typeof foodInfo.servingSizeUnitSingular !== 'string' || foodInfo.servingSizeUnitSingular.trim() === '') {
        res.status(400).render('edit_food', {title: 'Edit Food', foodInfo: foodInfo, error: 'Invalid serving size unit (singular).'});
        return;
    }
    if(!foodInfo.servingSizeUnitPlural || typeof foodInfo.servingSizeUnitPlural !== 'string' || foodInfo.servingSizeUnitPlural.trim() === '') {
        res.status(400).render('edit_food', {title: 'Edit Food', foodInfo: foodInfo, error: 'Invalid serving size unit (plural).'});
        return;
    }
    if(typeof foodInfo.parsedCalories !== 'number' || isNaN(foodInfo.parsedCalories) || foodInfo.parsedCalories < 0) {
        res.status(400).render('edit_food', {title: 'Edit Food', foodInfo: foodInfo, error: 'Calories must be a number greater than or equal to 0.'});
        return;
    }
    if(typeof foodInfo.parsedFat !== 'number' || isNaN(foodInfo.parsedFat) || foodInfo.parsedFat < 0) {
        res.status(400).render('edit_food', {title: 'Edit Food', foodInfo: foodInfo, error: 'Fat must be a number greater than or equal to 0.'});
        return;
    }
    if(typeof foodInfo.parsedCarbs !== 'number' || isNaN(foodInfo.parsedCarbs) || foodInfo.parsedCarbs < 0) {
        res.status(400).render('edit_food', {title: 'Edit Food', foodInfo: foodInfo, error: 'Carbohydrates must be a number greater than or equal to 0.'});
        return;
    }
    if(typeof foodInfo.parsedProtein !== 'number' || isNaN(foodInfo.parsedProtein) || foodInfo.parsedProtein < 0) {
        res.status(400).render('edit_food', {title: 'Edit Food', foodInfo: foodInfo, error: 'Protein must be a number greater than or equal to 0.'});
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
            foodInfo.parsedServingSizeNumber,
            foodInfo.servingSizeUnitSingular,
            foodInfo.servingSizeUnitPlural,
            foodInfo.parsedCalories,
            foodInfo.parsedFat,
            foodInfo.parsedCarbs,
            foodInfo.parsedProtein
        );
        res.redirect('/foods/' + req.params.id);
    } catch (e) {
        res.status(500).json({error: e.message});
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
        res.redirect('/foods');
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

module.exports = router;
