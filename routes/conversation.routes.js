const { Router } = require('express');
const router = Router();
const Conversation = require('../models/Conversation');
const PotentialMatch = require('../models/PotentialMatch');
const auth = require('../middlewares/auth');
const decodeUserId = require('../utils/decodeToken');

router.get('/get', auth, async (req, res) => {
    try {
    const token = req.headers.authorization.split(' ')[1];
    const userId = decodeUserId(token);
    const convs = await Conversation.find({
        members: userId,
        type: 'regular'
    });
    res.status(200).json(convs);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong"
        })
    }
})

router.get('/getById/:id', auth, async(req, res) => {
    try {
        const conv = await Conversation.findById(req.params.id);
        res.status(200).json(conv);
        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Something went wrong"
            })
        }
})

router.post('/deleteById', auth, async (req, res) => {
    try {
        const { conversationId, deleteId} = req.body;
        const token = req.headers.authorization.split(' ')[1];
        const userId = decodeUserId(token);
        await Conversation.deleteOne({_id: conversationId});
        await PotentialMatch.deleteOne({
            $and: [
                {
                    id1: userId
                },
                {
                    id2: deleteId
                }
            ]
        })
        res.status(202).json({message: 'Conversation deleted'});
        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Something went wrong"
            })
        }
})

router.get('/findAnonByUserId', auth, async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userId = decodeUserId(token);
        const convs = await Conversation.findOne({
            members: userId,
            type: 'anon'
        });
    res.status(200).json(convs);
        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Something went wrong"
            })
        }
})

router.get('/createAnon/:id', auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userId = decodeUserId(token);
        
        const conv = await Conversation.findOne({
            members: {
                $all: [userId, req.params.id]
            },
            type: 'anon'
        })
        if(conv) {
            res.status(201).json(conv);
        }
        else {
            const newConversation = new Conversation({
                members: [userId, req.params.id],
                type: 'anon'
            })
            
            const savedConversation = await newConversation.save();
            res.status(201).json(savedConversation);
        }
        
        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Something went wrong"
            })
        }
})

module.exports = router;