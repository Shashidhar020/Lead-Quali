export interface AIAnalysisResult {
  lead_score: number;
  business_type: string;
  summary: string;
  buying_intent: 'High' | 'Medium' | 'Low';
  urgency_score: number;
  follow_up_message: string;
}

export const analyzeLeadWithAI = async (
  name: string,
  email: string,
  phone: string,
  businessRequirement: string,
  budget: string,
  notes?: string
): Promise<AIAnalysisResult> => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.log('[AI SERVICE] OPENROUTER_API_KEY is missing. Generating realistic Mock AI qualification data...');
    // Intelligent Mock data generator based on business segment or requirement keywords
    let detectedSegment = 'Real Estate';
    let mockScore = 85;
    let mockIntent: 'High' | 'Medium' | 'Low' = 'High';
    let mockUrgency = 80;
    let mockSummary = '';
    let mockFollowUp = '';

    const reqLower = businessRequirement.toLowerCase();
    if (reqLower.includes('salon') || reqLower.includes('hair') || reqLower.includes('spa') || reqLower.includes('massage')) {
      detectedSegment = 'Salon';
      mockScore = 90;
      mockIntent = 'High';
      mockUrgency = 95;
      mockSummary = `${name} wants to book a hair coloring and style treatment session. Prefers late afternoon times.`;
      mockFollowUp = `Hi ${name}, thank you for choosing our Salon! I saw your request for hair coloring. We have openings this Thursday at 4 PM. Would that work for you? - Sarah, Stylist.`;
    } else if (reqLower.includes('gym') || reqLower.includes('fit') || reqLower.includes('coach') || reqLower.includes('train')) {
      detectedSegment = 'Gym';
      mockScore = 75;
      mockIntent = 'Medium';
      mockUrgency = 65;
      mockSummary = `${name} is looking to sign up for a personal training plan with a budget of ${budget}. Goal is fat loss.`;
      mockFollowUp = `Hey ${name}, thanks for reaching out to Elite Fitness! Let's get you set up for a free consultation with one of our master trainers to discuss your fitness goals. How does tomorrow evening look? - Team Elite.`;
    } else if (reqLower.includes('clinic') || reqLower.includes('doctor') || reqLower.includes('therapy') || reqLower.includes('dent')) {
      detectedSegment = 'Clinic';
      mockScore = 88;
      mockIntent = 'High';
      mockUrgency = 90;
      mockSummary = `${name} is seeking an urgent appointment regarding tooth pain or orthodontic consulting.`;
      mockFollowUp = `Hello ${name}, thank you for contacting our clinic. Tooth pain requires prompt attention. We can squeeze you in tomorrow morning at 9:30 AM. Please reply to confirm. - Clinic Reception.`;
    } else if (reqLower.includes('insur') || reqLower.includes('policy') || reqLower.includes('claim')) {
      detectedSegment = 'Insurance Agency';
      mockScore = 70;
      mockIntent = 'Medium';
      mockUrgency = 60;
      mockSummary = `${name} is inquiring about quotes for health or auto coverage, with a budget threshold of ${budget}.`;
      mockFollowUp = `Hello ${name}, thank you for requesting an insurance quote. I am reviewing policies that match your requirement. What is the best time for a quick 5-minute call today to finalize your rates? - David, Agent.`;
    } else if (reqLower.includes('coaching') || reqLower.includes('class') || reqLower.includes('course') || reqLower.includes('tutor') || reqLower.includes('study')) {
      detectedSegment = 'Coaching Center';
      mockScore = 80;
      mockIntent = 'High';
      mockUrgency = 70;
      mockSummary = `${name} wants to register for SAT prep / professional training courses. Budget mentioned: ${budget}.`;
      mockFollowUp = `Hi ${name}, thanks for inquiring about our academic programs! We have an info session starting this Saturday. I can secure a seat for you. Let me know if you would like to join. - Admissions office.`;
    } else {
      // Default: Real Estate
      detectedSegment = 'Real Estate';
      mockScore = 85;
      mockIntent = 'High';
      mockUrgency = 85;
      mockSummary = `${name} is interested in purchasing or leasing commercial/residential property. Stated budget: ${budget}.`;
      mockFollowUp = `Hi ${name}, thank you for your property inquiry! I've curated a list of listings matching your budget of ${budget}. When would you be free for a short call or walkthrough? - Premier Realty.`;
    }

    // Return mock object after a small artificial network latency (500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      lead_score: mockScore,
      business_type: detectedSegment,
      summary: mockSummary,
      buying_intent: mockIntent,
      urgency_score: mockUrgency,
      follow_up_message: mockFollowUp,
    };
  }

  // Production Mode: OpenRouter Live Fetch
  console.log('[AI SERVICE] Analyzing lead via OpenRouter...');
  
  const systemPrompt = `You are an AI Lead Qualification Agent. Evaluate user lead submissions.
Categorize the lead into one of these business segments: Real Estate, Salon, Gym, Clinic, Insurance Agency, Coaching Center.
Provide a lead score (0-100) indicating lead quality and conversion potential.
Provide urgency score (0-100) and buying intent (High, Medium, Low).
Draft a personalized follow-up SMS/Email message based on their requirement.

Return ONLY a valid JSON object matching this schema:
{
  "lead_score": number,
  "business_type": "Real Estate" | "Salon" | "Gym" | "Clinic" | "Insurance Agency" | "Coaching Center",
  "summary": "Brief 1-2 sentence executive summary of requirement",
  "buying_intent": "High" | "Medium" | "Low",
  "urgency_score": number,
  "follow_up_message": "Draft follow-up copy tailored to name and requirement"
}`;

  const userPrompt = `Lead Name: ${name}
Email: ${email}
Phone: ${phone}
Budget: ${budget}
Requirement details: ${businessRequirement}
Notes: ${notes || 'None'}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://quali.ai',
        'X-Title': 'QualiAI Platform',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response content received from OpenRouter API');
    }

    // Parse JSON safely
    const parsedResult = JSON.parse(content) as AIAnalysisResult;
    return {
      lead_score: Number(parsedResult.lead_score) || 50,
      business_type: parsedResult.business_type || 'Real Estate',
      summary: parsedResult.summary || 'Lead inquiry submitted.',
      buying_intent: parsedResult.buying_intent || 'Medium',
      urgency_score: Number(parsedResult.urgency_score) || 50,
      follow_up_message: parsedResult.follow_up_message || `Hi ${name}, thank you for your message. We have received your inquiry regarding: ${businessRequirement}.`,
    };
  } catch (error) {
    console.error('[AI SERVICE] OpenRouter error, falling back to mock details:', error);
    // Fallback response in case of API failure
    return {
      lead_score: 75,
      business_type: 'Real Estate',
      summary: `Failed to fetch live AI analysis. Here is a baseline summary: lead request for "${businessRequirement}".`,
      buying_intent: 'Medium',
      urgency_score: 60,
      follow_up_message: `Hi ${name}, thank you for your submission. We have received your details and are reviewing them.`,
    };
  }
};
