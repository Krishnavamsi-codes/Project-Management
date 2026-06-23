import mongoose,{Schema} from "mongoose"

const projectsnoteschema=new Schema({
    project:
    {
        type:Schema.Types.ObjectId,
        ref:"Project",
        required:true        
    },
    createdby:
    {
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }

},{timestamps:true})

export const ProjectNote=mongoose.model("ProjectNote",projectsnoteschema)