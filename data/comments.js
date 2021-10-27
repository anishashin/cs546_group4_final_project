let {ObjectId} = require('mongodb');

const mongoCollections = require('../config/mongoCollections');
const comments = mongoCollections.comments;
const users = mongoCollections.users;
const foods = mongoCollections.foods;
const userData = require('./users');
const foodData = require('./foods');

let exportedMethods = {
    async getAll() {
        const commentCollection = await comments();
        const commentList = await commentCollection.find({}).toArray();
        for(let comment of commentList) {
            comment._id = comment._id.toString();
            comment.foodId = comment.foodId.toString();
            comment.userId = comment.userId.toString();
        }
        return commentList;
    },

    async get(id) {
        if(!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Parameter 1 [id] must be a non-empty string containing more than just spaces.');
        }
        let parsedId = ObjectId(id);
        const commentCollection = await comments();
        const comment = await commentCollection.findOne({_id: parsedId});
        if(comment === null) throw new Error('No comment with that id.');
        comment._id = comment._id.toString();
        comment.foodId = comment.foodId.toString();
        comment.userId = comment.userId.toString();
        return comment;
    },

    async create(foodId, userId, text) {
        if(!foodId || typeof foodId !== 'string' || foodId.trim() === '') {
            throw new Error('Parameter 1 [foodId] must be a non-empty string containing more than just spaces.');
        }
        if(!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new Error('Parameter 2 [userId] must be a non-empty string containing more than just spaces.');
        }
        if(!text || typeof text !== 'string' || text.trim() === '') {
            throw new Error('Parameter 3 [text] must be a non-empty string containing more than just spaces.');
        }
        const commentCollection = await comments();
        const newComment = {
            foodId: foodId,
            userId: userId,
            text: text
        };
        const insertInfo = await commentCollection.insertOne(newComment);
        if(insertInfo.insertedCount === 0) throw new Error('Could not add comment.');
        const newId = insertInfo.insertedId;

        const user = await userData.get(userId);
        let userCommentList = user.comments;
        userCommentList.push(newId.toString());
        let parsedUserId = ObjectId(userId);
        const userCollection = await users();
        const updatedUser = {
            comments: userCommentList
        };
        const updateInfo = await userCollection.updateOne({_id: parsedUserId}, {$set: updatedUser});
        if(!updateInfo.matchedCount && !updateInfo.modifiedCount) throw new Error('Could not update user successfully.');

        const food = await foodData.get(foodId);
        let foodCommentList = food.comments;
        foodCommentList.push(newId.toString());
        let parsedFoodId = ObjectId(foodId);
        const foodCollection = await foods();
        const updatedFood = {
            comments: foodCommentList
        };
        const updateInfo2 = await foodCollection.updateOne({_id: parsedFoodId}, {$set: updatedFood});
        if(!updateInfo2.matchedCount && !updateInfo2.modifiedCount) throw new Error('Could not update food successfully.');

        return await this.get(newId.toString());
    },

    async remove(id) {
        if(!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Parameter 1 [id] must be a non-empty string containing more than just spaces.');
        }
        let parsedCommentId = ObjectId(id);
        const commentCollection = await comments();
        await this.get(id);

        const userCollection = await users();
        const user = await userCollection.findOne({'comments._id': parsedCommentId});
        if(user === null) throw new Error('No comment with that id.');
        const userCommentList = user.comments;
        const updatedUser = {
            comments: []
        };
        for(let c of userCommentList) {
            if(c._id !== id) {
                updatedUser.comments.push(c);
            }
        }
        const updateInfo = await userCollection.updateOne({_id: user._id}, {$set: updatedUser});
        if(!updateInfo.matchedCount && !updateInfo.modifiedCount) throw new Error('Could not delete comment.');

        const foodCollection = await foods();
        const food = await foodCollection.findOne({'comments._id': parsedCommentId});
        if(food === null) throw new Error('No comment with that id.');
        const foodCommentList = food.comments;
        const updatedFood = {
            comments: []
        };
        for(let c of foodCommentList) {
            if(c._id !== id) {
                updatedFood.comments.push(c);
            }
        }
        const updateInfo2 = await foodCollection.updateOne({_id: food._id}, {$set: updatedFood});
        if(!updateInfo2.matchedCount && !updateInfo2.modifiedCount) throw new Error('Could not delete comment.');
        
        const deletionInfo = await commentCollection.deleteOne({_id: parsedCommentId});
        if(deletionInfo.deletedCount === 0) throw new Error('Could not delete comment.');
        return {'commentId': reviewId, 'deleted': true};
    }
};

module.exports = exportedMethods;