/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
 * MIT Licensed
 */

// https://github.com/sindresorhus/gzip-size-cli/blob/master/cli.js
// /Users/rodolphe/.nvm/versions/node/v8.2.1/bin/node-minify --compressor babili --input 'examples/public/js/sample.js' --output 'examples/public/js-dist/babili-es6.js'
// /Users/rodolphe/.nvm/versions/node/v8.2.1/bin/node-minify --compressor gcc --input 'examples/public/js/sample.js,examples/public/js/sample2.js' --output 'examples/public/js-dist/babili-es6.js'
// /Users/rodolphe/.nvm/versions/node/v8.2.1/bin/node-minify --compressor babili --input 'examples/public/js/**/*.js' --output 'examples/public/js-dist/babili-es6.js'

'use strict';

/**
 * Module dependencies.
 */

var table = require('text-table');
var compress = require('./compress');
var spinner = require('./spinner');
var cliOptions;

/**
 * Module variables.
 */

var all = ['babili', 'butternut', 'gcc', 'uglifyjs', 'yui'];
var results = [
  ['Compressor', 'Size minified', 'Size Gzipped']
];
var smallers = [{sizeGzip: undefined}];

/**
 * Last step after minify.
 */

function finalize() {
  if (results.length - 1 === all.length) {
    var t = table(results);
    console.log('');
    console.log(t);
    console.log(formatSmallers(smallers));

    console.log('\nCompressing with ' + smallers[0].compressor + ' to ' + cliOptions.output);
    runOne(cliOptions, smallers[0].compressor).then(function() {
      console.log('\nAll done!');
    });
  }
}

/**
 * Format the output.
 */

function formatSmallers(smallers) {
  var sizeGzip = 0;
  var output = '\nThe smallest ' + (smallers.length > 1 ? 'are' : 'is') + ': ';
  smallers.forEach(function(item) {
    output += item.compressor + ' ';
    sizeGzip = item.sizeGzip;
  });
  output += 'with ' + sizeGzip;
  return output;
}

/**
 * Set the smallers compressor result.
 */

function setSmaller(result) {
  if (!smallers[0].sizeGzip) {
    smallers[0] = result;
    return;
  }
  if (smallers[0].sizeGzip > result.sizeGzip) {
    smallers = [];
    smallers[0] = result;
    return;
  }
  if (smallers[0].sizeGzip === result.sizeGzip) {
    smallers.push(result);
  }
}

/**
 * Run one compressor.
 */

function runOne(cli, compressor) {
  var options = {
    compressor: compressor || cli.compressor,
    input: cli.input.split(','),
    output: cli.output
  };

  spinner.start(compressor || cli.compressor);

  return compress(options).then(function(result) {
    results.push([result.compressor, result.size, result.sizeGzip]);
    setSmaller(result);
    spinner.stop(compressor);
  });
}

/**
 * Run cli.
 */

function run(cli) {
  cliOptions = cli;
  return new Promise(function(resolve, reject) {
    if (cli.compressor === 'all') {
      var sequence = Promise.resolve();
      all.forEach(function(compressor) {
        sequence = sequence.then(function() {
          return runOne(cli, compressor);
        });
      });
      sequence.then(function() {
        finalize();
        resolve();
      }).catch(function(err) {
        console.log(err.message);
        reject();
        process.exit(1);
      });
    } else {
      runOne(cli, cli.compressor).then(function() {
        resolve();
      });
    }
  });
}

module.exports = run;
