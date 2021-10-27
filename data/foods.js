let {ObjectId} = require('mongodb');

const mongoCollections = require('../config/mongoCollections');
const foods = mongoCollections.foods;

let exportedMethods = {
    async getAll() {
        const foodCollection = await foods();
        const foodList = await foodCollection.find({}).toArray();
        for(let food of foodList) {
            food._id = food._id.toString();
            for(let comment of food.comments) {
                comment._id = comment._id.toString();
            }
        }
        return foodList;
    },

    async get(id) {
        if(!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Parameter 1 [id] must be a non-empty string containing more than just spaces.');
        }
        let parsedId = ObjectId(id);
        const foodCollection = await foods();
        const food = await foodCollection.findOne({_id: parsedId});
        if(food === null) throw new Error('No food with that id.');
        food._id = food._id.toString();
        for(let comment of food.comments) {
            comment._id = comment._id.toString();
        }
        return food;
    },

    async create(name, servingSizeNumber, servingSizeUnitSingular, servingSizeUnitPlural, calories, fat, carbs, protein) {
        if(!name || typeof name !== 'string' || name.trim() === '') {
            throw new Error('Parameter 1 [name] must be a non-empty string containing more than just spaces.');
        }
        if(!servingSizeNumber || typeof servingSizeNumber !== 'number' || servingSizeNumber <= 0) {
            throw new Error('Parameter 2 [servingSizeNumber] must be a number greater than 0.');
        }
        if(!servingSizeUnitSingular || typeof servingSizeUnitSingular !== 'string' || servingSizeUnitSingular.trim() === '') {
            throw new Error('Parameter 3 [servingSizeUnitSingular] must be a non-empty string containing more than just spaces.');
        }
        if(!servingSizeUnitPlural || typeof servingSizeUnitPlural !== 'string' || servingSizeUnitPlural.trim() === '') {
            throw new Error('Parameter 4 [servingSizeUnitPlural] must be a non-empty string containing more than just spaces.');
        }
        if(!calories || typeof calories !== 'number' || calories < 0) {
            throw new Error('Parameter 5 [calories] must be a number greater than or equal to 0.');
        }
        if(!fat || typeof fat !== 'number' || fat < 0) {
            throw new Error('Parameter 6 [fat] must be a number greater than or equal to 0.');
        }
        if(!carbs || typeof carbs !== 'number' || carbs < 0) {
            throw new Error('Parameter 7 [carbs] must be a number greater than or equal to 0.');
        }
        if(!protein || typeof protein !== 'number' || protein < 0) {
            throw new Error('Parameter 8 [protein] must be a number greater than or equal to 0.');
        }
        const foodCollection = await foods();
        const newFood = {
            name: name,
            servingSizeNumber: servingSizeNumber,
            servingSizeUnitSingular: servingSizeUnitSingular,
            servingSizeUnitPlural: servingSizeUnitPlural,
            calories: calories,
            fat: fat,
            carbs: carbs,
            protein: protein,
            comments: []
        };
        const insertInfo = await foodCollection.insertOne(newFood);
        if(insertInfo.insertedCount === 0) throw new Error('Could not add food.');
        const newId = insertInfo.insertedId;
        return await this.get(newId.toString());
    },

    async update(id, name, servingSizeNumber, servingSizeUnitSingular, servingSizeUnitPlural, calories, fat, carbs, protein) {
        if(!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Parameter 1 [id] must be a non-empty string containing more than just spaces.');
        }
        if(!name || typeof name !== 'string' || name.trim() === '') {
            throw new Error('Parameter 2 [name] must be a non-empty string containing more than just spaces.');
        }
        if(!servingSizeNumber || typeof servingSizeNumber !== 'number' || servingSizeNumber <= 0) {
            throw new Error('Parameter 3 [servingSizeNumber] must be a number greater than 0.');
        }
        if(!servingSizeUnitSingular || typeof servingSizeUnitSingular !== 'string' || servingSizeUnitSingular.trim() === '') {
            throw new Error('Parameter 4 [servingSizeUnitSingular] must be a non-empty string containing more than just spaces.');
        }
        if(!servingSizeUnitPlural || typeof servingSizeUnitPlural !== 'string' || servingSizeUnitPlural.trim() === '') {
            throw new Error('Parameter 5 [servingSizeUnitPlural] must be a non-empty string containing more than just spaces.');
        }
        if(!calories || typeof calories !== 'number' || calories < 0) {
            throw new Error('Parameter 6 [calories] must be a number greater than or equal to 0.');
        }
        if(!fat || typeof fat !== 'number' || fat < 0) {
            throw new Error('Parameter 7 [fat] must be a number greater than or equal to 0.');
        }
        if(!carbs || typeof carbs !== 'number' || carbs < 0) {
            throw new Error('Parameter 8 [carbs] must be a number greater than or equal to 0.');
        }
        if(!protein || typeof protein !== 'number' || protein < 0) {
            throw new Error('Parameter 9 [protein] must be a number greater than or equal to 0.');
        }
        let parsedId = ObjectId(id);
        const foodCollection = await foods();
        const updatedFood = {
            name: name,
            servingSizeNumber: servingSizeNumber,
            servingSizeUnitSingular: servingSizeUnitSingular,
            servingSizeUnitPlural: servingSizeUnitPlural,
            calories: calories,
            fat: fat,
            carbs: carbs,
            protein: protein
        };
        const updateInfo = await foodCollection.updateOne({_id: parsedId}, {$set: updatedFood});
        if(!updateInfo.matchedCount && !updateInfo.modifiedCount) throw new Error('Could not update food successfully.');
        return await this.get(id);
    },

    async remove(id) {
        if(!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Parameter 1 [id] must be a non-empty string containing more than just spaces.');
        }
        let parsedId = ObjectId(id);
        const foodCollection = await foods();
        await this.get(id);
        const deletionInfo = await foodCollection.deleteOne({_id: parsedId});
        if(deletionInfo.deletedCount === 0) throw new Error('Could not delete food.');
        return {'foodId': id, 'deleted': true};
    }
};

module.exports = exportedMethods;