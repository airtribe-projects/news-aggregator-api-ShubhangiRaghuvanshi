const jwt= require('jsonwebtoken');
const JWT_SECRET=process.env.JWT_SECRET;
const authenticateJWT=(req,res,next)=>{
    const token=req.header("Authorization")?.replace("Bearer ","").trim();
    if(!token)
    {
        return res.status(401).json({message:'Unauthorised Access.No token provided '});
    }
    try{
        const decoded=jwt.verify(token,JWT_SECRET);
        req.user=decoded;
        next();
    }catch(err){
        return res.status(403).json({message:'Invalid Token'});
    }
    
        
        
      

}


module.exports=authenticateJWT;