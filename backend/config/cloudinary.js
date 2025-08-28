const cloudinary = require("cloudinary").v2;

exports.cloudinaryConnect = () => {
	try {
		console.log('🔧 Starting Cloudinary configuration...');
		
		// Check if environment variables are set
		if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
			console.log('❌ Cloudinary configuration missing!');
			console.log('Required environment variables:');
			console.log('- CLOUD_NAME:', process.env.CLOUD_NAME ? '✅ Set' : '❌ Missing');
			console.log('- API_KEY:', process.env.API_KEY ? '✅ Set' : '❌ Missing');
			console.log('- API_SECRET:', process.env.API_SECRET ? '✅ Set' : '❌ Missing');
			console.log('Please check your .env file');
			return false;
		}

		console.log('✅ Environment variables found:');
		console.log('- CLOUD_NAME:', process.env.CLOUD_NAME);
		console.log('- API_KEY:', process.env.API_KEY ? '✅ Set' : '❌ Missing');
		console.log('- API_SECRET:', process.env.API_SECRET ? '✅ Set' : '❌ Missing');

		// Configure Cloudinary
		cloudinary.config({
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.API_KEY,
			api_secret: process.env.API_SECRET,
		});

		console.log('🔧 Cloudinary configured, testing connection...');

		// Test the connection with better error handling
		cloudinary.api.ping()
			.then((result) => {
				console.log('✅ Cloudinary connected successfully!');
				console.log('Ping result:', result);
				console.log('Cloud Name:', process.env.CLOUD_NAME);
				console.log('API Key:', process.env.API_KEY ? '✅ Set' : '❌ Missing');
				console.log('API Secret:', process.env.API_SECRET ? '✅ Set' : '❌ Missing');
			})
			.catch((error) => {
				console.log('❌ Cloudinary connection test failed!');
				console.log('Error details:', error);
				console.log('Error message:', error.message);
				console.log('Error code:', error.http_code);
				console.log('Error status:', error.http_status);
				
				// Check for common Cloudinary errors
				if (error.http_code === 401) {
					console.log('🔍 This looks like an authentication error. Please check your API key and secret.');
				} else if (error.http_code === 404) {
					console.log('🔍 This looks like a cloud name error. Please check your cloud name.');
				}
			});

		return true;
	} catch (error) {
		console.log('❌ Error in Cloudinary configuration:', error);
		console.log('Error stack:', error.stack);
		return false;
	}
};


