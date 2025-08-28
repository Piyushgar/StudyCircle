import React, { useEffect, useRef, useState } from "react"
import { AiOutlineDown } from "react-icons/ai"
import { HiOutlineVideoCamera } from "react-icons/hi"
import { FaBookOpen, FaQuestionCircle } from "react-icons/fa"

function CourseSubSectionAccordion({ subSec }) {
  const getLectureIcon = (lectureType) => {
    switch (lectureType) {
      case 'video':
        return <HiOutlineVideoCamera className="text-lg text-blue-400" />
      case 'reading':
        return <FaBookOpen className="text-lg text-green-400" />
      case 'quiz':
        return <FaQuestionCircle className="text-lg text-yellow-400" />
      default:
        return <HiOutlineVideoCamera className="text-lg text-blue-400" />
    }
  }

  const getLectureInfo = (lectureType, subSec) => {
    switch (lectureType) {
      case 'video':
        return subSec.timeDuration ? `Duration: ${subSec.timeDuration}` : 'Video Lecture'
      case 'reading':
        return subSec.externalLink ? 'Reading + External Link' : 'Reading Material'
      case 'quiz':
        return `${subSec.totalQuestions || 0} Questions`
      default:
        return 'Lecture'
    }
  }

  return (
    <div>
      <div className="flex justify-between py-2">
        <div className={`flex items-center gap-2`}>
          <span>
            {getLectureIcon(subSec.lectureType)}
          </span>
          <div>
            <p className="font-medium">{subSec?.title}</p>
            <p className="text-xs text-richblack-400">
              {getLectureInfo(subSec.lectureType, subSec)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseSubSectionAccordion