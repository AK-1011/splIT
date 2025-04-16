# Quick Setup Guide

Since we noticed npm is not installed on your system, here's a quick guide to get started:

## Install Node.js and npm

```bash
# Update package list
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm

# Verify installation
node --version
npm --version
```

## Install project dependencies

```bash
# Navigate to project directory (if not already there)
cd ~/splIT

# Install dependencies
npm install
```

## Create placeholder icons

Since PWA requires icons, you have a few options:

1. Create simple placeholder icons:
```bash
# Install ImageMagick (if not already installed)
sudo apt install imagemagick

# Create placeholder icons
mkdir -p public/icons
convert -size 192x192 xc:#3B82F6 -gravity center -pointsize 50 -fill white -annotate 0 "splIT" public/icons/icon-192x192.png
convert -size 512x512 xc:#3B82F6 -gravity center -pointsize 120 -fill white -annotate 0 "splIT" public/icons/icon-512x512.png
```

2. Or simply use an online icon generator like [RealFaviconGenerator](https://realfavicongenerator.net/)

## Start development server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Next steps

Check the README.md and DEPLOYMENT.md files for detailed information on the project features and deployment options. 