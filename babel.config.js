module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@navigation": "./src/navigation",
            "@assets": "./assets",
            "@hooks": "./src/hooks",
            "@context": "./src/context",
            "@utils": "./src/utils",
            "@apis": "./src/apis",
            "@typings": "./src/typings",
          },
        },
      ],
    ],
  };
};
