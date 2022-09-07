import * as csso from 'csso';
import globCallback from 'glob';
import htmlMinifier from 'html-minifier';
import javascriptObfuscator from 'javascript-obfuscator';
import util from 'node:util';
import svgo from 'svgo';
import * as terser from 'terser';

export const glob = util.promisify(globCallback);

export const optimize = {
  js(content, options) {
    return terser.minify(content, options).then(o => o.code);
  },
  json(content) {
    return JSON.stringify(JSON.parse(content));
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
};

export const obfuscate = {
  js(content, options, i) {
    const mergedOptions = {
      ...options,
      identifiersPrefix: `_${i}`,
    };
    return javascriptObfuscator.obfuscate(content, mergedOptions).getObfuscatedCode();
  },
};
