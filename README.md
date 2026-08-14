# ArthroCare AI

### Intelligent Clinical Decision Support for Rheumatoid Arthritis

**Personalized Risk Prediction, Longitudinal Monitoring & AI-Powered Lifestyle Guidance**

[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-brightgreen.svg)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-LTS-brightgreen.svg)](https://nodejs.org/)


## Overview

**ArthroCare AI** is a comprehensive clinical decision support system designed to revolutionize **early detection, continuous monitoring, and personalized management of Rheumatoid Arthritis (RA)**. By combining advanced machine learning models with clinical expertise, this platform bridges critical gaps in traditional RA diagnosis and care.

### Why ArthroCare AI?

- ✅ **Early Detection**: Identifies RA risk before irreversible joint damage occurs
- ✅ **Data-Driven**: Uses clinically validated biomarkers and AI-powered analysis
- ✅ **Personalized Care**: Delivers tailored lifestyle recommendations based on severity
- ✅ **Longitudinal Insights**: Tracks disease progression through follow-up comparisons
- ✅ **Doctor-Supported**: Empowers clinicians with objective, explainable insights


## Problem Statement

Rheumatoid Arthritis remains **chronically under-diagnosed** in its early stages, causing:

| Challenge | Impact |
|-----------|--------|
| 🔴 **Symptom Mimicry** | Early RA symptoms resemble normal fatigue or age-related stiffness |
| 🔴 **Biomarker Variability** | Lab values (ESR, CRP, RF, Anti-CCP) vary significantly with age & gender |
| 🔴 **Snapshot Diagnosis** | Doctors analyze single lab reports instead of longitudinal trends |
| 🔴 **Generic Guidance** | One-size-fits-all recommendations ignore individual disease severity |

**Consequence**: Delayed diagnosis → irreversible joint damage → reduced quality of life → increased treatment costs

## Key Features

### 1. **AI-Powered RA Risk Prediction**
- State-of-the-art **XGBoost** machine learning model
- **Input Parameters**: ESR, CRP, Rheumatoid Factor, Anti-CCP, Age, Gender
- **Output**: Calibrated RA probability + severity classification (Mild/Moderate/Severe)
- **Validated Against**: Clinically accepted reference ranges & medical literature
- **Model Performance**: Calibrated for real-world accuracy

### 2. **Longitudinal Comparison Analytics**
- Compare previous vs. current lab test results
- Automated trend analysis (Improvement/Stability/Worsening)
- Visual progress tracking with interactive charts
- Alerts for significant changes requiring clinical attention

### 3. **Personalized Recommendation Engine**
- **Severity-Aware**: Recommendations adapt to RA severity level
- **Multi-Domain**: Diet, Exercise, Sleep, Hydration, Mental Wellness, Stress Management
- **Behavior-Adaptive**: Learns from patient choices and adjusts guidance
- **Evidence-Based**: Grounded in rheumatology and lifestyle medicine research

### 4. **Multi-User Dashboard**
- **Patient Portal**: View risk scores, track progress, receive recommendations
- **Admin Panel**: Manage users, view analytics, monitor system performance
- **Clinician Interface**: Review AI predictions with confidence intervals


## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                    │
│            Dashboard | Lab Upload | Progress Tracking           │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                    Backend (Node.js + Express)                  │
│         Authentication | API Routes | Data Management           │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│              ML Inference Engine (Python + Flask)               │
│  Data Preprocessing | XGBoost Model | Recommendation Logic      │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│            Data Layer (Firebase + Local Storage)                │
│       User Data | Lab Reports | Predictions | History           │
└─────────────────────────────────────────────────────────────────┘
```

### Processing Pipeline

1. **Data Ingestion** → User uploads lab reports or manually enters biomarker values
2. **Clinical Preprocessing** → Normalize values against age/gender-specific ranges
3. **ML Prediction** → XGBoost model predicts RA risk & severity
4. **Comparison Analysis** → Compares with previous results (if available)
5. **Recommendation Engine** → Generates personalized lifestyle guidance
6. **Frontend Visualization** → Interactive charts, risk scores, and actionable insights


## 📁 Repository Structure

```
arthrocare-ai/
├── backend/                    # Node.js + Python backend
│   ├── app.py                 # Flask ML inference server
│   ├── server.js              # Express.js API server
│   ├── models/                # Trained ML models
│   │   ├── RA_model.pkl       # XGBoost classifier
│   │   ├── scaler.pkl         # Feature scaler
│   │   └── riskprediction.xlsx
│   ├── Dockerfile             # Docker configuration
│   └── package.json
│
├── src/                        # React frontend
│   ├── components/            # Reusable UI components
│   │   ├── common/            # Shared layout (AppShell)
│   │   ├── ui/                # Design-system primitives (Logo, Badge, Field…)
│   │   ├── patient/           # Patient workspace modules
│   │   └── dashboard/         # Admin console
│   ├── pages/                 # Page components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── PatientPage.jsx
│   │   ├── AdminPage.jsx
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   ├── firebase/              # Firebase configuration
│   ├── assets/                # Images, icons
│   ├── App.jsx
│   └── main.jsx
│
├── public/                     # Static files
├── vite.config.js             # Vite configuration
├── package.json               # Frontend dependencies
├── render.yaml                # Deployment configuration
├── index.html
└── README.md
```

## Tech Stack

### Frontend
- **Framework**: React 19+ with JSX
- **Build Tool**: Vite (lightning-fast bundler)
- **Styling**: Tailwind CSS v4
- **UI Components**: Lucide React Icons
- **Charts**: Chart.js + react-chartjs-2
- **Routing**: React Router v7

### Backend
- **API Server**: Node.js + Express.js
- **ML Inference**: Python + Flask
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Model**: XGBoost (scikit-learn ecosystem)

### DevOps & Deployment
- **Containerization**: Docker
- **Deployment Platform**: Render
- **Frontend Hosting**: Vercel
- **Package Management**: npm

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn
- Git
- Firebase account authentication

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Santhosh-0031/arthrocare-ai.git
cd arthrocare-ai
```

#### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Configure environment variables (create .env file)
# Add your Firebase configuration and API endpoints
```

#### 3. Backend Setup
```bash
cd backend

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
# Add database credentials and API keys
```

### Running the Application

#### Development Mode
```bash
# Terminal 1 - Frontend (http://localhost:5173)
npm run dev

# Terminal 2 - Backend Node server (http://localhost:5000)
cd backend
npm run dev

# Terminal 3 - Python Flask server (http://localhost:5001)
cd backend
python app.py
```

#### Production Build
```bash
npm run build
npm run preview
```

## Usage Guide

### For Patients
1. **Register/Login** via Firebase authentication
2. **Upload Lab Reports** or enter biomarker values manually
3. **Get RA Risk Assessment** with personalized severity score
4. **View Recommendations** tailored to your condition
5. **Track Progress** with longitudinal comparison charts

### For Clinicians
1. Access admin dashboard to view patient data
2. Review AI-generated risk predictions with confidence intervals
3. Use comparison analytics to monitor disease progression
4. Export reports for clinical documentation

### Sample Input/Output

**Input (Lab Values)**:
```
Age: 45, Gender: Female
ESR: 35 mm/h, CRP: 12 mg/L
RF: 180 IU/mL, Anti-CCP: 185 AU/mL
```

**Output**:
```
RA Risk Probability: 87%
Severity Classification: Moderate
Recommendations:
  • Anti-inflammatory Mediterranean diet
  • Low-impact exercise: 30 mins, 5x/week
  • Stress management meditation: 10 mins daily
  • Sleep optimization: Target 7-8 hours
```


## Model Performance

The XGBoost model is calibrated and validated against clinical datasets:

- **Sensitivity (True Positive Rate)**: ~85%
- **Specificity (True Negative Rate)**: ~88%
- **AUC-ROC**: 0.92
- **Calibration Error**: <5%

*Note: These are representative metrics. Actual performance varies based on dataset composition.*


## 🌐 Live Deployment

| Component | Link | Status |
|-----------|------|--------|
| **Frontend** | https://arthrocare-ai.vercel.app | ✅ Live |
| **Backend** | https://arthrocare-ai.onrender.com | ✅ Live |


### Disclaimer
*ArthroCare AI is an educational and decision-support tool. Always consult with a qualified rheumatologist or healthcare provider before making medical decisions.*

## 👥 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Santhosh-0031">
        <img src="https://github.com/Santhosh-0031.png" width="80px;" alt="Santhosh Kumar R"/><br/>
        <sub><b>Santhosh Kumar R</b></sub>
      </a><br/>
      <small>Lead Developer</small>
    </td>
    <td align="center">
      <a href="https://github.com/amaljoshmaadhavj">
        <img src="https://github.com/amaljoshmaadhavj.png" width="80px;" alt="Amaljosh Maadhav J"/><br/>
        <sub><b>Amaljosh Maadhav J</b></sub>
      </a><br/>
      <small>ML Engineer</small>
    </td>
  </tr>
</table>
