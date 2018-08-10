import path from 'path'

import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

import { dependencies } from './package.json'

const esm = process.env.BABEL_ENV === 'esm'

function genConf ({ esm, minify }) {
  const conf = {
    input: './src/index.js',
    output: {
      dir: path.relative(__dirname, 'dist'),
      file: `index${esm ? '.esm' : ''}${minify ? '.min' : ''}.js`,
      format: esm ? 'esm' : 'cjs',
      name: 'debugES'
    },
    plugins: [
      resolve(),
      commonjs({
        include: ['node_modules/**'],
        sourceMap: false,
        ignoreGlobal: false
      }),
      babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true
      })
    ],
    external: [ ...Object.keys(dependencies), 'supports-color', 'util', 'tty' ]
  }

  if (minify) {
    conf.plugins.push(terser({
      compress: {
        collapse_vars: false
      }
    }))
  }

  return conf
}

export default [
  genConf({ esm, minify: false }),
  genConf({ esm, minify: true })
]
