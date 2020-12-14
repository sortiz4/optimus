const fs = require('fs');
const path = require('path');
const { glob, merge, optimize } = modules();

const DEFAULT_OPTIONS = {
  js: {
    format: {
      comments: false,
    },
    nameCache: {
    },
  },
  css: {
    comments: false,
    restructure: false,
  },
  svg: {
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
  },
  html: {
    collapseWhitespace: true,
    removeComments: true,
  },
};

function modules() {
  const csso = require('csso');
  const glob = require('glob');
  const htmlMinifier = require('html-minifier');
  const merge = require('lodash/merge');
  const Svgo = require('svgo');
  const terser = require('terser');
  const util = require('util');

  return {
    merge,
    glob: util.promisify(glob),
    optimize: {
      js(content, options) {
        return terser.minify(content, options).then(o => o.code);
      },
      css(content, options) {
        return Promise.resolve().then(() => csso.minify(content, options).css);
      },
      svg(content, options) {
        return new Svgo(options).optimize(content).then(o => o.data);
      },
      html(content, options) {
        return Promise.resolve().then(() => htmlMinifier.minify(content, options));
      },
    },
  };
}

async function transformFile(transformer, options, file) {
  const original = await fs.promises.readFile(file, 'utf-8');
  const minified = await transformer(original, options);
  await fs.promises.writeFile(file, minified);
}

async function optimus(context, options) {
  async function removeMapFiles(files) {
    await Promise.all(files.map(fs.promises.unlink));
  }

  async function transformJsFiles(files) {
    await Promise.all(files.map(transformJsFile));
  }

  async function transformCssFiles(files) {
    await Promise.all(files.map(transformCssFile));
  }

  async function transformSvgFiles(files) {
    await Promise.all(files.map(transformSvgFile));
  }

  async function transformHtmlFiles(files) {
    await Promise.all(files.map(transformHtmlFile));
  }

  async function transformJsFile(file) {
    await transformFile(optimize.js, mergedOptions.js, file);
  }

  async function transformCssFile(file) {
    await transformFile(optimize.css, mergedOptions.css, file);
  }

  async function transformSvgFile(file) {
    await transformFile(optimize.svg, mergedOptions.svg, file);
  }

  async function transformHtmlFile(file) {
    await transformFile(optimize.html, mergedOptions.html, file);
  }

  const mergedOptions = merge({}, DEFAULT_OPTIONS, options);

  await Promise.all(
    [
      glob(path.join(context, '**', '*.js')).then(transformJsFiles),
      glob(path.join(context, '**', '*.map')).then(removeMapFiles),
      glob(path.join(context, '**', '*.css')).then(transformCssFiles),
      glob(path.join(context, '**', '*.svg')).then(transformSvgFiles),
      glob(path.join(context, '**', '*.html')).then(transformHtmlFiles),
    ],
  );
}

module.exports = {
  optimus,
};
