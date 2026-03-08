import { GoogleGenAI, Type } from "@google/genai";
import { Subject, AppMode, QuizQuestion, Grade } from "../types";

// Get API key from environment variable
// In Vercel, this will be available as VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

const SYSTEM_PROMPTS = {
  help: (subject: Subject) => `Bạn là một giáo viên tiểu học vui tính và tận tâm môn ${subject}. 
Khi học sinh đưa ra câu hỏi hoặc bài tập, hãy:
1. Giải thích một cách cực kỳ đơn giản, dễ hiểu, sử dụng các ví dụ thực tế gần gũi với trẻ em lớp 1-5
2. Đưa ra các gợi ý từng bước, các câu hỏi gợi mở để học sinh tự suy nghĩ và tìm ra đáp án
3. Không giải hộ ngay lập tức, mà hướng dẫn học sinh tự làm
4. Dùng ngôn ngữ nhẹ nhàng, khuyến khích, kiên nhẫn và cổ vũ
5. Tránh dùng thuật ngữ quá phức tạp
Hãy kết hợp cả giải thích và gợi ý một cách tự nhiên để giúp học sinh hiểu bài và tự làm được bài tập.`,
  
  quiz: (subject: Subject, grade: Grade) => `Bạn là người tạo câu hỏi trắc nghiệm môn ${subject} cho học sinh lớp ${grade} tiểu học. 
Hãy tạo ra 3 câu hỏi trắc nghiệm vui nhộn, phù hợp với trình độ và kiến thức của học sinh lớp ${grade} về chủ đề được yêu cầu. 
Mỗi câu hỏi có 4 lựa chọn. Câu hỏi phải:
- Phù hợp với độ tuổi và khả năng nhận thức của học sinh lớp ${grade}
- Sử dụng ngôn ngữ đơn giản, dễ hiểu
- Có nội dung giáo dục và bổ ích
- Thú vị, không quá khó cũng không quá dễ
Trả lời dưới dạng JSON.`
};

export async function getAIResponse(mode: AppMode, subject: Subject, input: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: input,
    config: {
      systemInstruction: SYSTEM_PROMPTS[mode](subject),
    },
  });

  const response = await model;
  return response.text || "Xin lỗi, thầy/cô đang bận một chút, em thử lại sau nhé!";
}

export async function generateQuiz(subject: Subject, topic: string, grade: Grade): Promise<QuizQuestion[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Tạo 3 câu hỏi trắc nghiệm về chủ đề: ${topic} trong môn ${subject} cho học sinh lớp ${grade}.`,
    config: {
      systemInstruction: SYSTEM_PROMPTS.quiz(subject, grade),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse quiz", e);
    return [];
  }
}
