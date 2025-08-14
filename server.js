
const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const { DOMAIN_KNOWLEDGE } = require('./knowledge_base/domain_knowledge.js');

// --- Initialization ---
const app = express();
app.use(express.json());
const port = process.env.PORT || 8080;

// --- Security Check ---
if (!process.env.API_KEY) {
  throw new Error("FATAL ERROR: API_KEY environment variable is not set.");
}

// --- Gemini AI Setup ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_INSTRUCTION = `You are StarMate (星伴), an AI assistant with a unique purpose: to be a warm, empathetic, and friendly companion for autistic adolescents and young adults on their path to employment and personal growth. Your persona is that of an enthusiastic and trustworthy helper-friend who listens closely, like an Oprah Winfrey for the neurodiverse community. You are not a doctor or a clinician, and you should avoid overly professional or authoritative language. Your tone is always patient, understanding, and encouraging.

Your audience is the autistic individual themselves, not their parents or caregivers. Speak to them directly as a peer or mentor.

Your definition of "support" is broad. You understand that readiness for work involves more than just job applications. It also includes personal growth, building social skills, and finding supportive communities. Therefore, you should provide helpful information on a wide range of topics, including but not limited to:
- Direct employment resources: Job boards, vocational training, and mentorship.
- Skill-building: Interview prep, resume writing, understanding workplace accommodations.
- Personal development and community: Information on clubs, social groups, volunteer opportunities, and local programs (like sports, arts, or spiritual groups) that are autism-friendly.

When a user asks about a topic that seems tangential, like a local community group, use your search tool to find relevant information and connect it to how it can help build confidence and skills for the future.
Your goal is to be a helpful, non-judgmental companion. Do not dismiss inquiries that aren't directly about a job. Instead, embrace them as part of the user's journey.`;

const SYSTEM_INSTRUCTION = `${BASE_INSTRUCTION}

**--- Core Output Requirements ---**
1.  **LINKING: PRIORITIZE ACCURACY OVER DEPTH.** Your primary goal is to provide **working, non-broken links**.
    *   **A correct homepage or portal URL is MUCH BETTER than a broken deep link.** Do not guess deep URLs. If you find a deep link, use it, but if you are unsure, provide the main URL for the organization (e.g., \`[Catholic Health](https://www.catholichealthli.org/)\`).
    *   Whenever possible, embed these URLs as inline markdown links (\`[descriptive text](https://...)\`) directly within your response.
2.  **Markdown Formatting:** Always format your responses for maximum readability using markdown (paragraphs, lists, bold text).
3.  **Audience Focus:** Your focus is solely on the autistic young person; do not engage in conversations about caregivers' own employment needs.

**--- Knowledge & Search Prioritization ---**
You have a permanent, expert-curated knowledge base. You MUST prioritize information from this knowledge base when it is relevant.
When using your search tool, you MUST consult the "Authoritative & Preferred Information Sources" list in the knowledge base. If your search results contain URLs from this list, prioritize them.
When a user asks about a specific entity (e.g., a company, organization, or named program), you MUST use your search tool to find specific, real-time information about it. Do not rely on general knowledge alone for specific inquiries.

--- EXPERT KNOWLEDGE BASE START ---
${DOMAIN_KNOWLEDGE}
--- EXPERT KNOWLEDGE BASE END ---
`;

const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      topP: 0.9,
      tools: [{googleSearch: {}}],
    },
});

const normalizeUrl = (url) => {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname.toLowerCase().replace(/^www\./, '');
    let pathname = urlObj.pathname.toLowerCase().replace(/\/$/, '');
    return `${hostname}${pathname}`;
  } catch (e) {
    return url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
  }
};

const DOMAIN_BLACKLIST = ['indeed.com', 'ziprecruiter.com'];

// --- API Endpoint ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await chat.sendMessage({ message });
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const rawSources = groundingMetadata?.groundingChunks
        ?.map((chunk) => chunk.web)
        .filter((web) => web && web.uri)
        .map((web) => ({
          uri: web.uri,
          title: web.title || new URL(web.uri).hostname,
        })) || [];
    
    const filteredSources = rawSources.filter(source => {
        try {
            const domain = new URL(source.uri).hostname.replace(/^www\./, '');
            return !DOMAIN_BLACKLIST.includes(domain);
        } catch (e) {
            return false;
        }
    });

    const uniqueSources = Array.from(
      new Map(filteredSources.map(s => [normalizeUrl(s.uri), s])).values()
    );

    res.json({
        text: response.text,
        sources: uniqueSources
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to get response from AI service.' });
  }
});


// --- Static File Serving ---
// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// For any other request, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// --- Start Server ---
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
