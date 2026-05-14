import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import uploadOnCloudinary,{deleteOnCloudinary,getThumbnailUrl} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Subscription } from "../models/subscription.model.js";


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

// Extracting cloudinary upload public_id from url

const getPublicIdfromURL = (url) =>{

    const parts = url.split("/");
    const filename = parts.pop();
    const publicname = filename.split(".")[0];

    const publicId = `${publicname}`;
    return publicId;
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

const changeCurrentPassword = asyncHandler(
    async (req,res) => {
        const {currentPassword,newPassword} = req.body;

        const user = await User.findById(req.user?._id);
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

        if(!isPasswordCorrect){
            throw new ApiError(401,"Invalid password");
        }

        user.password = newPassword;
        await user.save({validateBeforeSave:false});

        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Password changed successfully")
        )

    }
)

const getCurrentUser = asyncHandler(
    async (req,res) => {
        return res
        .status(200)
        .json(
            new ApiResponse(200,req.user,"current user fetched successfully")
        )

    }

)

const updateAccountDetails = asyncHandler(
    async (req,res) => {
        const {fullname,email} = req.body;

        if(!fullname || !email){
            throw new ApiError(400,"All fields are required");

        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    fullname,
                    email
                }
            },
            {new: true}
        ).select("-password -refreshToken");

        return res
        .status(200)
        .json(
            new ApiResponse(200,user,"Account details updated successfully")
        )

    }

)

const updateUserAvatar = asyncHandler(
    async (req,res) => {
        const avatarLocalPath = req.file?.path;
        
        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is missing");

        }
        const oldAvatar = req.user.avatar;
        if(oldAvatar){
            const publicId = getPublicIdfromURL(oldAvatar);
            const result = await deleteOnCloudinary(publicId);
            if(!result){
                throw new ApiError(500,"Avatar deletion failed");

            }

        }
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        
        if(!avatar.url){
            throw new ApiError(400,"Avatar upload failed");

        }

        const user =await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    avatar:avatar.url
                }
            },
            {new: true}
        ).select("-password -refreshToken");

        return res
        .status(200)    
        .json(
            new ApiResponse(200,user,"Avatar updated successfully")
        )

        
    }

);

const updateUsercoverImage = asyncHandler(
    async (req,res) => {
        const coverImageLocalPath = req.file?.path;
        
        if(!coverImageLocalPath){
            throw new ApiError(400,"coverImage file is missing");

        }
        const oldCoverImage = req.user.coverImage;
        if(oldCoverImage){
            const publicId = getPublicIdfromURL(oldCoverImage);
            const result = await deleteOnCloudinary(publicId);
            if(!result){
                throw new ApiError(500,"coverImage deletion failed");

            }

        }

        const coverImage = await uploadOnCloudinary(coverImageLocalPath);
        
        if(!coverImage.url){
            throw new ApiError(400,"coverImage upload failed");

        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    coverImage:coverImage.url
                }
            },
            {new: true}
        ).select("-password -refreshToken");

        return res
        .status(200)    
        .json(
            new ApiResponse(200,user,"coverImage updated successfully")
        )

        
    }

);

const getUserChannelProfile = asyncHandler(
    async (req,res) => { 

        const {username} = req.params;
        if(!username?.trim()){
            throw new ApiError(400,"Username is missing");

        }
        const channel = await User.aggregate([
            {
                $match:{
                    username: username?.toLowerCase()
                }
            },
            {
                 $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"channel",
                    as:"subscribers"

                 }
            },
            {
                $lookup:{

                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"subscriber",
                    as:"subscribedTo"
                }
            },
            {
                $addFields:{
                    subscribersCount:{
                        $size:"$subscribers"
                    },
                    subscribedToCount:{
                        $size:"$subscribedTo"
                    },
                    isSubscribed:{
                        $cond: {
                            if: {
                                $in: [req.user?._id, "$subscribers.subscriber"]
                            },
                            then: true,
                            else: false
                        }
                    }

                }
            },{
                $project:{
                    fullname:1,
                    username:1,
                    subscribersCount:1,
                    subscribedToCount:1,
                    isSubscribed:1,
                    avatar:1,
                    coverImage:1

                }
                    
            }
            
        ])

        if(!channel?.length){
            throw new ApiError(404,"Channel does not exists");

        }

        return res
        .status(200)
        .json(
            new ApiResponse(200,channel[0],"Channel profile fetched successfully")
        )


      }

);

const getWatchHistory = asyncHandler(
    async (req,res) => {
        const user = await User.aggregate([
            {
                $match:{
                    _id: new mongoose.Types.ObjectId(req.user._id)
                
                
                }
            },
            {
                $lookup:{
                    from:"videos",
                    localField:"watchHistory",
                    foreignField:"_id",
                    as:"watchHistory",
                    pipeline:[
                        {
                            $lookup:{
                                from:"users",
                                localField:"owner",
                                foreignField:"_id",
                                as:"owner",
                                pipeline:[
                                    {
                                        $project:{
                                            fullname:1,
                                            username:1,
                                            avatar:1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields:{
                                owner:{
                                    $first: "$owner"
                                }
                            }
                        }
                    ]
                            
                }
            }
        ])
        return res
        .status(200)
        .json(
            new ApiResponse(200,user[0].watchHistory,"Watch history fetched successfully")
        )
    }
)


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverImage,
    getUserChannelProfile,
    getWatchHistory

};