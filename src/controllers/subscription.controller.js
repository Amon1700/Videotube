import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    let subscription =  await Subscription.findOne({
        subscriber : req.user._id,
        channel : channelId
    })

    if(subscription) {
        await subscription.deleteOne()
        return res.status(200).json(new ApiResponse(200, "channel is unsubcribed"))
    } else {
        subscription =  await Subscription.create({
            subscriber : req.user._id,
            channel : channelId
        })
        return res.status(200).json(new ApiResponse(200, subscription, "channel is subcribed"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params
    try {
        const subscriber = await Subscription.find({channel : subscriberId})
        return res.status(200).json(new ApiResponse(200, subscriber, "list of subscriber"))
    } catch (error) {
        throw new ApiError(500, `something went wrong while retrieving subscriber ${error}`)

    }

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    
    const { channelId } = req.params

    try {
        const SubscribedChannels = await Subscription.find({subscriber : channelId})
        return res.status(200).json(new ApiResponse(200, SubscribedChannels, "list of subscribed channels"))
    } catch (error) {
        throw new ApiError(500, `something went wrong while retrieving subscribed channels ${error}`)
    }

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}