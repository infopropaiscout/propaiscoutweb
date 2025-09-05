import { NextApiRequest, NextApiResponse } from 'next';

// API Provider interfaces
interface PropertyProvider {
  search(params: SearchParams): Promise<NormalizedProperty[]>;
  getHost(): string;
}

interface SearchParams {
  city?: string;
  state?: string;
  zipCode?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
}

interface NormalizedProperty {
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
  url: string;
  provider: string;
}

// US Real Estate Provider
class USRealEstateProvider implements PropertyProvider {
  private readonly host = 'us-real-estate-listings.p.rapidapi.com';

  getHost(): string {
    return this.host;
  }

  async search(params: SearchParams): Promise<NormalizedProperty[]> {
    try {
      const queryParams = new URLSearchParams({
        status: 'for_sale',
        page: (params.page || 1).toString(),
        ...(params.city && params.state ? {
          city: params.city,
          state: params.state
        } : {}),
        ...(params.zipCode ? { postal_code: params.zipCode } : {}),
        ...(params.minPrice ? { price_min: params.minPrice.toString() } : {}),
        ...(params.maxPrice ? { price_max: params.maxPrice.toString() } : {})
      });

      const response = await fetch(
        `https://${this.host}/properties/list?${queryParams}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
            'X-RapidAPI-Host': this.host
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeResponse(data);
    } catch (error) {
      console.error('US Real Estate API error:', error);
      return [];
    }
  }

  private normalizeResponse(data: any): NormalizedProperty[] {
    if (!data?.properties || !Array.isArray(data.properties)) {
      return [];
    }

    return data.properties.map(property => ({
      address: `${property.address.line}, ${property.address.city}, ${property.address.state} ${property.address.postal_code}`,
      price: property.list_price || 0,
      beds: property.description?.beds || 0,
      baths: property.description?.baths || 0,
      sqft: property.description?.sqft || 0,
      image: property.photos?.[0]?.href || '',
      url: property.rdc_web_url || '',
      provider: 'US Real Estate'
    }));
  }
}

// Zillow Provider
class ZillowProvider implements PropertyProvider {
  private readonly host = 'real-time-zillow-data.p.rapidapi.com';

  getHost(): string {
    return this.host;
  }

  async search(params: SearchParams): Promise<NormalizedProperty[]> {
    try {
      const queryParams = new URLSearchParams({
        ...(params.zipCode ? { location: params.zipCode } : {}),
        ...(params.city && params.state ? { location: `${params.city}, ${params.state}` } : {}),
        status_type: 'ForSale',
        page: (params.page || 1).toString()
      });

      const response = await fetch(
        `https://${this.host}/property/list-for-sale?${queryParams}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
            'X-RapidAPI-Host': this.host
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeResponse(data);
    } catch (error) {
      console.error('Zillow API error:', error);
      return [];
    }
  }

  private normalizeResponse(data: any): NormalizedProperty[] {
    if (!data?.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map(property => ({
      address: property.address || '',
      price: property.price || 0,
      beds: property.beds || 0,
      baths: property.baths || 0,
      sqft: property.sqft || 0,
      image: property.imgSrc || '',
      url: property.detailUrl || '',
      provider: 'Zillow'
    }));
  }
}

// API Handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const providers: PropertyProvider[] = [
      new USRealEstateProvider(),
      new ZillowProvider()
    ];

    const searchParams: SearchParams = {
      city: req.query.city as string,
      state: req.query.state as string,
      zipCode: req.query.zipCode as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      page: req.query.page ? Number(req.query.page) : 1
    };

    // Try each provider until we get results
    let properties: NormalizedProperty[] = [];
    for (const provider of providers) {
      try {
        properties = await provider.search(searchParams);
        if (properties.length > 0) {
          break; // Stop if we got results
        }
      } catch (error) {
        console.error(`Error with provider ${provider.getHost()}:`, error);
        continue; // Try next provider
      }
    }

    if (properties.length === 0) {
      return res.status(404).json({
        error: 'No properties found. Try another location.'
      });
    }

    return res.status(200).json({ properties });
  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({
      error: 'Failed to fetch properties. Please try again.'
    });
  }
}
