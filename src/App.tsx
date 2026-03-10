import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, HelpCircle, Pencil, Sparkles, Brain, Music, Palette, Laptop, Settings, Heart, Map, Dumbbell, Star, Trophy, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Subject, AppMode, Grade } from './types';
import { getAIResponse, generateQuiz } from './services/gemini';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { playCorrectSound, playIncorrectSound, playSuccessSound, playStartSound, playNextQuestionSound } from './utils/sounds';

const SUBJECTS: { id: Subject; name: string; icon: any; color: string; gradient: string; iconColor: string }[] = [
  { id: 'Math', name: 'Toán học', icon: Brain, color: 'bg-blue-500', gradient: 'from-blue-400 to-blue-600', iconColor: 'text-blue-500' },
  { id: 'Vietnamese', name: 'Tiếng Việt', icon: BookOpen, color: 'bg-orange-500', gradient: 'from-orange-400 to-orange-600', iconColor: 'text-orange-500' },
  { id: 'Science', name: 'Khoa học', icon: Sparkles, color: 'bg-green-500', gradient: 'from-green-400 to-green-600', iconColor: 'text-green-500' },
  { id: 'English', name: 'Tiếng Anh', icon: HelpCircle, color: 'bg-purple-500', gradient: 'from-purple-400 to-purple-600', iconColor: 'text-purple-500' },
  { id: 'HistoryGeography', name: 'Lịch sử & Địa lý', icon: Map, color: 'bg-teal-500', gradient: 'from-teal-400 to-teal-600', iconColor: 'text-teal-500' },
  { id: 'Ethics', name: 'Đạo đức', icon: Heart, color: 'bg-pink-500', gradient: 'from-pink-400 to-pink-600', iconColor: 'text-pink-500' },
  { id: 'Music', name: 'Âm nhạc', icon: Music, color: 'bg-indigo-500', gradient: 'from-indigo-400 to-indigo-600', iconColor: 'text-indigo-500' },
  { id: 'Arts', name: 'Mỹ thuật', icon: Palette, color: 'bg-yellow-500', gradient: 'from-yellow-400 to-yellow-600', iconColor: 'text-yellow-500' },
  { id: 'PE', name: 'GDTC', icon: Dumbbell, color: 'bg-emerald-500', gradient: 'from-emerald-400 to-emerald-600', iconColor: 'text-emerald-500' },
  { id: 'Technology', name: 'Công nghệ', icon: Settings, color: 'bg-slate-500', gradient: 'from-slate-400 to-slate-600', iconColor: 'text-slate-500' },
  { id: 'Informatics', name: 'Tin học', icon: Laptop, color: 'bg-gray-500', gradient: 'from-gray-400 to-gray-600', iconColor: 'text-gray-500' },
];

const MODES: { id: AppMode; name: string; description: string; icon: any; color: string }[] = [
  { id: 'help', name: 'Giải thích & Gợi ý', description: 'Giúp em hiểu bài và tự làm bài tập với lời giải thích dễ hiểu và gợi ý từng bước', icon: BookOpen, color: 'from-blue-500 via-purple-500 to-pink-500' },
  { id: 'quiz', name: 'Luyện tập vui', description: 'Thử thách với các câu hỏi hay và thú vị', icon: HelpCircle, color: 'from-orange-500 to-yellow-500' },
];

// Chủ đề luyện tập cho từng môn học và từng lớp
const QUIZ_TOPICS: Record<Subject, Record<Grade, string[]>> = {
  Math: {
    1: ['Số đếm từ 1 đến 10', 'Phép cộng trong phạm vi 10', 'Phép trừ trong phạm vi 10', 'So sánh số lớn hơn, nhỏ hơn', 'Hình vuông, hình tròn, hình tam giác', 'Đo độ dài', 'Xem giờ đúng giờ', 'Tiền Việt Nam', 'Làm quen với số 0', 'Thứ tự các số'],
    2: ['Phép cộng có nhớ trong phạm vi 100', 'Phép trừ có nhớ trong phạm vi 100', 'Bảng nhân 2, 3, 4, 5', 'Bảng chia 2, 3, 4, 5', 'Đơn vị đo: cm, dm, m', 'Chu vi hình chữ nhật', 'Xem đồng hồ', 'Tiền Việt Nam (tiếp)', 'Số có 3 chữ số', 'So sánh và sắp xếp số'],
    3: ['Phép cộng, trừ có nhớ trong phạm vi 1000', 'Bảng nhân 6, 7, 8, 9', 'Bảng chia 6, 7, 8, 9', 'Phép nhân, chia ngoài bảng', 'Đơn vị đo: kg, g, l, ml', 'Diện tích hình chữ nhật', 'Xem lịch, tháng, năm', 'Tiền Việt Nam (tiếp)', 'Số có 4 chữ số', 'Làm quen với phân số'],
    4: ['Phép cộng, trừ số có nhiều chữ số', 'Phép nhân với số có 2, 3 chữ số', 'Phép chia cho số có 2 chữ số', 'Phân số và phép tính với phân số', 'Đơn vị đo: km, m, dm, cm, mm', 'Diện tích hình vuông, hình chữ nhật', 'Chu vi và diện tích', 'Số thập phân', 'Tỉ số và tỉ số phần trăm', 'Hình học: góc, đường thẳng'],
    5: ['Phép cộng, trừ số thập phân', 'Phép nhân, chia số thập phân', 'Phân số và số thập phân', 'Tỉ số phần trăm', 'Đơn vị đo diện tích: m², km²', 'Thể tích hình hộp chữ nhật', 'Hình tam giác, hình thang', 'Tính vận tốc, quãng đường, thời gian', 'Tỉ lệ bản đồ', 'Hình tròn và chu vi hình tròn'],
  },
  Vietnamese: {
    1: ['Bảng chữ cái', 'Đọc và viết chữ cái', 'Ghép vần đơn giản', 'Từ đơn, từ ghép', 'Câu đơn giản', 'Dấu câu: chấm, hỏi, cảm', 'Viết chữ hoa', 'Tập đọc: Truyện ngắn', 'Tập viết: Chữ đẹp', 'Kể chuyện theo tranh'],
    2: ['Chính tả: Nghe - viết', 'Tập đọc: Văn bản ngắn', 'Luyện từ và câu', 'Từ loại: Danh từ, động từ', 'Câu hỏi, câu kể', 'Viết đoạn văn ngắn', 'Kể chuyện', 'Tập làm văn: Miêu tả', 'Dấu câu: phẩy, chấm phẩy', 'Đọc hiểu văn bản'],
    3: ['Chính tả: Quy tắc chính tả', 'Tập đọc: Văn bản dài hơn', 'Từ loại: Tính từ, đại từ', 'Câu ghép', 'Viết đoạn văn', 'Tập làm văn: Kể chuyện', 'Tập làm văn: Miêu tả', 'Luyện từ và câu nâng cao', 'Đọc hiểu và trả lời câu hỏi', 'Viết thư'],
    4: ['Chính tả: Từ khó', 'Tập đọc: Văn học', 'Từ loại đầy đủ', 'Câu phức', 'Viết bài văn hoàn chỉnh', 'Tập làm văn: Miêu tả đồ vật', 'Tập làm văn: Miêu tả cây cối', 'Tập làm văn: Kể chuyện', 'Luyện từ và câu: Thành ngữ, tục ngữ', 'Đọc hiểu văn bản văn học'],
    5: ['Chính tả: Từ Hán Việt', 'Tập đọc: Văn học Việt Nam', 'Từ loại và cụm từ', 'Câu phức, câu ghép', 'Viết bài văn tự sự', 'Tập làm văn: Miêu tả người', 'Tập làm văn: Miêu tả cảnh', 'Tập làm văn: Thuyết minh', 'Luyện từ và câu: Biện pháp tu từ', 'Đọc hiểu văn bản nghị luận'],
  },
  Science: {
    1: ['Cơ thể con người', 'Các giác quan', 'Thực vật xung quanh em', 'Động vật xung quanh em', 'Thời tiết và mùa', 'Nước và không khí', 'Ánh sáng và bóng tối', 'Âm thanh', 'Vật nổi, vật chìm', 'An toàn trong cuộc sống'],
    2: ['Cơ thể người: Hệ tiêu hóa', 'Thực vật: Cây xanh', 'Động vật: Động vật có xương sống', 'Thời tiết: Mưa, nắng, gió', 'Nước: Tính chất của nước', 'Không khí: Không khí quanh ta', 'Ánh sáng: Nguồn sáng', 'Âm thanh: Nguồn âm', 'Đất và đá', 'An toàn: Phòng tránh tai nạn'],
    3: ['Cơ thể người: Hệ hô hấp, tuần hoàn', 'Thực vật: Quá trình quang hợp', 'Động vật: Chuỗi thức ăn', 'Thời tiết: Khí hậu', 'Nước: Vòng tuần hoàn của nước', 'Không khí: Thành phần không khí', 'Ánh sáng: Bóng tối và bóng nắng', 'Âm thanh: Sự lan truyền âm thanh', 'Đất: Thành phần của đất', 'Năng lượng: Nhiệt năng'],
    4: ['Cơ thể người: Hệ thần kinh', 'Thực vật: Sinh sản của thực vật', 'Động vật: Môi trường sống', 'Thời tiết: Thời tiết và khí hậu', 'Nước: Tính chất và vai trò', 'Không khí: Áp suất không khí', 'Ánh sáng: Màu sắc', 'Âm thanh: Độ cao, độ to', 'Đất: Bảo vệ đất', 'Năng lượng: Điện năng'],
    5: ['Cơ thể người: Hệ sinh sản', 'Thực vật: Đa dạng thực vật', 'Động vật: Đa dạng động vật', 'Thời tiết: Biến đổi khí hậu', 'Nước: Bảo vệ nguồn nước', 'Không khí: Ô nhiễm không khí', 'Ánh sáng: Quang hợp', 'Âm thanh: Ô nhiễm tiếng ồn', 'Đất: Bảo vệ đất đai', 'Năng lượng: Tiết kiệm năng lượng'],
  },
  English: {
    1: ['Bảng chữ cái tiếng Anh', 'Số đếm 1-10', 'Màu sắc cơ bản', 'Đồ vật trong lớp học', 'Gia đình', 'Chào hỏi', 'Cơ thể người', 'Động vật dễ thương', 'Đồ ăn yêu thích', 'Hành động đơn giản'],
    2: ['Số đếm 1-20', 'Màu sắc và hình dạng', 'Đồ vật trong nhà', 'Gia đình và bạn bè', 'Chào hỏi và tạm biệt', 'Cảm xúc', 'Thời tiết', 'Quần áo', 'Đồ ăn và đồ uống', 'Hành động hàng ngày'],
    3: ['Số đếm 1-100', 'Thời gian: Giờ, phút', 'Ngày trong tuần', 'Tháng trong năm', 'Nghề nghiệp', 'Nơi chốn', 'Phương tiện giao thông', 'Sở thích', 'Thể thao', 'Câu mệnh lệnh'],
    4: ['Thì hiện tại đơn', 'Thì hiện tại tiếp diễn', 'Tính từ miêu tả', 'So sánh hơn', 'So sánh nhất', 'Giới từ chỉ vị trí', 'Câu hỏi Wh-', 'Câu phủ định', 'Danh từ số ít, số nhiều', 'Đại từ nhân xưng'],
    5: ['Thì quá khứ đơn', 'Thì tương lai đơn', 'Động từ bất quy tắc', 'Câu điều kiện loại 1', 'Tính từ và trạng từ', 'So sánh bằng', 'Câu bị động đơn giản', 'Câu hỏi đuôi', 'Liên từ', 'Từ vựng theo chủ đề'],
  },
  HistoryGeography: {
    1: ['Lịch sử gia đình', 'Địa lý gia đình', 'Ngày lễ trong năm', 'Nhà em ở đâu', 'Truyền thống gia đình', 'Sông, hồ gần nhà', 'Đồ vật xưa và nay', 'Thành phố và nông thôn', 'Công việc của ông bà', 'Thời tiết nơi em sống', 'Trường học xưa', 'Biển, bãi biển', 'Lễ hội dân gian', 'Phương tiện đi lại'],
    2: ['Lịch sử địa phương', 'Địa lý địa phương', 'Di tích lịch sử', 'Tỉnh, thành phố', 'Anh hùng dân tộc', 'Sông ngòi địa phương', 'Văn hóa dân tộc', 'Khí hậu địa phương', 'Làng quê xưa', 'Biển, đảo', 'Bảo tàng lịch sử', 'Du lịch địa phương'],
    3: ['Lịch sử Việt Nam: Thời kỳ dựng nước', 'Địa lý Việt Nam: Vị trí địa lý', 'Các vua Hùng', 'Địa hình Việt Nam', 'Khởi nghĩa Hai Bà Trưng', 'Sông ngòi Việt Nam', 'Nhà Lý, nhà Trần', 'Các vùng miền', 'Văn hóa Đại Việt', 'Biển và đảo', 'Nghệ thuật truyền thống', 'Tài nguyên thiên nhiên'],
    4: ['Lịch sử Việt Nam: Nhà Lê', 'Địa lý: Đồng bằng sông Hồng', 'Cách mạng tháng Tám', 'Đồng bằng sông Cửu Long', 'Kháng chiến chống Pháp', 'Tây Nguyên', 'Chủ tịch Hồ Chí Minh', 'Đông Nam Bộ', 'Thống nhất đất nước', 'Biển Đông', 'Xây dựng đất nước', 'Bảo vệ môi trường'],
    5: ['Lịch sử thế giới: Cổ đại', 'Địa lý thế giới: Các châu lục', 'Lịch sử Đông Nam Á', 'Địa lý châu Á', 'Lịch sử châu Âu', 'Địa lý châu Âu', 'Lịch sử hiện đại', 'Khí hậu thế giới', 'Các cuộc cách mạng', 'Dân cư thế giới'],
  },
  Ethics: {
    1: ['Em là ai', 'Gia đình em', 'Bạn bè của em', 'Lễ phép với người lớn', 'Giúp đỡ bạn bè', 'Chăm sóc bản thân', 'Giữ gìn vệ sinh', 'Yêu thương động vật', 'Tiết kiệm', 'Trung thực'],
    2: ['Tôn trọng người khác', 'Chia sẻ với bạn', 'Lắng nghe người khác', 'Giữ lời hứa', 'Xin lỗi khi sai', 'Cảm ơn khi được giúp', 'Tôn trọng tài sản', 'Bảo vệ môi trường', 'An toàn giao thông', 'Yêu quê hương'],
    3: ['Tự trọng', 'Tự tin', 'Trách nhiệm', 'Công bằng', 'Khoan dung', 'Hợp tác', 'Tôn trọng quy định', 'Bảo vệ môi trường', 'Tiết kiệm tài nguyên', 'Yêu nước'],
    4: ['Tự trọng và tự tin', 'Trách nhiệm với bản thân', 'Trách nhiệm với gia đình', 'Trách nhiệm với xã hội', 'Công bằng và khoan dung', 'Hợp tác và chia sẻ', 'Tôn trọng pháp luật', 'Bảo vệ môi trường sống', 'Tiết kiệm và bảo vệ tài nguyên', 'Yêu nước, yêu quê hương'],
    5: ['Tự trọng, tự tin, tự lập', 'Trách nhiệm công dân', 'Công bằng và dân chủ', 'Khoan dung và nhân ái', 'Hợp tác quốc tế', 'Tôn trọng và thực hiện pháp luật', 'Bảo vệ môi trường toàn cầu', 'Phát triển bền vững', 'Yêu nước và tự hào dân tộc', 'Xây dựng xã hội tốt đẹp'],
  },
  Music: {
    1: ['Hát đơn giản', 'Nhịp điệu cơ bản', 'Nhạc cụ: Trống', 'Nhạc cụ: Kèn', 'Bài hát thiếu nhi', 'Vận động theo nhạc', 'Nghe nhạc', 'Phân biệt âm thanh', 'Hát theo nhạc', 'Vui chơi với âm nhạc'],
    2: ['Hát đúng nhịp', 'Nhịp 2/4, 3/4', 'Nhạc cụ: Đàn', 'Nhạc cụ: Sáo', 'Bài hát dân ca', 'Vận động theo nhạc', 'Nghe và cảm thụ nhạc', 'Phân biệt cao độ', 'Hát có cảm xúc', 'Biểu diễn âm nhạc'],
    3: ['Hát đúng cao độ', 'Nhịp 4/4', 'Nhạc cụ: Đàn piano', 'Nhạc cụ: Đàn guitar', 'Bài hát quê hương', 'Vận động sáng tạo', 'Nghe nhạc cổ điển', 'Phân biệt trường độ', 'Hát hợp xướng', 'Sáng tạo với âm nhạc'],
    4: ['Hát đúng kỹ thuật', 'Nhịp phức tạp', 'Nhạc cụ: Violin', 'Nhạc cụ: Flute', 'Bài hát cách mạng', 'Vận động biểu diễn', 'Nghe nhạc dân tộc', 'Phân biệt âm sắc', 'Hát nhiều bè', 'Sáng tác đơn giản'],
    5: ['Hát chuyên nghiệp', 'Nhịp và phách', 'Nhạc cụ: Cello', 'Nhạc cụ: Saxophone', 'Bài hát quốc tế', 'Vận động nghệ thuật', 'Nghe nhạc giao hưởng', 'Phân tích âm nhạc', 'Hát và biểu diễn', 'Sáng tác nhạc'],
  },
  Arts: {
    1: ['Vẽ đường nét', 'Vẽ hình cơ bản', 'Tô màu', 'Vẽ theo mẫu', 'Vẽ tự do', 'Nặn đất sét', 'Xé dán giấy', 'Làm đồ chơi', 'Trang trí', 'Vẽ tranh gia đình'],
    2: ['Vẽ hình học', 'Vẽ phong cảnh', 'Tô màu nước', 'Vẽ theo chủ đề', 'Vẽ sáng tạo', 'Nặn tượng', 'Cắt dán', 'Làm thủ công', 'Trang trí lớp học', 'Vẽ tranh thiên nhiên'],
    3: ['Vẽ bố cục', 'Vẽ chân dung', 'Màu sắc và pha màu', 'Vẽ theo trí tưởng tượng', 'Vẽ minh họa', 'Điêu khắc đơn giản', 'Cắt dán sáng tạo', 'Làm đồ thủ công', 'Trang trí không gian', 'Vẽ tranh lịch sử'],
    4: ['Vẽ phối cảnh', 'Vẽ tĩnh vật', 'Màu sắc nâng cao', 'Vẽ theo phong cách', 'Vẽ minh họa truyện', 'Điêu khắc', 'Cắt dán nghệ thuật', 'Làm đồ mỹ nghệ', 'Trang trí ứng dụng', 'Vẽ tranh văn học'],
    5: ['Vẽ kỹ thuật', 'Vẽ tranh sơn dầu', 'Màu sắc chuyên sâu', 'Vẽ theo trường phái', 'Vẽ minh họa chuyên nghiệp', 'Điêu khắc nâng cao', 'Cắt dán nghệ thuật', 'Làm đồ mỹ nghệ', 'Thiết kế đồ họa', 'Vẽ tranh nghệ thuật'],
  },
  PE: {
    1: ['Đi bộ đúng tư thế', 'Chạy tại chỗ', 'Nhảy tại chỗ', 'Ném bóng', 'Bắt bóng', 'Đi thăng bằng', 'Trò chơi vận động', 'Thể dục buổi sáng', 'Vui chơi ngoài trời', 'An toàn khi chơi'],
    2: ['Chạy nhanh', 'Nhảy xa', 'Nhảy cao', 'Ném xa', 'Bắt bóng chính xác', 'Đi thăng bằng nâng cao', 'Trò chơi đồng đội', 'Thể dục nhịp điệu', 'Vận động phối hợp', 'An toàn thể thao'],
    3: ['Chạy bền', 'Nhảy xa, nhảy cao', 'Ném bóng chính xác', 'Bắt bóng nâng cao', 'Đi thăng bằng phức tạp', 'Trò chơi thể thao', 'Thể dục dụng cụ', 'Vận động phối hợp', 'Kỹ thuật cơ bản', 'Luật chơi đơn giản'],
    4: ['Chạy cự ly', 'Nhảy xa, nhảy cao nâng cao', 'Ném bóng kỹ thuật', 'Bắt bóng kỹ thuật', 'Đi thăng bằng nâng cao', 'Trò chơi thể thao', 'Thể dục dụng cụ nâng cao', 'Vận động phối hợp nâng cao', 'Kỹ thuật nâng cao', 'Luật chơi thể thao'],
    5: ['Chạy cự ly dài', 'Nhảy xa, nhảy cao chuyên sâu', 'Ném bóng chuyên sâu', 'Bắt bóng chuyên sâu', 'Đi thăng bằng chuyên sâu', 'Trò chơi thể thao', 'Thể dục dụng cụ chuyên sâu', 'Vận động phối hợp chuyên sâu', 'Kỹ thuật chuyên sâu', 'Luật chơi và đạo đức thể thao'],
  },
  Technology: {
    1: ['Đồ dùng trong nhà', 'Công cụ đơn giản', 'Máy móc đơn giản', 'An toàn khi sử dụng', 'Tiết kiệm điện', 'Tiết kiệm nước', 'Đồ chơi tự làm', 'Sửa chữa đơn giản', 'Vệ sinh đồ dùng', 'Bảo quản đồ dùng'],
    2: ['Đồ dùng điện', 'Công cụ thông dụng', 'Máy móc trong nhà', 'An toàn điện', 'Tiết kiệm năng lượng', 'Sử dụng nước hợp lý', 'Làm đồ chơi', 'Sửa chữa cơ bản', 'Vệ sinh và bảo quản', 'Bảo vệ môi trường'],
    3: ['Điện và mạch điện', 'Công cụ kỹ thuật', 'Máy móc nông nghiệp', 'An toàn lao động', 'Năng lượng tái tạo', 'Xử lý rác thải', 'Làm đồ dùng học tập', 'Sửa chữa đồ dùng', 'Vệ sinh môi trường', 'Bảo vệ tài nguyên'],
    4: ['Điện và điện tử', 'Công cụ chuyên dụng', 'Máy móc công nghiệp', 'An toàn lao động nâng cao', 'Năng lượng sạch', 'Tái chế rác thải', 'Làm đồ dùng hữu ích', 'Sửa chữa nâng cao', 'Bảo vệ môi trường', 'Phát triển bền vững'],
    5: ['Điện tử và tự động hóa', 'Công cụ hiện đại', 'Máy móc thông minh', 'An toàn lao động chuyên sâu', 'Năng lượng tương lai', 'Công nghệ xanh', 'Sáng chế và đổi mới', 'Sửa chữa chuyên sâu', 'Bảo vệ môi trường toàn cầu', 'Công nghệ bền vững'],
  },
  Informatics: {
    1: ['Làm quen với máy tính', 'Bàn phím và chuột', 'Màn hình máy tính', 'Trò chơi giáo dục', 'Vẽ trên máy tính', 'Nghe nhạc trên máy tính', 'Xem phim trên máy tính', 'An toàn khi dùng máy tính', 'Tắt mở máy tính', 'Giữ gìn máy tính'],
    2: ['Sử dụng máy tính cơ bản', 'Gõ phím', 'Sử dụng chuột', 'Trò chơi học tập', 'Vẽ tranh trên máy tính', 'Soạn thảo văn bản đơn giản', 'Tìm kiếm thông tin', 'An toàn mạng', 'Lưu trữ file', 'Quản lý thư mục'],
    3: ['Hệ điều hành', 'Soạn thảo văn bản', 'Bảng tính đơn giản', 'Trình chiếu đơn giản', 'Vẽ đồ họa', 'Tìm kiếm trên Internet', 'Email cơ bản', 'An toàn thông tin', 'Lưu trữ đám mây', 'Quản lý file nâng cao'],
    4: ['Hệ điều hành nâng cao', 'Soạn thảo văn bản nâng cao', 'Bảng tính Excel', 'Trình chiếu PowerPoint', 'Đồ họa máy tính', 'Tìm kiếm và đánh giá thông tin', 'Email và giao tiếp trực tuyến', 'An toàn mạng nâng cao', 'Lưu trữ và sao lưu', 'Lập trình cơ bản'],
    5: ['Hệ điều hành chuyên sâu', 'Soạn thảo văn bản chuyên nghiệp', 'Bảng tính nâng cao', 'Trình chiếu chuyên nghiệp', 'Đồ họa và thiết kế', 'Nghiên cứu và đánh giá thông tin', 'Giao tiếp và cộng tác trực tuyến', 'An toàn thông tin chuyên sâu', 'Quản lý dữ liệu', 'Lập trình và tư duy máy tính'],
  },
};

export default function App() {
  const [selectedSubject, setSelectedSubject] = React.useState<Subject | null>(null);
  const [mode, setMode] = React.useState<AppMode | null>(null);
  const [selectedGrade, setSelectedGrade] = React.useState<Grade | null>(null);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [response, setResponse] = React.useState<string | null>(null);
  const [quiz, setQuiz] = React.useState<any[] | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [quizFinished, setQuizFinished] = React.useState(false);

  // Phát âm thanh khi hoàn thành quiz
  React.useEffect(() => {
    if (quizFinished && quiz) {
      // playSuccessSound đã được gọi trong handleAnswer, nhưng đảm bảo phát lại khi component render
      setTimeout(() => playSuccessSound(), 200);
    }
  }, [quizFinished, quiz]);

  const handleAction = async () => {
    if (!selectedSubject || !mode || !input.trim()) return;
    if (mode === 'quiz' && !selectedGrade) return; // Require grade for quiz
    
    setLoading(true);
    setResponse(null);
    setQuiz(null);
    
    try {
      if (mode === 'quiz') {
        if (!selectedGrade) return;
        const questions = await generateQuiz(selectedSubject, input, selectedGrade);
        setQuiz(questions);
        setCurrentQuizIndex(0);
        setScore(0);
        setQuizFinished(false);
        // Phát âm thanh khi bắt đầu quiz
        setTimeout(() => playStartSound(), 100);
      } else {
        const res = await getAIResponse(mode, selectedSubject, input);
        setResponse(res);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (!quiz) return;
    const isCorrect = index === quiz[currentQuizIndex].correctAnswer;
    
    // Phát âm thanh ngay lập tức dựa trên kết quả
    // Đảm bảo AudioContext được khởi tạo và resume
    if (isCorrect) {
      setScore(s => s + 1);
      // Phát âm thanh đúng ngay lập tức
      playCorrectSound();
    } else {
      // Phát âm thanh sai ngay lập tức
      playIncorrectSound();
    }
    
    // Chuyển câu hỏi hoặc kết thúc quiz sau khi phát âm thanh
    setTimeout(() => {
      if (currentQuizIndex + 1 < quiz.length) {
        setCurrentQuizIndex(i => i + 1);
        playNextQuestionSound();
      } else {
        setQuizFinished(true);
        // Âm thanh sẽ được phát trong useEffect khi quizFinished thay đổi
      }
    }, isCorrect ? 1000 : 800); // Delay dài hơn để nghe rõ âm thanh
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-3 sm:p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Decorative background elements - optimized for mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 sm:opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 sm:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-48 h-48 sm:w-72 sm:h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 sm:opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="text-center mb-8 sm:mb-12 md:mb-16 px-2">
          <motion.div
            initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-4 sm:mb-6"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-3xl sm:text-4xl md:text-5xl"
              >
                🌟
              </motion.div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent leading-tight">
                Học Vui Mỗi Ngày
              </h1>
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-3xl sm:text-4xl md:text-5xl"
              >
                ✨
              </motion.div>
            </div>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 font-medium px-2">
          Người bạn đồng hành thông minh giúp em học giỏi hơn!
        </p>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
            </div>
          </motion.div>
      </header>

        <main className="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
        {/* Subject Selection */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-white/50"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
                1
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
                Chọn môn học yêu thích của em
          </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {SUBJECTS.map((s) => (
              <motion.button
                key={s.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedSubject(s.id);
                    setMode(null);
                    setSelectedGrade(null);
                  }}
                  className={`relative p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl flex flex-col items-center gap-2 sm:gap-3 transition-all duration-300 overflow-hidden touch-manipulation min-h-[100px] sm:min-h-[120px] ${
                  selectedSubject === s.id 
                      ? `bg-gradient-to-br ${s.gradient} text-white shadow-2xl ring-2 sm:ring-4 ring-white/50` 
                      : 'bg-white text-gray-700 active:shadow-lg border-2 border-gray-100'
                  }`}
                >
                  {selectedSubject === s.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2"
                    >
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </motion.div>
                  )}
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${selectedSubject === s.id ? 'bg-white/20' : 'bg-gray-50'}`}>
                    <s.icon 
                      size={24} 
                      className={`sm:w-7 sm:h-7 ${selectedSubject === s.id ? 'text-white' : s.iconColor}`}
                    />
                  </div>
                  <span className="font-bold text-xs sm:text-sm md:text-base text-center leading-tight">{s.name}</span>
              </motion.button>
            ))}
          </div>
          </motion.section>

        {/* Mode Selection */}
          <AnimatePresence>
        {selectedSubject && (
          <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-white/50"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
                    2
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
                    Em muốn làm gì hôm nay?
            </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
              {MODES.map((m) => (
                <motion.button
                  key={m.id}
                      whileHover={{ scale: 1.03, y: -5 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setMode(m.id);
                        if (m.id !== 'quiz') {
                          setSelectedGrade(null);
                        }
                      }}
                      className={`relative p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-left transition-all duration-300 overflow-hidden touch-manipulation min-h-[140px] sm:min-h-[160px] ${
                    mode === m.id 
                          ? `bg-gradient-to-br ${m.color} text-white shadow-2xl ring-2 sm:ring-4 ring-white/50` 
                          : 'bg-white text-gray-700 active:shadow-xl border-2 border-gray-100'
                      }`}
                    >
                      {mode === m.id && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute top-2 right-2 sm:top-3 sm:right-3"
                        >
                          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </motion.div>
                      )}
                      <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl w-fit mb-3 sm:mb-4 ${
                        mode === m.id 
                          ? 'bg-white/20' 
                          : m.id === 'help' ? 'bg-blue-100' 
                          : 'bg-orange-100'
                      }`}>
                        <m.icon 
                          size={24}
                          className={`sm:w-7 sm:h-7 ${
                            mode === m.id 
                              ? 'text-white' 
                              : m.id === 'help' ? 'text-blue-500' 
                              : 'text-orange-500'
                          }`}
                        />
                      </div>
                      <h3 className={`font-bold text-lg sm:text-xl mb-1.5 sm:mb-2 ${mode === m.id ? 'text-white' : 'text-gray-800'}`}>{m.name}</h3>
                      <p className={`text-xs sm:text-sm ${mode === m.id ? 'text-white/90' : 'text-gray-600'} leading-relaxed`}>{m.description}</p>
                    </motion.button>
                  ))}
                    </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Grade Selection - Only for Quiz Mode */}
          <AnimatePresence>
            {mode === 'quiz' && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-white/50"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
                    3
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
                    Em đang học lớp mấy?
                  </h2>
                </div>
                <div className="grid grid-cols-5 gap-3 sm:gap-4">
                  {[1, 2, 3, 4, 5].map((grade) => (
                    <motion.button
                      key={grade}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedGrade(grade as Grade)}
                      className={`relative p-4 sm:p-5 rounded-xl sm:rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 overflow-hidden touch-manipulation min-h-[100px] sm:min-h-[120px] ${
                        selectedGrade === grade 
                          ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl ring-2 sm:ring-4 ring-white/50' 
                          : 'bg-white text-gray-700 active:shadow-lg border-2 border-gray-100'
                      }`}
                    >
                      {selectedGrade === grade && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2"
                        >
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </motion.div>
                      )}
                      <div className={`text-3xl sm:text-4xl font-bold ${selectedGrade === grade ? 'text-white' : 'text-gray-400'}`}>
                        {grade}
                      </div>
                      <span className={`font-bold text-xs sm:text-sm ${selectedGrade === grade ? 'text-white' : 'text-gray-600'}`}>
                        Lớp {grade}
                      </span>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}
          </AnimatePresence>

          {/* Topic Suggestions - Only for Quiz Mode */}
          <AnimatePresence>
            {mode === 'quiz' && selectedSubject && selectedGrade && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-white/50"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
                    4
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-display font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
                    Chọn chủ đề em muốn luyện tập:
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {QUIZ_TOPICS[selectedSubject]?.[selectedGrade]?.map((topic, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        setInput(topic);
                        setLoading(true);
                        setResponse(null);
                        setQuiz(null);
                        try {
                          const questions = await generateQuiz(selectedSubject, topic, selectedGrade);
                          setQuiz(questions);
                          setCurrentQuizIndex(0);
                          setScore(0);
                          setQuizFinished(false);
                        } catch (error) {
                          console.error(error);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-400 hover:bg-gradient-to-br hover:from-green-100 hover:to-emerald-100 transition-all duration-300 text-left touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="font-medium text-sm sm:text-base text-gray-700 leading-tight flex-1">
                          {topic}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-gray-200">
                  <p className="text-sm sm:text-base text-gray-600 text-center">
                    Hoặc em có thể nhập chủ đề khác ở bên dưới 👇
                  </p>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Input Section */}
          <AnimatePresence>
            {mode && (mode === 'help' || (mode === 'quiz' && selectedGrade)) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border-2 border-orange-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,247,237,0.95) 100%)',
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
                    {mode === 'help' ? '3' : '5'}
                  </div>
                  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-display font-bold text-gray-800 leading-tight">
                    {mode === 'help' && 'Nhập câu hỏi hoặc bài tập em cần giúp đỡ:'}
              {mode === 'quiz' && 'Hoặc nhập chủ đề khác em muốn luyện tập:'}
            </h2>
                </div>
                <div className="space-y-4 sm:space-y-5">
                  <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ví dụ: Phép cộng phân số, Tả con mèo, Hệ mặt trời..."
                      className="w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white focus:border-orange-400 focus:ring-2 sm:focus:ring-4 focus:ring-orange-100 outline-none min-h-[120px] sm:min-h-[140px] text-base sm:text-lg transition-all resize-none shadow-inner touch-manipulation"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey && !loading && input.trim()) {
                          handleAction();
                        }
                      }}
                    />
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 text-xs text-gray-400 hidden sm:block">
                      Ctrl + Enter để gửi
                    </div>
                  </div>
                  <motion.button
                onClick={handleAction}
                    disabled={loading || !input.trim() || (mode === 'quiz' && !selectedGrade)}
                    whileHover={!loading && input.trim() ? { scale: 1.02 } : {}}
                    whileTap={!loading && input.trim() ? { scale: 0.98 } : {}}
                    className="w-full py-4 sm:py-5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl shadow-xl active:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 sm:gap-3 relative overflow-hidden group touch-manipulation min-h-[56px]"
              >
                {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white border-t-transparent rounded-full"
                        />
                        <span className="text-base sm:text-lg">Đang xử lý...</span>
                      </>
                ) : (
                  <>
                        <Sparkles size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                        <span className="text-base sm:text-lg">Bắt đầu thôi!</span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        />
                  </>
                )}
                  </motion.button>
            </div>
          </motion.section>
        )}
          </AnimatePresence>

        {/* Result Section */}
          <AnimatePresence>
        {(response || quiz) && (
          <motion.section
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-blue-200"
          >
            {response && (
                  <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-gray-100">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                        <Brain size={24} className="sm:w-8 sm:h-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
                          Thầy AI trả lời
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Câu trả lời dễ hiểu cho em</p>
                  </div>
                </div>
                    <div className="text-gray-700 leading-relaxed text-base sm:text-lg space-y-3 sm:space-y-4">
                      <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          p: ({ children }) => <p className="mb-3 sm:mb-4">{children}</p>,
                          h1: ({ children }) => <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-800">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-800">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800">{children}</h3>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-3 sm:mb-4 space-y-1.5 sm:space-y-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 sm:mb-4 space-y-1.5 sm:space-y-2">{children}</ol>,
                          li: ({ children }) => <li className="ml-2 sm:ml-4">{children}</li>,
                          code: ({ children }) => <code className="bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono break-words">{children}</code>,
                          strong: ({ children }) => <strong className="font-bold text-gray-800">{children}</strong>,
                        }}
                      >
                        {response}
                      </Markdown>
                </div>
                    <motion.button 
                      onClick={() => { setResponse(null); setInput(''); setMode(null); setSelectedSubject(null); setSelectedGrade(null); }}
                      whileHover={{ scale: 1.05, x: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-6 sm:mt-8 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold active:shadow-lg transition-all flex items-center gap-2 touch-manipulation min-h-[48px] text-sm sm:text-base"
                    >
                      <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                      Đặt câu hỏi khác
                    </motion.button>
              </div>
            )}

            {quiz && !quizFinished && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl sm:rounded-2xl border-2 border-orange-200">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base flex-shrink-0">
                          {currentQuizIndex + 1}
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-orange-700 uppercase tracking-wider">
                    Câu hỏi {currentQuizIndex + 1} / {quiz.length}
                  </span>
                      </div>
                      <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-lg sm:rounded-xl shadow-md w-full sm:w-auto justify-between sm:justify-start">
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                        <span className="text-base sm:text-lg font-bold text-gray-800">
                          Điểm: <span className="text-orange-600">{score}</span>
                  </span>
                </div>
                    </div>
                    <motion.h3 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 leading-relaxed"
                    >
                      {quiz[currentQuizIndex].question}
                    </motion.h3>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {quiz[currentQuizIndex].options.map((opt: string, i: number) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(i)}
                          className="p-4 sm:p-5 text-left rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white active:border-orange-400 active:bg-gradient-to-r active:from-orange-50 active:to-yellow-50 transition-all font-medium text-base sm:text-lg shadow-md active:shadow-lg group touch-manipulation min-h-[64px]"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-lg sm:rounded-xl text-white font-bold shadow-md group-active:scale-110 transition-transform flex-shrink-0 text-sm sm:text-base">
                        {String.fromCharCode(65 + i)}
                      </span>
                            <span className="flex-1 text-gray-700 group-active:text-gray-900 leading-relaxed">{opt}</span>
                          </div>
                        </motion.button>
                  ))}
                </div>
              </div>
            )}

            {quizFinished && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 sm:py-12"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                      className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6"
                    >
                      🎉
                    </motion.div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-3 sm:mb-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent px-2">
                      Tuyệt vời quá!
                    </h3>
                    <div className="mb-6 sm:mb-8">
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-2 sm:mb-3 px-2">Em đã hoàn thành bài tập với số điểm:</p>
                      <div className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl sm:rounded-2xl shadow-xl">
                        <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
                        <span className="text-2xl sm:text-3xl font-bold">
                          {score}/{quiz?.length}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 flex-wrap px-2">
                      {Array.from({ length: quiz?.length || 0 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                            i < score ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setQuiz(null); setQuizFinished(false); setInput(''); setMode(null); setSelectedSubject(null); setSelectedGrade(null); }}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-xl active:shadow-2xl transition-all flex items-center gap-2 mx-auto touch-manipulation min-h-[48px]"
                    >
                      <Sparkles size={18} className="sm:w-5 sm:h-5" />
                  Làm chủ đề khác
                    </motion.button>
                  </motion.div>
            )}
          </motion.section>
        )}
          </AnimatePresence>
      </main>

        <footer className="mt-12 sm:mt-16 md:mt-20 mb-4 sm:mb-6 md:mb-8 text-center text-gray-500 text-xs sm:text-sm px-2 space-y-2">
          <p className="font-medium">© 2026 Học Vui Mỗi Ngày - Cùng em vươn xa 🌟</p>
          <div className="pt-2 border-t border-gray-200 space-y-1">
            <p className="font-semibold text-gray-600">Trường Tiểu học Phúc Ninh</p>
            <p className="text-gray-500">Thôn Phúc Ninh, Xã Xuân Vân, tỉnh Tuyên Quang</p>
          </div>
      </footer>
      </div>
    </div>
  );
}
