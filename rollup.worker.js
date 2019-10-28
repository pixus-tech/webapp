import node from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import { uglify } from 'rollup-plugin-uglify'
import analyze from 'rollup-plugin-analyzer'
import commonjs from 'rollup-plugin-commonjs'

const scriptPrefix = process.env.SCRIPT_PREFIX

const isProduction = process.env.NODE_ENV === 'production'
const globalPlugins = isProduction ? [uglify()] : []

function config({plugins = [], output = {}}) {
  return {
    input: `src/worker-scripts/${scriptPrefix}.ts`,
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            module: 'es2015',
            target: 'es5',
          },
        },
      }),
      node(),
      commonjs(),
      ...globalPlugins,
      ...plugins,
      analyze(),
    ],
    output: {
      ...output
    },
    context: 'self',
    moduleContext: 'self',
  }
}

export default [
  config({
    output: {
      format: 'umd',
      name: scriptPrefix,
      file: `build/static/js/${scriptPrefix}.dev.js`,
      globals: {
        this: 'self',
      },
    }
  }),
]
