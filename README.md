# Chat Backend

A real-time chat backend built using **Node.js, TypeScript, Express.js, PostgreSQL, Prisma, Firebase Firestore, and Socket.IO**.

## Features

- User registration and login with JWT authentication
- Create and list direct chats
- Send and retrieve messages
- Cursor-based message pagination
- Read receipts and last-seen tracking
- Real-time messaging using Socket.IO
- Real-time read receipt and last-seen updates
- Authenticated chat rooms

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- Firebase Firestore
- Socket.IO
- JWT
- Zod

## Prerequisites

Install the following before running the project:

- Node.js and npm
- PostgreSQL
- Firebase project with Firestore enabled
- Firebase service account credentials

## Installation

Clone the repository and navigate to the project directory:

```bash
git clone <repository-url>
cd chat-backend
```

Install dependencies:

```bash
npm install
```

## Environment Configuration

Create a `.env` file in the project root:

```env
PORT=5500
NODE_ENV=development

DATABASE_URL="postgresql://username:password@localhost:5432/chat_backend"

JWT_SECRET="your_secret_key_at_least_32_characters"
JWT_EXPIRES_IN="1d"

FIREBASE_PROJECT_ID="your_firebase_project_id"
GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
```

Replace the placeholder values with your actual configuration.

Place your Firebase service account JSON file in the project root as:

```text
serviceAccountKey.json
```

**Security:** Never commit `.env` or `serviceAccountKey.json` to Git.

## Database Setup

Generate the Prisma client:

```bash
npx prisma generate
```

Apply existing migrations to PostgreSQL:

```bash
npx prisma migrate deploy
```

For local development when creating new migrations:

```bash
npx prisma migrate dev --name migration_name
```

## Run the Project

Start the development server:

```bash
npm run dev
```

The server runs at:

```text
http://localhost:5500
```

Health check:

```http
GET http://localhost:5500/health
```

## Build

Compile TypeScript:

```bash
npm run build
```

## Main REST APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get authenticated user |
| POST | `/api/chat/create` | Create or retrieve direct chat |
| GET | `/api/user/:userId/chats` | List user chats |
| POST | `/api/chat/:chatId/message/send` | Send message |
| GET | `/api/chat/:chatId/messages` | Fetch messages |
| POST | `/api/chat/:chatId/message/:messageId/read` | Mark message as read |
| POST | `/api/chat/:chatId/lastseen` | Update last seen |

Protected APIs require:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Socket.IO Events

All Socket.IO connections require a valid JWT.

Connection authentication:

```typescript
const socket = io("http://localhost:5500", {
  auth: {
    token: "<JWT_TOKEN>"
  }
});
```

| Event | Direction | Description |
|---|---|---|
| `chat:join` | Client → Server | Join chat room |
| `chat:leave` | Client → Server | Leave chat room |
| `message:send` | Client → Server | Send real-time message |
| `message:receive` | Server → Client | Receive new message |
| `message:read` | Client → Server | Mark message as read |
| `message:read:receive` | Server → Client | Receive read receipt |
| `chat:lastseen` | Client → Server | Update last seen |
| `chat:lastseen:receive` | Server → Client | Receive last-seen update |

Socket.IO events use acknowledgements to return operation results.

## Project Structure

```text
chat-backend/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── config/
│   ├── generated/
│   │   └── prisma/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   └── chats/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── scripts/
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Notes

- PostgreSQL stores users, chats, and chat memberships.
- Firebase Firestore stores chat messages, read receipts, and last-seen information.
- JWT authentication is used for REST APIs and Socket.IO connections.
- Socket.IO provides real-time communication between chat participants.
- Typing indicators and additional presence features are planned enhancements.

