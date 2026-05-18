import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    // validate name and description
    // get userId from req.user: since playlist will be created by a loggedin user
    // validate userId also
    // create a new document by this info of Playlist schema and return that document in res


    if(!name || !description   ){
        throw new ApiError(400,"All fields are required");
    }
    const userId = req.user._id;
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"User not logged in or Invalid user id");
    }
    const playlist = await Playlist.create({
        name:name,
        description:description,
        owner:userId
    });
    if(!playlist){
        throw new ApiError(400,"Playlist creation failed");
    }
    return res
    .status(201)
    .json(
        new ApiResponse(201,playlist,"Playlist created successfully")
    )
    
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    // validate userId
    // do db search and get the playlist corresponding to the user
    // return playlist

    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id");
    }
    const playlists = await Playlist.find({
        owner:userId
    })
    console.log(playlists);
    if(!playlists?.length){
        throw new ApiError(404,"No playlist found");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlists,"Playlists fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    // validate playlistId
    // do db search and findout the playlist
    // return response

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id");
        }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist not found");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist fetched successfully")   
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    // TODO: add video to playlist
    // validate playlistId and videoId
    // do db search and get the playlist by playlistId
    // push the video in the videos array of the playlist
    // save the data 
    // return response

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id");
    }
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");
    }
    const playlist = await Playlist.findById(playlistId);

    playlist.videos.push(videoId);
    await playlist.save({validateBeforeSave:false});
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Video added to playlist successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    // validate playlistId and videoId
    // get playlist by playlistId
    // pull the video by its id from the videos array
    // save changes
    // return response

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id");

    }
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id");

    }

    const playlist = await Playlist.findById(playlistId);
    playlist.videos.pull(videoId);
    await playlist.save({validateBeforeSave:false});
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Video removed from playlist successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    // validate playlistId
    // do db search and get the playlist by playlistId
    // delete the playlist by playlistId
    // return response

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id");  
    }
    const playlist = await Playlist.findById(playlistId);
    playlist.delete;
    return res
    .status(200)
    .json(
        new ApiResponse(200,null,"Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    // validate playlistId
    // validate atleast name or description required to update
    // do db search and get the playlist by id
    // update the required field
    // save db
    // return res

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id");
    }
    if(!name && !description){
        throw new ApiError(400,"Atleast one field required to update");
    }
    const playlist = await Playlist.findById(playlistId);
    
    if(name){
        playlist.name = name;
    }
    if(description){
        playlist.description = description;
    }
    await playlist.save({validateBeforeSave:false});
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}