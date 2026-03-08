# Hướng dẫn Deploy lên Vercel

## Bước 1: Chuẩn bị

1. Đảm bảo bạn đã có tài khoản Vercel (đăng ký tại https://vercel.com)
2. Đảm bảo code đã được push lên GitHub/GitLab/Bitbucket

## Bước 2: Lấy Google Gemini API Key

1. Truy cập: https://aistudio.google.com/apikey
2. Đăng nhập bằng tài khoản Google
3. Tạo API key mới
4. Copy API key (bạn sẽ cần nó ở bước sau)

## Bước 3: Deploy lên Vercel

### Cách 1: Deploy qua Vercel Dashboard

1. Truy cập https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import repository từ GitHub/GitLab/Bitbucket
4. Vercel sẽ tự động detect framework (Vite)
5. **Quan trọng**: Thêm Environment Variable:
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Value**: API key bạn đã copy ở bước 2
6. Click "Deploy"

### Cách 2: Deploy qua Vercel CLI

1. Cài đặt Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Đăng nhập:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Khi được hỏi, nhập:
   - Environment Variable: `VITE_GEMINI_API_KEY`
   - Value: API key của bạn

## Bước 4: Cấu hình Environment Variables trên Vercel

Sau khi deploy, bạn cần thêm environment variable:

1. Vào project trên Vercel Dashboard
2. Vào Settings → Environment Variables
3. Thêm biến mới:
   - **Key**: `VITE_GEMINI_API_KEY`
   - **Value**: API key của bạn
   - **Environment**: Production, Preview, Development (chọn tất cả)
4. Click "Save"
5. Redeploy project để áp dụng thay đổi

## Bước 5: Kiểm tra

1. Sau khi deploy xong, Vercel sẽ cung cấp URL (ví dụ: `your-app.vercel.app`)
2. Truy cập URL và test ứng dụng
3. Đảm bảo API hoạt động đúng

## Lưu ý

- **Không commit file `.env`** vào Git (đã có trong .gitignore)
- API key phải có prefix `VITE_` để Vite có thể truy cập ở client-side
- Sau khi thêm environment variable, cần redeploy để áp dụng
- Vercel sẽ tự động build và deploy khi bạn push code mới lên repository

## Troubleshooting

### Lỗi: API key không hoạt động
- Kiểm tra lại tên biến môi trường: phải là `VITE_GEMINI_API_KEY`
- Đảm bảo đã redeploy sau khi thêm environment variable
- Kiểm tra API key có hợp lệ không

### Lỗi: Build failed
- Kiểm tra logs trên Vercel Dashboard
- Đảm bảo tất cả dependencies đã được cài đặt đúng
- Kiểm tra Node.js version (Vercel tự động detect)

### Lỗi: 404 khi truy cập routes
- File `vercel.json` đã được cấu hình để redirect tất cả routes về `index.html`
- Nếu vẫn lỗi, kiểm tra lại cấu hình trong `vercel.json`
