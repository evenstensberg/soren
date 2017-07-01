#!/usr/bin/env node
'use strict';

const Runner = require('./lib/Runner');

let isTrue = false;

const binPathArgV = process.argv.map( (args) => {
  if (args.indexOf('binPath') >= 0) {
    return args.slice(8);
  }
}).filter(p => p)[0];

const argsArr = process.argv.map( (args) => {
  if (args === '--') {
    isTrue = true;
  }
  if (isTrue && args !== '--') {
    return args;
  }
}).filter(p => p);

class Soren extends Runner {
  constructor(options) {
    super(options);
    this.binPath = options.binPath ? options.binPath : null;
    this.arguments = options.arguments ? options.arguments : ' ';
  }
  run() {
    return Runner.run();
  }
  getFPS() {
    return Runner.getFPS();
  }
}

new Soren({
  binPath: binPathArgV,
  arguments: argsArr.join(' ')
}).getFPS().run();
