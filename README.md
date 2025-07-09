# byte learn

🎓 **Tagline**: Bite-Sized Learning for Everyone

**byte learn** is a video-based educational platform built with **Node.js**, **Express**, **MongoDB**, and **Cloudinary**, designed for educators to share short, structured learning modules and for learners to engage with curated content. This project showcases a full-stack solution with a robust backend API and a forthcoming React frontend, tailored for delivering bite-sized educational content.

---

## 🚀 Features
- **User Authentication**: Secure registration and login with JWT-based authentication and refresh tokens.
- **Lesson Management**: Upload, update, publish, unpublish, and delete lessons (videos) with Cloudinary for media storage.
- **Categories and Tags**: Organize lessons by subject (e.g., "Programming," "Science") and difficulty (e.g., "Beginner," "Advanced").
- **User Roles**: Support for **instructor** and **learner** roles with tailored access control.
- **Progress Tracking**: Track watched lessons to monitor learner progress.
- **Playlists**: Create, manage, and organize lessons into learning paths.
- **Engagement**: Like and comment on lessons to foster interactive Q&A discussions.
- **Scalable Architecture**: Leverage MongoDB aggregation pipelines and pagination for efficient data handling.

---

## 📚 What I Learned
- Building a full-stack application with **Express** and **MongoDB** using MVC architecture.
- Modeling complex relationships in MongoDB with **Mongoose**.
- Handling file uploads with **Multer** and **Cloudinary**.
- Implementing secure REST APIs with **JWT** authentication.
- Designing scalable CRUD operations and media storage.
- Enhancing APIs with categories, tags, user roles, and progress tracking for educational use.
- Preparing a backend for seamless integration with a **React** frontend.

---

## 🛠 Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Media Storage**: Cloudinary
- **File Uploads**: Multer
- **Authentication**: JWT
- **Utilities**: dotenv, cors, helmet, morgan
- **Frontend (Planned)**: React.js

---

## 📁 Project Structure
```
byte-learn/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   └── index.js
├── public/temp/  # Temporary storage for uploaded files
├── .env.sample   # Environment variable template
├── .gitignore
├── package.json
```

---

## ⚙️ Getting Started
1. **Clone the Repository**
   ```bash
   git clone https://github.com/Pranav04027/byte-learn.git
   cd byte-learn
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Set Up Environment Variables**
   - Copy `.env.sample` to create a `.env` file.
   - Add your values (e.g., MongoDB URI, Cloudinary credentials, JWT secret).
4. **Run the Server**
   ```bash
   npm run dev
   ```

---

## 🧪 API Endpoints
Key endpoints include:

- **POST /api/users/register** - Register a new user (with role selection: instructor/learner)
- **POST /api/users/login** - User login
- **POST /api/lessons** - Upload a lesson (video) with category and tags
- **PATCH /api/lessons/:lessonId** - Update lesson details
- **DELETE /api/lessons/:lessonId** - Delete a lesson
- **GET /api/lessons/:lessonId** - Get lesson details
- **GET /api/lessons?category=Programming&tag=Beginner** - Filter lessons by category and tags
- **POST /api/users/watched/:lessonId** - Mark a lesson as watched
- **GET /api/users/watched** - Retrieve watched lessons
- **POST /api/playlists** - Create a playlist
- **PATCH /api/playlists/:playlistId** - Update a playlist
- **POST /api/playlists/:playlistId/:lessonId** - Add lesson to playlist
- **DELETE /api/playlists/:playlistId/:lessonId** - Remove lesson from playlist

**Full API documentation**: [Postman Documentation](https://documenter.getpostman.com/view/45456961/2sB2xBEqF1)

---

## 🖼 Frontend Integration (Planned)
The **React** frontend will include:
- **Lesson Upload Form**: Fields for title, description, category, and tags for instructors.
- **Lesson Browsing**: Filters for categories and tags to help learners find relevant content.
- **User Registration**: Role selection (instructor/learner) during signup.
- **Learner Dashboard**: Display watched lessons and progress tracking.
- **Instructor Dashboard**: Manage uploaded lessons, view statistics, and monitor comments.

---

## 🧑‍🎓 Author
**Pranav Chauhan**  
A learning project to master full-stack development.  
📧 [chauhanpranav040@gmail.com](mailto:chauhanpranav040@gmail.com)  
🐙 [GitHub: Pranav04027](https://github.com/Pranav04027)

---

## 📝 License
This project is licensed under the **MIT License**. Feel free to use and modify for learning purposes.  
Want to contribute or have suggestions? Open an issue or PR on GitHub!
