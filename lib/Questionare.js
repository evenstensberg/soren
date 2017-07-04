'use strict';
const path = require('path');
const stdin = require('mock-stdin').stdin();
const chalk = require('chalk');
const stripAnsi = require('strip-ansi');
const prefix = require('global-prefix');
const ora = require('ora');

const STDOUTWRITE = process.stdout._write;

let stdoutChunk = '';
let stdoutChunkCopy = '';
let x = 0;
const questions = [];
const answers = [];
const assertions = [];

module.exports = function(options) {
  const currentSuiteName = path.parse(options.filePaths[0]).name.replace('.stdin', '');

  if (!options.arguments.includes(currentSuiteName)) {
    options.filePaths.shift();
    options.testSuite = null;
    options.questions = [];
    const Runner = require('./Runner');
    return Runner.run(options);
  }
  options.questions.forEach( (qa) => {
    questions.push(Object.keys(qa)[0]);
    answers.push(Object.values(qa)[0]);
    assertions.push(Object.values(qa)[1]);
  });
  const binPath = options.binPath;
  const optionsArgv = options.argv ? options.argv : [prefix, binPath];
  if (!optionsArgv.includes(prefix)) {
    optionsArgv.push(prefix);
  }
  options.arguments.forEach( arg => optionsArgv.push(arg));

  function overWrite(chunk, encoding, callback) {
    stdoutChunk += stripAnsi(chunk).trim();
    if (x < answers.length) {
      /* eslint-disable */
      stdoutChunkCopy = stdoutChunk.slice(stdoutChunk.length - questions[x].length).replace(/^\s+|\s+$/gm,'')
      if (stdoutChunkCopy === questions[x].replace(/^\s+|\s+$/gm,'')) {
        /* eslint-enable */
        assertions[x](answers[x]);
        stdin.send(answers[x]).send('\r');
        x++;
      }
      callback();
    }
  }

  process.argv = optionsArgv.filter(f => f);
  process.stdout.write(`\n`);
  const spinner = ora(chalk.cyan.bold(options.testSuite)).start();
  process.stdout._write = overWrite;
  require(options.absoluteBinPathResolved);

  setTimeout(() => {
    process.stdout._write = STDOUTWRITE;
    process.stdout.write(`\n\n Running Test Suite ${chalk.bold(options.testSuite)} failed\n`);
    process.stdout.write(`\n Expected: ${chalk.green(questions[x])}\n`);
    process.stdout.write(` Recieved: ${chalk.red(stdoutChunkCopy)} \n`);
    spinner.stop();
    return;
  }, 10E3);
};
