from fastapi import FastAPI
from pydantic import BaseModel
from vision import analyze_expiry, analyze_receipt, get_recipe
import base64
import tempfile
from typing import List

app = FastAPI()

class ImageAnalysisRequest(BaseModel):
    image: str  # Base64 encoded image
    items: list  # List of items from receipt

class ReceiptRequest(BaseModel):
    image: str  # Base64 encoded image

class Ingredient(BaseModel):
    name: str
    expiry: int

class RecipeRequest(BaseModel):
    nutritional_focus: str
    ingredients: List[Ingredient]

    
@app.post("/analyze_image")
async def analyze_image(request: ImageAnalysisRequest):
    # Create a temporary file to store the image
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
        # Decode base64 string to image
        image_data = base64.b64decode(request.image)
        temp_file.write(image_data)
        temp_file.flush()
        
        # Pass both image and items to analyze_expiry
        result = analyze_expiry(temp_file.name, request.items)
        
        return result

@app.post("/analyze_receipt")
async def analyze_receipt_image(request: ReceiptRequest):
    # Create a temporary file to store the image
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
        # Decode base64 string to image
        image_data = base64.b64decode(request.image)
        temp_file.write(image_data)
        temp_file.flush()
        
        # Analyze the receipt using vision.py
        result = analyze_receipt(temp_file.name)
        
        return result
    


class Ingredient(BaseModel):
    name: str
    expiry: int

class RecipeRequest(BaseModel):
    nutritional_focus: str
    ingredients: List[Ingredient]

@app.post("/get_recipe")
async def generate_recipe(request: RecipeRequest):
    try:
        # Convert ingredients to list of dicts for the get_recipe function
        ingredients_list = [
            {"name": ingredient.name, "expiry": ingredient.expiry}
            for ingredient in request.ingredients
        ]
        
        # Call the get_recipe function
        recipe = get_recipe(request.nutritional_focus, ingredients_list)
        print(recipe)
        return recipe
    except Exception as e:
        return {
            "error": f"Failed to generate recipe: {str(e)}"
        }

@app.get("/")
async def root():
    return {"message": "Hello World"}