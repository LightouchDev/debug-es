import path from 'path'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { dependencies } from './package.json'

const outputDir = {
  esm: 'esm',
  cjs: 'lib',
  umd: 'umd'
}

function genConf (input) {
  const basename = path.basename(input).split('.')[0]
  return {
    input,
    // bundle deps into es modules
    external: ['os', 'util', 'tty'].concat(process.env.BABEL_ENV === 'cjs' ? Object.keys(dependencies) : []),
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**', // only transpile our source code
        runtimeHelpers: true
      })
    ],
    // FIXME: do not use mjs extension until other bundler supported.
    output: {
      format: process.env.BABEL_ENV,
      file: `${basename}.js`,
      dir: outputDir[process.env.BABEL_ENV],
      name: process.env.BABEL_ENV === 'umd' ? 'DebugES' : undefined,
      extend: process.env.BABEL_ENV === 'umd'
    }
  }
}

const entry = [
  'src/browser.js',
  'src/node.js',
  'src/index.js'
]

export default entry.map(genConf)
