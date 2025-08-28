const express = require('express')
const app = express();

// packages
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

// connection to DB and cloudinary
const { connectDB } = require('./config/database');
const { cloudinaryConnect } = require('./config/cloudinary');

// routes
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');
const courseRoutes = require('./routes/course');


// middleware 
app.use(express.json()); // to parse json body
app.use(cookieParser());
app.use(
    cors({
        // origin: 'http://localhost:5173', // frontend link
        origin: "*",
        credentials: true
    })
);
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp',
        debug: true, // Enable debug mode
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
        abortOnLimit: true,
        responseOnLimit: "File size limit has been reached",
        createParentPath: true,
        parseNested: true,
        preserveExtension: true,
        safeFileNames: true,
        uriDecodeFileNames: true
    })
)


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Started on PORT ${PORT}`);
});

// connections
connectDB();
cloudinaryConnect();

// mount route
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/course', courseRoutes);




// Default Route
app.get('/', (req, res) => {
    // console.log('Your server is up and running..!');
    res.send(`<div>
    This is Default Route  
    <p>Everything is OK</p>
    </div>`);
})

// Debug route to check environment variables and file upload
app.post('/debug/upload', (req, res) => {
    console.log('=== DEBUG UPLOAD ROUTE ===');
    console.log('Environment Variables:');
    console.log('- PORT:', process.env.PORT);
    console.log('- CLOUD_NAME:', process.env.CLOUD_NAME);
    console.log('- API_KEY:', process.env.API_KEY ? 'Set' : 'Missing');
    console.log('- API_SECRET:', process.env.API_SECRET ? 'Set' : 'Missing');
    console.log('- FOLDER_NAME:', process.env.FOLDER_NAME);
    
    console.log('Request Files:', req.files);
    console.log('Request Body:', req.body);
    
    if (req.files && req.files.testFile) {
        const file = req.files.testFile;
        console.log('File Details:');
        console.log('- Name:', file.name);
        console.log('- Size:', file.size);
        console.log('- Mimetype:', file.mimetype);
        console.log('- Temp Path:', file.tempFilePath);
    }
    
    res.json({
        message: 'Debug info logged to console',
        envVars: {
            PORT: process.env.PORT,
            CLOUD_NAME: process.env.CLOUD_NAME,
            API_KEY: process.env.API_KEY ? 'Set' : 'Missing',
            API_SECRET: process.env.API_SECRET ? 'Set' : 'Missing',
            FOLDER_NAME: process.env.FOLDER_NAME
        },
        files: Object.keys(req.files || {}),
        body: req.body
    });
});

// Debug route to test subsection creation
app.post('/debug/subsection', (req, res) => {
    console.log('=== DEBUG SUBSECTION ROUTE ===');
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);
    
    res.json({
        message: 'Subsection debug info logged to console',
        body: req.body,
        files: Object.keys(req.files || {}),
        contentType: req.headers['content-type']
    });
});

// Test route to directly test subsection creation
app.post('/test/subsection', async (req, res) => {
    try {
        console.log('=== TEST SUBSECTION CREATION ===');
        console.log('Request Body:', req.body);
        console.log('Request Files:', req.files);
        
        // Simulate the createSubSection logic
        const { title, description, sectionId, lectureType, content, externalLink, questions } = req.body;
        
        if (!title || !description || !sectionId || !lectureType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                received: { title, description, sectionId, lectureType }
            });
        }
        
        let subSectionData = {
            title,
            description,
            lectureType
        };
        
        if (lectureType === 'reading') {
            if (!content && !externalLink) {
                return res.status(400).json({
                    success: false,
                    message: 'Content or external link is required for reading lectures'
                });
            }
            if (content) subSectionData.content = content;
            if (externalLink) subSectionData.externalLink = externalLink;
        }
        
        res.json({
            success: true,
            message: 'Subsection validation passed',
            data: subSectionData,
            received: req.body
        });
        
    } catch (error) {
        console.error('Test subsection error:', error);
        res.status(500).json({
            success: false,
            message: 'Test failed',
            error: error.message
        });
    }
});

// Debug route to check all categories and courses
app.get('/debug/categories', async (req, res) => {
    try {
        const Category = require('./models/category');
        const Course = require('./models/course');
        
        console.log('=== DEBUG CATEGORIES ===');
        
        // Get all categories
        const categories = await Category.find({});
        console.log('Total categories:', categories.length);
        
        // Get all courses
        const courses = await Course.find({});
        console.log('Total courses:', courses.length);
        
        // Check courses by status
        const draftCourses = courses.filter(c => c.status === 'Draft');
        const publishedCourses = courses.filter(c => c.status === 'Published');
        console.log('Draft courses:', draftCourses.length);
        console.log('Published courses:', publishedCourses.length);
        
        // Check categories with courses
        const categoriesWithCourses = await Category.find({}).populate('courses');
        console.log('Categories with courses:');
        categoriesWithCourses.forEach(cat => {
            console.log(`- ${cat.name}: ${cat.courses.length} courses`);
            if (cat.courses.length > 0) {
                cat.courses.forEach(course => {
                    console.log(`  * ${course.courseName} (${course.status})`);
                });
            }
        });
        
        res.json({
            message: 'Categories debug info logged to console',
            summary: {
                totalCategories: categories.length,
                totalCourses: courses.length,
                draftCourses: draftCourses.length,
                publishedCourses: publishedCourses.length
            }
        });
        
    } catch (error) {
        console.error('Debug categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug failed',
            error: error.message
        });
    }
});

// Debug route to check user enrolled courses
app.get('/debug/user/:userId/courses', async (req, res) => {
    try {
        const User = require('./models/user');
        const Course = require('./models/course');
        const CourseProgress = require('./models/courseProgress');
        
        const userId = req.params.userId;
        console.log('=== DEBUG USER COURSES ===');
        console.log('User ID:', userId);
        
        // Get user with courses
        const user = await User.findById(userId).populate('courses');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        console.log('User:', user.firstName, user.lastName);
        console.log('Enrolled courses count:', user.courses.length);
        
        // Check each course
        const courseDetails = [];
        for (const course of user.courses) {
            const fullCourse = await Course.findById(course._id).populate('courseContent');
            const progress = await CourseProgress.findOne({ userId, courseID: course._id });
            
            courseDetails.push({
                id: course._id,
                name: course.courseName,
                status: course.status,
                contentSections: fullCourse?.courseContent?.length || 0,
                progress: progress ? progress.completedVideos.length : 0
            });
            
            console.log(`- ${course.courseName} (${course.status})`);
            console.log(`  Content sections: ${fullCourse?.courseContent?.length || 0}`);
            console.log(`  Progress: ${progress ? progress.completedVideos.length : 0} videos completed`);
        }
        
        res.json({
            message: 'User courses debug info logged to console',
            userId,
            userInfo: {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                totalCourses: user.courses.length
            },
            courses: courseDetails
        });
        
    } catch (error) {
        console.error('Debug user courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug failed',
            error: error.message
        });
    }
});

// Test route to check environment variables
app.get('/debug/env', (req, res) => {
    res.json({
        message: 'Environment variables check',
        envVars: {
            PORT: process.env.PORT,
            CLOUD_NAME: process.env.CLOUD_NAME,
            API_KEY: process.env.API_KEY ? 'Set' : 'Missing',
            API_SECRET: process.env.API_SECRET ? 'Set' : 'Missing',
            FOLDER_NAME: process.env.FOLDER_NAME,
            NODE_ENV: process.env.NODE_ENV
        }
    });
});