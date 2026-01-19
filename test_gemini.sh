#!/bin/bash
curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{"text": "Extract this: Flight AA123 from NYC to LAX on 2026-02-07 at 10:00 AM. Return only JSON."}]
    }],
    "generationConfig": {
      "temperature": 0.2,
      "maxOutputTokens": 200
    }
  }' | python3 -m json.tool
