const express=require('express');
const router=express.Router();
require("dotenv").config();
const User=require('../models/users');
const authenticateToken=require("../middlewares/authenticateJWT");
router.get("/api/v1/preferences",authenticateToken,async(req,res)=>{
    try{
        const user=await User.findById(req.user.id);
        if(!user)
        {
            return res.status(404).json({message:'user not found'});
        }
        res.status(200).json({preferences:user.preferences});
    }
        catch(error)
        {
            res.status(500).json({message:'Internal server error'});
        }

   

})




router.put("/api/v1/preferences",authenticateToken,async(req,res)=>{
    try{
        const user=await User.findById(req.user.id);
        if(!user)
        {
            return res.status(404).json({message:'user not found'});
        }
        user.preferences=req.body.preferences;
        await user.save();
        res.status(200).json({message:'preferences updated successfully'});
    }
        catch(error)
        {
            res.status(500).json({message:'Internal server error'});
        }

   

})
module.exports=router;