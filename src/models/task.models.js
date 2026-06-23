import mongoose,{Schema} from "mongoose"
import { AvailableTaskStatuses,TaskStatusEnum } from "../utils/constants.js"
import { User } from "./user.models.js"

const taskschema=new Schema(
    {
        title:{type:String,
            required:true,
            trim:true
        },
        description:{
            type:String
        },
        project:{
            type:Schema.Types.ObjectId,
            ref:"Project",
            required:true
        },
        assignedby:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        assigntedto:
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        status:{
            default:TaskStatusEnum.IN_PROGRESS,
            enum:AvailableTaskStatuses,
            type:String
        },
        attachments:{
            type:[{
                url:String,
                mimetype:String,
                size:Number
            }],
            default:[]

        }

    },
    {
        timestamps:true
    }
)


export const tasks=mongoose.model("Task",taskschema)