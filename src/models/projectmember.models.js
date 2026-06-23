import mongoose,{Schema} from "mongoose"

import {AvailableUserRole,UserRolesEnum} from "../utils/constants.js"
const projectMemberSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    project:
    {
        type:Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },
    role:
    {
        type:String,
        enum:AvailableUserRole,
        default:UserRolesEnum.MEMBER // if nothing assigned defaults to member role
    }
},{timestamps:true})

export const ProjectMember=mongoose.model("ProjectMember",projectMemberSchema)