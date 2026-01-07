# 🏥 Skin Cancer Detection System

AI-powered skin cancer detection with machine learning analysis, explainable AI, and patient management.

## ✨ Features

- **AI Analysis**: XGBoost ensemble model with 7 skin lesion types detection
- **Explainable AI**: Saliency maps and LLM-powered medical insights
- **Patient Management**: Comprehensive history with search and CSV export
- **Image Input**: Upload or camera capture with validation
- **PDF Reports**: Professional medical reports generation
- **Dashboard**: Real-time statistics and recent activity tracking

## 🚀 Quick Start

### Prerequisites
- Python 3.13+
- Node.js 16+
- PostgreSQL 15+

### Installation

**1. Backend Setup**
```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys and database URL
```

**2. Frontend Setup**
```bash
cd frontend
npm install
```

**3. Run Application**
```bash
# Terminal 1 - Backend
python app.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Access:** http://localhost:3001

## 🔑 Environment Variables

Required in `.env` file:

```bash
# Database (PostgreSQL)
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/skin_cancer_db

# Roboflow ML Model
ROBOFLOW_API_KEY=your_roboflow_key
WORKSPACE=your_workspace
PROJECT=your_project
VERSION=1

# Groq LLM API
GROQ_API_KEY=your_groq_key

# Security
SECRET_KEY=your_secret_key
```

## 📱 Usage

1. **Register/Login** - Create account or sign in
2. **New Analysis** - Upload or capture skin lesion image
3. **View Results** - Get AI diagnosis with confidence scores and explainability
4. **History** - Browse past analyses, export CSV, download PDF reports
5. **Dashboard** - View statistics and recent activity

## 🛠️ Tech Stack

**Backend:** Flask, SQLAlchemy, PostgreSQL, Roboflow, Groq LLM, ReportLab  
**Frontend:** React 18, Vite, React Router, Tailwind CSS  
**ML/AI:** XGBoost Ensemble, Explainable AI (XAI), Saliency Mapping

## 🏥 Skin Lesion Types Detected

1. **Melanoma** 🔴 - High risk skin cancer
2. **Basal Cell Carcinoma** 🔴 - Most common skin cancer
3. **Actinic Keratoses** 🟠 - Pre-cancerous lesions
4. **Benign Keratosis** 🟢 - Non-cancerous growths
5. **Dermatofibroma** 🟢 - Benign skin lesions
6. **Melanocytic Nevi** 🟢 - Common moles
7. **Vascular Lesions** 🟢 - Blood vessel lesions

## 📊 Database

**PostgreSQL** is used for production with:
- User authentication and management
- Patient records and history
- Analysis results storage
- Database migrations with Flask-Migrate

To manage database:
```bash
# Create migration
flask db migrate -m "Description"

# Apply migration
flask db upgrade

# Backup database
pg_dump -U user dbname > backup.sql
```

## 📄 License

MIT License - See LICENSE file for details

---

**Version 2.0.0** | Built with Flask + React + PostgreSQL
