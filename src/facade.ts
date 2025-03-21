import { CompressOptions as CssoCompressOptions, MinifyOptions as CssoMinifyOptions, minify as csso } from 'csso';
import htmlMinifier, { Options as OptimizeHtmlOptions } from 'html-minifier';
import javascriptObfuscator, { ObfuscatorOptions as ObfuscateJsOptions } from 'javascript-obfuscator';
import svgo, { Config as OptimizeSvgOptions } from 'svgo';
import { MinifyOptions as OptimizeJsOptions, minify as terser } from 'terser';

type OptimizeCssOptions = CssoCompressOptions & CssoMinifyOptions;

interface Options<T> {
  readonly enabled: boolean;
  readonly options: T;
}

interface OptimizeOptions {
  readonly js: Options<OptimizeJsOptions>;
  readonly css: Options<OptimizeCssOptions>;
  readonly svg: Options<OptimizeSvgOptions>;
  readonly html: Options<OptimizeHtmlOptions>;
}

interface ObfuscateOptions {
  readonly js: Options<ObfuscateJsOptions>;
}

export interface OptimusOptions {
  readonly name: string;
  readonly remove: string[];
  readonly optimize: OptimizeOptions;
  readonly obfuscate: ObfuscateOptions;
}

export interface PartialOptimusOptions {
  readonly name?: string;
  readonly remove?: string[];
  readonly optimize?: Partial<OptimizeOptions>;
  readonly obfuscate?: Partial<ObfuscateOptions>;
}

export namespace Optimize {
  export async function js(content: string, options: OptimizeJsOptions): Promise<string> {
    return (await terser(content, options)).code ?? '';
  }

  export function json(content: string): string {
    return JSON.stringify(JSON.parse(content));
  }

  export function css(content: string, options: OptimizeCssOptions): string {
    return csso(content, options).css;
  }

  export function svg(content: string, options: OptimizeSvgOptions): string {
    return svgo.optimize(content, options).data;
  }

  export function html(content: string, options: OptimizeHtmlOptions): string {
    return htmlMinifier.minify(content, options);
  }
}

export namespace Obfuscate {
  export function js(content: string, options: ObfuscateJsOptions, i: number): string {
    const mergedOptions: ObfuscateJsOptions = {
      ...options,
      identifiersPrefix: `_${i}`,
    };

    return javascriptObfuscator.obfuscate(content, mergedOptions).getObfuscatedCode();
  }
}
