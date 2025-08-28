import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

import Footer from "../components/common/Footer"
import Course_Card from '../components/core/Catalog/Course_Card'
import Loading from './../components/common/Loading'

import { getAllCourses, fetchCourseCategories } from '../services/operations/courseDetailsAPI'
import { fadeIn } from './../components/common/motionFrameVarients'

import { FaFilter, FaTimes } from "react-icons/fa"

function Courses() {
    const [allCourses, setAllCourses] = useState([])
    const [filteredCourses, setFilteredCourses] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [loading, setLoading] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    // Fetch all courses and categories
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch all courses
                const coursesData = await getAllCourses()
                setAllCourses(coursesData || [])
                setFilteredCourses(coursesData || [])

                // Fetch all categories
                const categoriesData = await fetchCourseCategories()
                setCategories(categoriesData || [])
                
                // Debug logging
                console.log('Fetched courses:', coursesData?.length || 0)
                console.log('Fetched categories:', categoriesData?.length || 0)
                console.log('Sample course with category:', coursesData?.[0])
                console.log('All categories:', categoriesData?.map(cat => cat.name))
            } catch (error) {
                console.log("Error fetching data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Filter courses by category
    useEffect(() => {
        if (selectedCategory === "All") {
            setFilteredCourses(allCourses)
        } else {
            const filtered = allCourses.filter(course => {
                // Handle cases where category might be null or missing
                if (!course.category) return false
                
                // Check both exact match and case-insensitive match
                return course.category.name === selectedCategory ||
                       course.category.name?.toLowerCase() === selectedCategory.toLowerCase()
            })
            setFilteredCourses(filtered)
            console.log(`Filtering for category "${selectedCategory}":`, filtered.length, 'courses found')
        }
    }, [selectedCategory, allCourses])

    const handleCategoryChange = (categoryName) => {
        setSelectedCategory(categoryName)
        setShowFilters(false) // Close mobile filter menu
    }

    if (loading) {
        return (
            <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
                <Loading />
            </div>
        )
    }

    return (
        <>
            {/* Hero Section */}
            <div className="bg-richblack-800 px-4">
                <div className="mx-auto flex min-h-[260px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent">
                    <motion.div
                        variants={fadeIn('up', 0.1)}
                        initial='hidden'
                        whileInView={'show'}
                        viewport={{ once: false, amount: 0.1 }}
                    >
                        <p className="text-sm text-richblack-300">
                            Home / <span className="text-yellow-25">Courses</span>
                        </p>
                        <h1 className="text-3xl lg:text-4xl font-bold text-richblack-5 mt-4">
                            Explore All Courses
                        </h1>
                        <p className="max-w-[870px] text-richblack-200 mt-2">
                            Discover our comprehensive collection of programming courses designed by industry experts. 
                            Filter by category to find the perfect course for your learning journey.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-richblack-900 px-4 py-6 border-b border-richblack-700">
                <div className="mx-auto max-w-maxContentTab lg:max-w-maxContent">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        {/* Course Count */}
                        <div className="text-richblack-200">
                            Showing <span className="text-yellow-25 font-semibold">{filteredCourses.length}</span> courses
                            {selectedCategory !== "All" && (
                                <span> in <span className="text-yellow-25 font-semibold">{selectedCategory}</span></span>
                            )}
                        </div>

                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden flex items-center gap-2 bg-richblack-700 text-richblack-200 px-4 py-2 rounded-md hover:bg-richblack-600 transition-colors"
                        >
                            <FaFilter />
                            Filter by Category
                        </button>

                        {/* Desktop Category Filters */}
                        <div className="hidden lg:flex flex-wrap gap-3">
                            <button
                                onClick={() => handleCategoryChange("All")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                    selectedCategory === "All"
                                        ? "bg-yellow-25 text-black"
                                        : "bg-richblack-700 text-richblack-200 hover:bg-richblack-600"
                                }`}
                            >
                                All Courses ({allCourses.length})
                            </button>
                            {categories.map((category) => {
                                const categoryCount = allCourses.filter(course => {
                                    if (!course.category) return false
                                    return course.category.name === category.name ||
                                           course.category.name?.toLowerCase() === category.name.toLowerCase()
                                }).length
                                return (
                                    <button
                                        key={category._id}
                                        onClick={() => handleCategoryChange(category.name)}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                            selectedCategory === category.name
                                                ? "bg-yellow-25 text-black"
                                                : "bg-richblack-700 text-richblack-200 hover:bg-richblack-600"
                                        }`}
                                    >
                                        {category.name} ({categoryCount})
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Mobile Category Filters */}
                    {showFilters && (
                        <div className="lg:hidden mt-4 p-4 bg-richblack-700 rounded-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-richblack-5 font-semibold">Filter by Category</h3>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="text-richblack-300 hover:text-white"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleCategoryChange("All")}
                                    className={`px-4 py-2 rounded-md text-sm font-medium text-left transition-all duration-200 ${
                                        selectedCategory === "All"
                                            ? "bg-yellow-25 text-black"
                                            : "bg-richblack-600 text-richblack-200 hover:bg-richblack-500"
                                    }`}
                                >
                                    All Courses ({allCourses.length})
                                </button>
                                {categories.map((category) => {
                                    const categoryCount = allCourses.filter(course => {
                                        if (!course.category) return false
                                        return course.category.name === category.name ||
                                               course.category.name?.toLowerCase() === category.name.toLowerCase()
                                    }).length
                                    return (
                                        <button
                                            key={category._id}
                                            onClick={() => handleCategoryChange(category.name)}
                                            className={`px-4 py-2 rounded-md text-sm font-medium text-left transition-all duration-200 ${
                                                selectedCategory === category.name
                                                    ? "bg-yellow-25 text-black"
                                                    : "bg-richblack-600 text-richblack-200 hover:bg-richblack-500"
                                            }`}
                                        >
                                            {category.name} ({categoryCount})
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Courses Grid */}
            <div className="bg-richblack-900 px-4 py-12">
                <div className="mx-auto max-w-maxContentTab lg:max-w-maxContent">
                    {filteredCourses.length > 0 ? (
                        <motion.div
                            variants={fadeIn('up', 0.1)}
                            initial='hidden'
                            whileInView={'show'}
                            viewport={{ once: false, amount: 0.1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {filteredCourses.map((course, index) => (
                                <Course_Card 
                                    key={course._id} 
                                    course={course} 
                                    Height={"h-[300px]"} 
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-6xl text-richblack-600 mb-4">📚</div>
                            <h3 className="text-2xl font-semibold text-richblack-5 mb-2">
                                No courses found
                            </h3>
                            <p className="text-richblack-300 mb-6">
                                {selectedCategory === "All" 
                                    ? "There are no courses available at the moment."
                                    : `No courses found in the "${selectedCategory}" category.`
                                }
                            </p>
                            {selectedCategory !== "All" && (
                                <button
                                    onClick={() => handleCategoryChange("All")}
                                    className="bg-yellow-25 text-black px-6 py-3 rounded-md font-medium hover:bg-yellow-50 transition-colors"
                                >
                                    View All Courses
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    )
}

export default Courses
