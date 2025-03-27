# Security Visualization Platform

A comprehensive web application for understanding, visualizing, and learning about cryptographic algorithms and security concepts.

## 🌐 Live Demo

Visit the live platform at [securityviz.site](https://securityviz.site)

## 📝 Overview

Security Visualization Platform is an interactive educational tool designed to help students, professionals, and security enthusiasts understand complex cryptographic concepts through visual demonstrations, interactive tools, and quizzes.

The platform focuses on making security concepts accessible through:
- Interactive algorithm visualizations
- Cryptographic strength assessment tools
- Algorithm comparison tools
- Educational quizzes with leaderboards

## ✨ Features

### 🔐 Algorithm Visualizations

The platform provides detailed visualizations for multiple cryptographic algorithms:

- **AES (Advanced Encryption Standard)**: Step-by-step visualization of the AES encryption process
- **DES (Data Encryption Standard)**: Interactive demonstration of this classic symmetric-key algorithm
- **RSA (Rivest–Shamir–Adleman)**: Visual explanation of this widely-used asymmetric algorithm
- **Blowfish**: Complete walkthrough of the Blowfish encryption and decryption process
- **SHA (Secure Hash Algorithm)**: Visualization of the hashing process and how it ensures data integrity
- **Quantum Key Distribution**: Introduction to next-generation quantum cryptography concepts

Each visualization includes:
- Interactive step-by-step process explanation
- Visual guides showing data transformation
- Real-time changes as you modify inputs
- Educational explanations of each algorithm's strengths and weaknesses

### 🔍 Key Strength Analyzer

- Evaluate password/key strength against various cryptographic standards
- Get specific recommendations for improving security
- Visual representation of security levels for different algorithms
- Compare your key's strength against common attack methods

### 📊 Algorithm Comparison Tool

- Comprehensive side-by-side comparison of all implemented algorithms:
  - Speed and performance metrics
  - Security level assessment
  - Resource usage benchmarks
  - Key size recommendations
  - Implementation complexity analysis
- Interactive charts and detailed comparison tables
- Scenario-based recommendations for choosing the right algorithm

### 📚 Educational Quizzes

- Test your knowledge on all six cryptographic algorithms
- Compete on algorithm-specific leaderboards with other users
- Earn badges and track your progress across different security concepts

### 👤 User Authentication System

- Secure registration and login
- Email verification for account security
- Password recovery with secure token-based reset

## 🛠️ Technology Stack

### Frontend
- HTML5, CSS3, JavaScript
- Chart.js for data visualization
- TailwindCSS for styling
- FontAwesome for icons

### Backend
- Python with Flask
- MongoDB for database
- bcrypt for password hashing
- JWT-based authentication
- Email verification system

## 🔧 Development and Deployment

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Goxtham/Security-Viz-frontend.git
cd Security-Viz-frontend
```

2. Open `index.html` in your browser or use a local server:
```bash
# Python 3
python -m http.server 8080
```

3. The backend repository is available at a separate location and requires:
   - Python 3.7+
   - MongoDB
   - Required Python packages (Flask, PyMongo, bcrypt, etc.)

### Deployment

The platform uses a distributed deployment model:
- Frontend: Hosted on GitHub Pages or any static hosting platform
- Backend: Deployed on Render.com at [security-viz-api.onrender.com](https://security-viz-api.onrender.com)
- Domain management through a custom domain provider

## 🧪 Testing

The platform includes comprehensive testing for:
- Cross-browser compatibility
- Mobile responsiveness
- Security features including CSRF protection, XSS prevention
- Authentication flow validation

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salting
- **Session Management**: Secure, HttpOnly cookies with proper SameSite attributes
- **CORS Protection**: Properly configured Cross-Origin Resource Sharing
- **Input Validation**: Server-side validation of all inputs
- **Two-factor Authentication**: Email verification for sensitive operations

## 📱 Responsive Design

The platform is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablets
- Mobile devices

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
© 2025 Security Visualization Platform
