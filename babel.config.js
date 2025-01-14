module.exports = function (api) {
 // Ne pas redéfinir le cache si c'est déjà fait ailleurs
 if (api.cache) {
  api.cache(true);
}
  console.log("Babel plugins applied:", JSON.stringify(api.cache(() => {}), null, 2));

  return {

    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "@babel/plugin-transform-classes",
      [
        "@babel/plugin-transform-class-properties",
        { loose: false },
      ],
      [
        "@babel/plugin-transform-private-methods",
        { loose: false },
      ],
      [
        "@babel/plugin-transform-private-property-in-object",
        { loose: false },
      ],
      "react-native-reanimated/plugin",
    ],
    overrides: [
      {
        test: /node_modules[\\/]expo-router[\\/]/,
        plugins: [
          [
            "@babel/plugin-transform-class-properties",
            { loose: false },
          ],
          [
            "@babel/plugin-transform-private-methods",
            { loose: false },
          ],
          [
            "@babel/plugin-transform-private-property-in-object",
            { loose: false },
          ],
        ],
      },
    ],
  };
};
