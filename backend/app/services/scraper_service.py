import aiohttp
import asyncio
from typing import List, Dict, Any
import logging
import os
import json
from datetime import datetime, timedelta
import random

logger = logging.getLogger(__name__)

class ScraperService:
    def __init__(self):
        self.rapidapi_key = os.getenv("RAPIDAPI_KEY")
        self.session = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def scrape_properties(self, zip_codes: List[str]) -> List[Dict[Any, Any]]:
        """
        Scrape properties from multiple sources
        """
        all_properties = []
        
        for zip_code in zip_codes:
            # Scrape from multiple sources in parallel
            tasks = [
                self._fetch_realtor_properties(zip_code),
                self._fetch_zillow_properties(zip_code),
                self._fetch_realty_properties(zip_code),
                self._fetch_foreclosures(zip_code)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            properties = []
            for result in results:
                if isinstance(result, list):
                    properties.extend(result)
                else:
                    logger.error(f"Error during scraping: {str(result)}")
            
            # Merge and deduplicate properties
            merged_properties = self._merge_property_data(properties)
            all_properties.extend(merged_properties)
            
            # Add delay between zip codes to avoid rate limiting
            await asyncio.sleep(random.uniform(1, 3))
        
        return all_properties

    async def _fetch_realtor_properties(self, zip_code: str) -> List[Dict[Any, Any]]:
        """
        Fetch properties from Realtor.com API
        """
        if not self.rapidapi_key:
            return []

        try:
            url = "https://realtor.p.rapidapi.com/properties/v2/list-for-sale"
            headers = {
                "X-RapidAPI-Key": self.rapidapi_key,
                "X-RapidAPI-Host": "realtor.p.rapidapi.com"
            }
            params = {
                "postal_code": zip_code,
                "offset": "0",
                "limit": "100",
                "sort": "relevance"
            }

            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_realtor_data(data)
                else:
                    logger.error(f"Realtor API error: {response.status}")
                    return []

        except Exception as e:
            logger.error(f"Error fetching from Realtor API: {str(e)}")
            return []

    async def _fetch_zillow_properties(self, zip_code: str) -> List[Dict[Any, Any]]:
        """
        Fetch properties from Zillow API
        """
        if not self.rapidapi_key:
            return []

        try:
            url = "https://zillow-com1.p.rapidapi.com/propertyExtendedSearch"
            headers = {
                "X-RapidAPI-Key": self.rapidapi_key,
                "X-RapidAPI-Host": "zillow-com1.p.rapidapi.com"
            }
            params = {
                "location": zip_code,
                "status_type": "ForSale"
            }

            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_zillow_data(data)
                else:
                    logger.error(f"Zillow API error: {response.status}")
                    return []

        except Exception as e:
            logger.error(f"Error fetching from Zillow API: {str(e)}")
            return []

    async def _fetch_realty_properties(self, zip_code: str) -> List[Dict[Any, Any]]:
        """
        Fetch properties from Realty in US API
        """
        if not self.rapidapi_key:
            return []

        try:
            url = "https://realty-in-us.p.rapidapi.com/properties/list-for-sale"
            headers = {
                "X-RapidAPI-Key": self.rapidapi_key,
                "X-RapidAPI-Host": "realty-in-us.p.rapidapi.com"
            }
            params = {
                "postal_code": zip_code,
                "offset": "0",
                "limit": "100"
            }

            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_realty_data(data)
                else:
                    logger.error(f"Realty API error: {response.status}")
                    return []

        except Exception as e:
            logger.error(f"Error fetching from Realty API: {str(e)}")
            return []

    async def _fetch_foreclosures(self, zip_code: str) -> List[Dict[Any, Any]]:
        """
        Fetch foreclosure properties
        """
        if not self.rapidapi_key:
            return []

        try:
            url = "https://us-foreclosure-and-tax-deed-data.p.rapidapi.com/search"
            headers = {
                "X-RapidAPI-Key": self.rapidapi_key,
                "X-RapidAPI-Host": "us-foreclosure-and-tax-deed-data.p.rapidapi.com"
            }
            params = {
                "zipcode": zip_code
            }

            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._parse_foreclosure_data(data)
                else:
                    logger.error(f"Foreclosure API error: {response.status}")
                    return []

        except Exception as e:
            logger.error(f"Error fetching foreclosure data: {str(e)}")
            return []

    def _parse_realtor_data(self, data: Dict) -> List[Dict[Any, Any]]:
        """
        Parse Realtor.com API response
        """
        properties = []
        for listing in data.get("properties", []):
            try:
                property_data = {
                    "address": f"{listing.get('address', {}).get('line', '')} {listing.get('address', {}).get('city', '')}",
                    "zip_code": listing.get('address', {}).get('postal_code', ''),
                    "price": float(listing.get('price', 0)),
                    "square_feet": float(listing.get('building_size', {}).get('size', 0)),
                    "days_on_market": listing.get('days_on_market', 0),
                    "price_drops": len(listing.get('price_history', [])) - 1,
                    "property_type": listing.get('property_type', '').lower(),
                    "listing_agent": listing.get('agent', {}).get('name', ''),
                    "tax_assessed_value": float(listing.get('tax_assessment', 0)),
                    "owner_status": "unknown",
                    "pre_foreclosure": listing.get('is_foreclosure', False)
                }
                properties.append(property_data)
            except Exception as e:
                logger.error(f"Error parsing Realtor.com property: {str(e)}")
                continue

        return properties

    def _parse_zillow_data(self, data: Dict) -> List[Dict[Any, Any]]:
        """
        Parse Zillow API response
        """
        properties = []
        for listing in data.get("props", []):
            try:
                property_data = {
                    "address": listing.get('address', ''),
                    "zip_code": listing.get('zipcode', ''),
                    "price": float(listing.get('price', 0)),
                    "square_feet": float(listing.get('livingArea', 0)),
                    "days_on_market": listing.get('daysOnZillow', 0),
                    "price_drops": len(listing.get('priceHistory', [])) - 1,
                    "property_type": listing.get('homeType', '').lower(),
                    "listing_agent": listing.get('listingAgent', {}).get('name', ''),
                    "tax_assessed_value": float(listing.get('taxAssessedValue', 0)),
                    "owner_status": "absentee" if listing.get('isNonOwnerOccupied') else "owner-occupied",
                    "pre_foreclosure": listing.get('isPreforeclosureAuction', False)
                }
                properties.append(property_data)
            except Exception as e:
                logger.error(f"Error parsing Zillow property: {str(e)}")
                continue

        return properties

    def _parse_realty_data(self, data: Dict) -> List[Dict[Any, Any]]:
        """
        Parse Realty in US API response
        """
        properties = []
        for listing in data.get("listings", []):
            try:
                property_data = {
                    "address": f"{listing.get('address', {}).get('line', '')} {listing.get('address', {}).get('city', '')}",
                    "zip_code": listing.get('address', {}).get('postal_code', ''),
                    "price": float(listing.get('list_price', 0)),
                    "square_feet": float(listing.get('description', {}).get('sqft', 0)),
                    "days_on_market": listing.get('list_date_days', 0),
                    "price_drops": len(listing.get('price_history', [])) - 1,
                    "property_type": listing.get('property_type', '').lower(),
                    "listing_agent": listing.get('agent', {}).get('name', ''),
                    "tax_assessed_value": float(listing.get('tax_history', [{}])[0].get('assessment', {}).get('total', 0)),
                    "owner_status": "unknown",
                    "pre_foreclosure": False
                }
                properties.append(property_data)
            except Exception as e:
                logger.error(f"Error parsing Realty property: {str(e)}")
                continue

        return properties

    def _parse_foreclosure_data(self, data: Dict) -> List[Dict[Any, Any]]:
        """
        Parse Foreclosure API response
        """
        properties = []
        for listing in data.get("properties", []):
            try:
                property_data = {
                    "address": listing.get('address', ''),
                    "zip_code": listing.get('zipCode', ''),
                    "price": float(listing.get('estimatedValue', 0)),
                    "square_feet": float(listing.get('squareFootage', 0)),
                    "days_on_market": 0,  # Not typically available for foreclosures
                    "price_drops": 0,
                    "property_type": listing.get('propertyType', '').lower(),
                    "listing_agent": "",
                    "tax_assessed_value": float(listing.get('assessedValue', 0)),
                    "owner_status": "distressed",
                    "pre_foreclosure": True
                }
                properties.append(property_data)
            except Exception as e:
                logger.error(f"Error parsing Foreclosure property: {str(e)}")
                continue

        return properties

    def _merge_property_data(self, properties: List[Dict[Any, Any]]) -> List[Dict[Any, Any]]:
        """
        Merge and deduplicate property data from different sources
        """
        merged = {}
        
        for prop in properties:
            address = prop['address'].lower()
            if address not in merged:
                merged[address] = prop
            else:
                # Update with more complete information
                for key, value in prop.items():
                    if not merged[address][key] and value:
                        merged[address][key] = value
                
                # Use the lower price if available
                if prop['price'] and prop['price'] < merged[address]['price']:
                    merged[address]['price'] = prop['price']
                
                # Use the higher days on market if available
                if prop['days_on_market'] > merged[address]['days_on_market']:
                    merged[address]['days_on_market'] = prop['days_on_market']
                
                # Combine price drops
                merged[address]['price_drops'] = max(
                    merged[address]['price_drops'],
                    prop['price_drops']
                )
        
        return list(merged.values())