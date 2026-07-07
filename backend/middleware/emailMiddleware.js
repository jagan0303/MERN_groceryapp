const jwt=require("jsonwebtoken")
const dotEnv=require("dotenv")
exports.emailMiddleware=(req,res,next)=>{
      const token = req.headers.authorization?.split(" ")[1]
      if(!token){
        return res.status(401).json({msg:"Token required/Wrong token"})

      }
      try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
          req.userId=decoded._id;
          req.userEmail=decoded.email
           next()
      }
      catch(error){
        return res.status(403).json({msg:"invalid token or expired token"})


      }
}