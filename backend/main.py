from fastapi import FastAPI
from pydantic import BaseModel
from vision import analyze_expiry
import base64
import tempfile

app = FastAPI()

class ImageRequest(BaseModel):
    image: str  # Base64 encoded image

@app.post("/analyze")
async def analyze_image(request: ImageRequest):
    # Create a temporary file to store the image
    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
        # Decode base64 string to image
        image_data = base64.b64decode(request.image)
        temp_file.write(image_data)
        temp_file.flush()
        
        # Analyze the image using vision.py
        result = analyze_expiry(temp_file.name)
        
        return result

@app.get("/")
async def root():
    return {"message": "Hello World"}