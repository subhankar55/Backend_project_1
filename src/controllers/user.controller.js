import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});
        return {
            accessToken,
            refreshToken
        };
        
    } catch (error) {
        throw new ApiError(500,error.message);
    }
}


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

        console.log(req.files);

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

const loginUser = asyncHandler(
    async (req,res) => {
        // req body -> data
        // username or email
        // find the user
        // password check
        // access and refresh token
        // send cookie
        const {email,username,password} = req.body;
        if(!username && !email){
            throw new ApiError(400,"Username or email is required");

        }
        const user = await User.findOne({
            $or:[{username},{email}]
        })
        if(!user){
            throw new ApiError(400,"User not found");
        }

        // methods defined by us are available in the User instance named "user" not in User whose methods are defined by mongoose
        const isPasswordValid = await user.isPasswordCorrect(password);
        if(!isPasswordValid){
            throw new ApiError(401,"Invalid password");
        }
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
        
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
        
        // send to cookie
        // before sending we need to configure some options for security
        const options = {
            httpOnly:true,
            secure : true
        }
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(200,loggedInUser,"User logged in successfully")
        )

    }
)

const logoutUser = asyncHandler(
    async (req,res) => {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new:true
            }
        );
        const options = {
            httpOnly:true,
            secure : true
        }
        return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(
            new ApiResponse(200,null,"User logged out successfully")
        );
        
    }
)

const refreshAccessToken = asyncHandler(
    async (req,res) => {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if(!incomingRefreshToken){
            throw new ApiError(401,"Unauthorized request");
        }
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.ACCESS_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken._id);
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token");
        }
        if(user.refreshToken !== incomingRefreshToken){
            throw new ApiError(401,"Refresh Token is expired or used");
        }
        const options = {
            httpOnly:true,
            secure : true
        }
        const {accessToken,newrefreshToken} = await generateAccessAndRefreshToken(user._id);

        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options) 
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken:newrefreshToken
                },
                "Access token refreshed successfully")
        )
    }
)


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken

};