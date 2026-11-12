**# 💰 FinApp — Personal Finance & Budget Management Platform**

A modern, full-stack financial management web application built with HTML5, CSS3, Bootstrap 5, React.js on the frontend and Node.js, Express.js, MongoDB (Mongoose), and REST APIs on the backend.

\---

**## 🌟 Key Architecture & Modular Highlights**

**### 1. Modular Directory Structure**
\`\`\`text
finapp/
├── backend/                             # Node.js + Express REST API
│   ├── config/                          # App & environment configuration
│   ├── database/                        # 🗄️ Separate folder for MongoDB
│   │   ├── connection.js                # Resilient MongoDB connection & auto-reconnect
│   │   └── seed.js                      # Seeds default categories and admin user
│   ├── middleware/                      # Auth JWT, Multer uploads, error handling
│   ├── modules/                         # Feature-isolated backend modules
│   │   ├── auth/                        # JWT authentication, OTP validation, user profile
│   │   ├── expenses/                    # CRUD, filtering, search, receipt photo attachments
│   │   ├── income/                      # Income tracking across multiple sources
│   │   ├── budgets/                     # Category budgets with automated overspend alerts
│   │   ├── categories/                  # System default + user custom categories
│   │   ├── recurring/                   # Auto-repeating rent, subscriptions, EMIs (cron job)
│   │   ├── dashboard/                   # Aggregated statistics, pie/bar chart metrics
│   │   ├── reports/                     # 📥 Local disk export engine (CSV, PDF, JSON)
│   │   └── notifications/               # In-app budget warnings and reminders
│   ├── uploads/                         # Stored receipts and attachments
│   ├── .env                             # Environment variables
│   ├── package.json
│   └── server.js                        # Express server entry point
│
└── frontend/                            # React.js + Bootstrap 5 frontend
    ├── public/
    └── src/
        ├── components/
        │   ├── Navbar.jsx               # Top bar with notifications & quick-add trigger
        │   ├── Sidebar.jsx              # Dark navy navigation sidebar
        │   ├── LockScreen.jsx           # Biometric & PIN lock security screen
        │   └── charts/                  # Canvas interactive donut & trend charts
        ├── context/
        │   └── AuthContext.js           # Auth state, PIN lock state, JWT token handling
        ├── modules/                     # Modular frontend feature screens
        │   ├── auth/
        │   ├── dashboard/
        │   ├── expenses/
        │   ├── income/
        │   ├── budgets/
        │   ├── categories/
        │   ├── recurring/
        │   ├── reports/
        │   └── settings/
        ├── utils/                       # API Axios client, constants, currency formatters
        ├── App.js                       # React Router configuration & layout
        └── App.css                      # Modern gradient cards & responsive styling
\`\`\`

\---

**## 📥 Dedicated Local Disk Download Module (Requirement 3)**

The website includes a dedicated Reports & Local Disk Download Module (\`/reports\`):
\- Month selector for any month or custom period
\- Three prominent download cards with icons:
  1. 📥 Download CSV spreadsheet
  2. 📄 Download PDF statement
  3. 💾 Download JSON backup
\- Live preview table to inspect expenses and income before saving

\---

**## 🚀 Getting Started**

**### Prerequisites**
\- [Node.js]\([https://nodejs.org/](https://nodejs.org/)) (v16 or higher)
\- [MongoDB]\([https://www.mongodb.com/](https://www.mongodb.com/)) running locally or a [MongoDB Atlas]\([https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)) URI

**### 1. Database Configuration**
In \`backend/.env\`, verify or configure your MongoDB connection string:
\`\`\`env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finapp
JWT_SECRET=super_secret_finapp_jwt_key_2026_finance_tracker
JWT_EXPIRE=7d
NODE_ENV=development
\`\`\`

(Optional) Run the database seeder to create default categories and a demo admin user:
\`\`\`bash
npm run seed:backend
\`\`\`

\> Demo Admin Credentials:
\> Email: \`admin@finapp.com\`
\> Password: \`Admin@123\`

\---

**### 2. Start the Backend API**
\`\`\`bash
*# From the project root*
npm run start:backend

*# Or directly in the backend folder:*
cd backend
npm start
\`\`\`
The REST API will start on: \`[http://localhost:5000/api/v1](http://localhost:5000/api/v1)\`

\---

**### 3. Start the React Frontend**
\`\`\`bash
*# In a new terminal from the project root*
npm run start:frontend

*# Or directly in the frontend folder:*
cd frontend
npm start
\`\`\`
The React app will open at: \`[http://localhost:3000](http://localhost:3000)\`

\---

**## 🐳 Docker & Docker Compose (Quick One-Command Setup)**

Run the entire application stack (MongoDB + Express backend + React frontend) with a single command:

\`\`\`bash
*# From the project root*
docker-compose up --build
\`\`\`

**### What Docker Compose Launches**
1\. \`finapp-mongodb\` (MongoDB 7.0 database with persistent volume \`mongodb_data\`)
2\. \`finapp-backend\` (Node.js API on the private Compose network)
3\. \`finapp-frontend\` (production Nginx server hosting the React app on port \`3000\`)

**### Accessing the Dockerized Services**
\- Web App (Frontend): [http://localhost:3000](http://localhost:3000)
\- REST API (proxied through Nginx): [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
\- API Health Check: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

**### Seed Sample Data in Docker**
\`\`\`bash
docker-compose exec backend npm run seed
\`\`\`

**### Stop Containers**
\`\`\`bash
docker-compose down
\`\`\`

\---

**## 🚀 Continuous Deployment to AWS EC2**

The \`.github/workflows/cd.yml\` workflow deploys to an Amazon Linux 2023 EC2 instance after the \`CI\` workflow succeeds on the latest commit to \`main\`.

**### EC2 setup**
1. Install and start Docker Engine and the Docker Compose plugin.
2. Clone this repository into \`~/finapp\`, with the \`main\` branch checked out. The EC2 instance must be able to fetch the repository from GitHub.
3. Create \`~/finapp/.env\` using [\.env.example](./.env.example), and replace the example values with production settings. Do not commit this file.
4. Ensure the EC2 security group allows inbound SSH from the GitHub Actions runner strategy you use and inbound web traffic on port \`3000\`. Do not expose MongoDB credentials or the \`27017\` database port publicly.

The Compose setup stores MongoDB data in the persistent \`mongodb_data\` Docker volume and uploaded receipts in \`uploads_data\`; redeploying containers does not remove either volume.

**### GitHub Actions secrets**
Add these repository secrets under **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| \`EC2_HOST\` | EC2 public DNS name or IP address |
| \`EC2_USER\` | EC2 SSH user (commonly \`ec2-user\`) |
| \`EC2_SSH_KEY\` | Private SSH key authorized on the EC2 instance |
| \`EC2_KNOWN_HOSTS\` | Verified SSH host-key line for the EC2 host |

The EC2 SSH public key must be authorized for the chosen user. To create \`EC2_KNOWN_HOSTS\`, verify the instance host key through a trusted channel, then add the resulting known-hosts line as a secret. The workflow verifies the SSH host key rather than accepting unknown hosts.

Set production application values only in \`~/finapp/.env\` on EC2. At minimum, set a unique strong \`JWT_SECRET\`; configure \`EMAIL_USER\` and \`EMAIL_PASS\` if email/OTP delivery is required. The workflow does not print or transfer application secrets.

---

**## 🛡️ Security & Privacy (DPDP / GDPR Compliance)**
\- PIN and biometric-style lock protection in the app
\- JWT-based authentication with HTTP authorization headers
\- Client-side automatic logout on token expiry
\- Self-hosted database and export/deletion features to support privacy control

\---

**## 📌 Project Summary**
This application is designed for personal finance management, budgeting, recurring expenses, reporting, and secure local export workflows for both end users and administrators.