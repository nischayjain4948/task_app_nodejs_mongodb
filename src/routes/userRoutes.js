const router = require("express").Router();
const User = require("../models/user");
const auth = require("../middlewares/auth");
const {sendEmail} = require("../emails/account");

router.post("/create_user", async (req,res)=>{
    try{
    const user = new User(req.body);
    const token = await user.generateAuthToken();
    await user.save();
     sendEmail(user.email, user.name);
    return res.status(200).json({message:"user registered successfully."}); 
    }
    catch(err){
        return res.status(500).json({message:"Something went wrong.", err})
    }

})


router.patch("/update_user/me", auth,  async (req,res)=>{
    try{
     const updateFileds = Object.keys(req.body);
     const schemaFileds  = ["name", "email",  "password", "age"];

     const updatedOne = updateFileds.every((item)=>schemaFileds.includes(item));
     if(!updatedOne){
        return res.status(422).json({message:"Invalid parameters for update"});
     }
     updateFileds.forEach((update)=>req.user[update] = req.body[update]);
     await req.user.save();
     return res.status(200).json({message:"user updated successfully"});
    
    }
    catch(err){
        return res.status(500).json({message:"Something went wrong."});
    }

})


router.post("/login", async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).json({user, token});
    }
    catch(err){
        return res.status(404).json({message:"unabe to find user!"});
    }
})


router.delete("/delete_user/me", auth,  async (req,res)=>{
    try{
        await req.user.remove();
        return res.status(200).json({message:"user deleted successfully"});
    }
    catch(err){
        return res.status(500).json({message:"Something went wrong"});
    }
})

router.get("/get_users", auth,  async (req,res)=>{
    try{
        const user = await User.find({});
        return res.status(200).json({result:user});
    }
    catch(err){
        return res.status(500).json({message:"something went wrong!"});
    }

})
const multer = require("multer");
const upload = multer({
    limits:{
        fileSize:3000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
           return  cb(new Error("Please upload jpg,jpeg and png format only"));
        }
        cb(undefined, true);
    }
})


router.post("/me/avatar", auth,  upload.single('avatar') , async (req,res)=>{
    req.user.avatar = req.file.buffer;
    await req.user.save();
    return res.status(200).json({message:"profile picture uploaded successfully"});

}, (error, req, res, next )=>{
    res.status(400).json({error:error.message});
})


router.delete("/me/avatar", auth,  async(req,res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    return res.status(200).json({message:"profile picture deleted successfully"});
})


router.get("/:id/avatar", async (req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            throw new Error("Unable to found Image or user!");
        }
        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);
    }
    catch(err){
        res.status(400).json({err});
    }

})


module.exports = router;