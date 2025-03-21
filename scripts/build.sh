#!/bin/bash

echo "🚀 Starting production build..."

# Install dependencies
echo "📦 Installing dependencies..."
bun install --production

# Generate Prisma client
echo "🔄 Generating Prisma client..."
bunx prisma generate

# Build TypeScript
echo "🛠️ Building TypeScript..."
bunx rimraf dist
bunx tsc

# Copy necessary files
echo "📋 Copying configuration files..."
cp package.json dist/
cp .env.production dist/.env
cp -r prisma dist/

echo "✅ Build complete! Your application is ready in the 'dist' directory."