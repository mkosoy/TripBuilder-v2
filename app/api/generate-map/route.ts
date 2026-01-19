import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60 seconds for image generation

export async function POST(req: Request) {
  try {
    const { dayId, forceRegenerate = false } = await req.json();

    if (!dayId) {
      return NextResponse.json({ error: "Day ID is required" }, { status: 400 });
    }

    // Check if Hugging Face API is configured
    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json(
        { error: "Image generation not configured. Using fallback poster." },
        { status: 503 }
      );
    }

    const supabase = await getSupabaseServerClient();

    // Check if map already exists (unless force regenerate)
    if (!forceRegenerate) {
      const { data: existing } = await supabase
        .from("daily_visual_maps")
        .select("*")
        .eq("day_id", dayId)
        .single();

      if (existing) {
        return NextResponse.json({
          map: existing,
          cached: true
        });
      }
    }

    // Fetch day data with activities
    const { data: day, error: dayError } = await supabase
      .from("days")
      .select("*, activities(*)")
      .eq("id", dayId)
      .single();

    if (dayError || !day) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    // Generate prompt from day data
    console.log("[generate-map] Day activities count:", day.activities?.length || 0);
    console.log("[generate-map] Activities:", JSON.stringify(day.activities?.map((a: any) => ({ name: a.name, desc: a.description?.substring(0, 50) })), null, 2));
    const prompt = buildPromptFromDay(day);
    console.log("[generate-map] Generated prompt:", prompt);

    // Call Hugging Face API
    let imageUrl: string;
    let isFallback = false;

    try {
      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              negative_prompt: "text, words, letters, realistic photo, photograph, people, faces, humans",
              num_inference_steps: 30,
              guidance_scale: 7.5,
            }
          }),
        }
      );

      if (response.status === 429) {
        // Rate limit - use fallback
        console.warn("Hugging Face rate limit reached, using fallback");
        imageUrl = generateFallbackPoster(day);
        isFallback = true;
      } else if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      } else {
        // Get image as blob and convert to base64 data URL
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        imageUrl = `data:image/png;base64,${base64}`;
      }

    } catch (error) {
      console.error("Image generation failed, using fallback:", error);
      imageUrl = generateFallbackPoster(day);
      isFallback = true;
    }

    // Save to database (upsert to handle regeneration)
    const { data: savedMap, error: saveError } = await supabase
      .from("daily_visual_maps")
      .upsert({
        day_id: dayId,
        trip_id: day.trip_id,
        image_url: imageUrl,
        prompt_used: prompt,
        is_fallback: isFallback,
        generated_by_traveler_id: forceRegenerate ? req.headers.get("x-traveler-id") : null,
      }, {
        onConflict: "day_id"
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving map:", saveError);
      return NextResponse.json({ error: "Failed to save map" }, { status: 500 });
    }

    return NextResponse.json({
      map: savedMap,
      cached: false,
      isFallback
    });

  } catch (error) {
    console.error("Map generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate map" },
      { status: 500 }
    );
  }
}

// Helper function to build prompt from day data
function buildPromptFromDay(day: any): string {
  const activities = day.activities || [];
  const destination = day.destination;
  const isIceland = destination === "reykjavik";

  // Extract key places and landmarks from activities
  const keyPlaces = activities
    .filter((a: any) => a.name && !a.name.toLowerCase().includes("arrive") && !a.name.toLowerCase().includes("check-in"))
    .slice(0, 5) // Top 5 activities
    .map((a: any) => a.name)
    .join(", ");

  // Extract specific food/drink mentions from descriptions
  const foodMentions: string[] = [];
  const eventMentions: string[] = [];
  activities.forEach((a: any) => {
    const desc = (a.description || "").toLowerCase();
    const name = (a.name || "").toLowerCase();

    // Food items
    if (desc.includes("pastry") || desc.includes("sourdough")) foodMentions.push("fresh pastries");
    if (desc.includes("smorrebrod") || desc.includes("smørrebrød")) foodMentions.push("open-faced sandwiches");
    if (desc.includes("hot dog")) foodMentions.push("hot dogs");
    if (desc.includes("beer") || desc.includes("craft")) foodMentions.push("beer steins");
    if (desc.includes("wine")) foodMentions.push("wine glasses");
    if (desc.includes("coffee")) foodMentions.push("coffee cups");
    if (desc.includes("schnitzel")) foodMentions.push("schnitzel");
    if (name.includes("market") || desc.includes("market")) foodMentions.push("market stalls");

    // Events & special items
    if (desc.includes("light festival") || desc.includes("light trail")) eventMentions.push("glowing light installations");
    if (desc.includes("jazz")) eventMentions.push("jazz instruments");
    if (desc.includes("northern lights") || desc.includes("aurora")) eventMentions.push("aurora borealis");
    if (desc.includes("geysir") || desc.includes("geyser")) eventMentions.push("erupting geyser");
    if (desc.includes("waterfall")) eventMentions.push("dramatic waterfall");
    if (desc.includes("glacier")) eventMentions.push("blue glacier");
    if (desc.includes("hot spring") || desc.includes("lagoon")) eventMentions.push("steaming hot springs");
  });

  // Determine time of day vibe
  const hasNightlife = activities.some((a: any) => a.type === "nightlife");
  const hasMorning = activities.some((a: any) => {
    const time = a.time || "";
    return time.includes("AM") || time.includes("9:") || time.includes("10:") || time.includes("11:");
  });

  // Build treasure items list
  const treasureItems = [
    ...new Set([
      ...foodMentions,
      ...eventMentions,
    ])
  ].slice(0, 6).join(", ");

  // Destination-specific landmarks
  const landmarks = isIceland
    ? "Hallgrimskirkja church silhouette, volcanic mountains, geothermal steam vents, Icelandic horses"
    : "colorful Nyhavn houses, Round Tower, Copenhagen spires, bicycles, canal boats";

  // Atmosphere based on destination and activities
  const atmosphere = isIceland
    ? "mystical winter wonderland, aurora borealis dancing in sky, snow-covered volcanic landscape, ethereal blue and green glow"
    : "cozy hygge winter evening, warm golden lantern light, snow dusted cobblestones, twinkling fairy lights";

  // Time of day mood
  const timeVibe = hasNightlife
    ? "twilight adventure transitioning to magical night scene"
    : hasMorning
    ? "bright morning light with promise of adventure"
    : "golden afternoon exploration";

  const prompt = `
Vintage treasure map illustration of a day exploring ${isIceland ? "Reykjavik, Iceland" : "Copenhagen, Denmark"}.

STYLE: Hand-drawn antique treasure map with whimsical illustrated elements, sepia-toned parchment background with colorful illustrated icons, dotted path connecting locations, decorative compass rose, artistic and playful.

KEY ILLUSTRATED ELEMENTS (draw as cute icons along the treasure path):
- ${landmarks}
${treasureItems ? `- ${treasureItems}` : ""}
- X marks for each stop on the journey
- Dotted adventure trail connecting all locations
- Small illustrated figures of friends exploring together

ATMOSPHERE: ${atmosphere}, ${timeVibe}

IMPORTANT: NO TEXT, NO WORDS, NO LABELS - only illustrated icons and decorative elements. Make it look like a keepsake treasure map from an epic adventure day.
  `.trim();

  return prompt;
}

// Generate fallback SVG poster
function generateFallbackPoster(day: any): string {
  const destination = day.destination === "copenhagen" ? "Copenhagen" : "Reykjavik";
  const color = day.destination === "copenhagen" ? "#E94E77" : "#4A9B9F";

  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="${color}"/>
      <text x="400" y="250" font-family="Arial, sans-serif" font-size="48"
            fill="white" text-anchor="middle" font-weight="bold">
        ${destination}
      </text>
      <text x="400" y="320" font-family="Arial, sans-serif" font-size="32"
            fill="white" text-anchor="middle" opacity="0.9">
        ${day.title}
      </text>
      <text x="400" y="380" font-family="Arial, sans-serif" font-size="24"
            fill="white" text-anchor="middle" opacity="0.8">
        ${day.date}
      </text>
      <circle cx="400" cy="450" r="60" fill="white" opacity="0.2"/>
      <circle cx="300" cy="500" r="40" fill="white" opacity="0.15"/>
      <circle cx="500" cy="480" r="50" fill="white" opacity="0.18"/>
    </svg>
  `;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
