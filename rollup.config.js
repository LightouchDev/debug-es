import path from 'path'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { dependencies } from './package.json'

const esm = process.env.BABEL_ENV === 'esm'

function genConf (input) {
  const basename = path.basename(input).split('.')[0]
  return {
    input,
    // bundle deps into es modules
    external: ['os', 'util', 'tty'].concat(esm ? [] : Object.keys(dependencies)),
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
      format: esm ? 'esm' : 'cjs',
      file: `${basename}.js`,
      dir: esm ? 'esm' : 'lib'
    }
  }
}

const entry = [
  'src/browser.js',
  'src/node.js',
  'src/index.js'
]

export default entry.map(genConf)
