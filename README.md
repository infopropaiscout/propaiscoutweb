# PropAI Scout

PropAI Scout is an advanced real estate lead generation and scoring tool that helps identify and prioritize motivated seller leads in New Jersey and New York markets.

## Features

- Multi-zip code property search
- Automated data collection from major real estate platforms
- AI-powered motivation scoring system
- Property ROI estimation
- AI-generated seller outreach messages
- CSV export functionality
- Modern web interface

## Tech Stack

- Backend: FastAPI
- Frontend: React
- Database: SQLite
- AI: OpenAI API
- Data Scraping: BeautifulSoup4
- Data Processing: Pandas

## Setup

1. Clone the repository
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```
4. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Development

1. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=sqlite:///./propai_scout.db
```

## License

Proprietary - All Rights Reserved
