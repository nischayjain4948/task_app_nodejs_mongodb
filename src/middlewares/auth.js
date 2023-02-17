const jwt = require("jsonwebtoken");
const User = require("../models/user");
const mongoose = require("mongoose");


const auth = async (req,res,next) =>{
    try{
        const token = req.headers.authorization.split(" ");
        const newToken = token[1];
        const decode = jwt.verify(newToken,  process.env.JSON_WEB_SECREAT);
        const _id = mongoose.Types.ObjectId(decode._id);
        const user = await User.findOne({_id});
        if(!user){
            return res.status(404).status({message:"invalid auth token"});
        }
        req.user = user;
        next();
    }
    catch(err){
        res.status(401).json({error:"Unauthorized access!"});
    }

}

module.exports = auth;