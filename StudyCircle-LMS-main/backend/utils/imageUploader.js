const cloudinary = require('cloudinary').v2;

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    try {
        // Check if file exists
        if (!file) {
            throw new Error('No file provided for upload');
        }

        // Check if file has tempFilePath
        if (!file.tempFilePath) {
            throw new Error('File does not have tempFilePath. Check if express-fileupload is configured properly.');
        }

        console.log('Uploading file to Cloudinary:', {
            filename: file.name,
            size: file.size,
            tempPath: file.tempFilePath,
            folder: folder
        });

        const options = { folder: folder || 'study-edtech' };
        if (height) options.height = height;
        if (quality) options.quality = quality;
        options.resource_type = 'auto';

        const result = await cloudinary.uploader.upload(file.tempFilePath, options);
        
        console.log('Upload successful:', {
            public_id: result.public_id,
            secure_url: result.secure_url,
            format: result.format
        });

        return result;
    }
    catch (error) {
        console.log("Error while uploading image to Cloudinary:");
        console.log("Error details:", error);
        
        // Check if it's a Cloudinary configuration error
        if (error.message && error.message.includes('cloud_name')) {
            throw new Error('Cloudinary not configured. Please check your environment variables (CLOUD_NAME, API_KEY, API_SECRET)');
        }
        
        throw new Error(`Image upload failed: ${error.message}`);
    }
}

// Function to delete a resource by public ID
exports.deleteResourceFromCloudinary = async (url) => {
    if (!url) return;

    try {
        const result = await cloudinary.uploader.destroy(url);
        console.log(`Deleted resource with public ID: ${url}`);
        console.log('Delete Resource result = ', result)
        return result;
    } catch (error) {
        console.error(`Error deleting resource with public ID ${url}:`, error);
        throw error;
    }
};