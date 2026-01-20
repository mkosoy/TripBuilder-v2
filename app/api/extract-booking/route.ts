import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EXTRACTION_PROMPT = `You are a booking information extraction assistant. Analyze this screenshot and extract booking details.

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

Extract all visible information. If a field is not visible, omit it from the JSON.`;

// Try Gemini API first
async function tryGemini(mimeType: string, base64Data: string): Promise<{ success: boolean; data?: string; error?: string }> {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: "GEMINI_API_KEY not configured" };
  }

  console.log("[extract-booking] Trying Gemini API...");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: EXTRACTION_PROMPT },
            {
              inline_data: {
                mime_type: mimeType,
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
    console.error("[extract-booking] Gemini API error:", response.status, JSON.stringify(errorData));
    return { success: false, error: `Gemini error: ${response.status}` };
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!content) {
    return { success: false, error: "Empty response from Gemini" };
  }

  console.log("[extract-booking] Gemini API success");
  return { success: true, data: content };
}

// Fallback to Hugging Face API
async function tryHuggingFace(mimeType: string, base64Data: string): Promise<{ success: boolean; data?: string; error?: string }> {
  if (!process.env.HUGGINGFACE_API_KEY) {
    return { success: false, error: "HUGGINGFACE_API_KEY not configured" };
  }

  console.log("[extract-booking] Trying Hugging Face API as fallback...");

  // Use Qwen2-VL which is a good free vision-language model
  const response = await fetch(
    "https://api-inference.huggingface.co/models/Qwen/Qwen2-VL-7B-Instruct",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          image: `data:${mimeType};base64,${base64Data}`,
          text: EXTRACTION_PROMPT
        },
        parameters: {
          max_new_tokens: 2048,
          temperature: 0.2,
        }
      })
    }
  );

  if (!response.ok) {
    // Try alternative model if Qwen fails
    console.log("[extract-booking] Qwen model failed, trying BLIP...");

    // For BLIP, we need to use a simpler approach - it's image captioning
    // Let's try Idefics2 instead which is better for instruction following
    const ideficsResponse = await fetch(
      "https://api-inference.huggingface.co/models/HuggingFaceM4/idefics2-8b",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `User:<image>data:${mimeType};base64,${base64Data}</image>\n${EXTRACTION_PROMPT}\nAssistant:`,
          parameters: {
            max_new_tokens: 2048,
            temperature: 0.2,
          }
        })
      }
    );

    if (!ideficsResponse.ok) {
      const errorText = await ideficsResponse.text();
      console.error("[extract-booking] Hugging Face API error:", errorText);
      return { success: false, error: `Hugging Face error: ${ideficsResponse.status}` };
    }

    const ideficsData = await ideficsResponse.json();
    const content = Array.isArray(ideficsData) ? ideficsData[0]?.generated_text : ideficsData?.generated_text;

    if (!content) {
      return { success: false, error: "Empty response from Hugging Face" };
    }

    console.log("[extract-booking] Hugging Face (Idefics) API success");
    return { success: true, data: content };
  }

  const data = await response.json();
  const content = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;

  if (!content) {
    return { success: false, error: "Empty response from Hugging Face" };
  }

  console.log("[extract-booking] Hugging Face (Qwen) API success");
  return { success: true, data: content };
}

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Check if at least one API key is configured
    const hasGemini = !!process.env.GEMINI_API_KEY;
    const hasHuggingFace = !!process.env.HUGGINGFACE_API_KEY;

    console.log("[extract-booking] Available APIs - Gemini:", hasGemini, "HuggingFace:", hasHuggingFace);

    if (!hasGemini && !hasHuggingFace) {
      console.error("[extract-booking] No AI API keys configured");
      return NextResponse.json(
        { error: "AI extraction not configured. Please enter booking details manually." },
        { status: 503 }
      );
    }

    // Extract base64 data and mime type from data URL
    const base64Match = imageUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!base64Match) {
      console.error("[extract-booking] Invalid image format, doesn't match data URL pattern");
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }
    const mimeType = base64Match[1];
    const base64Data = base64Match[2];
    console.log("[extract-booking] Image mime type:", mimeType, "Base64 length:", base64Data.length);

    // Try Gemini first, then fall back to Hugging Face
    let result = await tryGemini(mimeType, base64Data);

    if (!result.success && hasHuggingFace) {
      console.log("[extract-booking] Gemini failed, trying Hugging Face fallback...");
      result = await tryHuggingFace(mimeType, base64Data);
    }

    if (!result.success) {
      console.error("[extract-booking] All AI APIs failed");
      return NextResponse.json(
        { error: "AI service is temporarily busy. Please try again in a minute or enter details manually." },
        { status: 429 }
      );
    }

    // Parse JSON from response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = result.data!.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in response");
      }
      extractedData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("[extract-booking] Failed to parse AI response:", result.data);
      return NextResponse.json(
        { error: "Failed to extract structured data from image" },
        { status: 500 }
      );
    }

    return NextResponse.json(extractedData);
  } catch (error) {
    console.error("[extract-booking] Extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract booking information" },
      { status: 500 }
    );
  }
}
