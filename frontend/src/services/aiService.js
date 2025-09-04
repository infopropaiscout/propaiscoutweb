import { API_CONFIG } from '../config/api';

class AIService {
  constructor() {
    this.headers = {
      'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  async calculateMotivationScore(property) {
    const factors = {
      daysOnMarket: {
        value: property.days_on_market,
        weight: 0.3,
        score: (days) => {
          if (days > 180) return 1;
          if (days > 90) return 0.8;
          if (days > 60) return 0.6;
          if (days > 30) return 0.4;
          return 0.2;
        }
      },
      priceHistory: {
        value: property.price_reduced_amount ? 1 : 0,
        weight: 0.2,
        score: (reduced) => reduced ? 1 : 0
      },
      lastSoldDate: {
        value: property.last_sold_date,
        weight: 0.2,
        score: (date) => {
          if (!date) return 0;
          const years = (new Date() - new Date(date)) / (1000 * 60 * 60 * 24 * 365);
          if (years > 20) return 1;
          if (years > 15) return 0.8;
          if (years > 10) return 0.6;
          if (years > 5) return 0.4;
          return 0.2;
        }
      },
      propertyCondition: {
        value: property.year_built,
        weight: 0.15,
        score: (year) => {
          if (!year) return 0;
          const age = new Date().getFullYear() - year;
          if (age > 50) return 1;
          if (age > 30) return 0.8;
          if (age > 20) return 0.6;
          if (age > 10) return 0.4;
          return 0.2;
        }
      },
      marketTrends: {
        value: property.estimated_value && property.price ? 
          property.estimated_value / property.price : 1,
        weight: 0.15,
        score: (ratio) => {
          if (ratio > 1.2) return 0.2; // Property might be underpriced
          if (ratio < 0.8) return 1;   // Property might be overpriced
          return 0.5;                  // Price seems fair
        }
      }
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const factor of Object.values(factors)) {
      if (factor.value !== null && factor.value !== undefined) {
        totalScore += factor.score(factor.value) * factor.weight;
        totalWeight += factor.weight;
      }
    }

    // Normalize score to account for missing factors
    const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 50;
    return Math.round(normalizedScore);
  }

  async analyzeROI(property) {
    try {
      const prompt = this._generateROIPrompt(property);
      const analysis = await this._callOpenAI(prompt);
      
      return {
        purchasePrice: property.price,
        estimatedRepairs: this._extractNumber(analysis, 'estimated repairs'),
        rehabCosts: this._extractNumber(analysis, 'rehab costs'),
        afterRepairValue: this._extractNumber(analysis, 'after repair value'),
        rentalIncome: this._extractNumber(analysis, 'potential monthly rental income'),
        expenses: this._extractNumber(analysis, 'estimated monthly expenses'),
        cashflow: this._extractNumber(analysis, 'monthly cashflow'),
        capRate: this._extractNumber(analysis, 'cap rate'),
        roi: this._extractNumber(analysis, 'ROI'),
        summary: this._extractSummary(analysis),
        recommendations: this._extractRecommendations(analysis)
      };
    } catch (error) {
      console.error('Error analyzing ROI:', error);
      throw new Error('Failed to analyze ROI. Please try again.');
    }
  }

  async generateOutreachMessage(property) {
    try {
      const prompt = this._generateOutreachPrompt(property);
      const message = await this._callOpenAI(prompt);
      return message;
    } catch (error) {
      console.error('Error generating outreach message:', error);
      throw new Error('Failed to generate message. Please try again.');
    }
  }

  async _callOpenAI(prompt) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert real estate investment analyst and professional communicator.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw error;
    }
  }

  _generateROIPrompt(property) {
    return `Analyze this property for investment potential:

Address: ${property.address}
Price: ${property.price}
Type: ${property.property_type}
Beds: ${property.beds}
Baths: ${property.baths}
Square Feet: ${property.sqft}
Year Built: ${property.year_built}
Days on Market: ${property.days_on_market}
Last Sold Price: ${property.last_sold_price}
Last Sold Date: ${property.last_sold_date}
Estimated Value: ${property.estimated_value}

Please provide a detailed investment analysis including:
1. Estimated repairs needed
2. Rehab costs
3. After Repair Value (ARV)
4. Potential monthly rental income
5. Estimated monthly expenses
6. Monthly cashflow
7. Cap rate
8. ROI
9. Summary of the investment opportunity
10. Recommendations

Format numbers without commas and use only digits for numerical values.`;
  }

  _generateOutreachPrompt(property) {
    return `Generate a personalized outreach message for this property:

Address: ${property.address}
Price: ${property.price}
Type: ${property.property_type}
Days on Market: ${property.days_on_market}
Motivation Score: ${property.motivation_score}

The message should:
1. Be professional and friendly
2. Reference specific property details
3. Show market knowledge
4. Express genuine interest
5. Include a clear call to action
6. Be concise (max 200 words)

Write the message from the perspective of a real estate investor.`;
  }

  _extractNumber(text, label) {
    const regex = new RegExp(`${label}[^\\d]*(\\d+(?:\\.\\d+)?)`);
    const match = text.toLowerCase().match(regex);
    return match ? parseFloat(match[1]) : null;
  }

  _extractSummary(text) {
    const summaryMatch = text.match(/summary[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/si);
    return summaryMatch ? summaryMatch[1].trim() : '';
  }

  _extractRecommendations(text) {
    const recommendationsMatch = text.match(/recommendations[:\s]+(.*?)(?=\n\n|$)/si);
    return recommendationsMatch ? recommendationsMatch[1].trim() : '';
  }
}

export const aiService = new AIService();