const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const auth = require('./middlewares/auth');
require('dotenv').config();


const app = express();

app.use('/api/test',auth, require('./routes/like.routes'))

app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(express.json());
app.use(require("./routes/image.routes"));
app.use('/uploads', express.static('uploads'))
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/likes', require('./routes/like.routes'))
app.use('/api/conversations', require('./routes/conversation.routes'))
app.use('/api/messages', require('./routes/message.routes'))
const PORT = process.env.PORT || 8080;
const MongoURI = process.env.MONGO_URI;

async function start() {
    try {
        mongoose.Promise = global.Promise;
        await mongoose.connect(MongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        app.listen(PORT, () => {
            console.log(`App has been started on PORT: ${PORT}`);
        });

    } catch (e) {
        console.log('Server error', e.message);
        process.exit(1);
    }
}

start();

