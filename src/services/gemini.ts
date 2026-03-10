import { GoogleGenAI, Type } from "@google/genai";
import { Subject, AppMode, QuizQuestion, Grade } from "../types";

// Get API key from environment variable
// In Vercel, this will be available as VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

const SUBJECT_DISPLAY: Record<Subject, string> = {
  Math: 'Toán học',
  Vietnamese: 'Tiếng Việt',
  Science: 'Khoa học',
  English: 'Tiếng Anh',
  HistoryGeography: 'Lịch sử và Địa lý',
  Ethics: 'Đạo đức',
  Music: 'Âm nhạc',
  Arts: 'Mỹ thuật',
  PE: 'GDTC',
  Technology: 'Công nghệ',
  Informatics: 'Tin học',
};

const HISTORY_GEOGRAPHY_NOTE = `
QUAN TRỌNG - Địa giới hành chính Việt Nam (sáp nhập 2025): Khi câu hỏi liên quan đến tỉnh, thành phố, địa chỉ hành chính Việt Nam, bạn PHẢI chỉ rõ:
- Địa chỉ/đơn vị hành chính TRƯỚC sáp nhập (ví dụ: 63 tỉnh, thành)
- Địa chỉ/đơn vị hành chính SAU sáp nhập 2025 (34 tỉnh, thành từ 01/7/2025)
Tham khảo chính thức: https://vi.wikipedia.org/wiki/Sáp_nhập_tỉnh,_thành_Việt_Nam_2025
`;

// Số câu hỏi mỗi bài: Toán, Tiếng Việt, Tiếng Anh 7-10 câu; các môn khác 3-5 câu
const QUIZ_QUESTION_RANGE: Record<Subject, { min: number; max: number }> = {
  Math: { min: 7, max: 10 },
  Vietnamese: { min: 7, max: 10 },
  English: { min: 7, max: 10 },
  Science: { min: 3, max: 5 },
  HistoryGeography: { min: 3, max: 5 },
  Ethics: { min: 3, max: 5 },
  Music: { min: 3, max: 5 },
  Arts: { min: 3, max: 5 },
  PE: { min: 3, max: 5 },
  Technology: { min: 3, max: 5 },
  Informatics: { min: 3, max: 5 },
};

function getQuizCountText(subject: Subject): string {
  const { min, max } = QUIZ_QUESTION_RANGE[subject];
  return `${min} đến ${max}`;
}

const SYSTEM_PROMPTS = {
  help: (subject: Subject) => `Bạn là một giáo viên tiểu học vui tính và tận tâm môn ${SUBJECT_DISPLAY[subject]}. 
Khi học sinh đưa ra câu hỏi hoặc bài tập, hãy:
1. Trả lời ngắn gọn, mạch lạc; giải thích đơn giản, dễ hiểu, dùng ví dụ gần gũi với trẻ em lớp 1-5
2. Đưa gợi ý từng bước, câu hỏi gợi mở để học sinh tự suy nghĩ và tìm đáp án
3. Không giải hộ ngay, mà hướng dẫn học sinh tự làm
4. Dùng ngôn ngữ nhẹ nhàng, khuyến khích, kiên nhẫn và cổ vũ
5. Tránh thuật ngữ phức tạp; tránh dài dòng, lặp ý
Hãy kết hợp giải thích và gợi ý tự nhiên, súc tích để học sinh hiểu bài và tự làm được.${subject === 'HistoryGeography' ? HISTORY_GEOGRAPHY_NOTE : ''}`,
  
  quiz: (subject: Subject, grade: Grade) => `Bạn là người tạo câu hỏi trắc nghiệm môn ${SUBJECT_DISPLAY[subject]} cho học sinh lớp ${grade} tiểu học.${subject === 'HistoryGeography' ? HISTORY_GEOGRAPHY_NOTE : ''} 
Hãy tạo ra ${getQuizCountText(subject)} câu hỏi trắc nghiệm vui nhộn, phù hợp với trình độ và kiến thức của học sinh lớp ${grade} về chủ đề được yêu cầu. 
Mỗi câu hỏi có 4 lựa chọn. Câu hỏi phải:
- Phù hợp với độ tuổi và khả năng nhận thức của học sinh lớp ${grade}
- Sử dụng ngôn ngữ đơn giản, dễ hiểu
- Có nội dung giáo dục và bổ ích
- Thú vị, không quá khó cũng không quá dễ
Trả lời dưới dạng JSON (mảng các câu hỏi).`
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
  const countText = getQuizCountText(subject);
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Tạo ${countText} câu hỏi trắc nghiệm về chủ đề: ${topic} trong môn ${SUBJECT_DISPLAY[subject]} cho học sinh lớp ${grade}.`,
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
