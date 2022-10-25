const { Router } = require('express');
const router = Router();
const Message = require('../models/Message');
const auth = require('../middlewares/auth');
const Conversation = require('../models/Conversation');
const decodeUserId = require('../utils/decodeToken');

router.post('/', auth, async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userId = decodeUserId(token);
    const newMessage = new Message({
        conversationId: req.body.conversationId,
        sender: userId,
        text: req.body.text,
        isRead: false
    })
    try {
        const save = await newMessage.save();
        res.status(200).json(save);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong"
        })
    }
})

router.get('/byConversation/:convId', auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userId = decodeUserId(token);
        await Message.updateMany({
            conversationId: req.params.convId,
            sender: {$ne: userId} 
        },
        [
            {
                $set: { isRead: true}
            }
        ]
        )
        const result = await Message.find({
            conversationId: req.params.convId
        })
        res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong"
        })
    }
})

router.get('/lastMessage/:convId', auth, async (req, res) => {
    try {
        const result = await Message.findOne({
            conversationId: req.params.convId,
        }
        ).sort({ "createdAt": -1 }).limit(1);
        res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong"
        })
    }
})

router.get('/countUnread', auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userId = decodeUserId(token);
        const userConvs = await Conversation.find({
            members: userId
        })
        const dateIds = userConvs.map(el => {
            return el._id;
        })
        const result = await Message.find(
            {
                conversationId: {$in: dateIds},
                sender: {$ne: userId},
                isRead: false
            }
        ).countDocuments(   )
        res.status(200).json(result);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong"
        })
    }
})

module.exports = router;