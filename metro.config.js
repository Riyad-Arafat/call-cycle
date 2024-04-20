const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  routerRoot: __dirname, // replace __dirname with the path to your routes directory
};

module.exports = config;
