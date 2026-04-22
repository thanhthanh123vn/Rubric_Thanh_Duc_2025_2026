import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [react(),
  //   VitePWA({
  //   registerType: 'autoUpdate',
  //   includeAssets: ['favicon.svg', 'icons.svg'], // Đảm bảo có các file này trong thư mục public
  //   manifest: {
  //     name: 'Rubric Đánh Giá KLTN',
  //     short_name: 'RubricApp',
  //     description: 'Ứng dụng quản lý và đánh giá Khóa luận tốt nghiệp',
  //     theme_color: '#10b981', // Màu nền thanh trạng thái (màu emerald-500 cho hợp theme của bạn)
  //     background_color: '#ffffff',
  //     display: 'standalone', // Bỏ thanh địa chỉ trình duyệt, trông như App thật
  //     icons: [
  //       {
  //         src: '/favicon.svg', // Tạm dùng favicon làm icon app
  //         sizes: '192x192',
  //         type: 'image/svg+xml'
  //       },
  //       {
  //         src: '/favicon.svg',
  //         sizes: '512x512',
  //         type: 'image/svg+xml'
  //       }
  //     ]
  //   }
  // })
  ],
  define: {

    global: 'window',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000
  }
})