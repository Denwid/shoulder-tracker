#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting Codespace setup..."

# --- Install Core Dependencies ---
echo "📦 Installing core packages (curl, npm, git-lfs)..."
sudo apt-get update
sudo apt-get install -y curl git-lfs
sudo apt-get install -y nodejs npm


# --- Install ngrok ---
echo "📦 Installing ngrok..."
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt-get update
sudo apt-get install -y ngrok

# --- Configure Tools ---
echo "🔧 Configuring git and ngrok..."
git lfs install
ngrok config add-authtoken $NGROK_AUTHTOKEN

echo "✅ Codespace setup complete!"
