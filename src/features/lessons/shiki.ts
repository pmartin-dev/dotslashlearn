import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";

import jsLang from "shiki/langs/javascript.mjs";
import tsLang from "shiki/langs/typescript.mjs";
import jsxLang from "shiki/langs/jsx.mjs";
import tsxLang from "shiki/langs/tsx.mjs";
import bashLang from "shiki/langs/bash.mjs";
import pythonLang from "shiki/langs/python.mjs";
import rubyLang from "shiki/langs/ruby.mjs";
import rustLang from "shiki/langs/rust.mjs";
import yamlLang from "shiki/langs/yaml.mjs";
import markdownLang from "shiki/langs/markdown.mjs";
import jsonLang from "shiki/langs/json.mjs";
import httpLang from "shiki/langs/http.mjs";
import tokyoNight from "shiki/themes/tokyo-night.mjs";

const highlighter = createHighlighterCoreSync({
  themes: [tokyoNight],
  langs: [
    jsLang,
    tsLang,
    jsxLang,
    tsxLang,
    bashLang,
    pythonLang,
    rubyLang,
    rustLang,
    yamlLang,
    markdownLang,
    jsonLang,
    httpLang,
  ],
  engine: createJavaScriptRegexEngine(),
});

export const rehypeShikiConfig = [
  rehypeShikiFromHighlighter,
  highlighter,
  {
    theme: "tokyo-night",
    addLanguageClass: true,
  },
] as [typeof rehypeShikiFromHighlighter, typeof highlighter, Record<string, unknown>];
