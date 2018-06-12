const _ = require('lodash');
const { promisify } = require('util');
const path = require('path');
const makeDir = require('make-dir');
const glob = promisify(require('glob'));
const writeFile = promisify(require('fs').writeFile);
const readFile = _.partial(promisify(require('fs').readFile), _, 'utf-8');

const STYLE_INPUT_DIR = './styles';
const MAIN_JS_PATH = './src/index.js';
const OUTPUT_DIR = './lib/styles';
// Base styles for every component.
const CORE_FILE_NAME = 'core.less';

const IMPORT_FILE_CONFIG = {
  'col': ['grid.less'],
  'control-label': ['form.less'],
  'cascader': ['picker.less', 'cascader.less'],
  'checkbox': ['form.less', 'checkbox.less'],
  'check-picker': ['picker.less', 'check-picker.less'],
  'check-tree': ['picker.less', 'check-tree-picker.less'],
  'check-tree-picker': ['picker.less', 'check-tree-picker.less'],
  'date-picker': ['picker.less', 'date-picker.less'],
  'date-range-picker': ['picker.less', 'date-range-picker.less'],
  'error-message': ['form.less'],
  'panel-group': ['panel.less'],
  'form-control': ['form.less'],
  'form-group': ['form.less'],
  'help-block': ['form.less', 'help-block.less'],
  'icon-button': ['button.less'],
  // @deprecated It's not recommended to use it , Compatible with old version.
  'icon-font': ['icon.less'],
  'input': ['form.less'],
  'input-group': ['form.less', 'input-group.less'],
  'input-number': ['form.less', 'input-number.less'],
  'navbar': ['nav.less', 'navbar.less'],
  'row': ['grid.less'],
  'radio': ['form.less', 'radio.less'],
  'table': ['table.less', 'table-pagination.less'],
  'select-picker': ['picker.less', 'select-picker.less'],
  'tree': ['picker.less', 'tree-picker.less'],
  'tree-picker': ['picker.less', 'tree-picker.less']
};

const getImportContent = (files) => {
  if (files.length === 0) {
    return '// It is generate by script.';
  }
  return files.map(fileName => `require('../../styles/${fileName}');`).join('\n');
};

const matchAll = (string, regex) => {
  const matches = [];
  let match = null;
  while (match = regex.exec(string)) {
    matches.push(match);
  }
  return matches;
};

// Consistent with {@link https://github.com/rsuite/babel-preset-rsuite | babel-preset-rsuite}.
const kebabCase = string => string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

const resolveLessBaseName = _.partial(path.basename, _, '.less');
(async function() {
  await makeDir(OUTPUT_DIR);
  // Don't match the file name begin with "_".
  const styleFiles = await glob(`${STYLE_INPUT_DIR}/!(_)*.less`);
  const styleNames = styleFiles.map(resolveLessBaseName);
  const jsContent = await readFile(MAIN_JS_PATH);
  const jsFileNames = matchAll(jsContent, /export\s+(\w+)\s+from/ig).map(match => kebabCase(match[1]));
  const uselessBaseName = _.difference(jsFileNames, styleNames);
  for (const baseName of jsFileNames) {
    const outputPath = `${OUTPUT_DIR}/${baseName}.js`;
    const useless = uselessBaseName.includes(baseName);
    const importFiles = _.get(IMPORT_FILE_CONFIG, baseName, useless ? [] : [`${baseName}.less`]);
    if (!_.isEmpty(importFiles)) {
      importFiles.unshift(CORE_FILE_NAME)
    }
    const err = await writeFile(outputPath, getImportContent(importFiles));
    console.log(`Generate file ${outputPath} ${err ? 'failed' : 'finished'}.`);
  }
  console.log(`Total: ${jsFileNames.length}`);
})();
