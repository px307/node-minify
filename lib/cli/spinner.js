/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var chalk = require('chalk');
var ora = require('ora');

/**
 * Expose `start() and stop()`.
 */

module.exports.start = start;
module.exports.stop = stop;

var spinner = ora();

function start(compressor) {
  spinner.text = 'Compressing file(s) with ' + chalk.green(compressor) + '...';
  spinner.start();
}

function stop(compressor) {
  spinner.text = 'File(s) compressed successfully with ' + chalk.green(compressor);
  spinner.succeed();
}
