const express=require("express");
const router=express.Router();
const bcrypt=require("bcrypt");
const jwt=require('jsonwebtoken');
const {body,validationResult}=require('express-validator');
require("dotenv").config();

const User=require("../models/users")

    router.post("/api/v1/users/register", [body('email').isEmail().withMessage("Please provide a valid email address"),
        body('password').isLength({min:6}).withMessage("Password should be atleast 6 characters long"),
        body('preferences').isArray().notEmpty().withMessage("Please enter your preferences").custom(pref=>{
            if(pref.length==0)
            {
                throw new Error('Preferences cannot be empty');
            }
            return true;
        }),
        body('preferences.*.category').notEmpty().withMessage("Please enter the category "),
        body('prefernces.*.language').isArray().withMessage("Please enter the languages")], async (req, res) => {
       

        try {
            const { username, email, password,preferences } = req.body;
            const errors=validationResult(req)
            {
                if(!errors.isEmpty())
                {
                    return res.status(400).json({errors:errors.array()});
                }
            }
    
          
            if (!email || !password || !username) {
                return res.status(400).json({ message: 'All fields are required' });
            }
    

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const dbUser = new User({ username, email, password: hashedPassword,preferences: preferences || [] });
    

            await dbUser.save();
            res.status(200).json({ message: 'User registered successfully' });
    
        } catch (error) {
            console.error(error); 
            res.status(500).json({ message: 'Server error' });
        }
    });
    
  
  
  
  
  
  



router.post("/api/v1/users/login",async(req,res)=>{
    try {
        const { email, password } = req.body;
        
       
        const user = await User.findOne({ email });
        console.log(user);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

      
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        
        res.status(200).json({ token });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
        
    });





module.exports=router;
