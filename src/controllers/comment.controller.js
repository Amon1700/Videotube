import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const option = {
        page,
        limit
    }

    try {
        
        const comments = await Comment.aggregatePaginate([
            {
                $match : {
                    viedo : new mongoose.Types.ObjectId(videoId) 
                }
            }
        ], option)

        return res.status(200).json(new ApiResponse(200,comments))

    } catch (error) {
        throw new ApiError(500, error)
    }

})

const addComment = asyncHandler(async (req, res) => {

    const {videoId} = req.params

    const {comment}= req.body

    console.log(videoId, comment)

    try {
        const commented = await Comment.create({
            content : comment,
            viedo : videoId,
            owner : req.user._id
        })
    
        return res.status(200).json(new ApiResponse(200, commented, "commented successfully"))
    } catch (error) {
        throw new ApiError(500, error)
    }

})

const updateComment = asyncHandler(async (req, res) => {

    const {commentId} = req.params

    const {newComment} = req.body

    try {
        const updatedCommnet = await Comment.findByIdAndUpdate(
            commentId,
            {
                $set : {
                    content : newComment
                }
            },
            { new : true}
    
        )
    
        return res.status(200).json(new ApiResponse(200, updatedCommnet, "comment updated successfully"))
    } catch (error) {
        throw new ApiError(500, error)
    }


})

const deleteComment = asyncHandler(async (req, res) => {
    
    const {commentId} = req.params

    try {
        const deleted = await Comment.findByIdAndDelete(commentId)
        return res.status(200).json(new ApiResponse(200, "comment deleted successfully"))
    } catch (error) {
        throw new ApiError(500, error)
    }

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
