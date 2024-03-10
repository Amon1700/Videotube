import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const user = req.user._id

    try {
        const video = await Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(user),
                    isPublished: true
                }
            },
            {
                $group: {
                    _id: null,
                    total_views: {
                        $sum: "$views"
                    },
                    total_videos: {
                        $sum: 1
                    }
                }
            },
        ])
    
        const subscribers = await Subscription.aggregate([
            {
                $match: {
                    channel: user
                }
            },
            {
                $count: "total_subscribers"
            }
        ])
    
        const like = await Like.aggregate([
            {
                $match: {
                    likeBy: user
                }
            },
            {
                $count: "total_likes"
            }
        ])
        
        const data = {
            total_videos : video.length ? video[0]["total_videos"] ? video[0]["total_videos"] : 0 : 0,
            total_views : video.length ? video[0]["total_views"] ? video[0]["total_views"] :  0 : 0,
            total_subscribers : subscribers.length ? subscribers[0]["total_subscribers"] ? subscribers[0]["total_subscribers"] : 0 : 0,
            total_likes : like.length ? like[0]["total_likes"]? like[0]["total_likes"] : 0 : 0
        }
    
    
        return res.status(200).json(new ApiResponse(200, data, "channel stats"))
    } catch (error) {
        throw new ApiError(500, `something went wrong while retrieving channel stats ${error}`)
    }   
})

const getChannelVideos = asyncHandler(async (req, res) => {
    try {
        const videos = await Video.find({ owner: req.user._id })

        return res.status(200).json(new ApiResponse(200, { videos }, " all viedos retrieved successfully"))

    } catch (error) {
        throw new ApiError(500, `something went wrong while retrieving videos ${error}`)

    }
})

export {
    getChannelStats,
    getChannelVideos
}