# splIT - Expense Tracker

A local-first PWA for tracking and splitting expenses with friends and family.

## Features

- Track and split expenses
- Manage groups and friends
- View activity and balances
- User accounts with authentication
- Local-first architecture (data stored on device)
- PWA support for offline use

## Test Accounts

The application comes with pre-configured test accounts:

1. **Ada (Adam)**
   - Username: ada
   - Email: adam@example.com
   - Password: password123

2. **Bob**
   - Username: bob
   - Email: bob@example.com
   - Password: password123

3. **Cha (Charlie)**
   - Username: cha
   - Email: charlie@example.com
   - Password: password123

## Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Vercel

This application can be quickly deployed to Vercel:

1. Push your repository to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project" and import your GitHub repository
4. Keep the default settings and click "Deploy"
5. Your app will be available at a Vercel-provided URL

## Local-First Architecture

This application uses IndexedDB for local data storage, which means:

- All user data is stored on the device
- The application works offline
- No backend server is required for core functionality
- User authentication is handled locally

## Future Improvements

- Server synchronization for multi-device support
- Expense attachments (photos of receipts)
- Currency conversion
- Recurring expenses
- Export data to CSV

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Storage**: IndexedDB (Dexie.js)
- **Authentication**: NextAuth.js (planning to implement)
- **PWA**: next-pwa
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Project Structure

```
splIT/
├── public/            # Static files and PWA assets
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # Reusable React components
│   └── lib/           # Utilities and database code
├── next.config.js     # Next.js configuration
├── tailwind.config.js # TailwindCSS configuration
└── package.json       # Dependencies and scripts
```

## License

MIT 