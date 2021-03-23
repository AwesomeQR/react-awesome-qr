import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import typescript from "rollup-plugin-typescript2";
import packageJson from "./package.json";
import path from "path";

export default [
  {
    input: "./src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [peerDepsExternal(), resolve({ browser: true }), commonjs(), typescript()],
    onwarn: function (warning, warn) {
      if (warning.loc.file.startsWith(path.resolve(__dirname, "node_modules", "bluebird"))) {
        // Suppress the eval warning in bluebird
        return;
      }
      warn(warning);
    },
  },
];
