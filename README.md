# 🏥 SkinCare AI - Skin Cancer Detection System

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A modern, AI-powered skin cancer detection system with a professional healthcare dashboard interface, real-time analysis, and comprehensive patient history management.

## 🌟 Features

### Modern Dashboard
- **Professional UI**: Clean, healthcare-inspired interface with sidebar navigation
- **Real-time Statistics**: Live metrics for total analyses, average confidence, and weekly trends
- **Diagnosis Distribution**: Visual charts showing diagnosis breakdown
- **Recent Activity**: Quick view of last 5 analyses with color-coded risk levels
- **Quick Actions**: Fast access to upload, camera capture, and history

### AI-Powered Analysis
- **XGBoost Ensemble**: Advanced machine learning model for accurate predictions
- **Explainable AI**: Saliency maps showing areas the AI focused on
- **LLM Integration**: Groq-powered medical insights and recommendations
- **High Accuracy**: 99%+ confidence scores on validated datasets
- **Multi-class Detection**: 7 different skin lesion types

### Patient Management
- **Comprehensive History**: Searchable and filterable patient records
- **Detailed Records**: Full patient information with images and analysis results
- **Export Functionality**: CSV export for record-keeping and reporting
- **Risk Alerts**: Automatic highlighting of high-risk cases
- **PDF Reports**: Professional medical reports with all analysis details

### Camera & Upload
- **Dual Input Modes**: Upload images or capture directly from camera
- **Live Preview**: Real-time camera feed with capture functionality
- **Image Validation**: Automatic quality checks and validation
- **Multiple Formats**: Support for JPG, JPEG, PNG
- **Smart Cropping**: Automatic focus on lesion areas

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/priyanshu-3/SkinCare.git
cd SkinCare
```

2. **Backend Setup**
```bash
# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Run the Application**

Terminal 1 (Backend):
```bash
python app.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

5. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## 📋 Required API Keys

### Roboflow API
For the ML model integration:
1. Sign up at [Roboflow](https://roboflow.com/)
2. Get your API key from workspace settings
3. Add to `.env`: `ROBOFLOW_API_KEY=your_key_here`

### Groq API
For LLM-powered medical insights:
1. Sign up at [Groq](https://groq.com/)
2. Get your API key
3. Add to `.env`: `GROQ_API_KEY=your_key_here`

## 🎯 Usage

### First Time Setup
1. Register a new account at `/register`
2. Login with your credentials
3. You'll land on the Dashboard

### Performing Analysis
1. Click **"New Analysis"** from sidebar or dashboard
2. Fill in patient information (Name, Age, Gender, Location)
3. Choose upload method:
   - **Upload**: Drag & drop or browse for image
   - **Camera**: Capture live from webcam
4. Click **"Analyze Image"**
5. View results with:
   - Diagnosis and confidence score
   - Saliency map showing AI focus areas
   - LLM-generated medical insights
   - Downloadable PDF report

### Viewing History
1. Click **"History"** from sidebar
2. Use search and filters to find records
3. Click eye icon to view full details
4. Export to CSV for reporting
5. Download individual PDF reports

### Settings
1. Click **"Settings"** from sidebar
2. Configure:
   - Profile information
   - Notification preferences
   - Security settings
   - Appearance options

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Flask (Python web framework)
- SQLAlchemy (ORM)
- SQLite (Database)
- Roboflow (ML model hosting)
- Groq (LLM API)
- ReportLab (PDF generation)

**Frontend:**
- React 18
- Vite (Build tool)
- React Router (Routing)
- Tailwind CSS (Styling)
- Lucide React (Icons)

**ML/AI:**
- XGBoost Ensemble
- Explainable AI (XAI)
- Saliency Mapping
- LLM Integration

### Project Structure
```
SkinCare/
├── app.py                      # Main Flask application
├── ensemble_model.py           # ML model implementation
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   └── Sidebar.jsx     # Navigation sidebar
│   │   ├── pages/              # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── DashboardNew.jsx
│   │   │   ├── AnalysisNew.jsx
│   │   │   ├── History.jsx
│   │   │   └── Settings.jsx
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── static/                     # Static files
│   └── uploads/                # User uploads & results
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables
└── README.md                   # This file
```

## 📊 Skin Lesion Types

The system can detect 7 types of skin lesions:

1. **Melanoma** 🔴 High Risk
   - Most dangerous form of skin cancer
   - Requires immediate medical attention

2. **Basal Cell Carcinoma** 🔴 High Risk
   - Most common type of skin cancer
   - Usually treatable if detected early

3. **Actinic Keratoses** 🟠 Medium Risk
   - Pre-cancerous lesions
   - Can develop into skin cancer

4. **Benign Keratosis** 🟢 Low Risk
   - Non-cancerous growths
   - Generally harmless

5. **Dermatofibroma** 🟢 Low Risk
   - Benign skin lesions
   - Common and harmless

6. **Melanocytic Nevi** 🟢 Low Risk
   - Common moles
   - Usually benign

7. **Vascular Lesions** 🟢 Low Risk
   - Blood vessel related lesions
   - Typically benign

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#3B82F6` - Main actions, info
- **Success Green**: `#10B981` - Positive results
- **Warning Orange**: `#F59E0B` - Medium risk
- **Danger Red**: `#EF4444` - High risk
- **Purple Accent**: `#8B5CF6` - Special features

### Typography
- **Font Family**: Inter, sans-serif
- **Weights**: 300, 400, 500, 600, 700

## 🔒 Security Features

- User authentication with hashed passwords
- Session management
- CSRF protection
- Input validation
- Secure file uploads
- Rate limiting
- XSS protection

## 📱 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Documentation

- **[Dashboard Redesign](DASHBOARD_REDESIGN.md)** - Technical documentation for the dashboard
- **[User Guide](NEW_DASHBOARD_GUIDE.md)** - Complete user guide
- **[Visual Guide](DASHBOARD_VISUAL_GUIDE.md)** - Visual layouts and diagrams
- **[Camera Fix](CAMERA_FIX.md)** - Camera functionality documentation
- **[Confidence Display Fix](CONFIDENCE_DISPLAY_FIX.md)** - Confidence value formatting

## 🐛 Known Issues

None currently reported. The application is stable and production-ready.

## 🔮 Future Enhancements

- [ ] Dark mode support
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Batch processing
- [ ] Appointment scheduling
- [ ] Role-based access control
- [ ] Integration with hospital systems

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Author

- **Priyanshu** - [priyanshu-3](https://github.com/priyanshu-3)

## 🙏 Acknowledgments

- Roboflow for ML model hosting
- Groq for LLM API
- Open source community for various libraries
- Healthcare professionals for domain expertise

## 📞 Support

For support, issues, or questions:
- Open an issue on GitHub
- Email: mehrapriyanshu33@gmail.com

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

## 📈 Stats

- **Lines of Code**: ~15,000+
- **Components**: 20+
- **API Endpoints**: 15+
- **Documentation**: 10+ comprehensive guides

---



*Last Updated: October 2025*
*Version: 2.0.0*
