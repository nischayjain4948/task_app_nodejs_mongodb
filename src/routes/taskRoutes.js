const router = require("express").Router();
const Task = require("../models/task");
const auth = require("../middlewares/auth");


router.post("/create_task", auth,  async (req,res)=>{
    try{     
        const task = new Task({...req.body, owner:req.user._id});
        await task.save();

       return res.status(200).json({message:"task added successfully."}); 
      }
      catch(err){
          return res.status(500).json({message:"Something went wrong."})
      }
})



router.patch("/update_task/:id", auth,  async (req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update));
    if(!isValidOperation){
        return res.status(404).json({message:"invalid field to update"});
    }
    try{
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id});
        if(!task){
            return res.status(404).json({message:"task not found!"});
        }
        updates.forEach((update)=>task[update] = req.body[update]);
        await task.save();
        return res.status(200).json({message:"task updated successfully"});
    }
    catch(err){
        return res.status(510).json({message:"something went wrong!"});
    }
})




router.delete("/delete_task/:id", auth,  async (req,res)=>{
    try{
        const deletedTask = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id});
        if(!deletedTask){
            return res.status(409).json({message:"Invalid id params"});
        }
        return res.status(200).json({message:"task deleted successfully"});
    }
    catch(err){
        return res.status(510).json({message:"something went wrong!"});
    }
})


router.get("/get_task/:id", auth , async (req,res)=>{
    try{
        const _id = req.params.id;
        const task = await Task.findOne({_id, owner:req.user._id});
        return res.status(200).json({result:task});
    }
    catch(err){
        return res.status(500).json({message:"something went wrong!"});
    }
})

router.get("/get_all_task", auth, async (req,res)=>{
    const match = {};
    const sort = {};
    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }
    if(req.query.sort){
        let sortBy = req.query.sort.split(":");
        sort[sortBy[0]] = sortBy[1] === 'desc' ? -1 : 1;
    }
    try{
        await req.user.populate({
            path:'get_all_task',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                
            },
            sort

        }).execPopulate();
        return res.status(200).json({result:req.user.get_all_task});
    }
    catch(err){
        return res.status(500).json({message:"something went wrong!"});
    }

})

module.exports = router;