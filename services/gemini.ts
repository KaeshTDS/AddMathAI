
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function solveMathProblem(
  imageData?: string,
  textQuery?: string,
  language: 'English' | 'Malay' = 'English'
) {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are an expert Additional Mathematics tutor for the Malaysian SPM syllabus.
    The user is a student who needs a step-by-step solution to a math problem.
    
    Guidelines:
    1. Identify the specific SPM Additional Mathematics topic (e.g., Circular Measure, Coordinate Geometry, Differentiation, etc.).
    2. Provide a clear, structured, step-by-step solution.
    3. Use both ${language} and its equivalent in the other language where technical terms are used (dual-language approach).
    4. If it's an image, perform OCR first to extract the question text accurately.
    5. Maintain a supportive and encouraging tone.
    6. If the input is not a math problem, politely inform the user and ask for a math-related query.
    
    Output Format:
    TOPIC: [Topic Name]
    QUESTION: [The extracted text of the question]
    SOLUTION:
    Step 1: ...
    Step 2: ...
    Final Answer: ...
  `;

  const contents: any[] = [];
  
  if (imageData) {
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageData.split(',')[1],
      },
    });
  }

  if (textQuery) {
    contents.push({ text: textQuery });
  } else if (imageData) {
    contents.push({ text: "Please solve this Additional Mathematics problem step-by-step." });
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      systemInstruction,
      temperature: 0.4,
    },
  });

  return response.text;
}
