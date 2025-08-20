import aiohttp
import asyncio
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from typing import List, Dict, Any
import logging
import json
import re
from datetime import datetime, timedelta
import random

logger = logging.getLogger(__name__)

class PropertyScraper:
    def __init__(self):
        self.user_agent = UserAgent()
        self.session = None
        self.headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'DNT': '1',
            'Upgrade-Insecure-Requests': '1',
        }

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(headers=self.headers)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    def _rotate_user_agent(self):
        self.session.headers.update({'User-Agent': self.user_agent.random})

    async def _fetch_with_retry(self, url: str, max_retries: int = 3) -> str:
        for attempt in range(max_retries):
            try:
                self._rotate_user_agent()
                async with self.session.get(url, timeout=30) as response:
                    if response.status == 200:
                        return await response.text()
                    elif response.status == 429:  # Too Many Requests
                        wait_time = 2 ** attempt
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        logger.error(f"Failed to fetch {url}, status: {response.status}")
                        return None
            except Exception as e:
                logger.error(f"Error fetching {url}: {str(e)}")
                if attempt == max_retries - 1:
                    return None
                await asyncio.sleep(2 ** attempt)

    async def scrape_zillow(self, zip_code: str) -> List[Dict[Any, Any]]:
        """
        Scrape property data from Zillow
        """
        properties = []
        url = f"https://www.zillow.com/homes/{zip_code}_rb/"
        html = await self._fetch_with_retry(url)
        
        if not html:
            return properties

        try:
            soup = BeautifulSoup(html, 'html.parser')
            script_tags = soup.find_all('script', type='application/json')
            
            for script in script_tags:
                if 'searchPageState' in script.string:
                    data = json.loads(script.string)
                    if 'cat1' in data and 'searchResults' in data['cat1']:
                        for property in data['cat1']['searchResults']['listResults']:
                            try:
                                price_history = property.get('priceHistory', [])
                                price_drops = sum(1 for ph in price_history if ph['event'] == 'Price reduction')
                                
                                prop_data = {
                                    'address': property['address'],
                                    'zip_code': zip_code,
                                    'price': property['price'],
                                    'square_feet': property.get('livingArea', 0),
                                    'days_on_market': property.get('daysOnZillow', 0),
                                    'price_drops': price_drops,
                                    'property_type': property.get('homeType', '').lower(),
                                    'listing_agent': property.get('brokerName', ''),
                                    'tax_assessed_value': property.get('taxAssessedValue', 0),
                                    'owner_status': 'absentee' if property.get('isNonOwnerOccupied') else 'owner-occupied',
                                    'pre_foreclosure': property.get('isPreforeclosureAuction', False),
                                }
                                properties.append(prop_data)
                            except Exception as e:
                                logger.error(f"Error parsing property data: {str(e)}")
                                continue
                    break
        except Exception as e:
            logger.error(f"Error scraping Zillow: {str(e)}")
        
        return properties

    async def scrape_redfin(self, zip_code: str) -> List[Dict[Any, Any]]:
        """
        Scrape property data from Redfin
        """
        properties = []
        url = f"https://www.redfin.com/zipcode/{zip_code}"
        html = await self._fetch_with_retry(url)
        
        if not html:
            return properties

        try:
            soup = BeautifulSoup(html, 'html.parser')
            script_tags = soup.find_all('script')
            
            for script in script_tags:
                if script.string and 'RF.reactBootstrap' in script.string:
                    data_match = re.search(r'JSONData: ({.*})', script.string)
                    if data_match:
                        data = json.loads(data_match.group(1))
                        if 'homes' in data:
                            for property in data['homes']:
                                try:
                                    prop_data = {
                                        'address': property['address'],
                                        'zip_code': zip_code,
                                        'price': property['price'],
                                        'square_feet': property.get('sqFt', 0),
                                        'days_on_market': property.get('daysOnMarket', 0),
                                        'price_drops': property.get('priceDrops', 0),
                                        'property_type': property.get('propertyType', '').lower(),
                                        'listing_agent': property.get('listingAgent', ''),
                                        'tax_assessed_value': property.get('taxAssessedValue', 0),
                                        'owner_status': 'unknown',
                                        'pre_foreclosure': False,
                                    }
                                    properties.append(prop_data)
                                except Exception as e:
                                    logger.error(f"Error parsing Redfin property data: {str(e)}")
                                    continue
                    break
        except Exception as e:
            logger.error(f"Error scraping Redfin: {str(e)}")
        
        return properties

    async def scrape_realtor(self, zip_code: str) -> List[Dict[Any, Any]]:
        """
        Scrape property data from Realtor.com
        """
        properties = []
        url = f"https://www.realtor.com/realestateandhomes-search/{zip_code}"
        html = await self._fetch_with_retry(url)
        
        if not html:
            return properties

        try:
            soup = BeautifulSoup(html, 'html.parser')
            script_tags = soup.find_all('script', type='application/json')
            
            for script in script_tags:
                if script.string and '"props":' in script.string:
                    data = json.loads(script.string)
                    if 'props' in data and 'pageProps' in data['props']:
                        properties_data = data['props']['pageProps'].get('properties', [])
                        for property in properties_data:
                            try:
                                prop_data = {
                                    'address': property['location']['address']['line'] + ', ' + property['location']['address']['city'],
                                    'zip_code': zip_code,
                                    'price': property['list_price'],
                                    'square_feet': property.get('description', {}).get('sqft', 0),
                                    'days_on_market': property.get('list_date_days', 0),
                                    'price_drops': len(property.get('price_history', [])) - 1,
                                    'property_type': property.get('type', '').lower(),
                                    'listing_agent': property.get('listing', {}).get('agent', {}).get('name', ''),
                                    'tax_assessed_value': property.get('tax_history', [{}])[0].get('assessment', {}).get('total', 0),
                                    'owner_status': 'unknown',
                                    'pre_foreclosure': property.get('flags', {}).get('is_foreclosure', False),
                                }
                                properties.append(prop_data)
                            except Exception as e:
                                logger.error(f"Error parsing Realtor.com property data: {str(e)}")
                                continue
                    break
        except Exception as e:
            logger.error(f"Error scraping Realtor.com: {str(e)}")
        
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
                if prop['price'] < merged[address]['price']:
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

    async def scrape_all_sources(self, zip_codes: List[str]) -> List[Dict[Any, Any]]:
        """
        Scrape property data from all sources for given zip codes
        """
        all_properties = []
        
        for zip_code in zip_codes:
            tasks = [
                self.scrape_zillow(zip_code),
                self.scrape_redfin(zip_code),
                self.scrape_realtor(zip_code)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            zip_properties = []
            for result in results:
                if isinstance(result, list):
                    zip_properties.extend(result)
                else:
                    logger.error(f"Error during scraping: {str(result)}")
            
            # Merge and deduplicate properties for this zip code
            merged_properties = self._merge_property_data(zip_properties)
            all_properties.extend(merged_properties)
            
            # Add a small delay between zip codes to avoid rate limiting
            await asyncio.sleep(random.uniform(1, 3))
        
        return all_properties