import CleanWebpackPlugin from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import * as path from 'path';
import postcssPresetEnv from 'postcss-preset-env';
import safeParser from 'postcss-safe-parser';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import Webpack, {
  Configuration,
  RuleSetLoader,
  RuleSetRule,
  RuleSetUseItem,
} from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import merge from 'webpack-merge';
import { build as babelBuild } from './babel';
import { IArguments, ICommandConf, webpackComponent } from './config';
import { tempEntryFile } from './utils';

interface ICssLoader extends RuleSetLoader {
  options: {
    importLoaders: number;
    modules?: boolean;
    localIdentName?: string;
  };
}

type style = 'less' | 'css' | 'sass';
export function styleLoaders(
  type?: style,
  mode?: Configuration['mode'],
  ifVue: boolean = false,
): RuleSetRule[] {
  const loaders: RuleSetRule[] = [
    {
      resourceQuery: /original/, // foo.css?original
      use: [
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: () => [postcssPresetEnv()],
          },
        },
      ],
    },
    {
      use: [
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: true,
            localIdentName: '[name]__[local]--[hash:base64:5]',
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: () => [postcssPresetEnv()],
          },
        },
      ],
    },
  ];

  loaders.forEach(rule => {
    const use: RuleSetUseItem[] = rule.use as RuleSetUseItem[];
    if (type === 'sass' || type === 'less') {
      const cssOptions = use[0] as ICssLoader;
      cssOptions.options.importLoaders = 2;
      use.push(`${type}-loader`);
    }
    if (mode === 'development') {
      if (ifVue) {
        use.unshift('vue-style-loader');
      } else {
        use.unshift('style-loader');
      }
    } else {
      use.unshift(MiniCssExtractPlugin.loader);
    }
    return rule;
  });
  return loaders;
}

const baseConfig: Configuration = {
  output: {
    filename: 'index.js',
    path: path.resolve(process.cwd(), './build/dist'),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
  },
  plugins: [
    new CleanWebpackPlugin(['build/dist'], {
      root: process.cwd(),
    }),
    new VueLoaderPlugin(),
  ],
};

function genDevConfig(
  conf: ICommandConf,
  componentType: webpackComponent,
): Configuration {
  const ifVue: boolean = componentType === 'vue';
  return {
    mode: 'development',
    devtool: 'eval-source-map',
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          exclude: [/\.vue$/],
          oneOf: [
            {
              test: /\.(js|jsx|ts|tsx)$/,
              include: [
                path.resolve(process.cwd(), path.dirname(conf.entry)),
                path.resolve(__dirname, './.temp'),
              ],
              use: [
                {
                  loader: 'babel-loader',
                  options: {
                    babelrc: false,
                    cacheDirectory: true,
                    highlightCode: true,
                    presets: [
                      '@babel/preset-env',
                      [
                        '@babel/preset-typescript',
                        {
                          isTSX: true,
                          allExtensions: true,
                        },
                      ],
                      '@babel/preset-react',
                    ],
                    plugins: [
                      [
                        '@babel/plugin-transform-runtime',
                        {
                          corejs: 2,
                        },
                      ],
                      '@babel/plugin-syntax-dynamic-import',
                      'react-hot-loader/babel',
                    ],
                  },
                },
              ],
            },
            {
              test: /\.css$/,
              oneOf: styleLoaders('css', 'development', ifVue),
            },
            {
              test: /\.less$/,
              oneOf: styleLoaders('less', 'development', ifVue),
            },
            {
              test: /\.(scss|sass)$/,
              oneOf: styleLoaders('sass', 'development', ifVue),
            },
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
              loader: 'url-loader',
              options: {
                limit: 10000,
                name: 'static/[name].[hash:8].[ext]',
              },
            },
            {
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
              loader: require.resolve('file-loader'),
              options: {
                name: 'static/[name].[hash:8].[ext]',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'index.html'),
        title: `CBS ${componentType.toUpperCase()} DEV SERVER`,
      }),
      new Webpack.HotModuleReplacementPlugin(),
    ],
    node: {
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },
  };
}

const buildConfig: Configuration = {
  mode: 'production',
  devtool: false,
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        exclude: [/\.vue$/],
        oneOf: [
          {
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  babelrc: false,
                  cacheDirectory: true,
                  compact: true,
                  highlightCode: true,
                  presets: [
                    '@babel/preset-env',
                    [
                      '@babel/preset-typescript',
                      {
                        isTSX: true,
                        allExtensions: true,
                      },
                    ],
                    '@babel/preset-react',
                  ],
                  plugins: [
                    [
                      '@babel/plugin-transform-runtime',
                      {
                        corejs: 2,
                      },
                    ],
                    '@babel/plugin-syntax-dynamic-import',
                  ],
                },
              },
            ],
          },
          {
            test: /\.vue$/,
            loader: 'vue-loader',
          },
          {
            test: /\.css$/,
            oneOf: styleLoaders('css', 'production'),
          },
          {
            test: /\.less$/,
            oneOf: styleLoaders('less', 'production'),
          },
          {
            test: /\.(scss|sass)$/,
            oneOf: styleLoaders('sass', 'production'),
          },
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          {
            // Exclude `js` files to keep "css" loader working as it injects
            // its runtime that would otherwise be processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
    }),
  ],
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        parallel: true,
        cache: true,
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          parser: safeParser,
          discardComments: {
            removeAll: true,
          },
        },
      }),
    ],
  },
};

export const start = (conf: ICommandConf, args: IArguments): Promise<any> => {
  return tempEntryFile({
    type: args['component-type'],
    fileExtra: conf['script-type'],
    entry: conf.entry,
  }).then(entryFile => {
    const entryConfig: Configuration = {
      entry: entryFile,
    };
    const webpackConf: Configuration = merge(
      entryConfig,
      baseConfig,
      genDevConfig(conf, args['component-type']),
    );
    const devServerOptions = {
      compress: true,
      port: args.port,
      hot: true,
      host: 'localhost',
      lazy: false,
      quiet: false,
      noInfo: false,
      open: true,
      clientLogLevel: 'none',
      stats: {
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
      },
    };

    WebpackDevServer.addDevServerEntrypoints(webpackConf, devServerOptions);
    const compiler = Webpack(webpackConf);
    const server = new WebpackDevServer(compiler, devServerOptions);

    return new Promise((resolve, reject) => {
      server.listen(args.port, '127.0.0.1', err => {
        if (err) {
          reject(err);
        } else {
          console.log(`Starting server on http://localhost:${args.port}`);
          resolve(server);
        }
      });
    });
  });
};

export const build = (conf: ICommandConf, args: IArguments): Promise<void> => {
  const entryConfig: Configuration = {
    entry: path.resolve(process.cwd(), `${conf.entry}`),
  };
  const webpackConf: Configuration = merge(
    entryConfig,
    baseConfig,
    buildConfig,
  );

  return Promise.all([
    new Promise((resolve, reject) => {
      Webpack(webpackConf, (err, stats) => {
        if (err) {
          console.error(err.stack || err);
          reject(err);
          return;
        }

        const info = stats.toJson();

        if (stats.hasErrors()) {
          console.error(info.errors);
        }

        if (stats.hasWarnings()) {
          console.warn(info.warnings);
        }
        console.log(
          stats.toString({
            // 增加控制台颜色开关
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
          }),
        );
        resolve();
        // 处理完成
      });
    }),
    args['component-type'] === 'vue' ? Promise.resolve() : babelBuild(conf),
  ]).then(() => {
    return;
  });
};
