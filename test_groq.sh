#!/bin/bash
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"model":"llama-3.2-90b-vision-preview","messages":[{"role":"user","content":"test"}],"max_tokens":10}'
