import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import { resetCart } from "../../slices/cartSlice";

const { COURSE_VERIFY_API } = studentEndpoints;

// ================ Simplified Course Enrollment (No Payment) ================ 
export async function enrollCourseDirectly(token, coursesId, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Enrolling in course...");

    try {
        console.log('=== DIRECT ENROLLMENT STARTED ===');
        console.log('Courses to enroll:', coursesId);
        console.log('User:', userDetails);

        // Create a mock payment verification response
        const mockPaymentData = {
            razorpay_order_id: `mock_order_${Date.now()}`,
            razorpay_payment_id: `mock_payment_${Date.now()}`,
            razorpay_signature: 'mock_signature',
            coursesId: coursesId
        };

        // Call the verify payment API directly with mock data
        const response = await apiConnector("POST", COURSE_VERIFY_API, mockPaymentData, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        // Success - course enrolled
        toast.success("Course enrolled successfully!");
        console.log("Course enrolled successfully:", response.data);
        
        // Clear cart if enrolling from cart
        if (coursesId.length > 1) {
            dispatch(resetCart());
        }
        
        // Navigate to enrolled courses
        navigate("/dashboard/enrolled-courses");
        
    } catch (error) {
        console.log("DIRECT ENROLLMENT ERROR.....", error);
        toast.error(error.response?.data?.message || "Failed to enroll in course");
    }
    
    toast.dismiss(toastId);
}

// ================ buyCourse ================ 
export async function buyCourse(token, coursesId, userDetails, navigate, dispatch) {
    // For now, redirect to direct enrollment
    // This bypasses all payment processing
    await enrollCourseDirectly(token, coursesId, userDetails, navigate, dispatch);
}