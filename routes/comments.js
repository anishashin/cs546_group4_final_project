const express = require('express');
const router = express.Router();
const xss = require('xss');
const data = require('../data');
const commentData = data.comments;
const foodData = data.foods;
const userData = data.users;

router.post('/', async (req, res) => {
    let commentInfo = req.body;
    commentInfo.foodId = xss(commentInfo.foodId);
    commentInfo.userId = xss(commentInfo.userId);
    commentInfo.text = xss(commentInfo.text);
    if(!commentInfo) {
        res.status(400).render('error', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            title: 'Error', 
            error: 'You must provide data to add a comment.'
        });
        return;
    }
    if(!commentInfo.foodId || typeof commentInfo.foodId !== 'string' || commentInfo.foodId.trim() === '') {
        res.status(400).render('error', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            title: 'Error', 
            error: 'Food id must be a non-empty string containing more than just spaces.'
        });
        return;
    }
    try {
        const food = await foodData.get(commentInfo.foodId);
    } catch (e) {
        res.status(400).render('error', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            title: 'Error', 
            error: 'No food with that id.'
        });
        return;
    }
    if(!commentInfo.userId || typeof commentInfo.userId !== 'string' || commentInfo.userId.trim() === '') {
        res.status(400).render('error', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            title: 'Error', 
            error: 'User id must be a non-empty string containing more than just spaces.'
        });
        return;
    }
    try {
        const user = await userData.get(commentInfo.userId);
    } catch (e) {
        res.status(400).render('error', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            title: 'Error', 
            error: 'No user with that id.'
        });
        return;
    }
    if(!commentInfo.text || typeof commentInfo.text !== 'string' || commentInfo.text.trim() === '') {
        res.status(400).render('error', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            title: 'Error', 
            error: 'Text must be a non-empty string containing more than just spaces.'
        });
        return;
    }
    try {
        const newComment = await commentData.create(
            commentInfo.foodId,
            commentInfo.userId,
            commentInfo.text
        );
        const user = await userData.get(newComment.userId);
        newComment.userName = user.firstName + ' ' + user.lastName;
        res.status(200).render('partials/comment', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            layout: null, 
            ...newComment
        });
    } catch (e) {
        res.status(500).render('error', {
            authenticated: req.session.user ? true : false,
            user: req.session.user,
            title: 'Error', 
            error: e.message
        });
    }
});

module.exports = router;