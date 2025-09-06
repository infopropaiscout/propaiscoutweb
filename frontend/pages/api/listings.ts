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
        offset: ((params.page || 1) - 1) * 20,
        limit: '20',
        status: 'for_sale',
        ...(params.zipCode ? { postal_code: params.zipCode } : {}),
        ...(params.city && params.state ? {
          location: `${params.city}, ${params.state}`
        } : {}),
        ...(params.minPrice ? { price_min: params.minPrice.toString() } : {}),
        ...(params.maxPrice ? { price_max: params.maxPrice.toString() } : {})
      }).toString();

      const response = await fetch(
        `https://${this.host}/v2/list-for-sale?${queryParams}`,
        {
          method: 'GET',
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

    return data.properties.map((property: any) => ({
      address: `${property.address.line || ''}, ${property.address.city || ''}, ${property.address.state_code || ''} ${property.address.postal_code || ''}`,
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
        status: 'forSale',
        page: params.page?.toString() || '1',
        ...(params.zipCode ? { zipcode: params.zipCode } : {}),
        ...(params.city && params.state ? {
          city: params.city,
          state: params.state
        } : {}),
        ...(params.minPrice ? { minPrice: params.minPrice.toString() } : {}),
        ...(params.maxPrice ? { maxPrice: params.maxPrice.toString() } : {})
      }).toString();

      const response = await fetch(
        `https://${this.host}/propertyExtendedSearch?${queryParams}`,
        {
          method: 'GET',
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
    if (!data?.props || !Array.isArray(data.props)) {
      return [];
    }

    return data.props.map((property: any) => ({
      address: `${property.streetAddress || ''}, ${property.city || ''}, ${property.state || ''} ${property.zipcode || ''}`,
      price: typeof property.price === 'string' ? parseInt(property.price.replace(/[^0-9]/g, '')) : (property.price || 0),
      beds: property.bedrooms || 0,
      baths: property.bathrooms || 0,
      sqft: property.livingArea || 0,
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
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const providers: PropertyProvider[] = [
      new USRealEstateProvider(),
      new ZillowProvider()
    ];

    const searchParams: SearchParams = {
      city: typeof req.query.city === 'string' ? req.query.city : undefined,
      state: typeof req.query.state === 'string' ? req.query.state : undefined,
      zipCode: typeof req.query.zipCode === 'string' ? req.query.zipCode : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      page: req.query.page ? Number(req.query.page) : 1
    };

    // Try each provider until we get results
    let properties: NormalizedProperty[] = [];
    let errors: string[] = [];

    for (const provider of providers) {
      try {
        console.log(`Trying provider: ${provider.getHost()}`);
        properties = await provider.search(searchParams);
        if (properties.length > 0) {
          console.log(`Found ${properties.length} properties from ${provider.getHost()}`);
          break;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${provider.getHost()}: ${errorMessage}`);
        console.error(`Error with provider ${provider.getHost()}:`, error);
        continue;
      }
    }

    if (properties.length === 0) {
      console.log('No properties found. Errors:', errors);
      return res.status(404).json({
        error: 'No properties found. Try another location.',
        providerErrors: errors
      });
    }

    return res.status(200).json({ properties });
  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({
      error: 'Failed to fetch properties. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
