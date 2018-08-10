module.exports = {
  env: {
    esm: {
      presets: [
        ['@babel/preset-env', {
          modules: false,
          targets: {
            esmodules: true
          }
        }]
      ]
    },
    cjs: {
      presets: [
        ['@babel/preset-env', {
          modules: false,
          targets: {
            node: 4
          }
        }]
      ]
    }
  },
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-runtime'
  ]
}
