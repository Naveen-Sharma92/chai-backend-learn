import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
cloudinary.config({ 
    cloud_name: process.env.CLOUDINERY_CLOUD_NAME, 
    api_key: process.env.CLOUDINERY_API_KEY, 
    api_secret:process.env.CLOUDINERY_API_SECRET  // Click 'View API Keys' above to copy your API secret

});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto"
            }
        );

        // file has been uploaded successful
        console.log("file is uploaded on cloudinary ", response.url);

        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved file as upload operation failed
        return null
    }
}

/*
const uploadResult = await cloudinary.uploader
       .upload(
           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
               public_id: 'shoes',
           }
       )
       .catch((error) => {
           console.log(error);
       });
    
    console.log(uploadResult);
    */
    export {uploadOnCloudinary}