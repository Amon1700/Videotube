import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteOldFile, uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const options = {
        page,
        limit,
    };

    const regex = new RegExp(query)

    const videos = await Video.aggregatePaginate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
                title: regex
            }
        },
        {
            $sort: {
                [sortBy]: Number(sortType)
            }
        },
    ], options)


    return res.status(200).json(new ApiResponse(200, { videos }, "ok"))

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    let videoFile

    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoFile = req.files.videoFile[0].path
    }

    if (!videoFile) {
        throw new ApiError(400, "video file is required")
    }

    let thumbnail

    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnail = req.files.thumbnail[0].path
    }

    if (!thumbnail) {
        throw new ApiError(400, "thumbnail file is required")
    }


    const videoFileUrl = await uploadOnCloudinary(videoFile)

    if (!videoFileUrl) {
        throw new ApiError(500, "something went wrong while uploading viedo file")
    }

    const thumbnailUrl = await uploadOnCloudinary(thumbnail)

    if (!thumbnailUrl) {
        throw new ApiError(500, "something went wrong while uploading thumbnail file")
    }

    const video = await Video.create({

        videoFile: videoFileUrl.url,
        thumbnail: thumbnailUrl.url,
        title: title,
        description: description,
        duration: videoFileUrl.duration,
        owner: req.user._id

    })

    if (!video) {
        throw new ApiError(500, "something went wrong while uploading video")
    }

    return res.status(200).json(new ApiResponse(200, video, "video uploaded successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc : {
                views: 1
            }
        },
        {new: true}
    )

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $push : {
                watchHistory: video
            }
        }
    )

    if (!video) {
        return res.status(200).json(new ApiResponse(200, "video not found"))
    }



    return res.status(200).json(new ApiResponse(200, video))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const { title, description} = req.body

    const thumbnail = req.file?.path

    const video = await Video.findById(videoId)

    if (!video) {
        return res.status(200).json(new ApiResponse(200, "video not found"))
    }
    
    const oldThumbnail = video.thumbnail

    const newThumbnail = await uploadOnCloudinary(thumbnail)

    if(!newThumbnail){
        throw new ApiError(400, "error while uploading file for thumbnail")
    }

    video.thumbnail = newThumbnail.url
    video.title = title
    video.description = description

    await video.save()

    await deleteOldFile(oldThumbnail)

    return res.status(200).json(new ApiResponse(200, video))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById({ _id: videoId })

    if (!video) {
        return res.status(200).json(new ApiResponse(200, "video not found"))
    }

    const videoFile = video.videoFile

    const thumbnail = video.thumbnail

    await deleteOldFile(videoFile)

    await deleteOldFile(thumbnail)

    await video.deleteOne()

    return res.status(200).json(new ApiResponse(200, "viedo deleted successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById({ _id: videoId })

    if (!video) {
        return res.status(200).json(new ApiResponse(200, "video not found"))
    }

    video.isPublished = !video.isPublished

    await video.save()

    return res.status(200).json(new ApiResponse(200, video, "toggled successfully"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
