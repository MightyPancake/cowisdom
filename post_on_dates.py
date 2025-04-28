import requests
import sys
import os
import subprocess
from datetime import datetime, timedelta

def post_to_airtable(airtable_api_token, base_id, table_name, filename, start_date, end_date, pre_command):
    # Airtable API URL
    base_url = "https://api.airtable.com/v0"
    url = f"{base_url}/{base_id}/{table_name}"

    # Prepare the headers
    headers = {
        "Authorization": f"Bearer {airtable_api_token}",
        "Content-Type": "application/json"
    }

    # Parse the start and end dates
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        print("Error: Dates must be in YYYY-MM-DD format.")
        sys.exit(1)

    if start > end:
        print("Error: Start date must not be after end date.")
        sys.exit(1)

    # Loop through each date in the range
    current_date = start
    while current_date <= end:
        print(f"\n=== Processing date: {current_date.strftime('%Y-%m-%d')} ===")

        # Run the pre-command
        if pre_command.strip():
            try:
                print(f"Running pre-command: {pre_command}")
                subprocess.run(pre_command, shell=True, check=True)
            except subprocess.CalledProcessError as e:
                print(f"Error: Pre-command failed with exit code {e.returncode}.")
                sys.exit(1)

        # Read the file content after pre-command
        if not os.path.exists(filename):
            print(f"Error: The file {filename} does not exist after running pre-command.")
            sys.exit(1)

        with open(filename, 'r') as file:
            quote_content = file.read().strip()

        if not quote_content:
            print(f"Warning: No content found in {filename} for {current_date.strftime('%Y-%m-%d')}. Skipping...")
            current_date += timedelta(days=1)
            continue

        # Prepare data payload
        data = {
            "fields": {
                "date": current_date.strftime("%Y-%m-%d"),
                "quote": quote_content
            }
        }

        # Send to Airtable
        response = requests.post(url, json=data, headers=headers)

        if response.status_code in (200, 201):
            print(f"Successfully added quote for {current_date.strftime('%Y-%m-%d')}")
        else:
            print(f"Failed to add data for {current_date.strftime('%Y-%m-%d')}. Status code: {response.status_code}")
            print("Response:", response.json())

        # Move to next day
        current_date += timedelta(days=1)

if __name__ == "__main__":
    if len(sys.argv) != 8:
        print("Usage: python post_to_airtable.py <airtable_api_token> <base_id> <table_name> <filename> <start_date> <end_date> <pre_command>")
        sys.exit(1)

    airtable_api_token = sys.argv[1]
    base_id = sys.argv[2]
    table_name = sys.argv[3]
    filename = sys.argv[4]
    start_date = sys.argv[5]
    end_date = sys.argv[6]
    pre_command = sys.argv[7]

    post_to_airtable(airtable_api_token, base_id, table_name, filename, start_date, end_date, pre_command)
