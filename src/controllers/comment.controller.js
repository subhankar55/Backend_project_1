import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;
    // validate the videoId
    // do db search and get the comments by id 
    // skip (page-1)*limit comments 
    // set limit to get that amount of comments
    // return response

    if(!videoId || !mongoose.Types.ObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");
    }
    const skip = (Number(page) - 1) * Number(limit);

    const comments = await Comment.find({
        video:videoId
    })
    .skip(skip)
    .limit(Number(limit))
    .select("-_id content owner");
     return res
    .status(200)
    .json(
        new ApiResponse(200,comments,"Comments fetched successfully")   
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    // get videoId from req
    // get content from req
    // validate the videoId
    // validate the content
    // check if user logged in
    // create a new comment document
    // return response

    const {videoId} = req.params;
    const {content} = req.body;
    if(!videoId || !mongoose.Types.ObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");
    }
    if(content.trim() === ""){
        throw new ApiError(400,"Content is required");

    }
    if(!req.user._id){
        throw new ApiError(400,"User not logged in");

    }

    const newComment = await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })
    return res
    .status(201)
    .json(
        new ApiResponse(201,newComment,"Comment added successfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    // get the commentId to update
    // get the content
    // validate the commentId
    // validate the content
    // do db search and get the content by contentId
    // update the content field
    // save 
    // return res

    const {commentId} = req.params;
    const {content} = req.body;

    if(!commentId || !mongoose.Types.ObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id");
    
    }
    if(content.trim() === ""){
        throw new ApiError(400,"Content is required");
    }

    const updatedComment = await Comment.findById(commentId);
    updatedComment.content = content;
    await updatedComment.save({validateBeforeSave:false});
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedComment,"Comment updated successfully")
    )

})


const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    // get the commentId
    // validate commentId
    // get the the comment by commentId from db
    // delete the comment 
    // return response


    const commentId = req.params;

    if(!commentId || !mongoose.Types.ObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id");

    }

    const comment = await Comment.findById(commentId);
    await comment.deleteOne();
     return res
    .status(200)
    .json(
        new ApiResponse(200,null,"Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }