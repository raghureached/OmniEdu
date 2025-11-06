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

const enhanceSurvey = async( req,res)=>{
  const { title ,description} = req.body;
  const prompt = `
You are a helpful assistant for an LMS app. Given the survey title and description below, rewrite it to be more engaging, clear, and professional and add tags and description.
Return the improved title in JSON format as:
{
  "title": "<enhanced title>",
  "description": "<enhanced description>",
  "tags": ["tag1", "tag2", "tag3"],
}
Survey Title: ${title}
Survey Description: ${description}
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
const enhanceAssessment = async( req,res)=>{
  const { title ,description} = req.body;
  const prompt = `
You are a helpful assistant for an LMS app. Given the assessmnest title and desc
 below, rewrite it to be more engaging, clear, and professional and add tags.
Return the improved title in JSON format as:
{
  "title": "<enhanced title>",
  "description": "<enhanced description>",
  "tags": ["tag1", "tag2", "tag3"],
}
Assessment Title: ${title}
Assessment Description: ${description}
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

const createQuestions = async(req,res)=>{
  const { title,description,noOfQuestions ,Level} = req.body;
  const prompt = `
You are a helpful assistant for an LMS app. Given the assessment title and description below, create ${noOfQuestions} questions based on given ${Level} for it.The type can Multiple Choice or Multi Select
Return the questions in JSON format as:
{
"questions": [
    {
      "question_text": "The table below shows the sales of a company over five years (in ₹ lakhs):",
      "type": "Multiple Choice",
      "options": [
        "fjhgd",
        "djhfdjmsf",
        "fdsf"
      ],
      "correct_option": [0],
      "total_points": 1
    }, {
      "question_text": "The table below shows the sales of a company over five years (in ₹ lakhs):",
      "type": "Multiple Select",
      "options": [
        "fjhgd",
        "djhfdjmsf",
        "fdsf"
      ],
      "correct_option": [0,2],
      "total_points": 1
    }
]
}
Assessment Title: ${title}
Assessment Description: ${description}
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
const generateSurveyWithSections = async (req, res) => {
  try {
      const { title,description, noOfSections ,noOfQuestions } = req.body;

      const prompt = `
You are an expert survey designer. Create a survey with ${noOfSections} sections, each containing ${noOfQuestions} questions, based on the following details:

Survey Title: ${title}
Survey Description: ${description}
Questions per Section: ${noOfQuestions}

Section 1: Course Rating
Section 2: Mentor Rating

For each question, follow these guidelines:
1. Create clear, focused questions about the course and mentor
2. Include appropriate options (e.g., rating scales, multiple choice)
3. Make questions appropriate for participants
4. For rating questions, use consistent scales (e.g., 1-5)

Return the survey in the following JSON format:
{
  "sections": [
      {
          "description": "<h1>Course Rating</h1><p>Your feedback about the course content and structure</p>",
          "questions": [
              {
                  "question_text": "How would you rate the course content?",
                  "type": "Multiple Select",
                  "options": ["5 - Excellent", "4 - Very Good", "3 - Good", "2 - Fair", "1 - Poor"],
                  "order": 1
              },
              {
                  "question_text": "How well did the course meet your expectations?",
                  "type": "Multiple Choice",
                  "options": ["Exceeded", "Met", "Partially Met", "Did Not Meet"],
                  "order": 2
              }
          ]
      },
      {
          "description": "<h1>Mentor Rating</h1><p>Your feedback about the mentor's performance</p>",
          "questions": [
              {
                  "question_text": "How would you rate the mentor's knowledge of the subject?",
                  "type": "Multiple Choice",
                  "options": ["5 - Excellent", "4 - Very Good", "3 - Good", "2 - Fair", "1 - Poor"],
                  "order": 3
              },
              {
                  "question_text": "How effective was the mentor in explaining concepts?",
                  "type": "Multiple Select",
                  "options": ["5 - Excellent", "4 - Very Good", "3 - Good", "2 - Fair", "1 - Poor"],
                  "order": 4
              }
          ]
      }
  ]
}
      `;

      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
      });

      let result = response.text || response.content || response;
      result = result.replace(/```json|```/g, "").trim();

      try {
          const surveyData = JSON.parse(result);
          
          // Validate the response structure
          if (!surveyData.sections || !Array.isArray(surveyData.sections) || 
              surveyData.sections.length !== 2) {
              throw new Error("Invalid survey structure received from AI");
          }

          // Process and validate each section and its questions
          let questionOrder = 1;
          const processedSections = surveyData.sections.map((section, sectionIndex) => {
              if (!section.questions || !Array.isArray(section.questions)) {
                  throw new Error(`Section ${sectionIndex + 1} is missing questions`);
              }

              // Update question orders
              const processedQuestions = section.questions.map(question => {
                  if (!question.options || !Array.isArray(question.options)) {
                      throw new Error(`Question is missing options: ${question.question_text}`);
                  }

                  return {
                      ...question,
                      order: questionOrder++
                  };
              });

              return {
                  ...section,
                  questions: processedQuestions
              };
          });

          return res.status(200).json({
              isSuccess: true,
              message: `Survey generated successfully with 2 sections and ${noOfQuestions} questions each`,
              data: {
                  sections: processedSections
              }
          });

      } catch (e) {
          console.error("Error processing survey:", e);
          return res.status(500).json({
              isSuccess: false,
              message: "Error generating survey",
              error: e.message,
              rawResponse: result
          });
      }

  } catch (error) {
      console.error("Error in generateSurveyWithSections:", error);
      return res.status(500).json({
          isSuccess: false,
          message: "Internal server error",
          error: error.message
      });
  }
};

module.exports = { enhanceText, generateImage, enhanceSurvey,enhanceAssessment,createQuestions ,generateSurveyWithSections};