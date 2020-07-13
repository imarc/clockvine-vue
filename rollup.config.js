import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import vue from 'rollup-plugin-vue'

export default {
  input: 'src/Clockvine.js',
  output: [
    {
      format: 'esm',
      file: 'lib/Clockvine.esm.js'
    }
  ],
  external: ['vue'],
  plugins: [
    resolve({
      browser: true
    }),
    commonjs({
      include: /node_modules/
    }),
    json(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),
    vue()
  ]
}
