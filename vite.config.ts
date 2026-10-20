/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    allowedHosts: [
      "ttr.dwg-art.ru", // точное совпадение с доменом
      ".dwg-art.ru", // домен и все его поддомены
      "212.220.211.162", // IP-адрес
    ],
  },
  // Конфигурация vitest (тип подключается через triple-slash ссылку выше)
  test: {
    environment: "node", // тестируем чистую логику — браузер не нужен
    include: ["src/**/*.test.ts"],
  },
});
