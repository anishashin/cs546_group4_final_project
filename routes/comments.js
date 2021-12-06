const express = require('express');
const router = express.Router();
const data = require('../data');
const commentData = data.comments;
const foodData = data.foods;
const userData = data.users;

router.get('/', async (req, res) => {
    try {
        const commentList = await commentData.getAll();
        res.status(200).json(commentList);
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
        const comment = await commentData.get(req.params.id);
        res.status(200).json(comment);
    } catch (e) {
        res.status(404).json({error: 'Comment not found.'});
    }
});

router.post('/', async (req, res) => {
    let commentInfo = req.body;
    if(!commentInfo) {
        res.status(400).json({error: 'You must provide data to add a comment.'});
        return;
    }
    if(!commentInfo.foodId || typeof commentInfo.foodId !== 'string' || commentInfo.foodId.trim() === '') {
        res.status(400).json({error: 'Food id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const food = await foodData.get(commentInfo.foodId);
    } catch (e) {
        res.status(400).json({error: 'No food with that id.'});
        return;
    }
    if(!commentInfo.userId || typeof commentInfo.userId !== 'string' || commentInfo.userId.trim() === '') {
        res.status(400).json({error: 'User id must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const user = await userData.get(commentInfo.userId);
    } catch (e) {
        res.status(400).json({error: 'No user with that id.'});
        return;
    }
    if(!commentInfo.text || typeof commentInfo.text !== 'string' || commentInfo.text.trim() === '') {
        res.status(400).json({error: 'Text must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const newComment = await commentData.create(
            commentInfo.foodId,
            commentInfo.userId,
            commentInfo.text
        );
        res.redirect('foods/' + commentInfo.foodId);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

router.put('/:id', async (req, res) => {
    if(!req.params.id || typeof req.params.id !== 'string' || req.params.id.trim() === '') {
        res.status(400).json({error: 'Id must be a non-empty string containing more than just spaces.'});
        return;
    }
    let commentInfo = req.body;
    if(!commentInfo) {
        res.status(400).json({error: 'You must provide data to edit a comment.'});
        return;
    }
    if(!commentInfo.text || typeof commentInfo.text !== 'string' || commentInfo.text.trim() === '') {
        res.status(400).json({error: 'Text must be a non-empty string containing more than just spaces.'});
        return;
    }
    try {
        const comment = await commentData.get(req.params.id);
    } catch (e) {
        res.status(404).json({error: 'Comment not found.'});
        return;
    }
    try {
        const updatedComment = await commentData.update(
            req.params.id,
            commentInfo.text
        );
        res.status(200).json(updatedComment);
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
        const comment = await commentData.get(req.params.id);
    } catch (e) {
        res.status(404).json({error: 'Comment not found.'});
        return;
    }
    try {
        const result = await commentData.remove(req.params.id);
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

module.exports = router;