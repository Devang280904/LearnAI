# LearnAI 🧠✨

LearnAI is an intelligent, full-stack educational platform that transforms static documents into interactive learning experiences. Built with modern web technologies and powered by Google's Gemini AI, LearnAI allows users to upload study materials and instantly generate summaries, flashcards, quizzes, and even chat directly with their documents.

## 🌟 Features

- **📄 Smart Document Uploads:** Upload PDF documents and have them automatically parsed and analyzed.
- **💬 AI Document Chat:** Have a conversational Q&A with your document. Ask questions and get instant, context-aware answers.
- **📝 Auto-Summarization:** Generate perfectly structured, beautiful markdown summaries with overviews, key points, and revision notes.
- **🗂️ Flashcard Generation:** Automatically extract key concepts from your text and convert them into interactive flashcard sets for active recall.
- **🎯 AI Quizzes:** Test your knowledge with dynamically generated multiple-choice quizzes, complete with real-time scoring and feedback.
- **🔐 Secure Authentication:** Full user authentication system with JWT, ensuring your documents and progress remain completely private.

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework:** React + Vite
- **Styling:** Tailwind CSS (v4)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Routing:** React Router DOM
- **Markdown:** React Markdown
- **HTTP Client:** Axios

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **AI Integration:** Google Generative AI SDK (`gemini-2.5-flash`)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **File Handling:** Multer & pdf-parse

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your machine. You will also need a free API key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Devang280904/LearnAI.git
   cd LearnAI
   ```

2. **Set up the Backend:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory and add the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   GEMINI_API_KEY=your_google_gemini_api_key
   CLIENT_URL=http://localhost:5173
   ```
   Start the backend development server:
   ```bash
   npm run dev
   ```

3. **Set up the Frontend:**
   Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   npm install
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Open the App:**
   Visit `http://localhost:5173` in your browser. Create an account, upload a PDF, and start learning!


## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📜 License
This project is licensed under the MIT License.
