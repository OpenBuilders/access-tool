export default {
  plugins: {
    "postcss-preset-env": {
      // Включает поддержку новых возможностей CSS
      stage: 2,
      // Автоматическое определение браузеров из package.json
      browsers: "last 2 versions",
    },
    autoprefixer: {
      // Добавляет префиксы для обеспечения кросс-браузерной совместимости
      grid: true,
    },
    // Применяем cssnano только в production режиме
    cssnano:
      process.env.NODE_ENV === "production"
        ? {
            preset: [
              "default",
              {
                discardComments: {
                  removeAll: true,
                },
                // Оптимизация CSS
                normalizeWhitespace: true,
                colormin: true,
              },
            ],
          }
        : false,
  },
};
