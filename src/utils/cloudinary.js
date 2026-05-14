import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";  
import dotenv from "dotenv";
dotenv.config();

// Configuration
        cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
     // Click 'View API Keys' above to copy your API secret
    });
    

const uploadOnCloudinary = async function(localFilePath) {
      
    if(!localFilePath) return null;
    // Upload an image
     const uploadResult = await cloudinary.uploader
       .upload(localFilePath, {
               resource_type: 'auto',

           }
       )
       .catch((error) => {
           console.log(error);
           if(localFilePath)fs.unlinkSync(localFilePath);
           return null;
       });
    
    //console.log(uploadResult);
    if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
    }

    return uploadResult;
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    // const optimizeUrl = cloudinary.url(uploadResult.public_id, {
    //     fetch_format: 'auto',
    //     quality: 'auto'
    // });
    
    // console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    // const autoCropUrl = cloudinary.url('shoes', {
    //     crop: 'auto',
    //     gravity: 'auto',
    //     width: 500,
    //     height: 500,
    // });
    
    // console.log(autoCropUrl);    
};

export const deleteOnCloudinary = async function(publicId) {
    
    try {
        if(!publicId) return null;

        const result = await cloudinary.uploader.destroy(publicId);
        console.log(result);

        return result;
    } catch (error) {

        console.log(error.message);
        return null;
    }
}

export const getThumbnailUrl = function (publicId) {
    
    return cloudinary.url(publicId,{
        resource_type:"video",
        format:"jpg"
    })

}

export default uploadOnCloudinary;