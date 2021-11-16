let {ObjectId} = require('mongodb');

const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;

const bcrypt = require('bcrypt');
const saltRounds = 16;

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

    async create(firstName, lastName, username, password) {
        if(!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
            throw new Error('Parameter 1 [firstName] must be a non-empty string containing more than just spaces.');
        }
        if(!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
            throw new Error('Parameter 2 [lastName] must be a non-empty string containing more than just spaces.');
        }
        if(!username || typeof username !== 'string' || !username.match(/^[a-zA-Z0-9]{4,}$/)) {
            throw new Error('Parameter 3 [username] must be at least 4 characters long and only contain alphanumeric characters.');
        }
        if(!password || typeof password !== 'string' || !password.match(/^[^\s]{6,}$/)) {
            throw new Error('Parameter 4 [password] must be at least 6 characters long and cannot contain spaces.');
        }
        const userCollection = await users();
        const user = await userCollection.findOne({username: username.toLowerCase()});
        if(user !== null) throw new Error('There is already a user with that username.');
        const hash = await bcrypt.hash(password, saltRounds);
        const newUser = {
            firstName: firstName,
            lastName: lastName,
            username: username.toLowerCase(),
            hashedPassword: hash,
            savedPlates: [],
            comments: []
        };
        const insertInfo = await userCollection.insertOne(newUser);
        if(insertInfo.insertedCount === 0) throw new Error('Could not create user.');
        const newId = insertInfo.insertedId;
        return await this.get(newId.toString());
    }
};

module.exports = exportedMethods;