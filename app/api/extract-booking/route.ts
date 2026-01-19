import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI extraction not configured. Please enter booking details manually." },
        { status: 503 }
      );
    }

    // Extract base64 data from data URL
    const base64Match = imageUrl.match(/^data:image\/\w+;base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }
    const base64Data = base64Match[1];

    // Use Gemini 2.5 Flash (FREE - stable model with higher quota)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `You are a booking information extraction assistant. Analyze this screenshot and extract booking details.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):

For FLIGHTS:
{
  "type": "flight",
  "airline": "airline name",
  "flightNumber": "flight number",
  "from": "departure city",
  "fromCode": "airport code",
  "to": "arrival city",
  "toCode": "airport code",
  "date": "YYYY-MM-DD",
  "departureTime": "HH:MM",
  "arrivalTime": "HH:MM",
  "confirmationNumber": "confirmation code"
}

For RESTAURANTS:
{
  "type": "restaurant",
  "name": "restaurant name",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "address": "full address",
  "confirmationNumber": "confirmation code",
  "partySize": number
}

For TOURS:
{
  "type": "tour",
  "name": "tour name",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "address": "meeting location",
  "confirmationNumber": "confirmation code",
  "duration": "duration"
}

Extract all visible information. If a field is not visible, omit it from the JSON.`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON from response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      extractedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", content);
      return NextResponse.json(
        { error: "Failed to extract structured data from image" },
        { status: 500 }
      );
    }

    return NextResponse.json(extractedData);
  } catch (error) {
    console.error("Gemini extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract booking information" },
      { status: 500 }
    );
  }
}
