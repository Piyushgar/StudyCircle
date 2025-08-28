import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { RxCross2 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"
import { FaPlus, FaTrash } from "react-icons/fa"

import {
  createSubSection,
  updateSubSection,
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import Upload from "../Upload"

export default function SubSectionModal({ modalData, setModalData, add = false, view = false, edit = false, }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
    watch,
  } = useForm()

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [lectureType, setLectureType] = useState('video')
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', ''], correctAnswer: 0 }])
  const { token } = useSelector((state) => state.auth)
  const { course } = useSelector((state) => state.course)

  useEffect(() => {
    if (view || edit) {
      setValue("lectureTitle", modalData.title)
      setValue("lectureDesc", modalData.description)
      setValue("lectureVideo", modalData.videoUrl)
      setValue("lectureContent", modalData.content)
      setValue("externalLink", modalData.externalLink)
      setLectureType(modalData.lectureType || 'video')
      if (modalData.questions) {
        setQuestions(modalData.questions)
      }
    }
  }, [])

  // detect whether form is updated or not
  const isFormUpdated = () => {
    const currentValues = getValues()
    if (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl ||
      currentValues.lectureContent !== modalData.content ||
      currentValues.externalLink !== modalData.externalLink ||
      lectureType !== modalData.lectureType ||
      JSON.stringify(questions) !== JSON.stringify(modalData.questions || [])
    ) {
      return true
    }
    return false
  }

  // Quiz question management
  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', ''], correctAnswer: 0 }])
  }

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const addOption = (questionIndex) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options.push('')
    setQuestions(newQuestions)
  }

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions]
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex].options.splice(optionIndex, 1)
      // Adjust correct answer if needed
      if (newQuestions[questionIndex].correctAnswer >= newQuestions[questionIndex].options.length) {
        newQuestions[questionIndex].correctAnswer = newQuestions[questionIndex].options.length - 1
      }
      setQuestions(newQuestions)
    }
  }

  const updateQuestion = (questionIndex, field, value) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex][field] = value
    setQuestions(newQuestions)
  }

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  // handle the editing of subsection
  const handleEditSubsection = async () => {
    const currentValues = getValues()
    const formData = new FormData()
    formData.append("sectionId", modalData.sectionId)
    formData.append("subSectionId", modalData._id)
    formData.append("lectureType", lectureType)
    
    if (currentValues.lectureTitle !== modalData.title) {
      formData.append("title", currentValues.lectureTitle)
    }
    if (currentValues.lectureDesc !== modalData.description) {
      formData.append("description", currentValues.lectureDesc)
    }
    
    if (lectureType === 'video') {
      if (currentValues.lectureVideo !== modalData.videoUrl) {
        formData.append("video", currentValues.lectureVideo)
      }
    } else if (lectureType === 'reading') {
      if (currentValues.lectureContent !== modalData.content) {
        formData.append("content", currentValues.lectureContent)
      }
      if (currentValues.externalLink !== modalData.externalLink) {
        formData.append("externalLink", currentValues.externalLink)
      }
    } else if (lectureType === 'quiz') {
      if (JSON.stringify(questions) !== JSON.stringify(modalData.questions || [])) {
        formData.append("questions", JSON.stringify(questions))
      }
    }

    setLoading(true)
    const result = await updateSubSection(formData, token)
    if (result) {
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData.sectionId ? result : section
      )
      const updatedCourse = { ...course, courseContent: updatedCourseContent }
      dispatch(setCourse(updatedCourse))
    }
    setModalData(null)
    setLoading(false)
  }

  const onSubmit = async (data) => {
    console.log('=== FORM SUBMISSION START ===');
    console.log('Form submitted with data:', data);
    console.log('Lecture type:', lectureType);
    console.log('Questions state:', questions);
    
    if (view) return

    // Validate required fields based on lecture type
    if (lectureType === 'reading' && !data.lectureContent?.trim()) {
      toast.error("Content is required for reading material");
      return;
    }
    
    if (lectureType === 'quiz') {
      const hasValidQuestions = questions.every(q => 
        q.questionText.trim() && 
        q.options.every(opt => opt.trim()) && 
        q.options.length >= 2
      );
      if (!hasValidQuestions) {
        toast.error("Please fill all quiz questions and options");
        return;
      }
    }

    if (edit) {
      if (!isFormUpdated()) {
        toast.error("No changes made to the form")
      } else {
        handleEditSubsection()
      }
      return
    }

    const formData = new FormData()
    formData.append("sectionId", modalData)
    formData.append("title", data.lectureTitle)
    formData.append("description", data.lectureDesc)
    formData.append("lectureType", lectureType)
    
    if (lectureType === 'video') {
      if (!data.lectureVideo) {
        toast.error("Video file is required for video lectures");
        return;
      }
      formData.append("video", data.lectureVideo)
    } else if (lectureType === 'reading') {
      formData.append("content", data.lectureContent)
      if (data.externalLink) {
        formData.append("externalLink", data.externalLink)
      }
    } else if (lectureType === 'quiz') {
      formData.append("questions", JSON.stringify(questions))
    }

    console.log('Sending FormData:');
    for (let [key, value] of formData.entries()) {
      console.log(key, ':', value);
    }

    try {
      setLoading(true)
      const result = await createSubSection(formData, token)
      console.log('API Response:', result);
      
      if (result) {
        const updatedCourseContent = course.courseContent.map((section) =>
          section._id === modalData ? result : section
        )
        const updatedCourse = { ...course, courseContent: updatedCourseContent }
        dispatch(setCourse(updatedCourse))
        toast.success("Lecture created successfully!");
        setModalData(null);
      } else {
        toast.error("Failed to create lecture");
      }
    } catch (error) {
      console.error('Error creating lecture:', error);
      toast.error("Error creating lecture: " + (error.message || 'Unknown error'));
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[800px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">
            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
          </p>
          <button onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>
        
        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 px-8 py-10">
          {/* Lecture Type Selection */}
          {!view && (
            <div className="flex flex-col space-y-2">
              <label className="text-sm text-richblack-5">
                Lecture Type <sup className="text-pink-200">*</sup>
              </label>
              <select
                value={lectureType}
                onChange={(e) => setLectureType(e.target.value)}
                className="form-style w-full"
                disabled={view || loading}
              >
                <option value="video">Video Lecture</option>
                <option value="reading">Reading Material</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
          )}

          {/* Lecture Title */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureTitle">
              Lecture Title {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <input
              disabled={view || loading}
              id="lectureTitle"
              placeholder="Enter Lecture Title"
              {...register("lectureTitle", { required: true })}
              className="form-style w-full"
            />
            {errors.lectureTitle && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture title is required
              </span>
            )}
          </div>
          
          {/* Lecture Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureDesc">
              Lecture Description {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <textarea
              disabled={view || loading}
              id="lectureDesc"
              placeholder="Enter Lecture Description"
              {...register("lectureDesc", { required: true })}
              className="form-style resize-x-none min-h-[130px] w-full"
            />
            {errors.lectureDesc && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture Description is required
              </span>
            )}
          </div>

          {/* Dynamic Content Based on Lecture Type */}
          {lectureType === 'video' && (
            <Upload
              name="lectureVideo"
              label="Lecture Video"
              register={register}
              setValue={setValue}
              errors={errors}
              video={true}
              viewData={view ? modalData.videoUrl : null}
              editData={edit ? modalData.videoUrl : null}
            />
          )}

          {lectureType === 'reading' && (
            <>
              <div className="flex flex-col space-y-2">
                <label className="text-sm text-richblack-5" htmlFor="lectureContent">
                  Content <sup className="text-pink-200">*</sup>
                </label>
                <textarea
                  disabled={view || loading}
                  id="lectureContent"
                  placeholder="Enter reading content or instructions"
                  {...register("lectureContent", { required: true })}
                  className="form-style resize-x-none min-h-[130px] w-full"
                />
                {errors.lectureContent && (
                  <span className="ml-2 text-xs tracking-wide text-pink-200">
                    Content is required for reading material
                  </span>
                )}
              </div>
              
              <div className="flex flex-col space-y-2">
                <label className="text-sm text-richblack-5" htmlFor="externalLink">
                  External Link (Optional)
                </label>
                <input
                  disabled={view || loading}
                  id="externalLink"
                  type="url"
                  placeholder="https://example.com"
                  {...register("externalLink")}
                  className="form-style w-full"
                />
              </div>
            </>
          )}

          {lectureType === 'quiz' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-sm text-richblack-5">
                  Quiz Questions <sup className="text-pink-200">*</sup>
                </label>
                {!view && (
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-100"
                  >
                    <FaPlus className="text-sm" />
                    Add Question
                  </button>
                )}
              </div>
              
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="rounded-lg border border-richblack-600 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-richblack-5">Question {questionIndex + 1}</h4>
                    {!view && questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-pink-200 hover:text-pink-100"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      disabled={view || loading}
                      placeholder="Enter question text"
                      value={question.questionText}
                      onChange={(e) => updateQuestion(questionIndex, 'questionText', e.target.value)}
                      className="form-style w-full"
                    />
                    
                    <div className="space-y-2">
                      <label className="text-xs text-richblack-5">Options:</label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            disabled={view || loading}
                            type="radio"
                            name={`correct-${questionIndex}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                            className="text-yellow-50"
                          />
                          <input
                            disabled={view || loading}
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option}
                            onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                            className="form-style flex-1"
                          />
                          {!view && question.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(questionIndex, optionIndex)}
                              className="text-pink-200 hover:text-pink-100"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {!view && (
                        <button
                          type="button"
                          onClick={() => addOption(questionIndex)}
                          className="text-sm text-blue-200 hover:text-blue-100"
                        >
                          + Add Option
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!view && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                onClick={() => {
                  console.log('=== SAVE BUTTON CLICKED ===');
                  console.log('Form values:', getValues());
                  console.log('Lecture type:', lectureType);
                  console.log('Questions:', questions);
                  console.log('Form errors:', errors);
                }}
                className="flex items-center gap-2 rounded-lg bg-yellow-50 px-6 py-3 text-sm font-medium text-richblack-900 hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading.." : edit ? "Save Changes" : "Save"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}