const fs = require('fs');
const path = require('path');
const { createSvgPlugins, glob, merge, optimize } = modules();

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
    plugins: createSvgPlugins(
      { name: 'cleanupAttrs', active: false },
      { name: 'cleanupEnableBackground', active: false },
      { name: 'cleanupIDs', active: false },
      { name: 'cleanupNumericValues', active: false },
      { name: 'convertColors', active: false },
      { name: 'convertEllipseToCircle', active: false },
      { name: 'convertPathData', active: false },
      { name: 'convertShapeToPath', active: false },
      { name: 'mergePaths', active: false },
      { name: 'removeTitle', active: false },
      { name: 'removeUnknownsAndDefaults', active: false },
      { name: 'removeUselessStrokeAndFill', active: false },
      { name: 'removeViewBox', active: false },
      { name: 'removeXMLProcInst', active: false },
    ),
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
  const svgo = require('svgo');
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
        return Promise.resolve().then(() => svgo.optimize(content, options).data);
      },
      html(content, options) {
        return Promise.resolve().then(() => htmlMinifier.minify(content, options));
      },
    },
    createSvgPlugins(...plugins) {
      return svgo.extendDefaultPlugins(plugins);
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
