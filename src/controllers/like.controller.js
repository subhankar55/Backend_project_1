import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    // validate videoId
    // do db search and get the like document by videoId and userId
    // if existed delete
    // if does not exist create
    // return res

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id");
    }
    const like = await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    })
    if(like){
        await like.deleteOne();
        return res
        .status(200)
        .json(
            new ApiResponse(200,null,"Video unliked successfully")
        )
    }
    const newLike = await Like.create({
        video:videoId,
        likedBy:req.user._id
    })
    return res
    .status(201)
    .json(
        new ApiResponse(201,newLike,"Video liked successfully")
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    // validate commentId
    // do db search and get the like by commentId and userId
    // if exists delete
    // else create a new Like
    // return response

    if(!commentId || !mongoose.Types.ObjectId){
        throw new ApiError(400,"Invalid comment id");
    }
    const like = await Like.findOne({
        comment:commentId,
        likedBy:req.user._id
    })
    if(like){   
        await like.deleteOne();
        return res
        .status(200)
        .json(
            new ApiResponse(200,null,"Comment unliked successfully")
        )
    }

    const newLike = await Like.create({
        comment:commentId,
        likedBy:req.user._id
    })
    return res
    .status(201)
    .json(
        new ApiResponse(201,newLike,"Comment liked successfully")
    )
    

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    // validate tweetId 
    // do db search by tweetId and userId and get the like
    // if like exists delete it
    // else create a new one
    // return response
    if(!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Invalid tweet id");
    }
    const like = await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    })  
    if(like){
        await like.deleteOne();
        return res
        .status(200)
        .json(
            new ApiResponse(200,null,"Tweet unliked successfully")
        )

    }
    const newLike = await Like.create({
        tweet:tweetId,
        likedBy:req.user._id
    })
    return res
    .status(201)
    .json(
        new ApiResponse(201,newLike,"Tweet liked successfully")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    // check if user is logged in
    // find all the videos by userId
    // select only video and deselect id 
    // return response
    const userId = req.user._id;
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"User not logged in");
    }
    const videos = await Like.find({
        likedBy:userId
    }).select("-_id video");

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"Liked videos fetched successfully")  
    )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}