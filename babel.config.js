module.exports = (api) => {
  if (api.env() === 'test') {
    return {
      presets: [
        '@babel/preset-env'
      ]
    }
  }
  return {
    presets: [
      ['@babel/preset-env', {
        modules: false,
        loose: true,
        debug: process.env.NODE_ENV === 'test',
        targets: {
          browsers: [
            'last 1 Chrome version',
            'last 1 Firefox version'
          ]
        },
        corejs: 3,
        useBuiltIns: 'usage'
      }]
    ]
  }
}
