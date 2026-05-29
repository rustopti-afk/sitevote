# SiteVote 🏆
Voting platform for the best websites.

## Quick Start
npm install
cp .env.example .env  
# Edit .env: add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
npm run db:push
npm run seed
npm run dev -- --host :: --port 3000

Dev URL: https://3000--main--georgiys-project--georgiys.coder.brobots.org.ua

## Make yourself admin
After first Google login, run in PostgreSQL:
UPDATE users SET role = 'ADMIN' WHERE email = 'deimocdp@gmail.com';

## Tech Stack
Next.js 15, TypeScript, TailwindCSS, Prisma 6, PostgreSQL, Redis, NextAuth v5, shadcn/ui, Framer Motion, Zustand
