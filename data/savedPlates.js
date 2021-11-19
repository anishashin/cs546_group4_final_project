//TO DO: round numbers to one decimal point
let {ObjectId} = require('mongodb');

const mongoCollections = require('../config/mongoCollections');
const savedPlates = mongoCollections.savedPlates;
const users = mongoCollections.users;
const userData = require('./users');
const foodData = require('./foods');

let exportedMethods = {
    async getAll() {
        const savedPlateCollection = await savedPlates();
        const savedPlateList = await savedPlateCollection.find({}).toArray();
        for(let savedPlate of savedPlateList) {
            savedPlate._id = savedPlate._id.toString();
        }
        return savedPlateList;
    },

    async get(id) {
        if(!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Parameter 1 [id] must be a non-empty string containing more than just spaces.');
        }
        let parsedId = ObjectId(id);
        const savedPlateCollection = await savedPlates();
        const savedPlate = await savedPlateCollection.findOne({_id: parsedId});
        if(savedPlate === null) throw new Error('No saved plate with that id.');
        savedPlate._id = savedPlate._id.toString();
        return savedPlate;
    },

    async create(userId, title, foods, servings) {
        if(!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new Error('Parameter 1 [userId] must be a non-empty string containing more than just spaces.');
        }
        const user = await userData.get(userId);
        if(!title || typeof title !== 'string' || title.trim() === '') {
            throw new Error('Parameter 2 [title] must be a non-empty string containing more than just spaces.');
        }
        if(Array.isArray(foods) === false || foods.length === 0) {
            throw new Error('Parameter 3 [foods] must be a non-empty array.');
        }
        for(let i = 0; i < foods.length; i++) {
            if(!foods[i] || typeof foods[i] !== 'string' || foods[i].trim() === '') {
                throw new Error('Parameter 3 [foods] must only contain non-empty string(s) with more than just spaces.')
            }
            let food = await foodData.get(foods[i]);
        }
        if(Array.isArray(servings) === false || servings.length !== foods.length) {
            throw new Error('Parameter 4 [servings] must be an array with the same length as Parameter 3 [foods].');
        }
        for(let i = 0; i < servings.length; i++) {
            if(!servings[i] || typeof servings[i] !== 'number' || servings[i] <= 0) {
                throw new Error('Parameter 4 [servings] must only contain numbers greater than 0.')
            }
        }
        const savedPlateCollection = await savedPlates();
        let totalCalories = 0;
        let totalFat = 0;
        let totalCarbs = 0;
        let totalProtein = 0;
        for(let i = 0; i < foods.length; i++) {
            let food = await foodData.get(foods[i]);
            totalCalories += food.calories * servings[i];
            totalFat += food.fat * servings[i];
            totalCarbs += food.carbs * servings[i];
            totalProtein += food.protein * servings[i];
        }
        const newSavedPlate = {
            userId: userId,
            title: title,
            foods: JSON.parse(JSON.stringify(foods)),
            servings: JSON.parse(JSON.stringify(servings)),
            totalCalories: totalCalories,
            totalFat: totalFat,
            totalCarbs: totalCarbs,
            totalProtein: totalProtein
        };
        const insertInfo = await savedPlateCollection.insertOne(newSavedPlate);
        if(insertInfo.insertedCount === 0) throw new Error('Could not create saved plate.');
        const newId = insertInfo.insertedId;
        
        let userSavedPlateList = user.savedPlates;
        userSavedPlateList.push(newId.toString());
        let parsedUserId = ObjectId(userId);
        const userCollection = await users();
        const updatedUser = {
            savedPlates: userSavedPlateList
        };
        const updateInfo = await userCollection.updateOne({_id: parsedUserId}, {$set: updatedUser});
        if(!updateInfo.matchedCount && !updateInfo.modifiedCount) throw new Error('Could not create saved plate.');
        
        return await this.get(newId.toString());
    },

    async update(id, title, foods, servings) {
        if(!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Parameter 1 [id] must be a non-empty string containing more than just spaces.');
        }
        if(!title || typeof title !== 'string' || title.trim() === '') {
            throw new Error('Parameter 2 [title] must be a non-empty string containing more than just spaces.');
        }
        if(Array.isArray(foods) === false || foods.length === 0) {
            throw new Error('Parameter 3 [foods] must be a non-empty array.');
        }
        for(let i = 0; i < foods.length; i++) {
            if(!foods[i] || typeof foods[i] !== 'string' || foods[i].trim() === '') {
                throw new Error('Parameter 3 [foods] must only contain non-empty string(s) with more than just spaces.')
            }
            let food = await foodData.get(foods[i]);
        }
        if(Array.isArray(servings) === false || servings.length !== foods.length) {
            throw new Error('Parameter 4 [servings] must be an array with the same length as Parameter 3 [foods].');
        }
        for(let i = 0; i < servings.length; i++) {
            if(!servings[i] || typeof servings[i] !== 'number' || servings[i] <= 0) {
                throw new Error('Parameter 4 [servings] must only contain numbers greater than 0.')
            }
        }
        let parsedId = ObjectId(id);
        const savedPlateCollection = await savedPlates();
        const savedPlate = await this.get(id);
        let totalCalories = 0;
        let totalFat = 0;
        let totalCarbs = 0;
        let totalProtein = 0;
        for(let i = 0; i < foods.length; i++) {
            let food = await foodData.get(foods[i]);
            totalCalories += food.calories * servings[i];
            totalFat += food.fat * servings[i];
            totalCarbs += food.carbs * servings[i];
            totalProtein += food.protein * servings[i];
        }
        const updatedSavedPlate = {
            title: title,
            foods: JSON.parse(JSON.stringify(foods)),
            servings: JSON.parse(JSON.stringify(servings)),
            totalCalories: totalCalories,
            totalFat: totalFat,
            totalCarbs: totalCarbs,
            totalProtein: totalProtein
        };
        const updateInfo = await savedPlateCollection.updateOne({_id: parsedId}, {$set: updatedSavedPlate});
        if(!updateInfo.matchedCount && !updateInfo.modifiedCount) throw new Error('Could not update saved plate.');
        return await this.get(id);
    },

    async remove(id) {
        if(!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Parameter 1 [id] must be a non-empty string containing more than just spaces.');
        }
        let parsedSavedPlateId = ObjectId(id);
        const savedPlateCollection = await savedPlates();
        const savedPlate = await this.get(id);

        const userCollection = await users();
        const user = await userCollection.findOne({savedPlates: id});
        if(user === null) throw new Error('No saved plate with that id.');
        const userSavedPlateList = user.savedPlates;
        const updatedUser = {
            savedPlates: []
        };
        for(let sp of userSavedPlateList) {
            if(sp !== id) {
                updatedUser.savedPlates.push(sp);
            }
        }
        const updateInfo = await userCollection.updateOne({_id: user._id}, {$set: updatedUser});
        if(!updateInfo.matchedCount && !updateInfo.modifiedCount) throw new Error('Could not delete saved plate.');

        const deleteInfo = await savedPlateCollection.deleteOne({_id: parsedSavedPlateId});
        if(deleteInfo.deletedCount === 0) throw new Error('Could not delete saved plate.');
        return {'savedPlateId': id, 'deleted': true};
    }
};

module.exports = exportedMethods;