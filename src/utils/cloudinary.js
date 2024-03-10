import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
    api_key: process.env.CLOUDNARY_API_KEY,
    api_secret: process.env.CLOUDNARY_API_SECRET, 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

const deleteOldFile = async (imageURL) => {

    try {
        const public_id = imageURL.split("/").pop().split(".")[0];
        const response = await cloudinary.uploader.destroy(public_id, { invalidate: true })
        return response
    } catch (error) {
        return null; 
    }
    

}

export {uploadOnCloudinary, deleteOldFile}
