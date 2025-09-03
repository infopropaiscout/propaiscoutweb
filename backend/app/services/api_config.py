from typing import Dict
import os
from dotenv import load_dotenv

load_dotenv()

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")

# RapidAPI Endpoints
APIS = {
    "realtor": {
        "base_url": "https://realtor.p.rapidapi.com",
        "endpoints": {
            "properties": "/properties/v2/list-for-sale",
            "property_detail": "/properties/v2/detail",
            "property_insights": "/properties/v2/market-insights"
        },
        "headers": {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "realtor.p.rapidapi.com"
        }
    },
    "zillow": {
        "base_url": "https://zillow-com1.p.rapidapi.com",
        "endpoints": {
            "property_search": "/propertyExtendedSearch",
            "property_detail": "/property",
            "comps": "/propertyComps"
        },
        "headers": {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "zillow-com1.p.rapidapi.com"
        }
    },
    "realty_in_us": {
        "base_url": "https://realty-in-us.p.rapidapi.com",
        "endpoints": {
            "properties": "/properties/list-for-sale",
            "property_detail": "/properties/detail",
            "agents": "/agents/list"
        },
        "headers": {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "realty-in-us.p.rapidapi.com"
        }
    },
    "foreclosure": {
        "base_url": "https://us-foreclosure-and-tax-deed-data.p.rapidapi.com",
        "endpoints": {
            "search": "/search",
            "details": "/details"
        },
        "headers": {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "us-foreclosure-and-tax-deed-data.p.rapidapi.com"
        }
    },
    "attom": {
        "base_url": "https://attom-property-api.p.rapidapi.com",
        "endpoints": {
            "property_detail": "/api/property/detailwithschools",
            "sales_history": "/api/property/saleshistory",
            "owner_info": "/api/property/ownerinfo"
        },
        "headers": {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "attom-property-api.p.rapidapi.com"
        }
    }
}
