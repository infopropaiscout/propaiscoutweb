#!/bin/bash

# Create and activate virtual environment
/opt/homebrew/bin/python3 -m venv venv
source venv/bin/activate

# Install build requirements
pip install -r requirements_build.txt

# Create .env file with API key
echo "RAPIDAPI_KEY=71aba9fbb6mshf14840260f6b5c7p17980fjsn318cf304588e" > backend/app/.env
echo "PORT=8000" >> backend/app/.env
echo "HOST=0.0.0.0" >> backend/app/.env
echo "ENABLE_MOCK_DATA=false" >> backend/app/.env
echo "ENABLE_CACHING=true" >> backend/app/.env
echo "CACHE_DURATION=3600" >> backend/app/.env

# Run the build script
python build_app.py

# Deactivate virtual environment
deactivate

echo "Build complete! You can find the executable in the dist folder."