import mongoose,{isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    // verify if the user logged in
    // using user's userId get total video views and total videos by mongoose aggregation pipelines
    // search db by channelId to find total subscribers and return the length of that array
    // create a final object
    // return response

    const userId = req.user._id;
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"User not logged in");

    }
    const videoStats = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"           
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likes"
                }
            }
        },
        {
            $group:{
                _id:null,
                totalViews:{
                    $sum:"$views"
                },
                totalVideos:{
                    $sum:1
                },
                totalLikes:{
                    $sum:"$likesCount"
                }
            }
        },
        {
            $project:{
                _id:0,
                totalViews:1,
                totalVideos:1,
                totalLikes:1
            }

        }
    ]);

    const totalSubscribers = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(userId)           
            }
        },
        {
            $group:{
                _id:null,
                subscriberCount:{
                    $sum:1
                }
            }
        },
        {
            $project:{
                _id:0,
                subscriberCount:1
            
            }
        }
    ])

    const stats = {
        totalViews:videoStats.length > 0 ? videoStats[0].totalViews : 0,
        totalVideos:videoStats.length > 0 ? videoStats[0].totalVideos : 0,
        totalLikes:videoStats.length > 0 ? videoStats[0].totalLikes : 0,
        totalSubscribers:totalSubscribers.length > 0 ? totalSubscribers[0].subscriberCount : 0
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,stats,"Channel stats fetched successfully")
    )
    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    // validate if user loggedin
    // find the videos by ownerId as userId
    // return response

    const userId = req.user._id;

    const videos = await Video.find(
        {
            owner:new mongoose.Types.ObjectId(userId)

        }
    ).select("-_id videoFile thumbnail title description duration views isPublished");

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"Channel videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }