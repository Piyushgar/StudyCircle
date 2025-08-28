import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom"

import HighlightText from '../components/core/HomePage/HighlightText'
import CTAButton from "../components/core/HomePage/Button"
import Footer from '../components/common/Footer'
import Course_Slider from '../components/core/Catalog/Course_Slider'

import { getAllCourses } from '../services/operations/courseDetailsAPI'

import { FaArrowRight, FaGraduationCap, FaUsers, FaCertificate } from "react-icons/fa"

import { motion } from 'framer-motion'
import { fadeIn, } from './../components/common/motionFrameVarients';



const Home = () => {
    // get all courses data
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllCourses = async () => {
            setLoading(true);
            try {
                const courses = await getAllCourses();
                setAllCourses(courses || []);
            } catch (error) {
                console.error("Error fetching courses:", error);
                setAllCourses([]);
            } finally {
                setLoading(false);
            }
        }
        
        fetchAllCourses();
    }, [])


    return (
        <React.Fragment>
            <div className='bg-richblack-900'>
                {/* Hero Section */}
                <div className='relative h-[500px] justify-center mx-auto flex flex-col w-11/12 max-w-maxContent items-center text-white'>
                    <Link to={"/signup"}>
                        <div className='group p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200
                                        transition-all duration-200 hover:scale-95 w-fit mb-8'>
                            <div className='flex flex-row items-center gap-2 rounded-full px-8 py-[8px]
                              transition-all duration-200 group-hover:bg-richblack-900'>
                                <p>Become an Instructor</p>
                                <FaArrowRight />
                            </div>
                        </div>
                    </Link>

                    <motion.div
                        variants={fadeIn('up', 0.1)}
                        initial='hidden'
                        whileInView={'show'}
                        viewport={{ once: false, amount: 0.1 }}
                        className='text-center text-4xl lg:text-5xl font-bold mt-4'
                    >
                        Learn <HighlightText text={"Coding Skills"} /> Online
                    </motion.div>

                    <motion.div
                        variants={fadeIn('up', 0.2)}
                        initial='hidden'
                        whileInView={'show'}
                        viewport={{ once: false, amount: 0.1 }}
                        className='mt-6 w-[90%] max-w-[600px] text-center text-lg text-richblack-300'
                    >
                        Master programming with our comprehensive courses. Learn at your own pace with hands-on projects and expert guidance.
                    </motion.div>

                    <div className='flex flex-row gap-6 mt-8'>
                        <CTAButton active={true} linkto={"/signup"}>
                            Start Learning
                        </CTAButton>
                        <CTAButton active={false} linkto={"/login"}>
                            View Courses
                        </CTAButton>
                    </div>
                </div>

                {/* Stats Section */}
                <div className='bg-richblack-800 py-12'>
                    <div className='w-11/12 max-w-maxContent mx-auto'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white'>
                            <div className='flex flex-col items-center'>
                                <FaGraduationCap className='text-4xl text-yellow-50 mb-4' />
                                <h3 className='text-2xl font-bold mb-2'>{allCourses.length}+</h3>
                                <p className='text-richblack-300'>Courses Available</p>
                            </div>
                            <div className='flex flex-col items-center'>
                                <FaUsers className='text-4xl text-yellow-50 mb-4' />
                                <h3 className='text-2xl font-bold mb-2'>10,000+</h3>
                                <p className='text-richblack-300'>Students Enrolled</p>
                            </div>
                            <div className='flex flex-col items-center'>
                                <FaCertificate className='text-4xl text-yellow-50 mb-4' />
                                <h3 className='text-2xl font-bold mb-2'>5,000+</h3>
                                <p className='text-richblack-300'>Certificates Issued</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* All Courses Section */}
                <div className='py-16 bg-richblack-900'>
                    <div className='w-11/12 max-w-maxContent mx-auto'>
                        <motion.div
                            variants={fadeIn('up', 0.1)}
                            initial='hidden'
                            whileInView={'show'}
                            viewport={{ once: false, amount: 0.1 }}
                            className='text-center mb-12'
                        >
                            <h2 className='text-3xl lg:text-4xl font-bold text-white mb-4'>
                                Explore Our <HighlightText text={"Courses"} />
                            </h2>
                            <p className='text-richblack-300 text-lg max-w-[600px] mx-auto'>
                                Choose from our wide range of programming courses designed by industry experts
                            </p>
                        </motion.div>

                        {loading ? (
                            <div className='flex justify-center items-center py-12'>
                                <div className='spinner'></div>
                                <p className='text-white ml-4'>Loading courses...</p>
                            </div>
                        ) : allCourses.length > 0 ? (
                            <Course_Slider Courses={allCourses} />
                        ) : (
                            <div className='text-center py-12'>
                                <p className='text-richblack-300 text-lg'>No courses available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Call to Action Section */}
                <div className='bg-richblack-800 py-16'>
                    <div className='w-11/12 max-w-maxContent mx-auto text-center'>
                        <motion.div
                            variants={fadeIn('up', 0.1)}
                            initial='hidden'
                            whileInView={'show'}
                            viewport={{ once: false, amount: 0.1 }}
                        >
                            <h2 className='text-3xl lg:text-4xl font-bold text-white mb-6'>
                                Ready to Start Your <HighlightText text={"Coding Journey"} />?
                            </h2>
                            <p className='text-richblack-300 text-lg mb-8 max-w-[600px] mx-auto'>
                                Join thousands of students already learning with StudyCircle. Start your programming career today!
                            </p>
                            <div className='flex flex-row gap-6 justify-center'>
                                <CTAButton active={true} linkto={"/signup"}>
                                    <div className='flex items-center gap-3'>
                                        Get Started Now
                                        <FaArrowRight />
                                    </div>
                                </CTAButton>
                                <CTAButton active={false} linkto={"/courses"}>
                                    Browse Courses
                                </CTAButton>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Footer */}
                <Footer />
            </div>
        </React.Fragment>
    )
}

export default Home

