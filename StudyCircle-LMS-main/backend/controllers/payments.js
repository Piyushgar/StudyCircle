const Rajorpay = require('razorpay');
const instance = require('../config/rajorpay');
const crypto = require('crypto');
const mailSender = require('../utils/mailSender');
const { courseEnrollmentEmail } = require('../mail/templates/courseEnrollmentEmail');
require('dotenv').config();

const User = require('../models/user');
const Course = require('../models/course');
const CourseProgress = require("../models/courseProgress")


const { default: mongoose } = require('mongoose')


// ================ capture the payment and Initiate the 'Rajorpay order' ================
exports.capturePayment = async (req, res) => {

    // extract courseId & userId
    const { coursesId } = req.body;
    // console.log('coursesId = ', typeof (coursesId))
    // console.log('coursesId = ', coursesId)

    const userId = req.user.id;


    if (coursesId.length === 0) {
        return res.json({ success: false, message: "Please provide Course Id" });
    }

    let totalAmount = 0;

    for (const course_id of coursesId) {
        let course;
        try {
            // valid course Details
            course = await Course.findById(course_id);
            if (!course) {
                return res.status(404).json({ success: false, message: "Could not find the course" });
            }

            // check user already enrolled the course
            const uid = new mongoose.Types.ObjectId(userId);
            if (course.studentsEnrolled.includes(uid)) {
                return res.status(400).json({ success: false, message: "Student is already Enrolled" });
            }

            totalAmount += course.price;
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // create order
    const currency = "INR";
    const options = {
        amount: totalAmount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
    }

    // initiate payment using Rajorpay
    try {
        const paymentResponse = await instance.instance.orders.create(options);
        // return response
        res.status(200).json({
            success: true,
            message: paymentResponse,
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, mesage: "Could not Initiate Order" });
    }

}



// ================ verify the payment ================
exports.verifyPayment = async (req, res) => {
    try {
        const razorpay_order_id = req.body?.razorpay_order_id;
        const razorpay_payment_id = req.body?.razorpay_payment_id;
        const razorpay_signature = req.body?.razorpay_signature;
        const courses = req.body?.coursesId;
        const userId = req.user.id;
        
        console.log('Payment verification data:', {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            courses,
            userId
        });

        if (!courses || !userId) {
            return res.status(400).json({ 
                success: false, 
                message: "Courses or User ID missing" 
            });
        }

        // For mock/test payments (when payment IDs start with "mock_")
        if (razorpay_order_id && razorpay_order_id.startsWith('mock_')) {
            console.log('Processing mock payment - direct enrollment');
            try {
                await enrollStudents(courses, userId, res);
                return res.status(200).json({ 
                    success: true, 
                    message: "Course enrolled successfully (Test Mode)" 
                });
            } catch (enrollError) {
                return res.status(500).json({ 
                    success: false, 
                    message: "Enrollment failed",
                    error: enrollError.message 
                });
            }
        }

        // Real payment verification
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ 
                success: false, 
                message: "Payment verification data missing" 
            });
        }

        let body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            try {
                //enroll student
                await enrollStudents(courses, userId, res);
                //return res
                return res.status(200).json({ success: true, message: "Payment Verified" });
            } catch (enrollError) {
                return res.status(500).json({ 
                    success: false, 
                    message: "Enrollment failed after payment verification",
                    error: enrollError.message 
                });
            }
        }
        return res.status(400).json({ success: false, message: "Payment Failed - Invalid Signature" });

    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Payment verification failed",
            error: error.message 
        });
    }
}


// ================ enroll Students to course after payment ================
const enrollStudents = async (courses, userId, res) => {
    try {
        if (!courses || !userId) {
            throw new Error("Please Provide data for Courses or UserId");
        }

        console.log(`Enrolling user ${userId} in courses:`, courses);

        for (const courseId of courses) {
            try {
                // Check if user is already enrolled
                const existingCourse = await Course.findById(courseId);
                if (!existingCourse) {
                    throw new Error(`Course not found: ${courseId}`);
                }

                if (existingCourse.studentsEnrolled.includes(userId)) {
                    console.log(`User ${userId} already enrolled in course ${courseId}`);
                    continue; // Skip if already enrolled
                }

                //find the course and enroll the student in it
                const enrolledCourse = await Course.findOneAndUpdate(
                    { _id: courseId },
                    { $push: { studentsEnrolled: userId } },
                    { new: true },
                )

                if (!enrolledCourse) {
                    throw new Error(`Failed to enroll in course: ${courseId}`);
                }
                console.log("Updated course: ", enrolledCourse.courseName);

                // Check if course progress already exists
                let courseProgress = await CourseProgress.findOne({
                    courseID: courseId,
                    userId: userId
                });

                if (!courseProgress) {
                    // Initialize course progress with 0 percent
                    courseProgress = await CourseProgress.create({
                        courseID: courseId,
                        userId: userId,
                        completedVideos: [],
                    });
                }

                // Find the student and add the course to their list of enrolled courses
                const enrolledStudent = await User.findByIdAndUpdate(
                    userId,
                    {
                        $addToSet: { // Use $addToSet to avoid duplicates
                            courses: courseId,
                            courseProgress: courseProgress._id,
                        },
                    },
                    { new: true }
                )

                console.log("Enrolled student: ", enrolledStudent.firstName);

                // Send an email notification to the enrolled student
                try {
                    const emailResponse = await mailSender(
                        enrolledStudent.email,
                        `Successfully Enrolled into ${enrolledCourse.courseName}`,
                        courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
                    );
                    console.log("Email Sent Successfully");
                } catch (emailError) {
                    console.log("Email sending failed, but enrollment successful:", emailError);
                    // Don't fail the enrollment if email fails
                }
            }
            catch (error) {
                console.log(`Error enrolling in course ${courseId}:`, error);
                throw error; // Re-throw to be caught by outer try-catch
            }
        }

        console.log('All courses enrolled successfully');
        return true; // Return success indicator
    } catch (error) {
        console.error('Enrollment error:', error);
        throw error; // Re-throw to be handled by calling function
    }
}



exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body;

    const userId = req.user.id;

    if (!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({ success: false, message: "Please provide all the fields" });
    }

    try {
        // find student
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Recieved`,
            paymentSuccessEmail(`${enrolledStudent.firstName}`,
                amount / 100, orderId, paymentId)
        )
    }
    catch (error) {
        console.log("error in sending mail", error)
        return res.status(500).json({ success: false, message: "Could not send email" })
    }
}


// ================ verify Signature ================
// exports.verifySignature = async (req, res) => {
//     const webhookSecret = '12345678';

//     const signature = req.headers['x-rajorpay-signature'];

//     const shasum = crypto.createHmac('sha256', webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest('hex');


//     if (signature === digest) {
//         console.log('Payment is Authorized');

//         const { courseId, userId } = req.body.payload.payment.entity.notes;

//         try {
//             const enrolledCourse = await Course.findByIdAndUpdate({ _id: courseId },
//                 { $push: { studentsEnrolled: userId } },
//                 { new: true });

//             // wrong upper ?

//             if (!enrolledCourse) {
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Course not found'
//                 });
//             }

//             // add course id to user course list
//             const enrolledStudent = await User.findByIdAndUpdate(userId,
//                 { $push: { courses: courseId } },
//                 { new: true });

//             // send enrolled mail

//             // return response
//             res.status(200).json({
//                 success: true,
//                 message: 'Signature Verified and Course Added'
//             })
//         }

//         catch (error) {
//             console.log('Error while verifing rajorpay signature');
//             console.log(error);
//             return res.status(500).json({
//                 success: false,
//                 error: error.messsage,
//                 message: 'Error while verifing rajorpay signature'
//             });
//         }
//     }

//     else {
//         return res.status(400).json({
//             success: false,
//             message: 'Invalid signature'
//         });
//     }
// }