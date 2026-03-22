# 💪 FitMatch — Gym Buddy Finder

> A full-stack, production-ready application to find compatible workout partners based on fitness goals, schedule, location, and experience level.

![FitMatch Banner](https://img.shields.io/badge/FitMatch-Gym%20Buddy%20Finder-orange?style=for-the-badge&logo=lightning)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?style=flat-square&logo=socket.io)

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔐 **Auth System** | JWT + bcrypt, register/login/logout, protected routes |
| 👤 **User Profiles** | Full profile with photo, gym, goals, schedule, bio |
| 🧠 **Smart Matching** | Proprietary scoring algorithm based on 5 dimensions |
| 🗺️ **Location Matching** | MongoDB 2dsphere geo-queries, configurable radius |
| 🔍 **Discover Page** | Infinite scroll, multi-filter, sorted by compatibility |
| 🤝 **Connection System** | Send/accept/reject requests, buddies list |
| 💬 **Real-Time Chat** | Socket.io, typing indicators, online status, history |
| 🔔 **Notifications** | Real-time + persisted alerts for matches and messages |
| 📸 **Image Upload** | Cloudinary with auto-cropping and validation |
| 🏋️ **Activity Feed** | Log workouts, view buddy activity feed |
| ⭐ **Rating System** | Rate gym sessions, average ratings on profiles |
| 📱 **Responsive** | Mobile-first, dark theme, glassmorphism UI |

---

## 🗂️ Project Structure

```
FitMatch/
├── Backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js  # Matching algorithm here
│   │   ├── matchController.js
│   │   ├── messageController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js            # GeoJSON, ratings, activities
│   │   ├── Match.js
│   │   ├── Message.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── matchRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── notificationRoutes.js
│   ├── socket/
│   │   └── socketHandler.js   # Online/offline, typing
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seeder.js          # Sample data seeder
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── MobileNav.jsx
    │   │   ├── BuddyCard.jsx
    │   │   └── SkeletonCard.jsx
    │   ├── layouts/
    │   │   ├── AuthLayout.jsx
    │   │   └── MainLayout.jsx
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DiscoverPage.jsx
    │   │   ├── MatchesPage.jsx
    │   │   ├── ChatPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── EditProfilePage.jsx
    │   │   ├── UserDetailPage.jsx
    │   │   ├── NotificationsPage.jsx
    │   │   └── FeedPage.jsx
    │   ├── store/
    │   │   ├── authStore.js    # Zustand + persist
    │   │   ├── socketStore.js
    │   │   └── chatStore.js
    │   ├── utils/
    │   │   └── axios.js        # Interceptors
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free tier works)

---

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd FitMatch
```

### 2. Backend Setup

```bash
cd Backend
cp .env.example .env
```

Edit `.env` and fill in:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fitmatch
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Install and start:
```bash
npm install
npm run dev      # Development with nodemon
# or
npm start        # Production
```

**Optional — Seed the database with sample users:**
```bash
npm run seed
```
This creates 6 demo users you can log in with (password: `password123`).

---

### 3. Frontend Setup

```bash
cd ../Frontend
npm install --legacy-peer-deps
npm run dev
```

The frontend will run at **http://localhost:5173** and proxy API calls to the backend.

---

## 🔑 API Reference

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/api/users/discover` | Smart match + filter |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/profile/avatar` | Upload photo |
| GET | `/api/users/:id` | View profile |
| POST | `/api/users/:id/rate` | Rate a buddy |
| POST | `/api/users/activity` | Log workout |
| GET | `/api/users/feed` | Activity feed |

### Matches
| Method | Route | Description |
|---|---|---|
| GET | `/api/matches` | Get accepted buddies |
| GET | `/api/matches/requests` | Pending requests |
| POST | `/api/matches/request/:id` | Send request |
| PUT | `/api/matches/accept/:id` | Accept request |
| PUT | `/api/matches/reject/:id` | Reject request |
| DELETE | `/api/matches/:id` | Remove buddy |

### Messages
| Method | Route | Description |
|---|---|---|
| GET | `/api/messages` | All conversations |
| POST | `/api/messages/:receiverId` | Send message |
| GET | `/api/messages/:userId` | Get conversation |
| PUT | `/api/messages/:userId/read` | Mark as read |

### Notifications
| Method | Route | Description |
|---|---|---|
| GET | `/api/notifications` | Get all |
| PUT | `/api/notifications/read-all` | Mark all read |
| PUT | `/api/notifications/:id/read` | Mark one read |

---

## 🧠 Matching Algorithm

The compatibility score (0–100) is calculated per user:

| Criterion | Weight |
|---|---|
| Same gym | +30 pts |
| Shared fitness goals | +5 pts each (max 25) |
| Same workout time | +20 pts |
| Same fitness level | +15 pts |
| Shared workout days | +2 pts each (max 10) |

Results are first filtered by distance (MongoDB 2dsphere), then ranked by score.

---

## 🌐 Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `user_connected` | Client → Server | Register online status |
| `user_online` | Server → All | User came online |
| `user_offline` | Server → All | User went offline |
| `new_message` | Server → Rooms | Real-time message delivery |
| `typing` | Client → Server | Start typing indicator |
| `stop_typing` | Client → Server | Stop typing indicator |
| `notification` | Server → User | In-app notification push |
| `match_accepted` | Server → User | Match accepted event |

---

## 🚀 Deployment

### Backend (Railway / Render / Heroku)
1. Set all env variables in platform dashboard
2. Update `MONGO_URI` to your Atlas connection string
3. Update `CLIENT_URL` to your frontend domain
4. Deploy with `npm start`

### Frontend (Vercel / Netlify)
1. Build: `npm run build`
2. Publish `dist/` folder
3. Set environment variable if needed

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS v3, Framer Motion |
| State | Zustand with persistence |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Real-time | Socket.io |
| Upload | Cloudinary, Multer |
| Geocoding | Browser Geolocation API + MongoDB 2dsphere |

---

## 📝 License

MIT — feel free to use and modify for your projects.

---

*Built with ❤️ and 💪 — Happy lifting!*
