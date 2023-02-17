const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        validate(value){
             if(!validator.isEmail(value)){
                throw new Error('Email is not valid');
             }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
        trim:true
    },

    age:{
        type:Number,
        default:0,
        validate(value){
            if(value < 0){
                throw new Error("Age must be grethar than 18");
            }
        }
    },
    tokens:[{
        token:{
            type:String
        }
    }],
    avatar:{
        type:Buffer
    }
    
}, {timestamps:true})


userSchema.virtual('get_all_task', {
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})


// JSONWebToken implementions..


// methods are called instance methods.....
userSchema.methods.generateAuthToken = async function (){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()}, process.env.JSON_WEB_SECREAT);
    return token
}




userSchema.methods.toJSON =  function  () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}



// login method 
// static are called model methods....
userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email});
    if(!user){
        throw new Error("unable to find");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error("password not matched");
    }
  return user;
}


// hash the plain text password before saving
userSchema.pre('save', async function (next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})


// Delete the particular tasks when the user is removed!
userSchema.pre('remove', async function (next){
    const user = this;
    await Task.deleteMany({owner:user._id});
    next();
})

const User = mongoose.model('Users', userSchema )

module.exports = User;