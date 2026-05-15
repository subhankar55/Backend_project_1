import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    // collect the tweet text from req
    // get user details from req.user (only logged in user can tweet)
    // store these fields in db creating a new db document
    // return response
    const {content} = req.body;
    if(!content || content.trim() === ""){
        throw new ApiError(400,"Tweet content is required");
    }
    const tweet = await Tweet.create({
        content,
        owner:req.user._id
    })
    return res
    .status(201)
    .json(
         new ApiResponse(201,tweet,"Tweet created successfully")
    )


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    // get the user details from req
    // now search for tweets done by that user using find function for the db
    // now return the tweets as response
    const {userId} = req.params;
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id");
    }
    const tweets = await Tweet.find({
        owner:userId
    })

    if(!tweets?.length){
        throw new ApiError(404,"No tweets found");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,tweets,"Tweets fetched successfully")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    // get the tweetid to update
    // find the tweet from database
    // update the content
    // save the database
    // return response

    const {tweetId} = req.params;
    const {content} = req.body;
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id");
        }
    const tweet = await Tweet.findById(tweetId);
        if(!tweet){
        throw new ApiError(404,"Tweet not found");
    }
    tweet.content = content;
    await tweet.save({validateBeforeSave:false});   

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"Tweet updated successfully") 
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    // get tweet by its id
    // find the tweet from database by its id
    // delete the tweet
    // return res

    const {tweetId} = req.params;
    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"Tweet not found");
    }
    await tweet.deleteOne();
    return res
    .status(200)
    .json(
        new ApiResponse(200,null,"Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}