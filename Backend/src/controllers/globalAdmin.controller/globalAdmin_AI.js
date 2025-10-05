const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function enhanceText(req, res) {
    const { title, description } = req.body;
    const prompt = `
You are a helpful assistant for an LMS app. Given the module title and description below, rewrite both to be more engaging, clear, and professional.And also add tags , learningOutcomes
Return the improved title and description in JSON format as:
{
  "title": "<enhanced title>",
  "description": "<enhanced description>",
  "tags": ["tag1", "tag2", "tag3"],
  "learningOutcomes": ["outcome1", "outcome2", "outcome3"]
}
Module Title: ${title}
Module Description: ${description}
  `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    let result = response.text || response.content || response;

    // Clean out code block markers like ```json ... ```
    result = result.replace(/```json|```/g, "").trim();

    let enhanced;
    try {
        enhanced = JSON.parse(result);
    } catch (e) {
        console.error("Parsing error:", e);
        enhanced = { raw: result }; // fallback if not valid JSON
    }

    return res.status(200).json({
        isSuccess: true,
        message: "Text enhanced successfully",
        data: enhanced,
    });
}


async function generateImage(req, res) {
  const { title, description } = req.body;

  try {
    // Call the image generation endpoint
    const response = await ai.images.generate({
      model: "imagen-3.0", // image model
      prompt: `Generate a high-quality, professional, educational illustration representing the learning module titled '${title}' with description '${description}'.`,
      size: "1024x1024", // supported: 512x512, 1024x1024
    });

    // SDK returns base64 image data
    const imageBase64 = response.data[0].b64_json;
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    return res.status(200).json({
      isSuccess: true,
      message: "Image generated successfully",
      data: { image: imageUrl },
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to generate image",
      error: error.message,
    });
  }
}

module.exports = { enhanceText, generateImage };
