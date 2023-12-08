import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'node:path';
import { OptimusOptions, PartialOptimusOptions, obfuscate, optimize } from './facade.js';

export const OPTIONS_MOBILE: OptimusOptions = {
  name: 'mobile',
  remove: [
    '*.map',
    '*.d.ts',
    '*.tsbuildinfo',
  ],
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
          {
            name: 'preset-default',
            params: {
              overrides: {
                cleanupAttrs: false,
                cleanupEnableBackground: false,
                cleanupIds: false,
                cleanupNumericValues: false,
                convertColors: false,
                convertEllipseToCircle: false,
                convertPathData: false,
                convertShapeToPath: false,
                mergePaths: false,
                removeTitle: false,
                removeUnknownsAndDefaults: false,
                removeUselessStrokeAndFill: false,
                removeViewBox: false,
                removeXMLProcInst: false,
              },
            },
          },
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

export const OPTIONS_SERVER: OptimusOptions = {
  name: 'server',
  remove: [
    '*.coffee',
    '*.jst',
    '*.markdown',
    '*.md',
    '*.mkd',
    '*.swp',
    '*.tgz',
    '*.ts',
    '*.tsbuildinfo',
    '.*ignore',
    '.DS_Store',
    '.appveyor.yml',
    '.babelrc',
    '.circleci',
    '.coveralls.yml',
    '.documentup.json',
    '.editorconfig',
    '.eslintignore',
    '.eslintrc',
    '.eslintrc.js',
    '.eslintrc.json',
    '.eslintrc.yml',
    '.flowconfig',
    '.gitattributes',
    '.github',
    '.gitlab-ci.yml',
    '.htmllintrc',
    '.idea',
    '.jshintrc',
    '.lint',
    '.npmignore',
    '.npmrc',
    '.nyc_output',
    '.prettierrc',
    '.prettierrc.js',
    '.prettierrc.json',
    '.prettierrc.toml',
    '.prettierrc.yml',
    '.stylelintrc',
    '.stylelintrc.js',
    '.stylelintrc.json',
    '.stylelintrc.yaml',
    '.stylelintrc.yml',
    '.tern-project',
    '.travis.yml',
    '.vscode',
    '.yarn-integrity',
    '.yarn-metadata.json',
    '.yarnclean',
    '.yo-rc.json',
    'AUTHORS',
    'CHANGES',
    'CONTRIBUTORS',
    'Gruntfile.js',
    'Gulpfile.js',
    'Jenkinsfile',
    'LICENCE',
    'LICENCE-MIT',
    'LICENCE.BSD',
    'LICENCE.txt',
    'LICENSE',
    'LICENSE-MIT',
    'LICENSE.BSD',
    'LICENSE.txt',
    'Makefile',
    '__tests__',
    '_config.yml',
    'appveyor.yml',
    'assets',
    'changelog',
    'circle.yml',
    'codeship-services.yml',
    'codeship-steps.yml',
    'coverage',
    'doc',
    'docs',
    'eslint',
    'example',
    'examples',
    'gulpfile.js',
    'htmllint.js',
    'images',
    'jest.config.js',
    'karma.conf.js',
    'licence',
    'license',
    'powered-test',
    'prettier.config.js',
    'stylelint.config.js',
    'test',
    'tests',
    'tsconfig.json',
    'tslint.json',
    'wallaby.conf.js',
    'wallaby.js',
    'website',
    'wercker.yml',
  ],
  optimize: {
    js: {
      enabled: false,
      options: {},
    },
    css: {
      enabled: false,
      options: {},
    },
    svg: {
      enabled: false,
      options: {},
    },
    html: {
      enabled: false,
      options: {},
    },
  },
  obfuscate: {
    js: {
      enabled: false,
      options: {},
    },
  },
};

export async function optimus(root: string, options?: PartialOptimusOptions): Promise<void> {
  async function collectNodes(name: string): Promise<string[]> {
    return await glob(path.join(root, '**', name));
  }

  async function removeEmpties(parent: string): Promise<void> {
    const stat = await fs.lstat(parent);

    if (stat.isDirectory()) {
      for (const node of await fs.readdir(parent)) {
        await removeEmpties(path.join(parent, node));
      }

      const nodes = await fs.readdir(parent);

      if (nodes.length === 0) {
        await fs.rmdir(parent);
      }
    }
  }

  async function removeNode(node: string): Promise<void> {
    await fs.remove(node);
  }

  async function removeNodes(nodes: string[]): Promise<void> {
    await Promise.all(nodes.map(removeNode));
  }

  async function removeNodesMatrix(matrix: string[][]): Promise<void> {
    await Promise.all(matrix.map(removeNodes));
  }

  async function transformFile(transformer: Function, options: object, file: string, i = 0): Promise<void> {
    const original = await fs.readFile(file, 'utf-8');
    const modified = await transformer(original, options, i);
    await fs.writeFile(file, modified);
  }

  async function optimizeJsFile(file: string): Promise<void> {
    await transformFile(optimize.js, mergedOptions.optimize.js.options, file);
  }

  async function optimizeJsonFile(file: string): Promise<void> {
    await transformFile(optimize.json, {}, file);
  }

  async function optimizeCssFile(file: string): Promise<void> {
    await transformFile(optimize.css, mergedOptions.optimize.css.options, file);
  }

  async function optimizeSvgFile(file: string): Promise<void> {
    await transformFile(optimize.svg, mergedOptions.optimize.svg.options, file);
  }

  async function optimizeHtmlFile(file: string): Promise<void> {
    await transformFile(optimize.html, mergedOptions.optimize.html.options, file);
  }

  async function obfuscateJsFile(file: string, i: number): Promise<void> {
    await transformFile(obfuscate.js, mergedOptions.obfuscate.js.options, file, i);
  }

  async function optimizeJsFiles(files: string[]): Promise<void> {
    await Promise.all(files.map(optimizeJsFile));
  }

  async function optimizeJsonFiles(files: string[]): Promise<void> {
    await Promise.all(files.map(optimizeJsonFile));
  }

  async function optimizeCssFiles(files: string[]): Promise<void> {
    await Promise.all(files.map(optimizeCssFile));
  }

  async function optimizeSvgFiles(files: string[]): Promise<void> {
    await Promise.all(files.map(optimizeSvgFile));
  }

  async function optimizeHtmlFiles(files: string[]): Promise<void> {
    await Promise.all(files.map(optimizeHtmlFile));
  }

  async function obfuscateJsFiles(files: string[]): Promise<void> {
    await Promise.all(files.map(obfuscateJsFile));
  }

  async function runOptimizeJs(): Promise<void> {
    if (mergedOptions.optimize.js.enabled) {
      await Promise.all(
        [
          collectNodes('*.{js,cjs,mjs}').then(optimizeJsFiles),
          collectNodes('*.{json,webmanifest}').then(optimizeJsonFiles),
        ],
      );
    }
  }

  async function runOptimizeCss(): Promise<void> {
    if (mergedOptions.optimize.css.enabled) {
      await collectNodes('*.css').then(optimizeCssFiles);
    }
  }

  async function runOptimizeSvg(): Promise<void> {
    if (mergedOptions.optimize.svg.enabled) {
      await collectNodes('*.svg').then(optimizeSvgFiles);
    }
  }

  async function runOptimizeHtml(): Promise<void> {
    if (mergedOptions.optimize.html.enabled) {
      await collectNodes('*.{htm,html}').then(optimizeHtmlFiles);
    }
  }

  async function runObfuscateJs(): Promise<void> {
    if (mergedOptions.obfuscate.js.enabled) {
      await collectNodes('*.{js,cjs,mjs}').then(obfuscateJsFiles);
    }
  }

  async function runClean(): Promise<void> {
    await removeEmpties(root);
  }

  async function runRemove(): Promise<void> {
    await Promise.all(mergedOptions.remove.map(collectNodes)).then(removeNodesMatrix);
  }

  async function runOptimize(): Promise<void> {
    await Promise.all(
      [
        runOptimizeJs(),
        runOptimizeCss(),
        runOptimizeSvg(),
        runOptimizeHtml(),
      ],
    );
  }

  async function runObfuscate(): Promise<void> {
    await runObfuscateJs();
  }

  function getDefaultOptions(name?: string): OptimusOptions {
    switch (name) {
      case OPTIONS_MOBILE.name:
        return OPTIONS_MOBILE;
      case OPTIONS_SERVER.name:
      default:
        return OPTIONS_SERVER;
    }
  }

  function getMergedOptions(): OptimusOptions {
    const defaultOptions = getDefaultOptions(options?.name);

    return {
      name: options?.name ?? defaultOptions.name,
      remove: options?.remove ?? defaultOptions.remove,
      optimize: {
        js: {
          enabled: options?.optimize?.js?.enabled ?? defaultOptions.optimize.js.enabled,
          options: options?.optimize?.js?.options ?? defaultOptions.optimize.js.options,
        },
        css: {
          enabled: options?.optimize?.css?.enabled ?? defaultOptions.optimize.css.enabled,
          options: options?.optimize?.css?.options ?? defaultOptions.optimize.css.options,
        },
        svg: {
          enabled: options?.optimize?.svg?.enabled ?? defaultOptions.optimize.svg.enabled,
          options: options?.optimize?.svg?.options ?? defaultOptions.optimize.svg.options,
        },
        html: {
          enabled: options?.optimize?.html?.enabled ?? defaultOptions.optimize.html.enabled,
          options: options?.optimize?.html?.options ?? defaultOptions.optimize.html.options,
        },
      },
      obfuscate: {
        js: {
          enabled: options?.obfuscate?.js?.enabled ?? defaultOptions.obfuscate.js.enabled,
          options: options?.obfuscate?.js?.options ?? defaultOptions.obfuscate.js.options,
        },
      },
    };
  }

  const mergedOptions = getMergedOptions();

  await runObfuscate();
  await runOptimize();
  await runRemove();
  await runClean();
}
