# StoryMail

<div align="center">
  <img src="logo.png" alt="StoryMail Logo" width="200"/>
  <h3>AI-Powered Email Management and Insights</h3>
  <p>Turn your chaotic email inbox into structured, intelligent, and beautifully visual summaries</p>
</div>

StoryMail transforms how you interact with your inbox by leveraging AI to categorize, summarize, and extract insights from your emails. Stop drowning in a sea of messages and start understanding the narrative of your communications.

## ✨ Features

### 📊 Email Analytics & Categorization
- **Smart Categorization**: Automatically sorts emails into categories (Work, Productivity, Newsletters, Scam, Other)
- **Visual Dashboard**: Get a visual breakdown of your email distribution across categories
- **Real-time Processing**: Emails are processed as they arrive via Postmark webhook integration
- **Streaks & Stats**: Track communication patterns and email frequency metrics

### 🤖 AI-Powered Email Understanding
- **Email Summaries**: Get concise summaries of long emails to quickly understand their content
- **Context-Aware Insights**: AI identifies important information and patterns across your emails
- **Spam Detection**: Advanced identification of potential scams and unwanted communications

### 📝 Weekly Email Digests
- **Personalized Newsletter**: Receive a weekly summary of your inbox activity as a story
- **Key Highlights**: Important emails, patterns, and insights highlighted automatically
- **Email Clustering**: Related emails automatically grouped by sender or topic in a mind palace-like visualization
- **Download or Email**: Get your digest as a beautifully formatted PDF or directly in your inbox
- **Automated Delivery**: Digests automatically generated and delivered every Sunday

### 💬 Conversational Email Assistant
- **Natural Language Queries**: Ask questions about your emails in plain English (e.g., "Show me last week's job offers")
- **Email Search**: Find emails across your archive through conversation
- **Context-Aware Responses**: Assistant maintains context of your email history
- **Custom Summaries**: Request focused summaries (e.g., "Summarize today's newsletters with links")

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14+ with React
- **Styling**: Tailwind CSS with shadcn/ui component system
- **State Management**: React Context API
- **Authentication**: Auth0 integration with protected routes
- **Data Fetching**: Fetch API with proper error handling
- **Deployment**: Vercel

### Backend
- **Framework**: Django (Python) with Django REST Framework
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: Auth0 integration with JWT validation
- **AI Integration**: Google Generative AI (Gemini API)
- **Email Processing**: Postmark for inbound email handling and delivery
- **PDF Generation**: ReportLab for dynamic PDF report creation
- **Deployment**: PythonAnywhere with scheduled tasks for digests
- **API Documentation**: Automatic REST documentation via DRF

### DevOps
- **Version Control**: Git
- **Environment Configuration**: dotenv for environment variables
- **Scheduled Tasks**: PythonAnywhere CRON jobs for weekly digests

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Postmark account (for email processing)
- Google Generative AI API key
- Auth0 account

### Email Setup with Postmark

1. Create an account on [Postmark](https://postmarkapp.com/)
2. Set up an inbound server and note the email address provided by Postmark
3. Forward your emails to this inbound address
4. Configure the webhook endpoint in Postmark settings:
   ```
   https://storymail-production.up.railway.app/api/postmark/inbound/
   ```
5. Emails sent to your Postmark inbound address will now be processed by StoryMail
6. Make sure account you logged in Storymail is same as account from which you are forwarding mails.
### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/storymail.git
   cd storymail
   ```

2. Create and activate a virtual environment
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your Auth0, Gemini, Postmark keys
   ```

5. Run migrations
   ```bash
   python manage.py migrate
   ```

6. Start the development server
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Install dependencies
   ```bash
   cd ../storymail
   npm install  # or pnpm install
   ```

2. Configure environment variables
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. Run the development server
   ```bash
   npm run dev  # or pnpm dev
   ```

4. Visit `http://localhost:3000` to access the application

## 📝 API Documentation

### Authentication
- `POST /api/auth/login/`: Redirect to Auth0 login
- `GET /api/auth/callback/`: Auth0 callback handling
- `POST /api/auth/logout/`: Logout user
- `GET /api/auth/user/`: Get authenticated user info

### Email Management
- `POST /api/postmark/inbound/`: Webhook for inbound emails
- `GET /api/categories/stats/`: Get email category statistics
- `GET /api/emails/`: List emails (filterable by category)
- `GET /api/emails/<id>/`: Get email details

### AI Features
- `POST /api/chat/`: Ask questions about your emails
- `POST /api/digest/`: Generate weekly email digest

## 🧠 Example Use Cases

- "Show all scam emails from last month."
- "Summarize this week's newsletters."
- "What's my email productivity trend?"
- "Generate weekly digest PDF and email it."

## 📋 Project Structure

```
StoryMail/
│
├── backend/                 # Django project (API)
│   ├── backend/             # Django settings and URLs
│   ├── custom_auth/         # Auth0 authentication
│   ├── mainlogic/           # Core email processing models and views
│   │   ├── models.py        # Email, User, and Digest models
│   │   ├── views.py         # API endpoints for emails and digests
│   │   └── ...
│   ├── manage.py
│   └── requirements.txt
│
├── storymail/               # Next.js frontend
│   ├── app/                 # Pages and routes
│   ├── components/          # UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── ...
│
└── README.md
```

## 🔮 Future Improvements

### Short-Term Enhancements
- **Email Reply Interface**: Reply to emails directly from the application
- **Mobile App**: React Native mobile application
- **Custom Categories**: Allow users to create and train custom email categories
- **Team Collaboration**: Shared inbox capabilities for teams
- **Google Calendar Integration**: Extract and manage tasks from emails

### Long-Term Vision
- **Sentiment Analysis**: Understand the emotional tone of your communications
- **Advanced Calendar Integration**: Extract events and schedule automatically
- **Task Extraction**: Identify action items from emails and create tasks
- **AI-Powered Email Templates**: Generate personalized response templates
- **Multi-Language Support**: Process and understand emails in multiple languages
- **More Visualizations**: Timelines, streak graphs, and communication patterns

### Technical Roadmap
- **Microservice Architecture**: Split functionality into specialized services for scalability
- **Real-time Updates**: Socket integration for live email notifications
- **Full-Text Search**: Advanced email search capabilities with ElasticSearch
- **Analytics Pipeline**: Big data processing for deeper email insights
- **Self-Hosted Option**: Containerized deployment for privacy-focused customers

## 🤝 Contributing

We welcome contributions! Feel free to open issues, fork the repository, and submit pull requests.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Auth0 for secure authentication
- Postmark for reliable email delivery
- The open source communities of Django, Next.js, and shadcn/ui

## 🌟 Author

Made with ❤️ by Ashish Nagmoti