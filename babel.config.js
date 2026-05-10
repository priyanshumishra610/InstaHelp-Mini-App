module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Must be listed last; required for Reanimated worklets (fixes native crashes and web issues)
    plugins: ["react-native-reanimated/plugin"],
  };
};
