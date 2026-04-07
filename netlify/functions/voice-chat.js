const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  const SYSTEM_PROMPT = `You are Amani, the friendly AI voice receptionist for Tom Tour Guide — Lake Kivu Adventures. 
  Keep responses SHORT and CONVERSATIONAL. Max 3 sentences. 
  LOCATION: Rubavu, Rwanda. WHATSAPP: +250 791 750 041.
  If unsure, tell them to WhatsApp Tom.`;

  try {
    const { messages } = JSON.parse(event.body);
    const userMessage = messages[messages.length - 1].content;

    // Google Gemini Free Tier Endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\nUser says: ${userMessage}` }]
        }]
      }),
    });

    const data = await response.json();
    
    // Extracting the text from Gemini's response format
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                  "I'm having a small connection issue. Please WhatsApp Tom at +250 791 750 041!";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: [{ text: reply }]
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to connect to Gemini" }),
    };
  }
};
