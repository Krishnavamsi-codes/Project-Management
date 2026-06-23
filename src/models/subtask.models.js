import mongoose,{Schema} from "mongoose"
import { User } from "./user.models"

const subtaskschema=new Schema(
    {
        title:{
            type:String,
            required:true,
            trim:true
        },
        task:{
            type:Schema.Types.ObjectId,ref:"Task",required:true
        },
        isCompleted:{
            type:Boolean,
            required:true
        },
        createdBy:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        }


    },{timestamps:true}


)

export const subtask=mongoose.model("subtask",subtaskschema);