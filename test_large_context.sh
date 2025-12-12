#!/bin/bash

# Generate a large prompt (approx 3000 words/tokens)
# "token " is 6 chars. 3000 * 6 = 18000 chars.
echo "Generating large prompt..."
LONG_TEXT=$(yes "test_token " | head -n 3000 | tr -d '\n')
echo "Prompt length: ${#LONG_TEXT} characters"

# Create payload with explicit context window expansion
cat <<EOF > large_payload.json
{
  "model": "qwen3:8b",
  "messages": [
    { 
      "role": "user", 
      "content": "Begin Input: $LONG_TEXT End Input. Please ignore the repeated tokens and just say 'I received the large input successfully'." 
    }
  ],
  "stream": false,
  "options": {
    "num_ctx": 8192
  }
}
EOF

# Send request
echo "Sending request to Ollama (http://localhost:11434)..."
start_time=$(date +%s)
curl -s http://localhost:11434/api/chat -d @large_payload.json | jq .
end_time=$(date +%s)

echo "Request took $((end_time - start_time)) seconds."
