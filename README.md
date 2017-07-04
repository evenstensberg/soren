# Soren

Soren is an minimal test runner designed to help E2E tests with interactive CLI tools such as an application using [Inquirer](https://github.com/SBoudrias/Inquirer.js). It's flaky and experimental, please submit any issues that you might encounter.

![alt-tag](https://github.com/ev1stensberg/soren/blob/master/assets/ex.png)

# Usage

```sh
$ npm install -g soren

soren binPath="./my/repo/dot.js" -- optionalArgs
```


# Example

Example from a E2E test with the [webpack-cli](https://github.com/webpack/webpack-cli/)

```js
'use strict';
const assert = require('assert');
/* global describe question */

// Webpack-cli -> soren binPath="YourPathToWebpackCLI" -- init
// Alternatively, clone webpack-cli and run 'Soren' inside the repo

describe('init', () => {
  question('Will your application have multiple bundles? (Y/n)', 'n', (answer) => {
    assert.equal(answer, 'n');
  });

  question('Which module will be the first to enter the application?', 'app.js', (answer) => {
    assert.equal(answer, 'app.js');
  });

  question('Which folder will your generated bundles be in? [default: dist]:',
    './dist', (answer) => {
      assert.equal(answer, './dist');
    });

  question('Are you going to use this in production? (Y/n)', 'Y', (answer) => {
    assert.equal(answer, 'Y');
  });

  question('Will you be using ES2015? (Y/n)', 'Y', (answer) => {
    assert.equal(answer, 'Y');
  });

  question(` Will you use one of the below CSS solutions?
  1) SASS
  2) LESS
  3) CSS
  4) PostCSS
  5) No
  Answer:`, 2, (answer) => {
      assert.equal(answer, 2);
    });
  question(`If you want to bundle your CSS files, what will you name the bundle? (press en
ter to skip)`, 'enter', (answer) => {
      assert.equal(answer, 'enter');
    });

  question('Name your \'webpack.[name].js?\' [default: \'prod\']:', 'dev', (answer) => {
    assert.equal(answer, 'dev');
  });
});
```

There's several things you may have noticed here. First of all, your interactive questions need to match exactly, as well as they have to be in order. Secondly, we're using the native [`assert`](https://nodejs.org/api/assert.html) module for node, while we figure out how to implement this nicely with other test runners.

## Important

1. Filename for each of the tests needs to be named `example.stdin.js`
2. When you're running `soren`, `describe` should have the argument you pass it, as well as the filename:
  `soren binPath=../some/path -- example`
3. Describe needs then to look like: `describe('example', () => {...})`

## Tricks of the Trade

1. Run Soren in a Docker container
2. If you are producing code, leave that checks for tools like Jest and run that command after Soren has run its command. (Example: `npm run E2E:soren && npm run E2E:jest`)

## Motivation

In the future, Soren should be consumed with a Docker container. This way, an E2E test that produces some output can be tested without consuming "Junk" code in your workspace.

## What's left


- Less flaky assertions
- Opt in docker and usage after a CLI command has been finished
