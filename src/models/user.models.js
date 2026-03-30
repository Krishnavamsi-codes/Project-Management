import mongoose,{Schema} from "mongoose"
import bcrypt from "bcrpyt"

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
        required:true,
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


//but now if i make only like changes on maybe like fullname or email then also the alrdy hashed password will get hashed again so we need to stop it
userSchema.pre('save',async function (next) {
    if(!this.isModified(this.password)) return next();
    this.password=await bcrypt.hash(this.password,10)
    
})
export const User=mongoose.model("User",userSchema)//"User gets conerted to user anyways"