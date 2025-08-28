# StudyCircle - Complete EdTech Platform 🎓

<img src='frontend/src/assets/Logo/logo.png' width="300" />

## 📋 Project Overview

**StudyCircle** is a comprehensive Educational Technology platform built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). The platform enables seamless creation, consumption, and management of educational content with advanced features for both students and instructors.

### ✨ **Key Features**
- 🔐 **Secure Authentication** with JWT and OTP verification
- 📚 **Course Management** with video, reading, and quiz content
- ☁️ **Cloud Storage** with Cloudinary for media management
- 📊 **Progress Tracking** and course completion system
- 🎨 **Responsive Design** with modern UI/UX
- 👥 **Role-based Access** (Student, Instructor, Admin)
---

## 🛠️ **Technology Stack**

### **Frontend** 🎨
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

### **Backend** ⚙️
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

### **Additional Services** ☁️
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

---

## 🔧 **Installation & Setup**

### **Prerequisites**
- Node.js (v18+ recommended)
- MongoDB (local or cloud)
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/nikhilyadav/studycircle.git
cd studycircle
```

### **2. Backend Setup**
```bash
cd backend
npm install

# Create .env file with:
JWT_SECRET=studycircle-secret-key-2025
DATABASE_URL=mongodb://localhost:27017/studynotion
PORT=4000
CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# Start backend server
npm start
```

### **3. Frontend Setup**
```bash
cd frontend
npm install

# Start frontend development server
VITE_APP_BASE_URL=http://localhost:4000/api/v1 npm run dev
```

### **4. Access Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

---

## 📱 **Application Pages & Features**

### **🏠 Public Pages**
| Page | Description | Screenshot |
|------|-------------|------------|
| **Home** | Landing page with platform overview | ![Home](./screenshots/home.png) |
| **Catalog** | Browse available courses by category | ![Catalog](./screenshots/catelog.png) |
| **Course Details** | Detailed course information and enrollment | ![Course Details](./screenshots/course.png) |
| **Footer** | Footer and Important links | ![Footer](./screenshots/footer.png) |

### **🔐 Authentication Pages**
| Page | Description | Screenshot |
|------|-------------|------------|
| **Login** | User authentication | ![Login](./screenshots/login.png) |
| **Signup** | New user registration | ![Signup](./screenshots/signup.png) |
| **Forgot Password** | Password reset functionality | ![Forgot Password](./screenshots/forgotpass.png) |

### **👨‍🎓 Student Dashboard**
| Page | Description | Screenshot |
|------|-------------|------------|
| **My Profile** | Student profile management | ![Dashboard](./screenshots/studentdash.png) |
| **Enrolled Courses** | View enrolled courses with progress | ![Enrolled Courses](./screenshots/enrolledcourses.png) |
| **Cart** | Course purchase management | ![Cart](./screenshots/cart.png) |
| **Course Player** | Video/content consumption interface | ![View Course](./screenshots/video.png) |
| **Settings** | Account settings and preferences | ![Edit Profile](./screenshots/studsetting.png) |

### **👨‍🏫 Instructor Dashboard**
| Page | Description | Screenshot |
|------|-------------|------------|
| **Instructor Analytics** | Course performance metrics | ![Instructor Data](./screenshots/isnstructordash.png) |
| **My Courses** | Manage created courses | ![My Courses](./screenshots/myCourses.png) |
| **Add Course** | Create new courses | ![Add Course](./screenshots/addcourse.png) |
| **Edit Course** | Modify existing courses | ![Edit Course](./screenshots/editcourse.png) |
| **Statistics** | Students and Income | ![Statistics](./screenshots/enrolled.png) |
---

## 🎯 **Core Features**

### **🔐 Authentication & Authorization**
- **JWT-based authentication** with secure token management
- **Role-based access control** (Student, Instructor)
- **Password reset** functionality
- **Profile management** with image upload

### **📚 Course Management**
- **Multi-media content support**: Videos, Reading materials, Quizzes
- **Course creation wizard** with step-by-step process
- **Content organization** with sections and subsections
- **Course publishing** and draft management
- **Category-based organization**

### **🎥 Learning Experience**
- **Video player** with progress tracking
- **Mark as complete** functionality
- **Quiz system** with automatic grading
- **Reading materials** support
- **Course navigation** with previous/next controls
- **Progress percentage** calculation


### **📊 Analytics & Tracking**
- **Course progress tracking**
- **Instructor dashboard** with earnings and student data
- **Course performance metrics**
- **Student engagement analytics**

---

## 🚧 **Development Setup**

### **Environment Variables**

#### **Backend (.env)**
```env
# Database
DATABASE_URL=mongodb://localhost:27017/studynotion

# Server
PORT=4000
JWT_SECRET=studycircle-secret-key-2025

# Cloudinary
CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# Email (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
```

#### **Frontend**
```env
VITE_APP_BASE_URL=http://localhost:4000/api/v1
```

---

## 👨‍💻 **Developer**

**Nikhil Yadav**
- GitHub: [@nikhilyadav](https://github.com/nikhilyadav)
- LinkedIn: [nikhilyadav](https://linkedin.com/in/nikhilyadav)
- Email: nikhilyadav4020@gmail.com

---

## 🙏 **Acknowledgments**

- React.js community for excellent documentation
- MongoDB for flexible database solutions
- Cloudinary for media management
- Razorpay for payment processing
- All open-source contributors

---

<div align="center">
  <h3>🌟 If you found this project helpful, please give it a star! 🌟</h3>
</div>
