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

image_path = "/Users/yiyixu/Documents/Personal/projects/htg2025/freshify/backend/produces.png"

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def analyze_expiry(image_path):
    # Getting the Base64 string
    base64_image = encode_image(image_path)


    response = client.responses.create(
        model="gpt-4o",
        input=[
            {
                "role": "system", "content": "You are an AI assistant that identifies food items from images and estimates their shelf life. Your response must be a valid JSON object.",
                "role": "user",
                "content": [
                    { "type": "input_text", "text": "You will be provided an image of a pile of foods from a grocery trip. I need your help to identify and classify each food in the image, as well as estimate the expiration date of the food under its current conditions. Your response must be a JSON object formatted as follows:\n\n```json\n{\n  \"foods\": [\n    {\"name\": \"Apple\", \"expiration_days\": 7},\n    {\"name\": \"Milk\", \"expiration_days\": 5}\n  ]\n}\n```\n\n- Each item in the image should be entered as a separate object inside the `foods` list.\n- `name` should be a string.\n- `expiration_days` should be an integer representing the estimated days before expiration.\n- Ignore non-food items." },
                    {
                        "type": "input_image",
                        "image_url": f"data:image/jpeg;base64,{base64_image}",
                    },
                ],
            }
        ],

    )
    # Assuming 'response' is your OpenAI response object
    output_content = response.output[0].content[0].text  # Extracts the raw text

    # Remove code block formatting (```json ... ```)
    clean_json = output_content.strip("```json").strip("```")

    # Convert to a Python dictionary
    parsed_json = json.loads(clean_json)

    # Pretty-print the JSON
    print(json.dumps(parsed_json, indent=4))
    return parsed_json


analyze_expiry(image_path)