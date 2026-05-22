import mongoose,{Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto";

const userSchema=new Schema({
    avatar:{
        type:{
            url:String,
            localPath:String
        },
        default:{
        url:'https://placehold.co/200*200',
        localPath:''
        }
    },
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type:String,
        trim:true
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    refreshtoken:{
        type:String
    },
    forgotPasswordToken:{
        type:String
    },
    forgotPasswordExpiry:{
        type:Date
    },
    emailVerificationToken:{
        type:String
    },
    emailVerificationExpiry:{
        type:Date
    }
},{
    timestamps:true
})


//but now if i make only like changes on maybe like fullname or email then also the alrdy hashed password will get hashed again so we need to stop it because if we attach the pre hook only to save then suppose we change like username then save will run but then without changing the password it is getting encrpyted again
userSchema.pre('save', async function() {

    if(!this.isModified("password"))
        return;

    this.password = await bcrypt.hash(this.password, 10);

    
})
userSchema.methods.isPasswordCorrect=async function(password) {
    return await bcrypt.compare(password,this.password)
    
}



userSchema.methods.generateAccessToken=function() {
    return jwt.sign(
        {
            _id : this._id,
            email:this.email,
            username:this.username
        },process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateRefreshToken=function() {
    return jwt.sign(
        {
            _id : this._id,
            email:this.email,
            username:this.username
        },process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateTemporaryToken=function(){
    const unhashedtoken=crypto.randomBytes(20).toString("hex")

    const hashedtoken=crypto.createHash("sha512").update(unhashedtoken).digest("hex")

    const tokenexpiry=Date.now()+(20*60*1000) //this is 20 minutes
    return {unhashedtoken,hashedtoken,tokenexpiry}
    }

export const User=mongoose.model("User",userSchema)//"User gets conerted to user anyways"