import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        let content = formData.get("text") as string || "";
        const audioFile = formData.get("audio") as File | null;
        const imageBase64 = formData.get("image") as string | null;

        if (!content && !audioFile && !imageBase64) {
            return NextResponse.json({ error: "No input provided" }, { status: 400 });
        }

        // Return mock response if API key is not configured yet
        if (process.env.OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE" || !process.env.OPENAI_API_KEY) {
            console.log("Using Mock AI Data");
            return NextResponse.json({
                title: "Mock AI Recipe",
                time: 25,
                health_score: 9,
                tags: ["Healthy", "Fast"],
                ingredients: [{ quantity: 2, unit: "cups", name: "Spinach" }],
                steps: ["Mix everything together."]
            });
        }

        // 1. If audio is provided, transcribe it using Whisper
        if (audioFile) {
            console.log("Transcribing audio...", audioFile.name);
            const transcription = await openai.audio.transcriptions.create({
                file: audioFile,
                model: "whisper-1",
            });
            content += "\n[Voice Dictation]: " + transcription.text;
        }

        const systemPrompt = `You are a culinary AI assistant for a health-conscious couple. Your job is to extract unstructured recipe data (text, OCR from image, or voice transcript) into a strict JSON structure.
You MUST output raw JSON without any markdown formatting.
Rules for extraction:
1. title: Create a catchy, human-readable title.
2. time: Extract or estimate prep/cook time (in minutes, integer).
3. ingredients: List of objects with { quantity (number/null), unit (string/null), name (string) }.
4. steps: Ordered array of strings.
5. health_score: Rate 1-10 based on whole foods, low ultra-processed, high veg/protein.
6. tags: Array of EXACTLY 1 to 3 categories chosen strictly from this list: ["Healthy", "Fast", "High Protein", "Vegan", "Comfort Food", "Low Carb", "Spicy", "Quick Snack", "Dessert", "Breakfast"]. Do NOT invent tags outside this list.`;

        // 2. Format the message payload based on whether there's an image
        let userMessage: any = content || "Extract recipe from the attached image.";

        if (imageBase64) {
            userMessage = [
                { type: "text", text: content || "Extract recipe details from this image." },
                { type: "image_url", image_url: { url: imageBase64 } }
            ];
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
            ],
        });

        const result = JSON.parse(response.choices[0].message.content || "{}");
        return NextResponse.json(result);
    } catch (error) {
        console.error("Magic Add Error:", error);
        return NextResponse.json(
            { error: "Failed to process recipe" },
            { status: 500 }
        );
    }
}
