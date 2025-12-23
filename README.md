# Baby Registry Website 👶

A beautiful, modern, minimalist website to share baby registries, collect messages, and gather gender predictions.

## Features

- 🎨 **Modern Design** - Earth-tone palette with smooth animations
- 📝 **Message Collection** - Visitors can leave messages for the baby
- 🗳️ **Gender Voting** - Interactive gender prediction voting
- 📋 **Registry Links** - Multiple registry options (Amazon, Target, Babylist)
- ✨ **Smooth Scrolling** - Lenis-powered smooth scroll experience
- 📱 **Responsive** - Works beautifully on all devices

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Express.js
- **Styling:** CSS with Framer Motion animations
- **Deployment:** Railway (backend) + Vercel (frontend)

## Local Development

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone <your-repo-url>
cd baby-registry-site
```

2. Install dependencies
```bash
npm install
```

3. Start development servers
```bash
npm run dev
```

This starts both:
- Backend server on `http://localhost:3001`
- Frontend dev server on `http://localhost:5173`

### Development Commands

- `npm run dev` - Start both frontend and backend
- `npm run dev:server` - Start backend only
- `npm run dev:client` - Start frontend only
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Summary:**
1. Deploy backend to Railway
2. Deploy frontend to Vercel
3. Set `VITE_API_URL` environment variable in Vercel
4. Test and share!

## Project Structure

```
baby-registry-site/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── OurStory.jsx
│   │   ├── BabyJourney.jsx
│   │   ├── Registries.jsx
│   │   ├── GenderVote.jsx
│   │   ├── BabyMessages.jsx
│   │   └── Footer.jsx
│   ├── App.jsx
│   └── main.jsx
├── server.js          # Express backend
├── package.json
├── vite.config.js
├── railway.json       # Railway configuration
├── Procfile           # Railway start command
└── vercel.json        # Vercel configuration
```

## Environment Variables

### Backend (Railway)
- `PORT` - Server port (auto-set by Railway)
- `FRONTEND_URL` - Optional: Your Vercel URL for CORS

### Frontend (Vercel)
- `VITE_API_URL` - Your Railway backend URL (required)

## Data Storage

Votes and messages are stored in JSON files:
- `votes.json` - Gender prediction votes
- `messages.json` - Messages for the baby

These files persist on Railway's filesystem between deployments.

## Features in Detail

### Gender Voting
- Visitors can vote for boy or girl
- One vote per IP address
- Real-time vote counts and percentages
- Can clear own vote

### Message Collection
- Visitors can leave messages with their name
- Messages displayed in a continuously scrolling carousel
- All messages will be collected into a book for the baby

### Registries
- Links to Amazon, Target, and Babylist registries
- Hover effects and smooth animations

## License

Private project - All rights reserved

## Support

For deployment help, see [DEPLOYMENT.md](./DEPLOYMENT.md) or [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
