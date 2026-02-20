# 🏫 Campus Lost & Found

A full-stack **MERN** platform for campus communities to report, search, and reclaim lost & found items — with real-time chat, smart matching, admin moderation, and a token reward system.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Register, Login, Email OTP verification, Forgot/Reset password, JWT access + refresh tokens |
| **Report Lost Item** | Detailed form with images (drag & drop), location, category, color, brand, date, token reward |
| **Report Found Item** | Same rich form — finders earn tokens when items are claimed |
| **Browse & Search** | Keyword search, filters (type, category, building, color, date range, status), pagination |
| **Smart Matching** | Score-based algorithm auto-matches lost ↔ found items by category, color, brand, location, date |
| **Real-time Chat** | Private conversations between reporters — text + image messages, typing indicators, read receipts |
| **Admin Panel** | Dashboard stats, user management (ban/unban), item approval/rejection/dispute, grant tokens |
| **Notifications** | In-app + email notifications for matches, claims, approvals, messages, token rewards |
| **Token Rewards** | Finders earn tokens when items are successfully returned; admins can grant tokens |
| **Image Upload** | Up to 5 images per item (Cloudinary), avatar upload |

---

## 🛠 Tech Stack

**Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.io, JWT, Bcrypt, Cloudinary, Nodemailer  
**Frontend:** React 18, Vite, Tailwind CSS 3, Zustand, React Router 6, Socket.io-client, Framer Motion, Axios  

---

## 📦 Prerequisites

Install these before starting:

1. **Node.js** (v18+) — [https://nodejs.org/](https://nodejs.org/)
2. **MongoDB** — either:
   - Local: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Cloud: [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (free tier)
3. **Git** — [https://git-scm.com/](https://git-scm.com/)

**Cloud Services (free tiers available):**

4. **Cloudinary** account — [https://cloudinary.com/](https://cloudinary.com/) (image hosting)
5. **Gmail App Password** — [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (for sending OTP emails)

---

## 🚀 Setup & Installation

### 1. Clone the project

```bash
git clone <your-repo-url>
cd "Campos Lost And Found"
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/` (copy from `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campus-lost-and-found
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_SECRET_CODE=admin123
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd Frontend/client
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 📁 Project Structure

```
Campos Lost And Found/
├── Backend/
│   ├── config/          # DB, Cloudinary, Nodemailer setup
│   ├── controllers/     # Auth, Items, Chat, Admin, Notifications
│   ├── middleware/       # JWT auth, admin guard
│   ├── models/          # User, Item, Chat, Message, Notification, TokenTransaction
│   ├── routes/          # Express route files
│   ├── socket/          # Socket.io real-time handler
│   ├── utils/           # Email templates, smart matching algorithm
│   ├── server.js        # Entry point
│   └── package.json
│
└── Frontend/client/
    ├── src/
    │   ├── components/  # Layout, Common, Items, Chat, Notifications
    │   ├── context/     # SocketContext (real-time)
    │   ├── hooks/       # useDebounce
    │   ├── pages/       # All route pages (auth, items, chat, admin)
    │   ├── services/    # Axios API client
    │   ├── store/       # Zustand stores (auth, notifications)
    │   ├── App.jsx      # Router & app shell
    │   └── main.jsx     # Entry point
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 👤 Default Admin

To register as admin, use the secret code defined in `ADMIN_SECRET_CODE` env variable during registration (set role in the registration or via DB).

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/verify-email` | Verify OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Send reset OTP |
| POST | `/api/auth/verify-reset-otp` | Verify reset OTP |
| POST | `/api/auth/reset-password` | Set new password |
| GET  | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Items
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/items` | Create item report |
| GET  | `/api/items` | Browse items (with filters) |
| GET  | `/api/items/:id` | Get single item |
| PUT  | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |
| POST | `/api/items/:id/claim` | Claim item |
| PUT  | `/api/items/:id/resolve` | Resolve item |

### Chat
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/chat/start` | Start a chat |
| GET  | `/api/chat` | Get my chats |
| GET  | `/api/chat/:id/messages` | Get chat messages |
| POST | `/api/chat/:id/messages` | Send message |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET  | `/api/admin/dashboard` | Dashboard stats |
| GET  | `/api/admin/users` | All users |
| PUT  | `/api/admin/users/:id/toggle-ban` | Ban/Unban user |
| GET  | `/api/admin/items` | All items |
| PUT  | `/api/admin/items/:id/approve` | Approve item |
| PUT  | `/api/admin/items/:id/reject` | Reject item |

---

## 🌐 Deployment

### Deploy Backend on Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
4. Add all environment variables from `.env`:
   ```
   NODE_ENV=production
   PORT=5001
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_REFRESH_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLIENT_URL=https://your-frontend.vercel.app
   ADMIN_SECRET_CODE=your_admin_code
   ```
5. Deploy!

### Deploy Frontend on Vercel

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `Frontend/client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```
5. Deploy!

### Post-Deployment Checklist
- ✅ Update `CLIENT_URL` in Render with your Vercel URL
- ✅ Test login/register flow
- ✅ Test image uploads
- ✅ Test real-time chat

---

## 📝 License

MIT

---

Built with ❤️ for campus communities.
