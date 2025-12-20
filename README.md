# byte learn

🎓 **Tagline**: Bite-Sized Learning for Everyone

**ByteLearn** is a full-stack video-based educational platform built with **Node.js**, **Express**, **MongoDB**, **Cloudinary**, and a sleek **React** frontend. It enables educators to share short, structured learning modules and helps learners engage with curated content effectively. ByteLearn isn't just a backend service—it's a thoughtfully engineered learning ecosystem.

---

## 🚀 Features

### 🔑 User Authentication

* Secure registration and login with **JWT-based** authentication and refresh tokens.
* Role-based access: `learner` and `instructor`.

### 🎥 Video & Lesson Management

* Upload, update, publish/unpublish, and delete videos.
* Store media on **Cloudinary**, with **Multer** handling file uploads.
* Rich metadata: categories, tags, difficulty levels.

### ⏳ Progress Tracking

* Monitor how much of a video each learner has watched.
* Resume from where you left off, personalized to the learner.

### 📄 Quizzes

* Instructors can create quizzes for each video.
* Learners can attempt quizzes and track scores.
* Attempt history with accuracy breakdown.

### 🏆 Recommendation Engine

* Personalized video suggestions based on bookmarks and watch history.
* Uses video tags, categories, and difficulty to recommend related content.

### 🤖 Automatic Quiz Generation

* Automatic quiz generation from uploaded Video.
* Powered by a separate AI microservice.
* Microservice Repository: [genAI_autoquiz_fromvid](https://github.com/Pranav04027/genAI_autoquiz_fromvid)

### 📂 Playlists

* Create and manage personal playlists.
* Add videos to playlists for organized learning.
* Public and private playlist visibility.

### 💬 Interactivity

* **Comments**: Nested comments on videos to discuss topics.
* **Likes**: Like videos and posts to show appreciation.
* **Community**: Engage with instructors and other learners.

### 🛡️ Advanced Security

* **Helmet**: Secure HTTP headers.
* **Rate Limiting**: Protects against brute-force and DDoS attacks.
* **Data Sanitization**: Prevents XSS and NoSQL injection attacks.
* **CORS**: Configured for secure cross-origin resource sharing.

### 📝 Posts (Micro-Blogging)

* Users can now share short-form educational content (formerly called Tweets).
* Posts support text, image, and like functionality.

### 🔹 Bookmarks

* Save videos for later.
* Accessible from the learner dashboard.

### 🔄 Role Switching

* While signing up, users select `instructor` or `learner` role.
* Instructors see an admin-style dashboard for content management.

---

## 📖 What I Learned

* Structuring scalable REST APIs with **Express.js**
* Secure authentication with **JWT** and refresh tokens
* Modeling relationships in **MongoDB** with Mongoose
* Efficient file handling and uploads with **Multer + Cloudinary**
* Implementing quiz logic and scoring
* User-centric features like progress tracking and recommendations
* Frontend integration with **React**, **Vite**, and **Tailwind CSS**

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js
* **Database**: MongoDB, Mongoose
* **Media Storage**: Cloudinary
* **File Uploads**: Multer
* **Authentication**: JWT (Access + Refresh)
* **Frontend**: React.js + Vite + Tailwind CSS
* **Utilities**: dotenv, cors, helmet, morgan
* **Security**: express-rate-limit, express-mongo-sanitize, express-xss-sanitizer

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

* Copy `.env.sample` to `.env`
* Fill in MongoDB URI, Cloudinary credentials, JWT secrets

4. **Run the Development Server**

```bash
npm run dev
```

---

## 🔮 API Endpoints (Highlights)

### ⚡ Auth

* `POST /api/users/register` - Register a user
* `POST /api/users/login` - Login and get tokens
* `POST /api/users/logout` - Logout and clear cookies

### 🎥 Videos

* `POST /api/videos/create` - Upload new video
* `PATCH /api/videos/:id` - Update a video
* `DELETE /api/videos/:id` - Delete video
* `GET /api/videos/getallvideos` - Public videos (with filters)
* `GET /api/videos/:id` - Get one video by ID

### 📉 Progress

* `POST /api/progress/:videoId` - Update watch progress
* `GET /api/progress/my` - Fetch current user's progress

### ✏️ Quizzes

* `POST /api/quiz/create` - Instructor creates quiz for video
* `GET /api/quiz/:videoId` - Learner fetches quiz
* `POST /api/quiz/:videoId/submit` - Submit attempt

### 📈 Recommendations

* `GET /api/recommendation/recommended` - Learner gets personalized recommendations

### 📋 Posts (Formerly Tweets)

* `POST /api/posts/create` - Create a post
* `GET /api/posts/feed` - All posts
* `POST /api/posts/:id/like` - Like a post

**Full API docs**: [Postman Collection](https://documenter.getpostman.com/view/45456961/2sB2xBEqF1)

---

## 🎨 Frontend

The frontend is a separate modern application built with **React 19** and **Vite**.

* **Repository**: [bytelearn-fronted](https://github.com/Pranav04027/bytelearn-fronted)
* **Tech Stack**: React 19, Vite, Tailwind CSS, Context API.
* **Features**: Role-based dashboards, Video playback, Quiz UI, Community interaction.

---

## 👨‍💼 Author

**Pranav Chauhan**
Passionate about crafting beautiful educational tools.
📧 [chauhanpranav040@gmail.com](mailto:chauhanpranav040@gmail.com)
🐙 [GitHub](https://github.com/Pranav04027)

---

## 📄 License

MIT License. Feel free to fork and experiment!
