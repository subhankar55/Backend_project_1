import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import uploadOnCloudinary,{getThumbnailUrl, deleteOnCloudinary} from "../utils/cloudinary.js"

const getPublicIdfromURL = (url) =>{

    const parts = url.split("/");
    const filename = parts.pop();
    const publicId = filename.split(".")[0];

    if(!publicId) {
        throw new ApiError(500,"Public id not found");
    }

    return publicId;
}


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy="createdAt", sortType="desc", userId } = req.query;
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
    };
    if(userId && mongoose.Types.ObjectId.isValid(userId)){
        filter.owner = new mongoose.Types.ObjectId(userId)
    };

    const sortOptions = {};

    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

    const limitNum = Number(limit) || 10;
    const pageNum = Number(page) || 1;

    const skip = (pageNum - 1) * limitNum;

    const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"Videos fetched successfully")
    );


})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    // validate the info
    // upload the video file in local storage using multer
    // upload the video file to cloudinary
    // get video url
    // get thumbnail url
    // set title and description
    // get duration from cloudinary
    // keep views 0 for now
    // make is published true
    // and set the owner from user info
    // now return a response

    if([title,description].some((field) => field?.trim() === "")){
        throw new ApiError(400,"All fields are required");
    };

    const videoLocalPath = req.file?.path;
    
    if(!videoLocalPath){
        throw new ApiError(400,"Video file is missing");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);

    if(!videoFile){
        throw new ApiError(400,"Video upload failed");
    }

    const publicId = videoFile.public_id;

    const thumbnail = getThumbnailUrl(publicId);

    const video = await Video.create({
        videoFile:videoFile.url,
        thumbnail,
        title,
        description,
        duration:videoFile.duration,
        views:0,
        isPublished:true,
        owner:req.user._id
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201,video,"Video published successfully")
    )


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    // validate videoid
    // search in database
    // increment the view and save in db
    // return the video

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id");
    }
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video not found");
    }
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $push:{
                watchHistory:videoId
            }
        },
        {
            new:true
        }
    )

    video.views += 1;
    await video.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    // validate videoId
    // get other fields to update 
    // validate them
    // get video from database by db query
    // upload the new thumbnail to local path via multer
    // upload the new thumbnail in cloudinary and delete old one
    // collect the new thumbnail url 
    // update the necessary fields
    // return response

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id");
    }
    const {title,description} = req.body;

    const thumbnailLocalPath = req.file?.path;

    if((!title || title.trim() === "") &&
     (!description || description.trim() === "") && 
     !thumbnailLocalPath) {
        throw new ApiError(400,"Atleast one field required to update");
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }
    // delete the old thumbnail from cloudinary

    if(thumbnailLocalPath){
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if(!uploadedThumbnail){
            throw new ApiError(400,"Thumbnail upload failed");
        }

        const publicId = getPublicIdfromURL(video.thumbnail);
        const videoPublicId = getPublicIdfromURL(video.videoFile);
        if(publicId != videoPublicId){
            const result = await deleteOnCloudinary(publicId);
            if(!result){
                throw new ApiError(500,"Thumbnail deletion failed");
            }
        }
        
        video.thumbnail = uploadedThumbnail.url;
    }
    if(title){
        video.title = title;
    }
    if(description){
        video.description = description;
    }
    
    await video.save({validateBeforeSave:false});

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video updated successfully") 
        )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
    // validate the video id
    // access the video details by videoId from database
    // using video url findout the video publicId 
    // delete the video from cloudinary using publicId
    // delete the video details from database
    // return ok response

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }

    const publicId = getPublicIdfromURL(video.videoFile);
    const result = await deleteOnCloudinary(publicId,"video");
    if(!result){
        throw new ApiError(500,"Video deletion failed");
    }

    await video.deleteOne();

    return res
    .status(200)
    .json(
        new ApiResponse(200,null,"Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: toggle video publish status
    // validate videoid
    // get video details from videoId from db
    // toggle the status
    // return response
    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id");
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }
    video.isPublished = !video.isPublished;
    await video.save({validateBeforeSave:false});
    return res
    .status(200)        
    .json(
        new ApiResponse(200,video,"Video publish status toggled successfully")
    )

})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}