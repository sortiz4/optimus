const fs = require('fs');
const path = require('path');
const { glob, optimize } = modules();

const JS_OPTIONS = {
  format: {
    comments: false,
  },
  nameCache: {
  },
};

const SVG_OPTIONS = {
  multipass: true,
  plugins: [
    { cleanupAttrs: false },
    { cleanupEnableBackground: false },
    { cleanupIDs: false },
    { cleanupNumericValues: false },
    { convertColors: false },
    { convertEllipseToCircle: false },
    { convertPathData: false },
    { convertShapeToPath: false },
    { mergePaths: false },
    { removeTitle: false },
    { removeUnknownsAndDefaults: false },
    { removeUselessStrokeAndFill: false },
    { removeViewBox: false },
    { removeXMLProcInst: false },
  ],
};

const HTML_OPTIONS = {
  collapseWhitespace: true,
  removeComments: true,
};

function modules() {
  const glob = require('glob');
  const htmlMinifier = require('html-minifier');
  const Svgo = require('svgo');
  const terser = require('terser');
  const util = require('util');

  return {
    glob: util.promisify(glob),
    optimize: {
      js(content, options) {
        return terser.minify(content, options).then(o => o.code);
      },
      svg(content, options) {
        return new Svgo(options).optimize(content).then(o => o.data);
      },
      html(content, options) {
        return Promise.resolve(htmlMinifier.minify(content, options));
      },
    },
  };
}

async function removeMapFiles(files) {
  await Promise.all(files.map(fs.promises.unlink));
}

async function transformJsFiles(files) {
  await Promise.all(files.map(transformJsFile));
}

async function transformSvgFiles(files) {
  await Promise.all(files.map(transformSvgFile));
}

async function transformHtmlFiles(files) {
  await Promise.all(files.map(transformHtmlFile));
}

async function transformFile(transformer, options, file) {
  const original = await fs.promises.readFile(file, 'utf-8');
  const minified = await transformer(original, options);
  await fs.promises.writeFile(file, minified);
}

async function transformJsFile(file) {
  await transformFile(optimize.js, JS_OPTIONS, file);
}

async function transformSvgFile(file) {
  await transformFile(optimize.svg, SVG_OPTIONS, file);
}

async function transformHtmlFile(file) {
  await transformFile(optimize.html, HTML_OPTIONS, file);
}

async function optimus(context) {
  await Promise.all(
    [
      glob(path.join(context, '**', '*.js')).then(transformJsFiles),
      glob(path.join(context, '**', '*.map')).then(removeMapFiles),
      glob(path.join(context, '**', '*.svg')).then(transformSvgFiles),
      glob(path.join(context, '**', '*.html')).then(transformHtmlFiles),
    ],
  );
}

module.exports = {
  optimus,
};
