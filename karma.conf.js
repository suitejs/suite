/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Run all tests: `npm run tdd`
 * Run all styles tests: `M=styles npm run tdd`
 * Run a component test: `M=Button npm run tdd`
 * Run a test of a file: `src/Picker/test/PickerToggleSpec.js npm run tdd`
 */

/**
 * @param {import('karma').Config} config
 */
module.exports = config => {
  const { env } = process;
  const { M, F } = env;

  let testFile = 'src/**/*Spec.js';

  if (M) {
    testFile = `src/${M}/test/*.js`;
  } else if (F) {
    testFile = F;
  }

  config.set({
    /** Timeout for capturing a browser (in ms). */
    captureTimeout: 210000,

    /** maximum number of tries a browser will attempt in the case of a disconnection (in ms) */
    browserDisconnectTolerance: 3,

    /** How long does Karma wait for a browser to reconnect (in ms). */
    browserDisconnectTimeout: 210000,

    /** How long will Karma wait for a message from a browser before disconnecting from it (in ms). */
    browserNoActivityTimeout: 210000,
    basePath: '',
    files: [testFile].map(pattern => ({ pattern, watched: false })),
    frameworks: ['mocha', 'sinon-chai', 'webpack'],
    colors: true,
    reporters: ['mocha', 'coverage'],
    logLevel: config.LOG_INFO,
    preprocessors: {
      'src/**/*Spec.js': ['webpack']
    },
    client: {
      mocha: {
        require: [require.resolve('./test/chai-assertions.js')]
      }
    },
    webpack: require('./webpack.karma.js'),
    webpackMiddleware: {
      noInfo: true
    },
    browsers: env.BROWSER ? env.BROWSER.split(',') : ['Chrome'],
    customLaunchers: {
      ChromeCi: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      },
      FirefoxAutoAllowGUM: {
        base: 'Firefox',
        prefs: {
          'media.navigator.permission.disabled': true
        }
      }
    },
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'html' },
        { type: 'lcov', subdir: 'lcov' } // lcov
      ]
    }
  });
};
