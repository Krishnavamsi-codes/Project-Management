
import crypto from "crypto"
import jwt from "jsonwebtoken"

import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asynchandler } from "../utils/async-handler.js"
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

//we keep generate access and refresh token separately and not inside register user because this can be used again fo rlogin or signup
const generateAccessandRefreshTokens = async (userId) => {

    try {

        const user = await User.findById(userId)

        const accesstoken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()

        //since refreshtoken is stored in database because 
        // User logs in
        // Backend creates:
        // 1. Access Token (short expiry)
        // 2. Refresh Token (long expiry)

        // Frontend sends access token with requests

        // If access token valid -> request allowed

        // If access token expired -> backend sends 401

        // Frontend sends refresh token to /refresh-token

        // Backend verifies refresh token with JWT + DB

        // If valid -> backend generates new access token

        // Frontend retries request using new access token

        user.refreshtoken = refreshtoken

        //so now db got updated so we gotta save it rn so for this command is user.save() but 
        //before saving what db will do is itll validate everything like password is required for all users etc but this is handled separately
        //so we can do user.save({validateBeforeSave:false})

        await user.save({ validateBeforeSave: false })

        return { accesstoken, refreshtoken }

    }
    catch(error) {

        throw new ApiError(
            500,
            "Couldnt generate access and refresh token successfully",
            error
        )
    }
}

const registeruser = asynchandler(async (req, res) => {

    const { email, username, password, role } = req.body

    const existing = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existing) {

        throw new ApiError(
            409,
            "User with the email/username already exists",
            []
        )
    }

    else {

        const user = await User.create({
            email: email,
            username: username,
            password: password,
            role: role
        })

        const {
            unhashedtoken,
            hashedtoken,
            tokenexpiry

        } = user.generateTemporaryToken()

        user.emailVerificationToken = hashedtoken
        user.emailVerificationExpiry = tokenexpiry

        await user.save({ validateBeforeSave: false })

        await sendEmail({

            email: user?.email,

            subject: "Please verify your email",

            MailgenContent: emailVerificationMailgenContent(

                user.username,

                `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedtoken}`

                //Verification URL explanation

                // req.protocol gives current protocol like http or https
                // req.get("host") gives current host with port like localhost:8000 or example.com
                // Together they create base URL like http://localhost:8000
                // Then routing goes to /api/v1/users/verify-email
                // unhashedToken is added at the end to create unique verification link for each user
            )
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshtoken -emailVerificationToken -emailVerificationExpiry"
        )

        if(!createdUser) {

            throw new ApiError(
                500,
                "Something gone wrong while registering a user"
            )
        }

        return res.status(201).json(
            new ApiResponse(
                201,
                { user: createdUser },
                "User has been registered successfully"
            )
        )
    }
})

const loginuser = asynchandler(async(req,res)=>{

    const {email,password} = req.body

    if(!email || !password)
    {
        throw new ApiError(400,"Email and Password are required")
    }

    const user = await User.findOne({email})

    if(!user)
    {
        throw new ApiError(400,"User doesnt exist")
    }

    //dont allow login without email verification
    if(!user.isEmailVerified)
    {
        throw new ApiError(401,"Please verify your email first")
    }

    const isenteredpasswordcorecct = await user.isPasswordCorrect(password)

    if(!isenteredpasswordcorecct)
    {
        throw new ApiError(400,"Invalid Password entered")
    }

    const {accesstoken,refreshtoken} =
        await generateAccessandRefreshTokens(user._id)

    const loggedinUser = await User.findById(user._id).select(
        "-password -refreshtoken -emailVerificationToken -emailVerificationExpiry"
    )

    const options = {
        httpOnly:true,
        secure:false,
        sameSite:"strict"
    }

    return res.status(200)
    .cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoken",refreshtoken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedinUser,
            },
            "User logged in successfully"
        )
    )
})



//in verifyjwt at the end we kept req.user=user so we appended smth to the request
//so we can directly access the user in the request and in that we can take the user id and then update
const logoutuser = asynchandler(async(req,res,next)=>
{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshtoken:""
            }
        },
        {
            returnDocument: "after",
        },

    )

 const options = {
    httpOnly:true,
    secure:false,
    sameSite:"strict"
 }

 return res
 .status(200)
 .clearCookie("accesstoken",options)
 .clearCookie("refreshtoken",options)
 .json(
    new ApiResponse(200,"","User Logged out successfully")
 )
})


const getCurrentuser = asynchandler(async(req,res)=>{

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "Current User successfully fetched"
        )
    )
})

const verifyemail = asynchandler(async(req,res)=>{

    const {verificationtoken} = req.params

    if(!verificationtoken){

        throw new ApiError(
            400,
            "Email verification token is missing"
        )
    }

    //see line 107

    let hashedtoken = crypto
    .createHash("sha256")
    .update(verificationtoken)
    .digest("hex")

    const user = await User.findOne({

        emailVerificationToken:hashedtoken,

        emailVerificationExpiry:{
            $gt : Date.now()
        }

        // this is condition like if we add 20 minutes to the current time and only if that is greater than this then only we can do verification
    })

    if(!user)
    {
        throw new ApiError(
            400,
            "Email verification token is invalid or expired"
        )
    }


    //user got verified why to store unncessary
    user.emailVerificationToken = undefined
    user.emailVerificationExpiry = undefined
    user.isEmailVerified = true

    await user.save({validateBeforeSave:false})

    return res.status(200).json(
        new ApiResponse(
            200,
            {isEmailVerified:true},
            "Email has been verified"
        )
    )

})

const resendemailverification = asynchandler(async(req,res)=>{

    const user = await User.findById(req?.user?._id)

    if(!user)
    {
        throw new ApiError(404,"User does not exist")
    }

    if(user.isEmailVerified)
    {
        throw new ApiError(409,"Email is alrdy verified")
    }

    const {
        unhashedtoken,
        hashedtoken,
        tokenexpiry

    } = user.generateTemporaryToken()

    user.emailVerificationToken = hashedtoken
    user.emailVerificationExpiry = tokenexpiry

    await user.save({ validateBeforeSave: false })

    await sendEmail({

        email: user?.email,

        subject: "Please verify your email",

        MailgenContent: emailVerificationMailgenContent(

            user.username,

            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedtoken}`

            //Verification URL explanation

            // req.protocol gives current protocol like http or https
            // req.get("host") gives current host with port like localhost:8000 or example.com
            // Together they create base URL like http://localhost:8000
            // Then routing goes to /api/v1/users/verify-email
            // unhashedToken is added at the end to create unique verification link for each user
        )
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Mail has been sent to your email id"
        )
    )
})

const refreshAccessToken = asynchandler(async (req,res)=>{

    const incomingrefreshtoken =
        req.cookies.refreshtoken || req.body.refreshtoken

    if(!incomingrefreshtoken){

        throw new ApiError(
            401,
            "Unauthorized access"
        )
    }

    try{

        const decodedtoken = jwt.verify(
            incomingrefreshtoken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedtoken?._id)

        if(!user)
        {
            throw new ApiError(
                401,
                "Invalid Refresh Token"
            )
        }

        if(incomingrefreshtoken != user?.refreshtoken)
        {
            throw new ApiError(
                401,
                "Refresh token is expired"
            )
        }

        const {
            accesstoken:newaccesstoken,
            refreshtoken:newrefreshtoken
        } = await generateAccessandRefreshTokens(user._id)

        user.refreshtoken = newrefreshtoken

        await user.save({validateBeforeSave:false})

        const options = {
            httpOnly:true,
            secure:false,
            sameSite:"strict"
        }

        return res
        .status(200)
        .cookie("accesstoken",newaccesstoken,options)
        .cookie("refreshtoken",newrefreshtoken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accesstoken:newaccesstoken,
                    refreshtoken:newrefreshtoken
                },
                "Access token refreshed successfully"
            )
        )

    }
    catch(error)
    {
        throw new ApiError(
            401,
            "Invalid or expired refresh token"
        )
    }
})


import { forgotPasswordMailgenContent } from "../utils/mail.js"
const forgetPasswordRequest=asynchandler(async(req,res)=>
    {
    const{email}=req.body
    const user=await User.findOne({email})
    if(!user)
    {
        throw new ApiError(404,"User does not exist",[])
    }
    const {unhashedtoken,hashedtoken,tokenexpiry}=user.generateTemporaryToken()
    user.forgotPasswordToken=hashedtoken
    user.forgotPasswordExpiry=tokenexpiry

    await user.save({ validateBeforeSave: false })

    await sendEmail({
        email:user?.email,
        subject:"Password Reset Request",
        MailgenContent:forgotPasswordMailgenContent(user.username,`${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unhashedtoken}`)
    })

    return res.status(200).json(new ApiResponse(200,{},"Password reset email has been sent on your mail @"))
    })

    const resetForgotPassword=asynchandler(async(req,res)=>{
        const {resettoken}=req.params
        const {newpassword}=req.body

        let hashedToken=crypto.createHash("sha256").update(resettoken).digest("hex")

        const user=await User.findOne(
            {
                forgotPasswordToken:hashedToken,
                forgotPasswordExpiry:{$gt:Date.now()}
            }
        )

        if(!user)
        {
            throw new ApiError(400,"Password reset token is invalid or expired")
        }

        user.forgotPasswordExpiry=undefined
        user.forgotPasswordToken=undefined

        user.password=newpassword
        await user.save({validateBeforeSave:false})

        return res.status(200).json(new ApiResponse(200,{},"Password reset successfully"))
    })

const changeCurrentPassword=asynchandler(async(req,res)=>{
    const {oldpassword,newpassword}=req.body
    const user=await User.findById(req.user?._id)

    const ispassowrdvalid=await user.isPasswordCorrect(oldpassword)

    if(!ispassowrdvalid){
        throw new ApiError(400,"INvalid old password sent")
    }
    user.password=newpassword
    await user.save({validateBeforeSave:false})
    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))
})
export {
    registeruser,
    loginuser,
    logoutuser,
    getCurrentuser,
    verifyemail,
    resendemailverification,
    refreshAccessToken,
    forgetPasswordRequest,
    changeCurrentPassword,
    resetForgotPassword
}
