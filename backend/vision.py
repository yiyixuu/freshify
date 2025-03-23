from openai import OpenAI
import base64
import os
from dotenv import load_dotenv
import json

# Load API key from .env file
load_dotenv()
OPENAI_KEY = os.getenv("OPENAI_KEY")

# Set up OpenAI client
client = OpenAI(api_key=OPENAI_KEY)

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def analyze_expiry(image_path, receipt_items):
    base64_image = encode_image(image_path)
    
    # Create a formatted list of items for the prompt
    items_list = "\n".join([f"- {item['name']} (Quantity: {item['quantity']})" for item in receipt_items])

    response = client.responses.create(
        model="gpt-4o",
        input=[
            {
                "role": "system", 
                "content": "You are an AI assistant that identifies specific food items from images and estimates their shelf life. Your response must be a valid JSON object.",
                "role": "user",
                "content": [
                    { 
                        "type": "input_text", 
                        "text": f"""You will be provided an image of groceries. The receipt shows the following items were purchased:

{items_list}

Please identify these specific items in the image and estimate their expiration dates. Your response must be a JSON object formatted as follows:

```json
{{
  "foods": [
    {{"name": "Apple", "expiration_days": 7}},
    {{"name": "Milk", "expiration_days": 5}}
  ]
}}
```

- Only include items from the provided receipt list
- Match the exact names from the receipt where possible
- If an item from the receipt is not visible in the image, do not include it
- For each visible item, estimate the days until expiration
"""
                    },
                    {
                        "type": "input_image",
                        "image_url": f"data:image/jpeg;base64,{base64_image}",
                    },
                ],
            }
        ],
    )
    
    # Extract and parse the response
    output_content = response.output[0].content[0].text
    
    # Check if the response indicates no food items
    if "no food items detected" in output_content.lower():
        return {
            "error": "No food items detected in the image. Please take a clear picture of your groceries."
        }
    
    # Continue with normal processing
    clean_json = output_content.strip("```json").strip("```")
    parsed_json = json.loads(clean_json)
    
    print("Analysis complete for:", image_path)
    print(json.dumps(parsed_json, indent=4))
    return parsed_json


def analyze_receipt(image_path):
    # Getting the Base64 string
    base64_image = encode_image(image_path)

    response = client.responses.create(
        model="gpt-4o",
        input=[
            {
                "role": "system", 
                "content": "You are an AI assistant specialized in optical character recognition (OCR) for receipts. Your task is to extract item names, quantities, and prices from receipt images. Your response must be a valid JSON object.",
                "role": "user",
                "content": [
                    { 
                        "type": "input_text", 
                        "text": "You will be provided an image of a receipt. I need your help to extract the items, quantities, and prices from the receipt. Your response must be a JSON object formatted as follows:\n\n```json\n{\n  \"items\": [\n    {\"name\": \"Apple\", \"quantity\": 2, \"price\": 3.99},\n    {\"name\": \"Milk\", \"quantity\": 1, \"price\": 4.99}\n  ],\n  \"total\": 12.97\n}\n```\n\n- Each item should be entered as a separate object inside the `items` list.\n- `name` should be a string (the item name as it appears on the receipt).\n- `quantity` should be an integer.\n- `price` should be a number (float) representing the price per item.\n- Include a `total` field with the total amount from the receipt.\n- If no items are found or the receipt is unclear, respond with \"no items detected\"" 
                    },
                    {
                        "type": "input_image",
                        "image_url": f"data:image/jpeg;base64,{base64_image}",
                    },
                ],
            }
        ],
    )
    
    # Extract and parse the response
    output_content = response.output[0].content[0].text
    
    # Check if the response indicates no items
    if "no items detected" in output_content.lower():
        return {
            "error": "No items detected in the receipt. Please ensure the receipt is clearly visible and well-lit."
        }
    
    # Continue with normal processing
    clean_json = output_content.strip("```json").strip("```")
    parsed_json = json.loads(clean_json)
    
    print("Receipt analysis complete for:", image_path)
    print(json.dumps(parsed_json, indent=4))
    return parsed_json