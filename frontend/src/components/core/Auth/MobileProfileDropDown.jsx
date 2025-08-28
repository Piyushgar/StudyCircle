import { useState, useRef, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { FaUser, FaSignOutAlt } from "react-icons/fa"
import { AiOutlineCaretDown, AiOutlineHome } from "react-icons/ai"
import { VscDashboard, VscSignOut } from "react-icons/vsc"
import { PiNotebook } from "react-icons/pi"
import { logout } from "../../../services/operations/authAPI"
import { ACCOUNT_TYPE } from "../../../utils/constants"
import useOnClickOutside from "../../../hooks/useOnClickOutside"
import Img from '../../common/Img'

function MobileProfileDropDown() {
    const { user } = useSelector((state) => state.profile)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const ref = useRef(null)
    const [open, setOpen] = useState(false)

    useOnClickOutside(ref, () => setOpen(false))

    if (!user) return null

    return (
        // only for small devices
        <button className="relative sm:hidden" onClick={() => setOpen(true)}>
            <div className="flex items-center gap-x-1">
                <Img
                    src={user?.image}
                    alt={`profile-${user?.firstName}`}
                    className={'aspect-square w-[30px] rounded-full object-cover'}
                />
                <AiOutlineCaretDown className="text-sm text-richblack-100" />
            </div>

            {open && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute min-w-[120px] top-[118%] right-0 z-[1000] divide-y-[1px] divide-richblack-700 overflow-hidden rounded-lg border-[1px] border-richblack-700 bg-richblack-800"
                    ref={ref}
                >
                    <Link to="/dashboard/my-profile" onClick={() => setOpen(false)}>
                        <div className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100">
                            <VscDashboard className="text-lg" />
                            Dashboard
                        </div>
                    </Link>

                    <Link to='/' onClick={() => setOpen(false)}>
                        <div className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 border-y border-richblack-700 ">
                            <AiOutlineHome className="text-lg" />
                            Home
                        </div>
                    </Link>

                    <Link to='/' onClick={() => setOpen(false)}>
                        <div className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100">
                            <PiNotebook className="text-lg" />
                            Courses
                        </div>
                    </Link>

                    <div
                        onClick={() => {
                            dispatch(logout(navigate))
                            setOpen(false)
                        }}
                        className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100"
                    >
                        <VscSignOut className="text-lg" />
                        Logout
                    </div>
                </div>
            )}
        </button>
    )
}

export default MobileProfileDropDown