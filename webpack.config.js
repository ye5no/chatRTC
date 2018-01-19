module.exports = {
  entry: {
    index: "./client/index.js",
    chat: "./client/chat.js"
  },
  output: {
    path: __dirname + '/public/js/',
    filename: "[name].bundle.js"
  },
  watch: false,

  resolveLoader: {
    modules: [ 'node_modules' ],
    extensions: [ '.js' ]
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: [/node_modules/]
      },
    ]
  }
};
