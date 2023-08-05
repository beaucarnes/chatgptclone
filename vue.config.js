const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',


  }
})

// module.exports = {
//   devServer: {
//     host: '0.0.0.0',
//     disableHostCheck: true
//   }
// }