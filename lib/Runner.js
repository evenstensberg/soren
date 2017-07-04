'use strict';
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const Questionare = require('./Questionare');


module.exports = class Runner {
  constructor(options) {
    this.options = Object.assign(options, {
      testSuite: null,
      absoluteBinPathResolved: null,
      questions: [],
      filePaths: []
    });
    try {
      this.options.absoluteBinPathResolved = path.resolve(process.cwd(), this.options.binPath);
      if (!fs.existsSync(this.options.absoluteBinPathResolved)) {
        throw new Error('Invalid Path Detected:', this.absoluteBinPathResolved);
      }
    } catch (err) {
      this.options.absoluteBinPathResolved = null;
    }
    Object.getOwnPropertyNames(Runner.prototype)
      .filter(n => [
        'describe',
        'question',
        'onCompleted'
      ].includes(n)).forEach( (method) => {
        global[method] = this[method];
      });
    // I'm a bad human being...
    Runner.options = this.options;
  }
  describe(suite, cb) {
    Runner.options.testSuite = suite;
    return cb();
  }
  question(q, answer, cb) {
    return Runner.options.questions.push({[q]: answer, cb});
  }
  onCompleted(cb) {
    return cb();
  }

  static getFPS() {
    glob.sync('**/*.stdin.js', {}).forEach(fp => {
      Runner.options.filePaths.push(path.resolve(process.cwd(), fp));
    });
    return this;
  }
  static run() {
    if (!Runner.options.absoluteBinPathResolved) {
      try {
        const packageJSONFile = require(`${process.cwd()}/package.json`).name;
        const binDirPath = path.join(process.cwd(), 'bin', `${packageJSONFile}.js`);
        if (fs.existsSync(binDirPath)) {
          Runner.options.binPath = binDirPath;
          Runner.options.absoluteBinPathResolved = path.resolve(process.cwd(), binDirPath);
        } else {
          // eslint-disable-next-line
          console.error('Tried to find CLI path, but was unable to do so');
          process.exit(1);
        }
      } catch (err) {}
    }
    // TODO: Figure out a way to stop the CLI from exiting using process_child
    return Runner.options.filePaths.forEach( (fp) => {
      require(fp);
      // eslint-disable-next-line
      return Questionare(Runner.options);
    });
  }
};
