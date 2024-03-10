import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name || !description) {
        throw new ApiError(
            400,
            `${!name ? "name": ""}${(!name && !description)? " and ": ""}${!description ? "description":""} is required`) 
    }

    const playlist =  await Playlist.create({
        name,
        description,
        owner:new mongoose.Types.ObjectId(req.user._id)
    })

    if(!playlist) {
        throw new ApiError(500,"something went wrong while creating the playlist")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "playlist created"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {

    const {userId} = req.params

    const playlist =  await Playlist.find({owner : userId})

    return res.status(200).json(new ApiResponse(200, playlist))

})

const getPlaylistById = asyncHandler(async (req, res) => {

    const {playlistId} = req.params

    const playlist = await Playlist.findById(playlistId)

    return res.status(200).json(new ApiResponse(200, playlist))
    
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {

    const {playlistId, videoId} = req.params
    
    const video = await Video.findById(videoId)
    
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push :{
                videos : video
            }
        },
        {new : true}
    )

    if(!playlist) {
        throw new ApiError(500,"something went wrong while video added to playlist")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "video added to playlist successfully"))
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    const {playlistId, videoId} = req.params
    
    try {
        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $pull :{
                    videos : videoId
                }
            },
            {new : true}
            )

        return res.status(200).json(new ApiResponse(200, playlist, "video removed from playlist successfully"))

    } catch (error) {
        throw new ApiError(500,"something went wrong while removing video from playlist")
    }

})

const deletePlaylist = asyncHandler(async (req, res) => {

    const {playlistId} = req.params

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if(!playlist) {
        return res.status(200).json(new ApiResponse(200, "playlist not found"))
    }

    return res.status(200).json(new ApiResponse(200, "playlist deleted successfully"))
    
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if(!name || !description) {
        throw new ApiError(
            400,
            `${!name ? "name": ""}${(!name && !description)? " and ": ""}${!description ? "description":""} is required`) 
    }

    const playlist =  await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        },
        {new : true}
    )

    if(!playlist) {
        throw new ApiError(500,"soething went wrong updating the playlist")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "playlist updated"))

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
