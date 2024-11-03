const mongoose = require('mongoose');
const uri = "mongodb+srv://<db_username>:<db_password>@messagerie.ckrck.mongodb.net/?retryWrites=true&w=majority&appName=Messagerie";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDB;
