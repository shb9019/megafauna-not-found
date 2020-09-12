# MegaFauna Not Found!

A game inspired by the Australian MegaFauna Extinction by Homo Sapiens.

Built using [js13k-rollup](https://github.com/spmurrayzzz/js13k-rollup/) template

*Requires: Node.js >= 4 and < 12*

Current output zip size: `13087 bytes`

## Getting started

- Install dependencies

```
npm install -g gulp node-static
npm install
```

- Kick off a build

```
gulp
```

- Start a static server

```
static
```

- Navigate to [http://localhost:8080/dist](http://localhost:8080/dist) in your browser to run the app

- To run builds while you save changes to files

```
gulp watch
```

## How the build pipeline works

JavaScript step

1. Rollup reads the dependency tree and outputs `dist/main.js` w/ sourcemaps support
2. Uglify minifies the previous file and outputs `dist/main.min.js`

CSS step

3. All css files are concatenated and output to `dist/main.css`

Template step

4. `index.hbs` is output into two separate files: `dist/index.html` and `dist/index.min.html`. The former is used for development. The latter has all the necessary scripts and styles are inlined into a single deliverable used for later packaging.

Zip step

5. The `index.min.html` is compressed into a single `game.zip` that can be used for competition submission.
