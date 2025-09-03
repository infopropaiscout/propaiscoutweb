import uvicorn
from app.api import app
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set RapidAPI key
os.environ["RAPIDAPI_KEY"] = "71aba9fbb6mshf14840260f6b5c7p17980fjsn318cf304588e"

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
