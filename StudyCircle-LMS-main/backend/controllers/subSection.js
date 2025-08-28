const Section = require('../models/section');
const SubSection = require('../models/subSection');
const { uploadImageToCloudinary } = require('../utils/imageUploader');



// ================ create SubSection ================
exports.createSubSection = async (req, res) => {
    try {
        console.log('=== CREATE SUBSECTION REQUEST ===');
        console.log('Request Body:', req.body);
        console.log('Request Files:', req.files);
        
        // extract data
        const { title, description, sectionId, lectureType, content, externalLink, questions } = req.body;

        // validation
        if (!title || !description || !sectionId || !lectureType) {
            console.log('Missing required fields:', { title, description, sectionId, lectureType });
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        let subSectionData = {
            title,
            description,
            lectureType
        };

        // Handle different lecture types
        if (lectureType === 'video') {
            const videoFile = req.files?.video;
            if (!videoFile) {
                return res.status(400).json({
                    success: false,
                    message: 'Video file is required for video lectures'
                });
            }
            // upload video to cloudinary
            const videoFileDetails = await uploadImageToCloudinary(videoFile, process.env.FOLDER_NAME);
            subSectionData.timeDuration = videoFileDetails.duration;
            subSectionData.videoUrl = videoFileDetails.secure_url;
        } else if (lectureType === 'reading') {
            if (!content && !externalLink) {
                return res.status(400).json({
                    success: false,
                    message: 'Content or external link is required for reading lectures'
                });
            }
            if (content) subSectionData.content = content;
            if (externalLink) subSectionData.externalLink = externalLink;
        } else if (lectureType === 'quiz') {
            let parsedQuestions;
            try {
                // Parse questions if it's a JSON string
                parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
            } catch (parseError) {
                console.log('Error parsing questions:', parseError);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid questions format'
                });
            }
            
            if (!parsedQuestions || !Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Questions are required for quiz lectures'
                });
            }
            // Validate quiz questions
            for (let i = 0; i < parsedQuestions.length; i++) {
                const question = parsedQuestions[i];
                if (!question.questionText || !question.options || !Array.isArray(question.options) || 
                    question.options.length < 2 || question.correctAnswer === undefined || 
                    question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid question format at index ${i}`
                    });
                }
            }
            subSectionData.questions = parsedQuestions;
            subSectionData.totalQuestions = parsedQuestions.length;
        }

        console.log('SubSection data to create:', subSectionData);

        // create entry in DB
        const SubSectionDetails = await SubSection.create(subSectionData);

        // link subsection id to section
        // Update the corresponding section with the newly created sub-section
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: SubSectionDetails._id } },
            { new: true }
        ).populate("subSection")

        console.log('SubSection created successfully:', SubSectionDetails._id);

        // return response
        res.status(200).json({
            success: true,
            data: updatedSection,
            message: 'SubSection created successfully'
        });
    }
    catch (error) {
        console.log('Error while creating SubSection');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while creating SubSection'
        })
    }
}



// ================ Update SubSection ================
exports.updateSubSection = async (req, res) => {
    try {
        console.log('=== UPDATE SUBSECTION REQUEST ===');
        console.log('Request Body:', req.body);
        console.log('Request Files:', req.files);
        
        const { sectionId, subSectionId, title, description, lectureType, content, externalLink, questions } = req.body;

        // validation
        if (!subSectionId) {
            return res.status(400).json({
                success: false,
                message: 'subSection ID is required to update'
            });
        }

        // find in DB
        const subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }

        // add data
        if (title) {
            subSection.title = title;
        }

        if (description) {
            subSection.description = description;
        }

        if (lectureType) {
            subSection.lectureType = lectureType;
        }

        // Handle different lecture types
        if (lectureType === 'video' || subSection.lectureType === 'video') {
            // upload video to cloudinary
            if (req.files && req.files.videoFile !== undefined) {
                const video = req.files.videoFile;
                const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
                subSection.videoUrl = uploadDetails.secure_url;
                subSection.timeDuration = uploadDetails.duration;
            }
        } else if (lectureType === 'reading' || subSection.lectureType === 'reading') {
            if (content !== undefined) subSection.content = content;
            if (externalLink !== undefined) subSection.externalLink = externalLink;
        } else if (lectureType === 'quiz' || subSection.lectureType === 'quiz') {
            if (questions !== undefined) {
                let parsedQuestions;
                try {
                    // Parse questions if it's a JSON string
                    parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
                } catch (parseError) {
                    console.log('Error parsing questions:', parseError);
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid questions format'
                    });
                }
                
                // Validate quiz questions
                for (let i = 0; i < parsedQuestions.length; i++) {
                    const question = parsedQuestions[i];
                    if (!question.questionText || !question.options || !Array.isArray(question.options) || 
                        question.options.length < 2 || question.correctAnswer === undefined || 
                        question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
                        return res.status(400).json({
                            success: false,
                            message: `Invalid question format at index ${i}`
                        });
                    }
                }
                subSection.questions = parsedQuestions;
                subSection.totalQuestions = parsedQuestions.length;
            }
        }

        // save data to DB
        await subSection.save();

        const updatedSection = await Section.findById(sectionId).populate("subSection")

        console.log('SubSection updated successfully:', subSectionId);

        return res.json({
            success: true,
            data: updatedSection,
            message: "Section updated successfully",
        });
    }
    catch (error) {
        console.error('Error while updating the section')
        console.error(error)
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while updating the section",
        })
    }
}



// ================ Delete SubSection ================
exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )

        // delete from DB
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" })
        }

        const updatedSection = await Section.findById(sectionId).populate('subSection')

        // In frontned we have to take care - when subsection is deleted we are sending ,
        // only section data not full course details as we do in others 

        // success response
        return res.json({
            success: true,
            data: updatedSection,
            message: "SubSection deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,

            error: error.message,
            message: "An error occurred while deleting the SubSection",
        })
    }
}