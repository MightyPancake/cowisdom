import requests
import sys
import os
from datetime import datetime

def post_to_airtable(airtable_api_token, base_id, table_name, filename):
    # Airtable API URL
    base_url = "https://api.airtable.com/v0"
    url = f"{base_url}/{base_id}/{table_name}"

    # Read the file content
    if not os.path.exists(filename):
        print(f"Error: The file {filename} does not exist.")
        sys.exit(1)

    with open(filename, 'r') as file:
        quote_content = file.read().strip()

    # Prepare the data to be sent to Airtable
    data = {
        "fields": {
            "date": datetime.now().strftime("%Y-%m-%d"),  # Current date
            "quote": quote_content
        }
    }

    headers = {
        "Authorization": f"Bearer {airtable_api_token}",
        "Content-Type": "application/json"
    }

    # Make the POST request
    response = requests.post(url, json=data, headers=headers)

    if response.status_code in (200, 201):
        print("Successfully added the quote to Airtable!\n")

        # Pretty print the created record
        record = response.json()
        fields = record.get("fields", {})
        date = fields.get("date", "(no date)")
        quote = fields.get("quote", "(no quote)")

        print("==== Record Added ====")
        print(f"Date:  {date}")
        print(f"Quote: {quote}")
        print("======================")
        
    else:
        print(f"Failed to add data. Status code: {response.status_code}")
        print("Response:", response.json())

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python post_to_airtable.py <airtable_api_token> <base_id> <table_name> <filename>")
        sys.exit(1)

    airtable_api_token = sys.argv[1]
    base_id = sys.argv[2]
    table_name = sys.argv[3]
    filename = sys.argv[4]

    post_to_airtable(airtable_api_token, base_id, table_name, filename)
