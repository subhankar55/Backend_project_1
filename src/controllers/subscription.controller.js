import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    // validate the given info
    // verify if the channel belongs to the user, if yes : we can not subscribe our own channel
    // check if user is already subscribed to the channel
    // if yes , then delete the subscription document regarding this
    // if no, create a new document
    // return response for both cases

    if(!channelId || !mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid channel id");
    }

    const channel = await User.findById(channelId);

    if(!channel) {
        throw new ApiError(404,"Channel not found");
    }

    if(channelId == req.user._id){
        throw new ApiError(400,"You cannot subscribe to your own channel");
    
    }

    const subscribedUser = await Subscription.findOne({
        subscriber:req.user._id,
        channel:channelId

    })

    if(subscribedUser){
        await subscribedUser.deleteOne();
        return res
        .status(200)
        .json(
            new ApiResponse(200,null,"Unsubscribed successfully")
        )
    }

    const newSubscription = await Subscription.create({
        subscriber:req.user._id,
        channel:channelId
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201,newSubscription,"Subscribed successfully")
    )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: get user channel subscribers
    // validate the channelId
    // aggregate the subscribers for the channel
    // return response

    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id");
    }
    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)

            }
        },{
            $group:{
                _id:"$channel",
                subscribers:{
                    $push:"$subscriber"
                }
            }
        }
    ])

    const subscribersList = subscribers.length > 0 ? subscribers[0].subscribers : [];
    return res
    .status(200)
    .json(
        new ApiResponse(200,subscribersList,"Subscribers fetched successfully")
    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    // TODO: list of channels , user subscribed to
    // validate subscriberId, 
    // aggregate the channels to whom user is subscribed
    // return response

    if(!subscriberId || !isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid subscriber id");
    }

    const channels = await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            
            }
        },{
            $group:{
                _id:"$subscriber",
                channels:{
                    $push:"$channel"
                }
            }
        }
    ])

    const subscribedChannels = channels.length > 0 ? channels[0].channels : [];

    return res
    .status(200)
    .json(
        new ApiResponse(200,subscribedChannels,"Subscribed channels fetched successfully")
    );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}