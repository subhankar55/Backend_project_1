import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy="createdAt", sortType="desc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    // filter the videos based on query or userId or both based on availablity
    // sort them using sortBy and sortType 
    // then do the pagination by using skip
    // return the paginates videos

    const filter = {};

    if(query){
        filter.title = {
            $regex: query,
            $options: "i"
        }
    }
    if(userId && mongoose.Types.ObjectId.isValid(userId)){
        filter.owner = new mongoose.Types.ObjectId(userId)
    }

    const sortOptions = {};

    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    const limitNum = Number(limit) || 10;
    const pageNum = Number(page) || 1;

    const skip = (pageNum - 1) * limitNum;

    const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum)

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"Videos fetched successfully")
    )


})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}