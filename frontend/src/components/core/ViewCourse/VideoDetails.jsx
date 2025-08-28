import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation } from "react-router-dom"
import { useNavigate, useParams } from "react-router-dom"

import "video-react/dist/video-react.css"
import { BigPlayButton, Player } from "video-react"

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import { setCourseViewSidebar } from "../../../slices/sidebarSlice"

import IconBtn from "../../common/IconBtn"

import { HiMenuAlt1 } from 'react-icons/hi'
import { FaBookOpen, FaQuestionCircle, FaExternalLinkAlt } from 'react-icons/fa'

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams()

  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef(null)
  const dispatch = useDispatch()

  const { token } = useSelector((state) => state.auth)
  const { courseSectionData, courseEntireData, completedLectures } = useSelector((state) => state.viewCourse)

  const [videoData, setVideoData] = useState([])
  const [previewSource, setPreviewSource] = useState("")
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  useEffect(() => {
    ; (async () => {
      if (!courseSectionData.length) return
      if (!courseId && !sectionId && !subSectionId) {
        navigate(`/dashboard/enrolled-courses`)
      } else {
        const filteredData = courseSectionData.filter(
          (course) => course._id === sectionId
        )
        const filteredVideoData = filteredData?.[0]?.subSection.filter(
          (data) => data._id === subSectionId
        )
        if (filteredVideoData) setVideoData(filteredVideoData[0])
        setPreviewSource(courseEntireData.thumbnail)
        setVideoEnded(false)
        setQuizSubmitted(false)
        setQuizAnswers({})
        setQuizScore(0)
      }
    })()
  }, [courseSectionData, courseEntireData, location.pathname])

  // check if the lecture is the first video of the course
  const isFirstVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)

    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === subSectionId)

    if (currentSectionIndx === 0 && currentSubSectionIndx === 0) {
      return true
    } else {
      return false
    }
  }

  // go to the next video
  const goToNextVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)

    const noOfSubsections = courseSectionData[currentSectionIndx].subSection.length

    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === subSectionId)

    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx + 1]._id

      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`)
    } else {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
      const nextSubSectionId = courseSectionData[currentSectionIndx + 1].subSection[0]._id
      navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`)
    }
  }

  // check if the lecture is the last video of the course
  const isLastVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)

    const noOfSubsections = courseSectionData[currentSectionIndx].subSection.length

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    if (
      currentSectionIndx === courseSectionData.length - 1 &&
      currentSubSectionIndx === noOfSubsections - 1
    ) {
      return true
    } else {
      return false
    }
  }

  // go to the previous video
  const goToPrevVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)

    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === subSectionId)

    if (currentSubSectionIndx !== 0) {
      const prevSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx - 1]._id

      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`)
    } else {
      const prevSectionId = courseSectionData[currentSectionIndx - 1]._id
      const prevSubSectionId = courseSectionData[currentSectionIndx - 1].subSection[
        courseSectionData[currentSectionIndx - 1].subSection.length - 1
      ]._id

      navigate(`/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`)
    }
  }

  const handleLectureCompletion = async () => {
    setLoading(true)
    console.log('Attempting to mark lecture as complete:', {
      courseId,
      subSectionId,
      token: token ? 'present' : 'missing'
    })
    
    const result = await markLectureAsComplete(token, subSectionId, courseId)
    if (result) {
      dispatch(updateCompletedLectures(subSectionId))
      console.log('Lecture marked as complete successfully')
    } else {
      console.log('Failed to mark lecture as complete')
    }
    setLoading(false)
  }

  // Quiz functions
  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }))
  }

  const submitQuiz = () => {
    let score = 0
    const totalQuestions = videoData.questions.length
    
    videoData.questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        score++
      }
    })
    
    setQuizScore(score)
    setQuizSubmitted(true)
    
    // Mark as completed if score is good enough (e.g., 70% or more)
    if (score >= totalQuestions * 0.7) {
      handleLectureCompletion()
    }
  }

  const { courseViewSidebar } = useSelector(state => state.sidebar)

  // this will hide course video , title , desc, if sidebar is open in small device
  if (courseViewSidebar && window.innerWidth <= 640) return;

  const renderLectureContent = () => {
    if (!videoData) return null

    switch (videoData.lectureType) {
      case 'video':
        return (
          <Player
            ref={playerRef}
            aspectRatio="16:9"
            playsInline
            autoPlay
            onEnded={() => setVideoEnded(true)}
            src={videoData?.videoUrl}
          >
            <BigPlayButton position="center" />
            {/* Render When Video Ends */}
            {videoEnded && (
              <div
                style={{
                  backgroundImage:
                    "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1))",
                }}
                className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
              >
                {!completedLectures.includes(subSectionId) && (
                  <IconBtn
                    disabled={loading}
                    onclick={() => handleLectureCompletion()}
                    text={!loading ? "Mark As Completed" : "Loading..."}
                    customClasses="text-xl max-w-max px-4 mx-auto"
                  />
                )}
                <IconBtn
                  disabled={loading}
                  onclick={() => {
                    if (playerRef?.current) {
                      playerRef?.current?.seek(0)
                      setVideoEnded(false)
                    }
                  }}
                  text="Rewatch"
                  customClasses="text-xl max-w-max px-4 mx-auto mt-2"
                />

                <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                  {!isFirstVideo() && (
                    <button
                      disabled={loading}
                      onClick={goToPrevVideo}
                      className="blackButton"
                    >
                      Prev
                    </button>
                  )}
                  {!isLastVideo() && (
                    <button
                      disabled={loading}
                      onClick={goToNextVideo}
                      className="blackButton"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </Player>
        )

      case 'reading':
        return (
          <div className="bg-richblack-800 rounded-lg p-6 min-h-[400px]">
            <div className="flex items-center gap-2 mb-4">
              <FaBookOpen className="text-2xl text-green-400" />
              <h2 className="text-xl font-semibold">Reading Material</h2>
            </div>
            
            {videoData.content && (
              <div className="prose prose-invert max-w-none mb-6">
                <div className="whitespace-pre-wrap text-richblack-25">
                  {videoData.content}
                </div>
              </div>
            )}
            
            {videoData.externalLink && (
              <div className="border-t border-richblack-600 pt-4">
                <a
                  href={videoData.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <FaExternalLinkAlt />
                  Open External Resource
                </a>
              </div>
            )}
            
            <div className="mt-6">
              <IconBtn
                disabled={loading}
                onclick={() => handleLectureCompletion()}
                text={!loading ? "Mark As Completed" : "Loading..."}
                customClasses="text-lg"
              />
            </div>
          </div>
        )

      case 'quiz':
        return (
          <div className="bg-richblack-800 rounded-lg p-6 min-h-[400px]">
            <div className="flex items-center gap-2 mb-6">
              <FaQuestionCircle className="text-2xl text-yellow-400" />
              <h2 className="text-xl font-semibold">Quiz</h2>
            </div>
            
            {!quizSubmitted ? (
              <div className="space-y-6">
                {videoData.questions?.map((question, questionIndex) => (
                  <div key={questionIndex} className="border border-richblack-600 rounded-lg p-4">
                    <h3 className="font-medium mb-3">
                      Question {questionIndex + 1}: {question.questionText}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            value={optionIndex}
                            checked={quizAnswers[questionIndex] === optionIndex}
                            onChange={() => handleQuizAnswer(questionIndex, optionIndex)}
                            className="text-yellow-50"
                          />
                          <span className="text-richblack-25">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length < videoData.questions.length}
                  className="bg-yellow-50 text-richblack-900 px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-100"
                >
                  Submit Quiz
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold mb-4">
                  Quiz Results: {quizScore}/{videoData.questions.length}
                </div>
                <div className="text-lg mb-6">
                  {quizScore >= videoData.questions.length * 0.7 
                    ? "Congratulations! You passed the quiz!" 
                    : "Keep studying! You need to score at least 70% to pass."}
                </div>
                
                {quizScore >= videoData.questions.length * 0.7 && (
                  <div className="mb-6">
                    <IconBtn
                      disabled={loading}
                      onclick={() => handleLectureCompletion()}
                      text={!loading ? "Mark As Completed" : "Loading..."}
                      customClasses="text-lg"
                    />
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setQuizSubmitted(false)
                    setQuizAnswers({})
                    setQuizScore(0)
                  }}
                  className="bg-richblack-600 text-richblack-25 px-6 py-2 rounded-lg font-medium hover:bg-richblack-500"
                >
                  Retake Quiz
                </button>
              </div>
            )}
          </div>
        )

      default:
        return (
          <img
            src={previewSource}
            alt="Preview"
            className="h-full w-full rounded-md object-cover"
          />
        )
    }
  }

  return (
    <div className="flex flex-col gap-5 text-white">

      {/* open - close side bar icons */}
      <div className="sm:hidden text-white absolute left-7 top-3 cursor-pointer " onClick={() => dispatch(setCourseViewSidebar(!courseViewSidebar))}>
        {
          !courseViewSidebar && <HiMenuAlt1 size={33} />
        }
      </div>

      {renderLectureContent()}

      <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
      <p className="pt-2 pb-6">{videoData?.description}</p>
    </div>
  )
}

export default VideoDetails
