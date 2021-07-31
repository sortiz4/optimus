const fs = require('fs');
const path = require('path');
const { glob, optimize, obfuscate } = modules();

const OPTIONS = {
  remove: {
    sourceMaps: true,
    typeDefinitions: true,
    typeScriptArtifacts: true,
  },
  optimize: {
    js: {
      enabled: true,
      options: {
        format: {
          comments: false,
        },
        nameCache: {
        },
      },
    },
    css: {
      enabled: true,
      options: {
        comments: false,
        restructure: false,
      },
    },
    svg: {
      enabled: true,
      options: {
        multipass: true,
        plugins: [
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
        ],
      },
    },
    html: {
      enabled: true,
      options: {
        collapseWhitespace: true,
        removeComments: true,
      },
    },
  },
  obfuscate: {
    js: {
      enabled: false,
      options: {
        optionsPreset: 'default',
      },
    },
  },
};

function modules() {
  const csso = require('csso');
  const glob = require('glob');
  const htmlMinifier = require('html-minifier');
  const javascriptObfuscator = require('javascript-obfuscator');
  const svgo = require('svgo');
  const terser = require('terser');
  const util = require('util');

  return {
    glob: util.promisify(glob),
    optimize: {
      js(content, options) {
        return terser.minify(content, options).then(o => o.code);
      },
      css(content, options) {
        return Promise.resolve().then(() => csso.minify(content, options).css);
      },
      svg(content, options) {
        const mergedOptions = {
          ...options,
          plugins: svgo.extendDefaultPlugins(options.plugins ?? []),
        };
        return Promise.resolve().then(() => svgo.optimize(content, mergedOptions).data);
      },
      html(content, options) {
        return Promise.resolve().then(() => htmlMinifier.minify(content, options));
      },
    },
    obfuscate: {
      js(content, options, i) {
        const mergedOptions = {
          ...options,
          identifiersPrefix: `_${i}`,
        };
        return javascriptObfuscator.obfuscate(content, mergedOptions).getObfuscatedCode();
      },
    },
  };
}

async function optimus(root, options) {
  async function transformFile(transformer, options, file, i) {
    const original = await fs.promises.readFile(file, 'utf-8');
    const modified = await transformer(original, options, i);
    await fs.promises.writeFile(file, modified);
  }

  async function removeFiles(files) {
    await Promise.all(files.map(fs.promises.unlink));
  }

  async function collectFiles(extension) {
    return await glob(path.join(root, '**', extension));
  }

  async function optimizeJsFile(file) {
    await transformFile(optimize.js, mergedOptions.optimize.js.options, file);
  }

  async function optimizeCssFile(file) {
    await transformFile(optimize.css, mergedOptions.optimize.css.options, file);
  }

  async function optimizeSvgFile(file) {
    await transformFile(optimize.svg, mergedOptions.optimize.svg.options, file);
  }

  async function optimizeHtmlFile(file) {
    await transformFile(optimize.html, mergedOptions.optimize.html.options, file);
  }

  async function obfuscateJsFile(file, i) {
    await transformFile(obfuscate.js, mergedOptions.obfuscate.js.options, file, i);
  }

  async function optimizeJsFiles(files) {
    await Promise.all(files.map(optimizeJsFile));
  }

  async function optimizeCssFiles(files) {
    await Promise.all(files.map(optimizeCssFile));
  }

  async function optimizeSvgFiles(files) {
    await Promise.all(files.map(optimizeSvgFile));
  }

  async function optimizeHtmlFiles(files) {
    await Promise.all(files.map(optimizeHtmlFile));
  }

  async function obfuscateJsFiles(files) {
    await Promise.all(files.map(obfuscateJsFile));
  }

  async function runRemoveSourceMaps() {
    if (mergedOptions.remove.sourceMaps) {
      await collectFiles('*.map').then(removeFiles);
    }
  }

  async function runRemoveTypeDefinitions() {
    if (mergedOptions.remove.typeDefinitions) {
      await collectFiles('*.d.ts').then(removeFiles);
    }
  }

  async function runRemoveTypeScriptArtifacts() {
    if (mergedOptions.remove.typeDefinitions) {
      await collectFiles('*.tsbuildinfo').then(removeFiles);
    }
  }

  async function runOptimizeJs() {
    if (mergedOptions.optimize.js.enabled) {
      await collectFiles('*.js').then(optimizeJsFiles);
    }
  }

  async function runOptimizeCss() {
    if (mergedOptions.optimize.css.enabled) {
      await collectFiles('*.css').then(optimizeCssFiles);
    }
  }

  async function runOptimizeSvg() {
    if (mergedOptions.optimize.svg.enabled) {
      await collectFiles('*.svg').then(optimizeSvgFiles);
    }
  }

  async function runOptimizeHtml() {
    if (mergedOptions.optimize.html.enabled) {
      await collectFiles('*.html').then(optimizeHtmlFiles);
    }
  }

  async function runObfuscateJs() {
    if (mergedOptions.obfuscate.js.enabled) {
      await collectFiles('*.js').then(obfuscateJsFiles);
    }
  }

  async function runRemove() {
    await Promise.all(
      [
        runRemoveSourceMaps(),
        runRemoveTypeDefinitions(),
        runRemoveTypeScriptArtifacts(),
      ],
    );
  }

  async function runOptimize() {
    await Promise.all(
      [
        runOptimizeJs(),
        runOptimizeCss(),
        runOptimizeSvg(),
        runOptimizeHtml(),
      ],
    );
  }

  async function runObfuscate() {
    await runObfuscateJs();
  }

  const mergedOptions = {
    remove: {
      sourceMaps: options?.remove?.sourceMaps ?? OPTIONS.remove.sourceMaps,
      typeDefinitions: options?.remove?.typeDefinitions ?? OPTIONS.remove.typeDefinitions,
      typeScriptArtifacts: options?.remove?.typeScriptArtifacts ?? OPTIONS.remove.typeScriptArtifacts,
    },
    optimize: {
      js: {
        enabled: options?.optimize?.js?.enabled ?? OPTIONS.optimize.js.enabled,
        options: options?.optimize?.js?.options ?? OPTIONS.optimize.js.options,
      },
      css: {
        enabled: options?.optimize?.css?.enabled ?? OPTIONS.optimize.css.enabled,
        options: options?.optimize?.css?.options ?? OPTIONS.optimize.css.options,
      },
      svg: {
        enabled: options?.optimize?.svg?.enabled ?? OPTIONS.optimize.svg.enabled,
        options: options?.optimize?.svg?.options ?? OPTIONS.optimize.svg.options,
      },
      html: {
        enabled: options?.optimize?.html?.enabled ?? OPTIONS.optimize.html.enabled,
        options: options?.optimize?.html?.options ?? OPTIONS.optimize.html.options,
      },
    },
    obfuscate: {
      js: {
        enabled: options?.obfuscate?.js?.enabled ?? OPTIONS.obfuscate.js.enabled,
        options: options?.obfuscate?.js?.options ?? OPTIONS.obfuscate.js.options,
      },
    },
  };

  await runObfuscate();
  await runOptimize();
  await runRemove();
}

module.exports = {
  optimus,
};
