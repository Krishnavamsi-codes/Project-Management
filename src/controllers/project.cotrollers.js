import {User} from "../models/user.models.js"
import { Project } from "../models/project.models.js"
import { ProjectMember } from "../models/projectmember.models.js"
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asynchandler } from "../utils/async-handler.js"
import mongoose, { mongo } from "mongoose"
import { UserRolesEnum } from "../utils/constants.js"
import { pipeline } from "nodemailer/lib/xoauth2/index.js"

const getprojects=asynchandler(async (req,res)=>{
const projects=await ProjectMember.aggregate([
        {
            $match: {
                user:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"project",
                localField:"project",
                foreignField:"_id",
                as:"Projects",
                pipeline:[
                    {
                        $lookup:{
                            from:"projectmember",
                            localField:"_id",
                            foreignField:"project",
                            as:"projectmembers"
                        }
                    },{
                        $addFields:{
                            members:{
                                $size:"projectmembers"
                            }
                        }
                    },
                    {
                        $unwind:"project"
                    },
                    {
                        $project ://this is projection
                        {
                            project:{
                                _id:1,
                                name:1,
                                description:1,
                                members:1,
                                createdBy:1,
                                createdAt:1
                            },
                            role:1,
                            _id:0
                            
                        }
                    }
                    
                    
                ]
            }
        }
    ])
})

const getprojectbyid=asynchandler(async (req,res)=>{
        const {projectid}=req.params
        const project=await Project.findById(projectid)
        if(!project)
        {
            return new ApiError(404,"Project not found");
        }
        return res.status(200).json(new ApiResponse(200,project,"Project fetched successfully"))
})
const createproject=asynchandler(async (req,res)=>{
    const {name,description}=req.body
    

    const project=await Project.create(name,
        description,
        createdBy:new mongoose.Types.ObjectId(req.user._id))//(req.user._id) will return a string but we need a user object so 

    //so this guy is the admin now

    await ProjectMember.create({user:new mongoose.Types.ObjectId(req.user._id),
        project:new mongoose.Types.ObjectId(project._id),
        role: UserRolesEnum.ADMIN
     })
     return res.status(201).json(new ApiResponse(201,project,"Project created successfully"))
})
const deleteproject=asynchandler(async (req,res)=>{
    const {projectid}=req.params
    const project=await Project.findByIdAndDelete(projectid)
    if(!project)
    {
        throw new ApiError(404,"Project not found")
    }
    return res.status(200).json(new ApiResponse(200,project,"Project deleted successfully"));

})
const addmemberstoproject=asynchandler(async (req,res)=>{
    const {email,role}=req.body
    const{projectid}=req.params
    const user=await User.findOne({email})
    if(!user)
        throw new ApiError(404,"User doesnt exist")
    
        await ProjectMember.findByIdAndUpdate({
            user:new mongoose.Types.ObjectId(user._id),
            project:new mongoose.Types.ObjectId(projectid)

        },{ user:new mongoose.Types.ObjectId(user._id),
            project:new mongoose.Types.ObjectId(projectid),
            role:role
},{new:true,upsert:true

})
    return res.status(200).json(new ApiResponse(200,user,"User added successfully"))
})
const getprojectmembers=asynchandler(async (req,res)=>{
const {projectid}=req.params
const {project}=await Project.findById(projectid)

if(!project)
    throw new ApiError(404,"PROJECT NOT FOUND")

    const Projectmembers=await projectmembers.aggregate([
        {
            $match:{
                project:new mongoose.Types.ObjectId(projectid)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"user",
                foreignField:"_id",
                as:"user",
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            username:1,
                            fullname:1,
                            avatar:1
                        }
                    }
                ]

            }
        },{
            $addFields:{
                user:{
                    $arrayElemat:["$user",0]
                }
            }
        },
        {
            $project:{
                project:1,
                user:1,
                role:1,
                createdAt:1,
                createdBy:1
            }
    ])
})



const updatememberole=asynchandler(async (req,res)=>{
    const updateMemberRole = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.params;
    const { newRole } = req.body;

    if (!AvailableUserRole.includes(newRole)) {
        throw new ApiError(400, "Invalid Role");
    }

    let projectMember = await ProjectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId),
    });

    if (!projectMember) {
        throw new ApiError(400, "Project member not found");
    }

    projectMember = await ProjectMember.findByIdAndUpdate(
        projectMember._id,
        {
            role: newRole,
        },
        {
            new: true,
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            projectMember,
            "Project member role updated successfully"
        )
    );
});
})
const deleteMember = asyncHandler(async (req, res) => {
    const { projectId, userId } = req.params;

    const projectMember = await ProjectMember.findOneAndDelete({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId),
    });

    if (!projectMember) {
        throw new ApiError(400, "Project member not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Project member removed successfully"
        )
    );
});

const updateproject=asynchandler(async(req,res)=>{
    const {name,description}=req.body
    const {projectid}=req.params
    const project=await Project.findByIdAndUpdate(projectid,

        {
            name,description
        },{new:true}
    )
    if(!project)
    {
        throw new ApiError(404,"Project not found")
    }
    return res.status(200).json(200,project,"Project Updated Successfully")

})

export const{addmemberstoproject,createproject,deletemember,updatememberole,getprojectbyid,getprojectmembers,deleteproject,getprojects}