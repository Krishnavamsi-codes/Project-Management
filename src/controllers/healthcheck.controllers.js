import {ApiResponse} from "../utils/api-response.js"
import { asynchandler } from "../utils/async-handler.js";

//  const healthcheck=async (req,res,next)=>
// {
//     try{
//         const user=await getUserFromDB()
//         res.status(200).json(new ApiResponse(200,{message : "Server is running"}));
//     }catch(error){
//         next(error);
//     };
// }; this is manual try catch block instead of this we can do an asynceventhandler which takes the request handler as input and returns a funciton which resolves that event using the request handler and if any error comes it gets caught
const healthcheck=asynchandler(async (req,res,next) =>{res.status(200).json(new ApiResponse(200,{message:"Server is running"}))})
export {healthcheck};