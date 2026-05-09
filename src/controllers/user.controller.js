import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";


const registerUser = asyncHandler(
    async (req,res) => {
        //get user details from frontend
        //validation - not empty
        //check if user already exists: username, email
        //check for images , check for avatar
        //upload them to cloudinary
        //create user object - create entry in db
        //remove password and refresh token field from response
        // check for user creation
        //return response

        const {fullname,email,username,password} = req.body;
        console.log("email:",email);

        // if(fullName === ""){
        //     throw new ApiError(400,"Full name is required");
        // }
        if(
            [fullname,email,username,password].some((field)=>field?.trim() === "")
        ){
            throw new ApiError(400,"All fields are required");

        }
        const existedUser = await User.findOne({
            $or:[{username},{email}]
        })
        if(existedUser){
            throw new ApiError(400,"User with email or username already exists");
        }

        const avatarLocalPath = req.files?.avatar?.[0]?.path;
        const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar is required");

        }
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if(!avatar){
            throw new ApiError(400,"Avatar upload failed");
        }
        const user = await User.create({
            username:username.toLowerCase(),
            email,
            fullname,
            avatar:avatar.url,
            coverImage:coverImage?.url || "",
            password,

        })
        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        if(!createdUser){
            throw new ApiError(400,"User creation failed");
        }
        return res.status(201).json(
            new ApiResponse(201,createdUser,"User created successfully")
        )
    }
)

export default registerUser;