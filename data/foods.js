let { ObjectId } = require('mongodb');

const mongoCollections = require('../config/mongoCollections');
const foods = mongoCollections.foods;
const comments = mongoCollections.comments;
const savedPlates = mongoCollections.savedPlates;
const commentData = require('./comments');

let exportedMethods = {
    async getAll() {
        const foodCollection = await foods();
        const foodList = await foodCollection.find({}).sort({ name: 1 }).toArray();
        for (let food of foodList) {
            food._id = food._id.toString();
        }
        return foodList;
    },

    async get(id) {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Parameter 1 [id] must be a non-empty string containing more than just spaces.');
        }
        let parsedId = ObjectId(id);
        const foodCollection = await foods();
        const food = await foodCollection.findOne({ _id: parsedId });
        if (food === null) throw new Error('No food with that id.');
        food._id = food._id.toString();
        return food;
    },

    async create(name, servingSizeNumber, servingSizeUnitSingular, servingSizeUnitPlural, calories, fat, carbs, protein) {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            throw new Error('Parameter 1 [name] must be a non-empty string containing more than just spaces.');
        }
        if (!servingSizeNumber || typeof servingSizeNumber !== 'number' || servingSizeNumber <= 0) {
            throw new Error('Parameter 2 [servingSizeNumber] must be a number greater than 0.');
        }
        if (!servingSizeUnitSingular || typeof servingSizeUnitSingular !== 'string' || servingSizeUnitSingular.trim() === '') {
            throw new Error('Parameter 3 [servingSizeUnitSingular] must be a non-empty string containing more than just spaces.');
        }
        if (!servingSizeUnitPlural || typeof servingSizeUnitPlural !== 'string' || servingSizeUnitPlural.trim() === '') {
            throw new Error('Parameter 4 [servingSizeUnitPlural] must be a non-empty string containing more than just spaces.');
        }
        if (typeof calories !== 'number' || isNaN(calories) || calories < 0) {
            throw new Error('Parameter 5 [calories] must be a number greater than or equal to 0.');
        }
        if (typeof fat !== 'number' || isNaN(fat) || fat < 0) {
            throw new Error('Parameter 6 [fat] must be a number greater than or equal to 0.');
        }
        if (typeof carbs !== 'number' || isNaN(carbs) || carbs < 0) {
            throw new Error('Parameter 7 [carbs] must be a number greater than or equal to 0.');
        }
        if (typeof protein !== 'number' || isNaN(protein) || protein < 0) {
            throw new Error('Parameter 8 [protein] must be a number greater than or equal to 0.');
        }
        const foodCollection = await foods();
        const newFood = {
            name: name,
            servingSizeNumber: Math.round(servingSizeNumber * 10) / 10,
            servingSizeUnitSingular: servingSizeUnitSingular,
            servingSizeUnitPlural: servingSizeUnitPlural,
            calories: Math.round(calories * 10) / 10,
            fat: Math.round(fat * 10) / 10,
            carbs: Math.round(carbs * 10) / 10,
            protein: Math.round(protein * 10) / 10,
            comments: []
        };
        const insertInfo = await foodCollection.insertOne(newFood);
        if (insertInfo.insertedCount === 0) throw new Error('Could not add food.');
        const newId = insertInfo.insertedId;
        return await this.get(newId.toString());
    },

    async update(id, name, servingSizeNumber, servingSizeUnitSingular, servingSizeUnitPlural, calories, fat, carbs, protein) {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Parameter 1 [id] must be a non-empty string containing more than just spaces.');
        }
        if (!name || typeof name !== 'string' || name.trim() === '') {
            throw new Error('Parameter 2 [name] must be a non-empty string containing more than just spaces.');
        }
        if (!servingSizeNumber || typeof servingSizeNumber !== 'number' || servingSizeNumber <= 0) {
            throw new Error('Parameter 3 [servingSizeNumber] must be a number greater than 0.');
        }
        if (!servingSizeUnitSingular || typeof servingSizeUnitSingular !== 'string' || servingSizeUnitSingular.trim() === '') {
            throw new Error('Parameter 4 [servingSizeUnitSingular] must be a non-empty string containing more than just spaces.');
        }
        if (!servingSizeUnitPlural || typeof servingSizeUnitPlural !== 'string' || servingSizeUnitPlural.trim() === '') {
            throw new Error('Parameter 5 [servingSizeUnitPlural] must be a non-empty string containing more than just spaces.');
        }
        if (typeof calories !== 'number' || isNaN(calories) || calories < 0) {
            throw new Error('Parameter 6 [calories] must be a number greater than or equal to 0.');
        }
        if (typeof fat !== 'number' || isNaN(fat) || fat < 0) {
            throw new Error('Parameter 7 [fat] must be a number greater than or equal to 0.');
        }
        if (typeof carbs !== 'number' || isNaN(carbs) || carbs < 0) {
            throw new Error('Parameter 8 [carbs] must be a number greater than or equal to 0.');
        }
        if (typeof protein !== 'number' || isNaN(protein) || protein < 0) {
            throw new Error('Parameter 9 [protein] must be a number greater than or equal to 0.');
        }
        let parsedId = ObjectId(id);
        const foodCollection = await foods();
        const food = await this.get(id);
        const updatedFood = {
            name: name,
            servingSizeNumber: Math.round(servingSizeNumber * 10) / 10,
            servingSizeUnitSingular: servingSizeUnitSingular,
            servingSizeUnitPlural: servingSizeUnitPlural,
            calories: Math.round(calories * 10) / 10,
            fat: Math.round(fat * 10) / 10,
            carbs: Math.round(carbs * 10) / 10,
            protein: Math.round(protein * 10) / 10
        };
        const updateInfo = await foodCollection.updateOne({ _id: parsedId }, { $set: updatedFood });
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw new Error('Could not update food.');

        const savedPlateCollection = await savedPlates();
        const savedPlateList = await savedPlateCollection.find({ foods: id }).toArray();
        for (let sp of savedPlateList) {
            let totalCalories = 0;
            let totalFat = 0;
            let totalCarbs = 0;
            let totalProtein = 0;
            for (let i = 0; i < sp.foods.length; i++) {
                let food = await this.get(sp.foods[i]);
                totalCalories += food.calories * sp.servings[i];
                totalFat += food.fat * sp.servings[i];
                totalCarbs += food.carbs * sp.servings[i];
                totalProtein += food.protein * sp.servings[i];
            }
            let updatedSavedPlate = {
                totalCalories: Math.round(totalCalories * 10) / 10,
                totalFat: Math.round(totalFat * 10) / 10,
                totalCarbs: Math.round(totalCarbs * 10) / 10,
                totalProtein: Math.round(totalProtein * 10) / 10
            };
            let updateInfo2 = await savedPlateCollection.updateOne({ _id: sp._id }, { $set: updatedSavedPlate });
            if (!updateInfo2.matchedCount && !updateInfo2.modifiedCount) throw new Error('Could not update food.');
        }

        return await this.get(id);
    },

    async remove(id) {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Parameter 1 [id] must be a non-empty string containing more than just spaces.');
        }
        let parsedFoodId = ObjectId(id);
        const foodCollection = await foods();
        const food = await this.get(id);

        const commentCollection = await comments();
        const commentList = await commentCollection.find({ foodId: id }).toArray();
        for (let comment of commentList) {
            let result = await commentData.remove(comment._id.toString());
        }

        const savedPlateCollection = await savedPlates();
        const savedPlateList = await savedPlateCollection.find({ foods: id }).toArray();
        for (let sp of savedPlateList) {
            let foodList = sp.foods;
            let servingList = sp.servings;
            let updatedSavedPlate = {
                foods: [],
                servings: [],
                totalCalories: 0,
                totalFat: 0,
                totalCarbs: 0,
                totalProtein: 0
            };
            for (let i = 0; i < foodList.length; i++) {
                if (foodList[i] !== id) {
                    updatedSavedPlate.foods.push(foodList[i]);
                    updatedSavedPlate.servings.push(servingList[i]);
                    let food = await this.get(foodList[i]);
                    updatedSavedPlate.totalCalories += food.calories * servingList[i];
                    updatedSavedPlate.totalFat += food.fat * servingList[i];
                    updatedSavedPlate.totalCarbs += food.carbs * servingList[i];
                    updatedSavedPlate.totalProtein += food.protein * servingList[i];
                }
            }
            updatedSavedPlate.totalCalories = Math.round(updatedSavedPlate.totalCalories * 10) / 10;
            updatedSavedPlate.totalFat = Math.round(updatedSavedPlate.totalFat * 10) / 10;
            updatedSavedPlate.totalCarbs = Math.round(updatedSavedPlate.totalCarbs * 10) / 10;
            updatedSavedPlate.totalProtein = Math.round(updatedSavedPlate.totalProtein * 10) / 10;
            let updateInfo2 = await savedPlateCollection.updateOne({ _id: sp._id }, { $set: updatedSavedPlate });
            if (!updateInfo2.matchedCount && !updateInfo2.modifiedCount) throw new Error('Could not remove food.');
        }

        const deleteInfo = await foodCollection.deleteOne({ _id: parsedFoodId });
        if (deleteInfo.deletedCount === 0) throw new Error('Could not remove food.');
        return { 'foodId': id, 'deleted': true };
    }
};

module.exports = exportedMethods;