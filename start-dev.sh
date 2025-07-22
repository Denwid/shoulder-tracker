#!/bin/bash

# Title for the script
echo "🚀 Starting development environment..."

# Start the Live Server in the background
# This command finds the index.html file and serves it on port 5500
npx live-server --port=5500 &

# Give the server a moment to start up
sleep 2

# Start the ngrok tunnel to expose port 5500
echo "🚇 Starting ngrok tunnel..."
ngrok http 5500
