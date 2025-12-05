const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add support for lucide-react-native
config.resolver.alias = {
  ...config.resolver.alias,
  "react-native-svg": "react-native-svg/lib/commonjs",
};

module.exports = config;
