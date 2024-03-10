import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggle = async(data, name) => {

    let like = await Like.findOne(data)

    if(like) {
        await like.deleteOne()
        return new ApiResponse(200, `like removed from ${name}`)
    } else {
        like = await Like.create(data)
        return new ApiResponse(200, like, `like added to ${name}`)
    }

}

const toggleVideoLike = asyncHandler(async (req, res) => {

    const {videoId} = req.params

    const response = await toggle({video:videoId, likeBy:req.user._id}, "video")

    return res.status(200).json(response)

})

const toggleCommentLike = asyncHandler(async (req, res) => {

    const {commentId} = req.params

    const response = await toggle({comment:commentId, likeBy:req.user._id}, "comment")

    return res.status(200).json(response)
    
})

const toggleTweetLike = asyncHandler(async (req, res) => {

    const {tweetId} = req.params

    const response = await toggle({tweet:tweetId, likeBy:req.user._id}, "tweet")

    return res.status(200).json(response)

})

const getLikedVideos = asyncHandler(async (req, res) => {

    const videos = await Like.find({likeBy: req.user._id}).select('video')

    return res.status(200).json(new ApiResponse(200, videos, "liked videos"))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}