import React from "react";
import { Link } from "react-router-dom";
import { ImGithub, ImLinkedin2 } from "react-icons/im";
import { FaEnvelope } from "react-icons/fa";

// Images
import StudyNotionLogo from "../../assets/Logo/logo.png";

// Simplified footer data
const QuickLinks = ["About", "Contact", "Courses", "Careers"];
const Policies = ["Privacy Policy", "Terms & Conditions"];



const Footer = () => {
  return (
    <div className="bg-richblack-800 py-8">
      <div className="w-11/12 max-w-maxContent mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-richblack-400 mb-8">
          
          {/* Logo and About */}
          <div className="md:col-span-1">
            <img src={StudyNotionLogo} alt="StudyCircle Logo" className="h-8 mb-4" />
            <p className="text-sm text-richblack-300 mb-4">
              Empowering learners worldwide with quality programming education.
            </p>
            <div className="flex gap-3">
              <a href="https://www.linkedin.com/in/nikhilyadav/" className="text-richblack-300 hover:text-white transition-colors duration-300" target="_blank" rel="noopener noreferrer">
                <ImLinkedin2 size={18} />
              </a>
              <a href="https://www.github.com/nikhilyadav" className="text-richblack-300 hover:text-white transition-colors duration-300" target="_blank" rel="noopener noreferrer">
                <ImGithub size={18} />
              </a>
              <a href="mailto:nikhilyadav4020@gmail.com" className="text-richblack-300 hover:text-white transition-colors duration-300">
                <FaEnvelope size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-richblack-50 font-semibold text-sm mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              {QuickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={`/${link.toLowerCase()}`}
                  className="text-sm text-richblack-300 hover:text-white transition-colors duration-300"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-richblack-50 font-semibold text-sm mb-4">Categories</h3>
            <div className="flex flex-col gap-2">
              <Link to="/courses" className="text-sm text-richblack-300 hover:text-white transition-colors duration-300">
                Web Development
              </Link>
              <Link to="/courses" className="text-sm text-richblack-300 hover:text-white transition-colors duration-300">
                Data Science
              </Link>
              <Link to="/courses" className="text-sm text-richblack-300 hover:text-white transition-colors duration-300">
                Mobile Development
              </Link>
              <Link to="/courses" className="text-sm text-richblack-300 hover:text-white transition-colors duration-300">
                DevOps
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-richblack-50 font-semibold text-sm mb-4">Support</h3>
            <div className="flex flex-col gap-2">
              <Link to="/help" className="text-sm text-richblack-300 hover:text-white transition-colors duration-300">
                Help Center
              </Link>
              <Link to="/contact" className="text-sm text-richblack-300 hover:text-white transition-colors duration-300">
                Contact Us
              </Link>
              <Link to="/faq" className="text-sm text-richblack-300 hover:text-white transition-colors duration-300">
                FAQ
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-richblack-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-richblack-400">
            <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
              {Policies.map((policy, index) => (
                <Link
                  key={index}
                  to={`/${policy.split(" ").join("-").toLowerCase()}`}
                  className="hover:text-white transition-colors duration-300"
                >
                  {policy}
                </Link>
              ))}
            </div>
            
            <div className="text-center">
              <p>
                Made with ❤️ by{" "}
                <Link 
                  to="https://github.com/nikhilyadav24" 
                  target="_blank" 
                  className="text-white hover:underline"
                >
                  nikhilyadav
                </Link>
              </p>
              <p className="mt-1">© 2024 StudyCircle. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;