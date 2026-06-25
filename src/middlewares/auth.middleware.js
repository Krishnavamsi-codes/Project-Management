// for every single request whatever it is we are getting from the user we need to check for the accesstoken and then retrieve the data 
// because the access token is generated from the user id password and username so we can access anything with this
// so instead of checking for every single service for the access token we keep it in the middleware

// for mobile apps cookies arent available the cookie information is sent is the header as the bearer token so rn to keep it easy to migrate to app
// im also setting the bearer token


import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { asynchandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
import { ProjectMember } from "../models/projectmember.models.js";

export const verifyJWT=asynchandler(async(req,res,next)=>
{
    const token=req?.cookies.accesstoken || req?.header('Authorization')?.replace("Bearer ",""); // since mobile apps keep info in header i.e bearer token of authorization type we retrieve
    // from cookies or from the header but if u see in postman that thing has got bearer word in that token so we replace it without space
    //to get only the access token
    // we write ? this is called optional chaning that means only if request exists then get the cookies and in that get accesstoken

    if(!token)
    {
        throw new ApiError(403,"Unauthorized Request")
    }

    // jwt.verify() checks whether:

    // token is valid
    // token is not modified
    // token is not expired

    // and then decodes payload.
    try{
        const decodedtoken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedtoken?._id).select(
            "-password -refreshtoken -emailVerificationToken -emailVerificationExpiry"
        )

        if(!user)
        {
            throw new ApiError(401,"Invalid Access Token")
        }
        req.user=user
        next()        
    }
    catch(err)
    {
        throw new ApiError(401,"Invalid Access Token")
    }

})

export const validateProjectPermission=(roles=[])=>{
    asynchandler(async(req,res,next)=>
    {
        const {projectid}=req.params
        if(!projectid){
            throw new ApiError(400,"Project id is missing")
        }

        const project=await ProjectMember.findOne({
            project:new mongoose.Types.ObjectId(projectid),
            user:new mongoose.Types.ObjectId(req.user._id)
        })
          if(project){
            throw new ApiError(400,"Projec is missing")
        }


        const givenrole=project?.role

        req.user.role=givenrole
        if(!roles.includes(givenrole))
            throw new ApiError(404,"You dont have permission to perform this specific action")
    }
)
}

