// TO DO: hash password, create regex for username, create regex for unhashedPassword
let {ObjectId} = require('mongodb');

const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;

let exportedMethods = {
    async getAll() {
        const userCollection = await users();
        const userList = await userCollection.find({}).toArray();
        for(let user of userList) {
            user._id = user._id.toString();
            for(let savedPlate of user.savedPlates) {
                savedPlate._id = savedPlate._id.toString();
            }
            for(let comment of user.comments) {
                comment._id = comment._id.toString();
            }
        }
        return userList;
    },

    async get(id) {
        if(!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Parameter 1 [id] must be a non-empty string containing more than just spaces.');
        }
        let parsedId = ObjectId(id);
        const userCollection = await users();
        const user = await userCollection.findOne({_id: parsedId});
        if(user === null) throw new Error('No user with that id.');
        user._id = user._id.toString();
        for(let savedPlate of user.savedPlates) {
            savedPlate._id = savedPlate._id.toString();
        }
        for(let comment of user.comments) {
            comment._id = comment._id.toString();
        }
        return user;
    },

    async create(firstName, lastName, username, unhashedPassword) {
        if(!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
            throw new Error('Parameter 1 [firstName] must be a non-empty string containing more than just spaces.');
        }
        if(!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
            throw new Error('Parameter 2 [lastName] must be a non-empty string containing more than just spaces.');
        }
        if(!username || typeof username !== 'string' || username.trim() === '') {
            throw new Error('Parameter 3 [username] must be a non-empty string containing more than just spaces.');
        }
        if(!unhashedPassword || typeof unhashedPassword !== 'string' || unhashedPassword.trim() === '') {
            throw new Error('Parameter 4 [unhashedPassword] must be a non-empty string containing more than just spaces.');
        }
        const userCollection = await users();
        const newUser = {
            firstName: firstName,
            lastName: lastName,
            username: username,
            hashedPassword: unhashedPassword,
            savedPlates: [],
            comments: []
        };
        const insertInfo = await userCollection.insertOne(newUser);
        if(insertInfo.insertedCount === 0) throw new Error('Could not add user.');
        const newId = insertInfo.insertedId;
        return await this.get(newId.toString());
    },

    async update(id, firstName, lastName, username, unhashedPassword) {
        if(!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Parameter 1 [id] must be a non-empty string containing more than just spaces.');
        }
        if(!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
            throw new Error('Parameter 2 [firstName] must be a non-empty string containing more than just spaces.');
        }
        if(!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
            throw new Error('Parameter 3 [lastName] must be a non-empty string containing more than just spaces.');
        }
        if(!username || typeof username !== 'string' || username.trim() === '') {
            throw new Error('Parameter 4 [username] must be a non-empty string containing more than just spaces.');
        }
        if(!unhashedPassword || typeof unhashedPassword !== 'string' || unhashedPassword.trim() === '') {
            throw new Error('Parameter 5 [unhashedPassword] must be a non-empty string containing more than just spaces.');
        }
        let parsedId = ObjectId(id);
        const userCollection = await users();
        const updatedUser = {
            firstName: firstName,
            lastName: lastName,
            username: username,
            hashedPassword: unhashedPassword
        };
        const updateInfo = await userCollection.updateOne({_id: parsedId}, {$set: updatedUser});
        if(!updateInfo.matchedCount && !updateInfo.modifiedCount) throw new Error('Could not update user successfully.');
        return await this.get(id);
    },

    async remove(id) {
        if(!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Parameter 1 [id] must be a non-empty string containing more than just spaces.');
        }
        let parsedId = ObjectId(id);
        const userCollection = await users();
        await this.get(id);
        const deletionInfo = await userCollection.deleteOne({_id: parsedId});
        if(deletionInfo.deletedCount === 0) throw new Error('Could not delete user.');
        return {'userId': id, 'deleted': true};
    }
};

module.exports = exportedMethods;