import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";
import packageJson from "./package.json";

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
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        module: true,
        jsnext: true,
        main: true,
        browser: true,
      }),
      commonjs(),
      typescript(),
    ],
  },
  {
    input: "./src/index.ts",
    output: [{ file: "./lib/index.d.ts", format: "es" }],
    plugins: [dts({ respectExternal: true })],
  },
];
