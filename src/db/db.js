const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true
});
mongoose.set('strictQuery', false);