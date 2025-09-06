import axios from 'axios';

// Helper functions for normalizing responses from different APIs
const normalizeRedfinResponse = (properties) => {
  if (!Array.isArray(properties)) return [];
  
  return properties.map(property => ({
    address: property.location?.address || '',
    price: property.price || 0,
    beds: property.beds || 0,
    baths: property.baths || 0,
    sqft: property.sqft || 0,
    image: property.imageUrl || '',
    url: property.url || '',
    provider: 'Redfin',
    description: property.description || '',
    year_built: property.yearBuilt || null,
    lot_size: property.lotSize || null,
    property_type: property.propertyType || ''
  }));
};

const normalizeRealtorResponse = (properties) => {
  if (!Array.isArray(properties)) return [];
  
  return properties.map(property => ({
    address: `${property.address.line}, ${property.address.city}, ${property.address.state_code} ${property.address.postal_code}`,
    price: property.price || 0,
    beds: property.beds || 0,
    baths: property.baths || 0,
    sqft: property.building_size?.size || 0,
    image: property.photos?.[0]?.href || '',
    url: property.rdc_web_url || '',
    provider: 'Realtor.com',
    description: property.description || '',
    year_built: property.year_built || null,
    lot_size: property.lot_size?.size || null,
    property_type: property.prop_type || ''
  }));
};

const normalizeStreetEasyResponse = (properties) => {
  if (!Array.isArray(properties)) return [];
  
  return properties.map(property => ({
    address: property.address || '',
    price: property.price || 0,
    beds: property.bedrooms || 0,
    baths: property.bathrooms || 0,
    sqft: property.floorspace || 0,
    image: property.image_url || '',
    url: property.url || '',
    provider: 'StreetEasy',
    description: property.description || '',
    year_built: property.year_built || null,
    lot_size: null,
    property_type: property.property_type || ''
  }));
};

const normalizeZillowResponse = (properties) => {
  if (!Array.isArray(properties)) return [];
  
  return properties.map(property => ({
    address: `${property.address || ''}, ${property.city || ''}, ${property.state || ''} ${property.zipcode || ''}`,
    price: typeof property.price === 'string' ? parseInt(property.price.replace(/[^0-9]/g, '')) : (property.price || 0),
    beds: property.bedrooms || 0,
    baths: property.bathrooms || 0,
    sqft: property.livingArea || property.sqft || 0,
    image: property.imgSrc || '',
    url: property.detailUrl || '',
    provider: 'Zillow',
    description: '',
    year_built: property.yearBuilt || null,
    lot_size: property.lotSize || null,
    property_type: property.propertyType || ''
  }));
};

const normalizeLoopNetResponse = (properties) => {
  if (!Array.isArray(properties)) return [];
  
  return properties.map(property => ({
    address: `${property.address || ''}, ${property.city || ''}, ${property.state || ''} ${property.zip || ''}`,
    price: property.price || 0,
    beds: null,
    baths: null,
    sqft: property.building_size || 0,
    image: property.photos?.[0] || '',
    url: property.listing_url || '',
    provider: 'LoopNet',
    description: property.description || '',
    year_built: property.year_built || null,
    lot_size: property.lot_size || null,
    property_type: property.property_type || ''
  }));
};

import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';

// Initialize the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors);
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { zipCode, city, state, minPrice, maxPrice, page = '1' } = req.query;
  
  if (!process.env.RAPIDAPI_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  let properties = [];
  let errors = [];
  const commonHeaders = {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY
  };

  // 1. Try Redfin API
  if (properties.length === 0) {
    try {
      console.log('Trying Redfin API...');
      const response = await axios({
        method: 'GET',
        url: 'https://redfin-com-data.p.rapidapi.com/properties/search',
        headers: {
          ...commonHeaders,
          'X-RapidAPI-Host': 'redfin-com-data.p.rapidapi.com'
        },
        params: {
          location: zipCode || `${city || ''}, ${state || ''}`,
          limit: '20',
          offset: ((parseInt(page) - 1) * 20).toString(),
          sort_by: 'price',
          ...(minPrice ? { min_price: minPrice.toString() } : {}),
          ...(maxPrice ? { max_price: maxPrice.toString() } : {})
        }
      });

      if (response.data?.data?.length > 0) {
        properties = normalizeRedfinResponse(response.data.data);
        console.log(`Found ${properties.length} properties from Redfin`);
      }
    } catch (error) {
      console.error('Redfin API error:', error.message);
      errors.push(`Redfin API: ${error.message}`);
    }
  }

  // 2. Try Realtor API
  if (properties.length === 0) {
    try {
      console.log('Trying Realtor API...');
      const response = await axios({
        method: 'GET',
        url: 'https://realtor-com4.p.rapidapi.com/properties/list_v2',
        headers: {
          ...commonHeaders,
          'X-RapidAPI-Host': 'realtor-com4.p.rapidapi.com'
        },
        params: {
          location: zipCode || `${city || ''}, ${state || ''}`,
          status: 'for_sale',
          offset: ((parseInt(page) - 1) * 20).toString(),
          limit: '20',
          ...(minPrice ? { price_min: minPrice.toString() } : {}),
          ...(maxPrice ? { price_max: maxPrice.toString() } : {})
        }
      });

      if (response.data?.data?.home_search?.results?.length > 0) {
        properties = normalizeRealtorResponse(response.data.data.home_search.results);
        console.log(`Found ${properties.length} properties from Realtor.com`);
      }
    } catch (error) {
      console.error('Realtor API error:', error.message);
      errors.push(`Realtor API: ${error.message}`);
    }
  }

  // 3. Try StreetEasy API
  if (properties.length === 0) {
    try {
      console.log('Trying StreetEasy API...');
      const response = await axios({
        method: 'GET',
        url: 'https://streeteasy-api.p.rapidapi.com/properties/search',
        headers: {
          ...commonHeaders,
          'X-RapidAPI-Host': 'streeteasy-api.p.rapidapi.com'
        },
        params: {
          zip: zipCode,
          min_price: minPrice,
          max_price: maxPrice,
          page: page
        }
      });

      if (response.data?.data?.length > 0) {
        properties = normalizeStreetEasyResponse(response.data.data);
        console.log(`Found ${properties.length} properties from StreetEasy`);
      }
    } catch (error) {
      console.error('StreetEasy API error:', error.message);
      errors.push(`StreetEasy API: ${error.message}`);
    }
  }

  // 4. Try Zillow API
  if (properties.length === 0) {
    try {
      console.log('Trying Zillow API...');
      const response = await axios({
        method: 'GET',
        url: 'https://zillow-working-api.p.rapidapi.com/properties/search',
        headers: {
          ...commonHeaders,
          'X-RapidAPI-Host': 'zillow-working-api.p.rapidapi.com'
        },
        params: {
          location: zipCode || `${city || ''}, ${state || ''}`,
          page: page,
          ...(minPrice ? { minPrice: minPrice.toString() } : {}),
          ...(maxPrice ? { maxPrice: maxPrice.toString() } : {})
        }
      });

      if (response.data?.properties?.length > 0) {
        properties = normalizeZillowResponse(response.data.properties);
        console.log(`Found ${properties.length} properties from Zillow`);
      }
    } catch (error) {
      console.error('Zillow API error:', error.message);
      errors.push(`Zillow API: ${error.message}`);
    }
  }

  // 5. Try LoopNet API (for commercial properties)
  if (properties.length === 0) {
    try {
      console.log('Trying LoopNet API...');
      const response = await axios({
        method: 'GET',
        url: 'https://loopnet-api.p.rapidapi.com/properties/search',
        headers: {
          ...commonHeaders,
          'X-RapidAPI-Host': 'loopnet-api.p.rapidapi.com'
        },
        params: {
          location: zipCode || `${city || ''}, ${state || ''}`,
          page: page,
          ...(minPrice ? { min_price: minPrice.toString() } : {}),
          ...(maxPrice ? { max_price: maxPrice.toString() } : {})
        }
      });

      if (response.data?.listings?.length > 0) {
        properties = normalizeLoopNetResponse(response.data.listings);
        console.log(`Found ${properties.length} properties from LoopNet`);
      }
    } catch (error) {
      console.error('LoopNet API error:', error.message);
      errors.push(`LoopNet API: ${error.message}`);
    }
  }

  if (properties.length > 0) {
    return res.status(200).json({ properties });
  } else {
    return res.status(404).json({
      error: 'No properties found. Try another location.',
      providerErrors: errors
    });
  }
}
