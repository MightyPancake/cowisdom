#!/bin/bash
set -e

# Save fortune output to fortune.txt
fortune > fortune.txt

# Run the Python script
python post.py "$AIRTABLE_API_TOKEN" "$AIRTABLE_BASE_ID" "fortune" "fortune.txt"
