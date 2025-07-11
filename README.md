# 🩺 HealthCare Chatbot

A smart healthcare chatbot built using **HTML, CSS, JavaScript, Flask**, and **OpenAI API** to assist users with health-related queries. It also stores and displays chat history using **SQLite**.

---

## 📌 Features

- 🤖 AI-powered responses to health-related questions
- 🗂️ Stores chat history by session
- 💬 View all previous chats
- 🗑️ Option to clear or delete specific chat sessions
- 🌐 Responsive and professional frontend UI

---

## 🛠️ Tech Stack

| Frontend     | Backend      | Database | API         |
|--------------|--------------|----------|-------------|
| HTML, CSS, JS| Flask (Python)| SQLite   | OpenAI API  |

---

## 📂 Project Structure

```
healthcare-chatbot/
├── static/                # CSS, JS, image files
├── templates/             # HTML templates
├── chat_db.py             # DB utility functions
├── chat_history.db        # SQLite DB (auto-generated)
├── app.py                 # Main Flask app
├── .env                   # API key and secret config
├── requirements.txt       # Python dependencies
└── README.md              # Project documentation
```

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Abhinaya54/healthcare-chatbot.git
cd healthcare-chatbot
```

### 2. Set up virtual environment (optional but recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Add your OpenAI API key to `.env`
Create a file called `.env` in the root folder and add:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 5. Run the Flask app
```bash
python app.py
```

Then open in browser: [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 🔒 Environment Setup (`.env` file)

Your `.env` file should contain:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 📌 TODO / Future Improvements

- Add user authentication
- Integrate with a real medical knowledge base
- Deploy on Render or Heroku
- Add voice input and TTS (Text-to-Speech)
- Improve chatbot accuracy using fine-tuned LLMs

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🙋‍♀️ Author

**Abhinaya Pulagam**  
📧 [abhinayapulgam@gmail.com](mailto:abhinayapulgam@gmail.com)  
🔗 [GitHub - Abhinaya54](https://github.com/Abhinaya54)

---

## 🌐 Live Demo (Optional)

If deployed, add the link here:  
`🔗 https://your-deployment-url.com`
                                                                                                                                                                                                                       
