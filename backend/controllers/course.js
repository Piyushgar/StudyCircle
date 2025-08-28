const Course = require('../models/course');
const User = require('../models/user');
const Category = require('../models/category');
const Section = require('../models/section')
const SubSection = require('../models/subSection')
const CourseProgress = require('../models/courseProgress')

const { uploadImageToCloudinary, deleteResourceFromCloudinary } = require('../utils/imageUploader');
const { convertSecondsToDuration } = require("../utils/secToDuration")



// ================ create new course ================
exports.createCourse = async (req, res) => {
    try {
        console.log('=== COURSE CREATION STARTED ===');
        console.log('Request Body:', req.body);
        console.log('Request Files:', req.files);
        
        // extract data
        let { courseName, courseDescription, whatYouWillLearn, price, category, instructions: _instructions, status, tag: _tag } = req.body;

        // Convert the tag and instructions from stringified Array to Array
        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)

        console.log('Parsed Data:', {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            category,
            instructions,
            tag
        });

        // get thumbnail of course
        let thumbnail = req.files?.thumbnailImage;
        console.log('Thumbnail File:', thumbnail);
        console.log('All Files Received:', req.files);
        console.log('File Keys:', Object.keys(req.files || {}));
        
        // Check if thumbnail exists in different possible locations
        if (!thumbnail) {
            console.log('Thumbnail not found in req.files.thumbnailImage');
            console.log('Available files:', req.files);
            
            // Try to find the file with any name
            const fileKeys = Object.keys(req.files || {});
            if (fileKeys.length > 0) {
                console.log('Found files with names:', fileKeys);
                const firstFile = req.files[fileKeys[0]];
                console.log('First file details:', firstFile);
                
                // Use the first file as thumbnail
                if (firstFile && firstFile.tempFilePath) {
                    console.log('Using first file as thumbnail');
                    thumbnail = firstFile;
                }
            }
        }

        // validation
        if (!courseName || !courseDescription || !whatYouWillLearn || (price === undefined || price === null)
            || !category || !thumbnail || !instructions.length || !tag.length) {
            console.log('Validation Failed:', {
                courseName: !!courseName,
                courseDescription: !!courseDescription,
                whatYouWillLearn: !!whatYouWillLearn,
                price: price,
                category: !!category,
                thumbnail: !!thumbnail,
                instructionsLength: instructions.length,
                tagLength: tag.length
            });
            return res.status(400).json({
                success: false,
                message: 'All Fields are required (price can be 0 for free courses)'
            });
        }

        // Set price to 0 if not provided (free course)
        if (!price || price <= 0) {
            price = 0;
            console.log('Setting course price to 0 (free course)');
        }

        // Validate thumbnail file
        if (!thumbnail.tempFilePath) {
            console.log('Thumbnail validation failed - no tempFilePath');
            return res.status(400).json({
                success: false,
                message: 'Thumbnail file upload failed. Please try again.'
            });
        }

        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (thumbnail.size > maxSize) {
            console.log('File too large:', thumbnail.size, 'bytes');
            return res.status(400).json({
                success: false,
                message: 'Thumbnail file size should be less than 5MB'
            });
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(thumbnail.mimetype)) {
            console.log('Invalid file type:', thumbnail.mimetype);
            return res.status(400).json({
                success: false,
                message: 'Only JPEG, JPG, PNG, and WebP images are allowed'
            });
        }

        console.log('File validation passed:', {
            name: thumbnail.name,
            size: thumbnail.size,
            type: thumbnail.mimetype,
            tempPath: thumbnail.tempFilePath
        });

        // check current user is instructor or not , bcoz only instructor can create 
        // we have insert user id in req.user , (payload , while auth ) 
        const instructorId = req.user.id;
        console.log('Instructor ID:', instructorId);

        // check given category is valid or not
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            console.log('Category not found:', category);
            return res.status(401).json({
                success: false,
                message: 'Category Details not found'
            })
        }
        console.log('Category found:', categoryDetails.name);

        // upload thumbnail to cloudinary
        console.log('Starting Cloudinary upload...');
        let thumbnailDetails;
        try {
            thumbnailDetails = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME || 'study-edtech');
            if (!thumbnailDetails || !thumbnailDetails.secure_url) {
                throw new Error('Thumbnail upload failed');
            }
            console.log('Cloudinary upload successful:', thumbnailDetails.secure_url);
        } catch (uploadError) {
            console.log('Thumbnail upload error:', uploadError);
            return res.status(500).json({
                success: false,
                message: `Thumbnail upload failed: ${uploadError.message}`
            });
        }

        // create new course - entry in DB
        console.log('Creating course in database...');
        const newCourse = await Course.create({
            courseName, courseDescription, instructor: instructorId, whatYouWillLearn, price, category: categoryDetails._id,
            tag, status, instructions, thumbnail: thumbnailDetails.secure_url, createdAt: Date.now(),
        });
        console.log('Course created successfully:', newCourse._id);

        // add course id to instructor courses list, this is bcoz - it will show all created courses by instructor 
        await User.findByIdAndUpdate(instructorId,
            {
                $push: {
                    courses: newCourse._id
                }
            },
            { new: true }
        );
        console.log('Course added to instructor profile');

        // Add the new course to the Categories
        await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        );
        console.log('Course added to category');

        // return response
        console.log('=== COURSE CREATION COMPLETED ===');
        res.status(200).json({
            success: true,
            data: newCourse,
            message: 'New Course created successfully'
        })
    }

    catch (error) {
        console.log('=== COURSE CREATION ERROR ===');
        console.log('Error while creating new course');
        console.log('Error details:', error);
        console.log('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'User cannot be registered , Please try again..!'
        })
    }
}


// ================ show all courses ================
exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({},
            {
                courseName: true, courseDescription: true, price: true, thumbnail: true, instructor: true,
                ratingAndReviews: true, studentsEnrolled: true, category: true, tag: true
            })
            .populate({
                path: 'instructor',
                select: 'firstName lastName email image'
            })
            .populate({
                path: 'category',
                select: 'name description'
            })
            .exec();

        return res.status(200).json({
            success: true,
            data: allCourses,
            message: 'Data for all courses fetched successfully'
        });
    }

    catch (error) {
        console.log('Error while fetching data of all courses');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching data of all courses'
        })
    }
}



// ================ Get Course Details ================
exports.getCourseDetails = async (req, res) => {
    try {
        // get course ID
        const { courseId } = req.body;

        // find course details
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")

            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    select: "-videoUrl",
                },
            })
            .exec()


        //validation
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId}`,
            });
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        // console.log('courseDetails -> ', courseDetails)
        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        //return response
        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
            },
            message: 'Fetched course data successfully'
        })
    }

    catch (error) {
        console.log('Error while fetching course details');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching course details',
        });
    }
}


// ================ Get Full Course Details ================
exports.getFullCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        // console.log('courseId userId  = ', courseId, " == ", userId)

        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        //   console.log("courseProgressCount : ", courseProgressCount)

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        //   count total time duration of course
        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos ? courseProgressCount?.completedVideos : [],
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}



// ================ Edit Course Details ================
exports.editCourse = async (req, res) => {
    try {
        console.log('=== EDIT COURSE REQUEST ===');
        console.log('Request Body:', req.body);
        console.log('Request Files:', req.files);
        
        const { courseId, status, ...updates } = req.body
        
        if (!courseId) {
            console.log('Missing courseId in request body');
            return res.status(400).json({ 
                success: false,
                error: "Course ID is required" 
            });
        }
        
        console.log('Course ID:', courseId);
        console.log('Status update:', status);
        console.log('Other updates:', updates);
        
        const course = await Course.findById(courseId)

        if (!course) {
            console.log('Course not found with ID:', courseId);
            return res.status(404).json({ 
                success: false,
                error: "Course not found" 
            });
        }

        // If Thumbnail Image is found, update it
        if (req.files && req.files.thumbnailImage) {
            console.log("Updating thumbnail image");
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }

        // Handle status update separately
        if (status !== undefined) {
            console.log(`Updating course status from ${course.status} to ${status}`);
            course.status = status;
        }

        // Update other fields that are present in the request body
        for (const key in updates) {
            if (updates.hasOwnProperty(key) && key !== 'courseId') {
                try {
                    if (key === "tag" || key === "instructions") {
                        if (typeof updates[key] === 'string') {
                            course[key] = JSON.parse(updates[key])
                        } else {
                            course[key] = updates[key]
                        }
                    } else {
                        course[key] = updates[key]
                    }
                    console.log(`Updated field ${key}:`, course[key]);
                } catch (parseError) {
                    console.log(`Error parsing field ${key}:`, parseError);
                    return res.status(400).json({
                        success: false,
                        message: `Invalid format for field: ${key}`,
                        error: parseError.message
                    });
                }
            }
        }

        // updatedAt
        course.updatedAt = Date.now();

        console.log('Saving updated course...');
        console.log('Final course data:', {
            status: course.status,
            title: course.courseName,
            updatedAt: course.updatedAt
        });
        
        //   save data
        await course.save()

        const updatedCourse = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        console.log('Course updated successfully');

        // success response
        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        })
    } catch (error) {
        console.error('=== EDIT COURSE ERROR ===');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: "Error while updating course",
            error: error.message,
        })
    }
}



// ================ Get a list of Course for a given Instructor ================
exports.getInstructorCourses = async (req, res) => {
    try {
        // Get the instructor ID from the authenticated user or request body
        const instructorId = req.user.id

        // Find all courses belonging to the instructor
        const instructorCourses = await Course.find({ instructor: instructorId, }).sort({ createdAt: -1 })


        // Return the instructor's courses
        res.status(200).json({
            success: true,
            data: instructorCourses,
            // totalDurationInSeconds:totalDurationInSeconds,
            message: 'Courses made by Instructor fetched successfully'
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
        })
    }
}



// ================ Delete the Course ================
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body

        // Find the course
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        }

        // delete course thumbnail From Cloudinary
        await deleteResourceFromCloudinary(course?.thumbnail);

        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                    const subSection = await SubSection.findById(subSectionId)
                    if (subSection) {
                        await deleteResourceFromCloudinary(subSection.videoUrl) // delete course videos From Cloudinary
                    }
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Error while Deleting course",
            error: error.message,
        })
    }
}




