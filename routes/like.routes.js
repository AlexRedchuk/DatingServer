const { Router } = require('express');
const router = Router();
const auth = require('../middlewares/auth');
const decodeUserId = require('../utils/decodeToken');
const PotentialMatch = require('../models/PotentialMatch');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

router.get('/like/:likeid', auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userId = decodeUserId(token);
        const match = {
            id1: req.params.likeid,
            id2: userId
        }
        const potentialMatch = await PotentialMatch.findOne(match)
        await User.findByIdAndUpdate(userId, {
            $push: {
                skippedPool: req.params.likeid
             }
        })
        if (potentialMatch) {
            await PotentialMatch.findByIdAndDelete(potentialMatch._id);
            await User.findByIdAndUpdate(userId, {
                $push: {
                    sympathies: req.params.likeid
                 }
            })
            await User.findByIdAndUpdate(req.params.likeid, {
                $push: {
                    sympathies: userId
                 }
            })
            const newConversation = new Conversation({
                members: [userId, req.params.likeid]
            })
            const matchedUser = await User.findById(req.params.likeid);
            const savedConversation = newConversation.save();
            res.status(201).json({
                matchedUser,
                сonversation: savedConversation,
                message: "It's a match!"
            })
        }
        else {
            await PotentialMatch.create({
                id1: userId,
                id2: req.params.likeid
            });
            res.status(201).json({
                message: "Created potential match"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong"
        })
    }
});

router.post('/checkIfLiked', auth, async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userId = decodeUserId(token);
        const otherId = req.body.members?.find(el => el !== userId);
        const result = await PotentialMatch.find({
            $and: [
                {
                    id1: userId
                },
                {
                    id2: otherId
                }
            ]
            
            
        })
        res.status(200).json(result)
    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong"
        })
    }
})

router.get('/likeAnonUser/:likeid', auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userId = decodeUserId(token);
        const match = {
            id1: req.params.likeid,
            id2: userId
        }
        const potentialMatch = await PotentialMatch.findOne(match)
        await User.findByIdAndUpdate(userId, {
            $push: {
                skippedPool: req.params.likeid
             }
        })
        if (potentialMatch) {
            await PotentialMatch.findByIdAndDelete(potentialMatch._id);
            await User.findByIdAndUpdate(userId, {
                $push: {
                    sympathies: req.params.likeid
                 }
            })
            await User.findByIdAndUpdate(req.params.likeid, {
                $push: {
                    sympathies: userId
                 }
            })
            const matchedUser = await User.findById(req.params.likeid);
            const anonConv = await Conversation.findOneAndUpdate({
                members: userId,
                type: 'anon'
            }, {type: 'regular'});
            res.status(201).json({
                matchedUser,
                сonversation: anonConv,
                message: "It's a match!"
            })
        }
        else {
            await PotentialMatch.create({
                id1: userId,
                id2: req.params.likeid
            });
            res.status(201).json({
                message: "Created potential match"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong"
        })
    }
});


router.post('/blockUser', auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userId = decodeUserId(token);
        await User.findByIdAndUpdate(userId, {
            $pull: {
                sympathies: req.body.deleteId
                }
            })
        await User.findByIdAndUpdate(req.body.deleteId, {
            $pull: {
                sympathies: userId
            }
            })
        await Message.deleteMany({conversationId: req.body.conversationId});
        await Conversation.findByIdAndDelete(req.body.conversationId);
        const convs = await Conversation.find({
            members: userId
        });
        res.status(200).json(convs);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong"
        })
    }
});

router.get('/dislike/:dislikeid', auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userId = decodeUserId(token);
        const match = {
            id1: req.params.dislikeid,
            id2: userId
        }
        const potentialMatch = await PotentialMatch.findOne(match)
        const test = await User.findOne({$and: [
            {
                _id: userId
            },
            {
                skippedPool: {
                    $ne: req.params.dislikeid
                }
            }
        ]})
        if(test) {
            await User.findByIdAndUpdate(userId, {
                $push: {
                    skippedPool: req.params.dislikeid
                 }
             })
        }
        if (potentialMatch) {
            await PotentialMatch.findByIdAndDelete(potentialMatch._id);
            res.status(201).json({
                message: "Skipped match"
            })
        }
        else {
            await User.findByIdAndUpdate(req.params.dislikeid, {
                $push: {
                    skippedPool: userId
                 }
             })
        }
        res.status(200).json({
            message: 'Skip'
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Something went wrong"
        })
    }
});

router.get('/getSymphaties', auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userId = decodeUserId(token);
        const currentUser = await User.findOne({_id: userId});
        await User.find({
            _id: { $in: currentUser.sympathies}
        }, (err, items) => {
            if (err) {
                console.log(err);
                res.status(500).send('An error occurred', err);
            }
            else {
                res.status(200).send(items);
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
})

router.get('/getDatingUser', auth, async (req, res) => {
    try {
    const token = req.headers.authorization.split(' ')[1];
    const userId = decodeUserId(token);
    const currentUser = await User.findOne({_id: userId});
    const gender = currentUser.gender === 'male' ? 'female' : 'male';
    await User.findOne({ 
        $and: [
        {_id: { $not: { $in: currentUser.skippedPool }}},
        {gender: gender}
    ]}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
            throw err;
        }
        else {
            res.status(200).send(items);
        }
    }); 
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
   
});

router.get('/getPotentials', auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userId = decodeUserId(token);
        const potentials = await PotentialMatch.find({
            id2: userId
            
        })
        const potentialsArray = []
        potentials.forEach( data => {
            if(data.id1 === userId) {
                potentialsArray.push(data.id2)
            }
            if(data.id2 === userId) {
                potentialsArray.push(data.id1)
            }
        } )
        await User.find({
            _id: { $in: potentialsArray}
        }, (err, items) => {
            if (err) {
                console.log(err);
                res.status(500).send('An error occurred', err);
            }
            else {
                res.status(200).send(items);
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
})

module.exports = router;
