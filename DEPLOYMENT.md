# Deploying splIT to Vercel

This guide provides step-by-step instructions for deploying the splIT expense tracker app to Vercel for free.

## Prerequisites

1. GitHub account
2. Vercel account (you can sign up for free using your GitHub account)

## Deployment Steps

### Step 1: Push Your Code to GitHub

1. Create a new repository on GitHub:
   - Go to [GitHub New Repository](https://github.com/new)
   - Name it "splIT" or any name you prefer
   - Make it public or private (your choice)
   - Click "Create repository"

2. Follow the instructions to push your existing repository:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/splIT.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)

2. If you haven't already, sign up for a free account using your GitHub account

3. Click on "New Project"

4. Import your GitHub repository:
   - Find and select your "splIT" repository
   - Click "Import"

5. Configure the project:
   - Leave all defaults as they are (Vercel will automatically detect Next.js)
   - You can change the project name if you want
   - No environment variables are needed for this basic setup

6. Click "Deploy"

7. Wait for the deployment to complete (usually takes 1-2 minutes)

8. When deployment finishes, you'll be given a URL (like `https://split-yourusername.vercel.app`) where your app is now hosted!

### Step 3: Test Your Deployed App

1. Visit your new Vercel URL
2. Verify that you can:
   - Register a new account
   - Log in with existing test accounts (ada, bob, cha)
   - Create and view expenses

### Step 4: Custom Domain (Optional)

If you want to use a custom domain instead of the Vercel-provided URL:

1. From your Vercel project dashboard, click on "Settings" → "Domains"
2. Add your domain and follow the instructions to set up DNS

## Troubleshooting

- **Issue**: App doesn't load properly
  - **Solution**: Check the Vercel deployment logs for errors. Most common issues are related to environment variables or build configurations.

- **Issue**: Data doesn't persist between sessions
  - **Note**: This is expected behavior as data is stored in the browser's IndexedDB, which is specific to each device/browser.

## Maintaining Your Deployment

- Any push to your main branch on GitHub will automatically trigger a new deployment on Vercel
- You can set up preview deployments for pull requests in the Vercel settings

# splIT Deployment Guide

This guide covers how to set up, install dependencies, and deploy the splIT expense tracker PWA.

## Prerequisites

### Installing Node.js and npm

On Ubuntu/Debian:
```bash
# Update package list
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm

# Verify installation
node --version
npm --version
```

On other systems, download from [nodejs.org](https://nodejs.org/).

## Project Setup

1. Clone the repository:
```bash
git clone <your-repository-url>
cd splIT
```

2. Install dependencies:
```bash
npm install
```

3. Create required directories (if not already present):
```bash
mkdir -p public/icons
```

4. Add PWA icons:
- Place 192x192 and 512x512 PNG icons in public/icons/
- You can create placeholder icons or use a tool like [RealFaviconGenerator](https://realfavicongenerator.net/)

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Building for Production

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Deployment Options

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Log in:
```bash
railway login
```

3. Link project:
```bash
railway link
```

4. Deploy:
```bash
railway up
```

### Fly.io

1. Install Flyctl:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Log in:
```bash
fly auth login
```

3. Create app:
```bash
fly launch
```

## Environment Variables

- `NEXTAUTH_URL`: Your app URL (for authentication)
- `NEXTAUTH_SECRET`: Secret for JWT encryption (generate a secure random string)

## Adding Backend Sync (Future)

To implement the sync feature with a backend:

1. Create a simple Express or Next.js API route server
2. Implement authentication using NextAuth.js
3. Expose endpoints for synchronizing data:
   - `/api/sync/expenses`
   - `/api/sync/groups`
4. Use a lightweight database like PostgreSQL or MongoDB

The app's current design already supports this architecture through the sync flags and methods in `db.ts`. 