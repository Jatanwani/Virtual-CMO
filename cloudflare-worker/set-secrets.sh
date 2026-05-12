#!/bin/bash
# set-secrets.sh
# Run this once after `wrangler login` to push all your API keys as secrets.
# Usage: bash set-secrets.sh

echo "=================================================="
echo "  Virtual CMO Gateway — Secret Setup"
echo "=================================================="
echo ""

read -p "GROQ_API_KEY (from console.groq.com): " GROQ
echo "$GROQ" | wrangler secret put GROQ_API_KEY

read -p "CEREBRAS_API_KEY (from cloud.cerebras.ai): " CEREBRAS
echo "$CEREBRAS" | wrangler secret put CEREBRAS_API_KEY

read -p "GEMINI_API_KEY (from aistudio.google.com): " GEMINI
echo "$GEMINI" | wrangler secret put GEMINI_API_KEY

read -p "MISTRAL_API_KEY (from console.mistral.ai): " MISTRAL
echo "$MISTRAL" | wrangler secret put MISTRAL_API_KEY

read -p "OLLAMA_URL (e.g. http://YOUR_ORACLE_IP:11434, or leave blank): " OLLAMA
if [ -n "$OLLAMA" ]; then
  echo "$OLLAMA" | wrangler secret put OLLAMA_URL
else
  echo "Skipping OLLAMA_URL (optional)"
fi

echo ""
echo "✅ All secrets set! Run: wrangler deploy"
