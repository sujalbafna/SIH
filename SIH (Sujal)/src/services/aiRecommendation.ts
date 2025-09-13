interface UserProfile {
  name: string;
  education: string;
  field: string;
  skills: string[];
  interests: string[];
  location: string;
  duration: string;
  workType: string;
  experience?: string;
}

interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  duration: string;
  skills: string[];
  type: string;
  remote: boolean;
  description: string;
  requirements: string[];
}

class AIRecommendationService {
  private openaiApiKey: string;

  constructor() {
    // In a real app, this would come from environment variables
    this.openaiApiKey = import.meta.env.VITE_REACT_APP_OPENAI_API_KEY || '';
  }

  async generateRecommendations(
    userProfile: UserProfile, 
    internships: Internship[]
  ): Promise<Array<Internship & { matchScore: number; reasoning: string }>> {
    try {
      const prompt = this.buildRecommendationPrompt(userProfile, internships);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an AI career counselor for the PM Internship Scheme in India. 
              Your job is to match candidates with suitable internships based on their profiles. 
              Consider skills, interests, location preferences, education background, and career aspirations.
              Focus on opportunities that would benefit first-generation learners and students from diverse backgrounds.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI recommendations');
      }

      const data = await response.json();
      return this.parseAIResponse(data.choices[0].message.content, internships);
      
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      // Fallback to rule-based matching
      return this.fallbackMatching(userProfile, internships);
    }
  }

  private buildRecommendationPrompt(userProfile: UserProfile, internships: Internship[]): string {
    return `
User Profile:
- Name: ${userProfile.name}
- Education: ${userProfile.education} in ${userProfile.field}
- Skills: ${userProfile.skills.join(', ')}
- Interests: ${userProfile.interests.join(', ')}
- Location: ${userProfile.location}
- Preferred Duration: ${userProfile.duration}
- Work Type Preference: ${userProfile.workType}

Available Internships:
${internships.map((internship, index) => `
${index + 1}. ${internship.title} at ${internship.company}
   - Location: ${internship.location}
   - Duration: ${internship.duration}
   - Skills Required: ${internship.skills.join(', ')}
   - Type: ${internship.type}
   - Remote: ${internship.remote ? 'Yes' : 'No'}
   - Requirements: ${internship.requirements.join(', ')}
`).join('')}

Please analyze and rank the top 5 internships for this candidate. For each recommendation, provide:
1. Internship ID (use the number from the list)
2. Match Score (0-100)
3. Brief reasoning (2-3 sentences explaining why it's a good match)

Format your response as JSON:
{
  "recommendations": [
    {
      "id": 1,
      "matchScore": 95,
      "reasoning": "Excellent match because..."
    }
  ]
}
    `;
  }

  private parseAIResponse(
    aiResponse: string, 
    internships: Internship[]
  ): Array<Internship & { matchScore: number; reasoning: string }> {
    try {
      const parsed = JSON.parse(aiResponse);
      return parsed.recommendations.map((rec: any) => {
        const internship = internships[rec.id - 1];
        return {
          ...internship,
          matchScore: rec.matchScore,
          reasoning: rec.reasoning
        };
      }).filter(Boolean);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.fallbackMatching({ skills: [], interests: [] } as UserProfile, internships);
    }
  }

  private fallbackMatching(
    userProfile: UserProfile, 
    internships: Internship[]
  ): Array<Internship & { matchScore: number; reasoning: string }> {
    return internships.map(internship => {
      let score = 50; // Base score
      let reasoning = "Basic compatibility match";

      // Skill matching
      const skillMatch = userProfile.skills?.some(skill => 
        internship.skills.some(reqSkill => 
          reqSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (skillMatch) {
        score += 20;
        reasoning = "Skills align with requirements";
      }

      // Interest matching
      const interestMatch = userProfile.interests?.some(interest => 
        internship.type.toLowerCase().includes(interest.toLowerCase()) ||
        internship.title.toLowerCase().includes(interest.toLowerCase())
      );
      if (interestMatch) {
        score += 20;
        reasoning += " and matches career interests";
      }

      // Location preference
      if (userProfile.workType === 'remote' && internship.remote) {
        score += 10;
      }

      return {
        ...internship,
        matchScore: Math.min(score, 100),
        reasoning
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  async enhanceInternshipDescription(internship: Internship): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a career counselor helping students understand internship opportunities. Provide clear, encouraging, and informative descriptions.'
            },
            {
              role: 'user',
              content: `Enhance this internship description to be more appealing and informative for Indian students, especially first-generation learners:
              
              Title: ${internship.title}
              Company: ${internship.company}
              Current Description: ${internship.description}
              
              Make it more engaging and explain what they'll learn and how it helps their career.`
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
      
      return internship.description;
    } catch (error) {
      console.error('Failed to enhance description:', error);
      return internship.description;
    }
  }
}

export const aiRecommendationService = new AIRecommendationService();