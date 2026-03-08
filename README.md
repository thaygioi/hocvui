<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Học Vui Mỗi Ngày 🌟

Ứng dụng hỗ trợ học tập thông minh dành cho học sinh tiểu học - Giải thích bài học, gợi ý làm bài và luyện tập thú vị.

## ✨ Tính năng

- 📚 **Giải thích & Gợi ý**: Giúp học sinh hiểu bài và tự làm bài tập
- 🎯 **Luyện tập vui**: Quiz với 10 chủ đề gợi ý cho mỗi môn học và lớp
- 🎨 **Thiết kế đẹp**: UI/UX chuyên nghiệp, phù hợp với trẻ em
- 📱 **Responsive**: Hoạt động tốt trên mọi thiết bị

## 🚀 Chạy Local

**Yêu cầu:** Node.js 18+ và npm

1. Cài đặt dependencies:
   ```bash
   npm install
   ```

2. Tạo file `.env.local` và thêm API key:
   ```bash
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   
   Hoặc sử dụng biến môi trường:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

3. Chạy ứng dụng:
   ```bash
   npm run dev
   ```

4. Mở trình duyệt tại: http://localhost:3000

## 📦 Deploy lên Vercel

Xem hướng dẫn chi tiết trong file [DEPLOY.md](./DEPLOY.md)

### Tóm tắt nhanh:

1. Push code lên GitHub/GitLab/Bitbucket
2. Import project vào Vercel
3. Thêm Environment Variable: `VITE_GEMINI_API_KEY` với giá trị là API key của bạn
4. Deploy!

## 🔑 Lấy Google Gemini API Key

1. Truy cập: https://aistudio.google.com/apikey
2. Đăng nhập bằng tài khoản Google
3. Tạo API key mới
4. Copy và sử dụng trong biến môi trường

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Animations**: Motion (Framer Motion)
- **AI**: Google Gemini API
- **Icons**: Lucide React

## 📝 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build cho production
- `npm run preview` - Preview build production
- `npm run lint` - Kiểm tra TypeScript errors

## 📄 License

MIT
