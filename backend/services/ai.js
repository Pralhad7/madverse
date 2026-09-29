const { getReviewsForRating } = require('./reviewMessages');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Natural language helper to construct human-sounding long-form draft variants
 * categorized by star rating (1 to 5) without hallucinating any facts.
 */
function createFallbackVariants({ businessName, locationName, starRating = 5, selectedPrompts = [], customDetails = '', tone }) {
    const safeRating = Math.max(1, Math.min(5, Number(starRating) || 5));
    const reviews = getReviewsForRating(safeRating, businessName, locationName);
    
    // Select 3 diverse long-form review variants
    const v1 = reviews[0];
    const v2 = reviews[1] || reviews[0];
    const v3 = reviews[2] || reviews[0];

    const badges = {
        1: ['Objective', 'Detailed Feedback', 'Constructive Note'],
        2: ['Balanced', 'Room for Growth', 'Detailed Observations'],
        3: ['Fair Review', 'Honest Assessment', 'Balanced Take'],
        4: ['High Praise', 'Great Hospitality', 'Detailed Experience'],
        5: ['Exceptional', 'Masterclass', 'Highly Recommended']
    };

    const tones = {
        1: ['Constructive & Clear', 'Direct & Detailed', 'Respectful Observations'],
        2: ['Gentle Critique', 'Constructive Assessment', 'Balanced Overview'],
        3: ['Honest & Balanced', 'Objective Feedback', 'Fair Assessment'],
        4: ['Warm & Satisfied', 'Enthusiastic & Detailed', 'Thoughtful Praise'],
        5: ['Warm & Enthusiastic', 'Raving Review', 'Deeply Impressed']
    };

    const ratingBadges = badges[safeRating] || badges[5];
    const ratingTones = tones[safeRating] || tones[5];

    return [
        { id: 'draft-1', tone: ratingTones[0], text: v1, badge: ratingBadges[0] },
        { id: 'draft-2', tone: ratingTones[1], text: v2, badge: ratingBadges[1] },
        { id: 'draft-3', tone: ratingTones[2], text: v3, badge: ratingBadges[2] }
    ];
}

async function generateDrafts({ businessName, businessCategory, locationName, starRating = 5, selectedPrompts = [], customDetails = '', language = 'en', tone = 'friendly' }) {
    const promptText = `
You are a review writing assistant helping a real verified customer write an honest, high-quality Google Review for a local business.
Business: ${businessName} (${businessCategory}) - Location: ${locationName}
Intended Rating: ${starRating ? starRating + ' stars' : '5 stars'}
Customer's Observed Points: ${selectedPrompts.join(', ') || 'General visit'}
Customer's Extra Note: ${customDetails || 'None provided'}
Language: ${language}
Tone preference: ${tone}

Strict Guardrails:
1. Grounding: Ground the review SOLELY on the facts and notes provided above. Do NOT invent specific dishes, employee names, wait minutes, or scenarios that were not provided.
2. Tone: First-person authentic voice ("I visited...", "We noticed..."). Avoid robotic marketing buzzwords (e.g. "synergy", "world-class gastronomic delight").
3. Rating-Specific Sentiment (1 to 5 stars):
   - 1 Star: Substantial, serious, respectful, objective critique describing severe friction or disappointments.
   - 2 Stars: Moderate critique recognizing the premise but clearly explaining operational shortcomings.
   - 3 Stars: Balanced, fair, realistic assessment highlighting both pros and room for improvement.
   - 4 Stars: Very positive, encouraging, and detailed review noting minor areas for polish.
   - 5 Stars: Highly enthusiastic, glowing, detailed praise celebrating hospitality and quality.
4. Review Length: The reviews MUST be a bit long and thorough (3-6 sentences, approx 60-100 words each). Do NOT output brief 1-2 sentence snippets.
5. Output 3 distinct style variants:
   - Variant 1: "Warm & Authentic" (or "Constructive & Clear" if 1-2 stars)
   - Variant 2: "Story-Driven & Observant"
   - Variant 3: "Detailed & Comprehensive"

Output Format: Strictly return a JSON array containing exactly 3 objects:
[
  { "id": "1", "tone": "Style Name", "badge": "Badge text", "text": "Review draft here..." },
  { "id": "2", "tone": "Style Name", "badge": "Badge text", "text": "Review draft here..." },
  { "id": "3", "tone": "Style Name", "badge": "Badge text", "text": "Review draft here..." }
]
`;

    if (GEMINI_API_KEY) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.6
                    }
                })
            });
            const data = await response.json();
            if (data.candidates && data.candidates.length > 0) {
                const text = data.candidates[0].content.parts[0].text;
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.map((item, idx) => ({
                        id: item.id || `variant-${idx + 1}`,
                        tone: item.tone || 'Suggested Draft',
                        badge: item.badge || 'AI Draft',
                        text: typeof item === 'string' ? item : item.text
                    }));
                }
            }
        } catch (e) {
            console.error("Gemini API Error, falling back to smart dynamic generator:", e.message);
        }
    }

    return createFallbackVariants({ businessName, locationName, starRating, selectedPrompts, customDetails, tone });
}

module.exports = { generateDrafts };
