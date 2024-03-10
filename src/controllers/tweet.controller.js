import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body

    try {
        const tweet = await Tweet.create({
            content,
            owner: req.user._id
        })
    
        return res.status(200).json(new ApiResponse(200,tweet, "tweet created successfully"))
    } catch (error) {
        throw new ApiError(500, `something went wrong while creating tweet ${error}`) 
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params

    try {
        const tweets = await Tweet.find({
            owner: userId
        })
        return res.status(200).json(new ApiResponse(200,tweets, "tweets retrieved successfully"))
    } catch (error) {
        throw new ApiError(500, `something went wrong while retrieving tweets ${error}`) 
    }
})

const updateTweet = asyncHandler(async (req, res) => {

    const {tweetId} = req.params
    const {newContent} = req.body

    try {
        const updatedTweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {
                $set : {
                    content : newContent
                }
            },
            {new : true}
        )
        return res.status(200).json(new ApiResponse(200,updatedTweet, "tweet updated successfully"))
    } catch (error) {
        throw new ApiError(500, `something went wrong while updating tweet ${error}`) 
    }
})

const deleteTweet = asyncHandler(async (req, res) => {

    const {tweetId} = req.params

    try {
        const tweet = await Tweet.findByIdAndDelete(tweetId)
    
        return res.status(200).json(new ApiResponse(200, "tweet deleted successfully"))
    } catch (error) {
        throw new ApiError(500, `something went wrong while deleting tweet ${error}`) 
    }

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
