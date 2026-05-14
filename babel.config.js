module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  // Use the Hermes parser so Babel can handle React Native 0.83.x .js files
  // that contain TypeScript `as` casts alongside Flow type annotations.
  plugins: ['babel-plugin-syntax-hermes-parser'],
};
