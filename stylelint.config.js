module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
  rules: {
    // Overwrite stylelint-config-standard rules
    // ----------------------------------

    // Don't check if there is a whitespace after the function.
    // Style-lint can't distinguish less mixin or css function. Disable this check item directly here.
    'function-whitespace-after': null,
    // Require a leading zero for fractional numbers less than 1.
    'number-leading-zero': 'always',

    // Extended rules
    // - The most restrictive vendor-prefix limit is enabled, which is determined by the data of {@link https://caniuse.com}
    // ----------------------------------

    // Forbidden the at rule (eg: @keyframes ) to use the browser prefix.
    'at-rule-no-vendor-prefix': true,
    // fix less detached ruleset
    'at-rule-no-unknown': null,
    // Specify an allowed-list of attributes and units allowed in the declaration.
    'declaration-property-unit-allowed-list': {
      'font-size': ['px', 'em', '%'],
      '/^animation/': ['s']
    },
    // Forbidden @media  use the browser prefix.
    'media-feature-name-no-vendor-prefix': true,
    // Limit the depth of nesting allowed.
    'max-nesting-depth': 5,
    // Don't forbidden low specificity selectors from appearing after high specificity selectors.
    // [Specificity description]{@link https://www.w3.org/TR/css3-selectors/#specificity}
    'no-descending-specificity': null,
    // Class selector naming rules use kebab-case. eg: .class-name
    // FIXME: this regex covers LESS parametric mixin definitions
    //        which was supposed to be ignored from this rule by stylelint
    //        @see https://github.com/stylelint/stylelint/issues/5258
    'selector-class-pattern': '^[a-z0-9]+(-?[a-z0-9]+)*(\\(.*\\))?$',
    // ID selector naming rules use camel case , excepted `icon-`. eg: #loginButton,#icon-login
    'selector-id-pattern': '^([a-z]+([A-Z][a-z]+)?)||(icon-([a-z-]+))$',
    // Forbidden use the browser prefix.
    'property-no-vendor-prefix': true,
    'selector-no-vendor-prefix': true,
    'value-no-vendor-prefix': true,
    // Limit the number of composite selectors in a selector.
    // TODO consider narrowing this limit
    'selector-max-compound-selectors': 6,
    // Limit the number of ID selectors in a selector.
    'selector-max-id': 1,
    // Limit the number of universal selectors in a selector.
    'selector-max-universal': 1,
    // Specify an allowed-list of allowed pseudo-class selectors.(Only use pseudo-classes supported by IE10+ browsers)
    // [CSS selector browser support]{@link https://labs.qianduan.net/css-selector/}
    'selector-pseudo-class-allowed-list': [
      // CSS 1
      'active',
      'link',
      'visited',
      // CSS 2.1
      'first-child',
      'focus',
      'hover',
      // CSS 3
      'checked',
      'disabled',
      'enabled',
      'empty',
      'first-of-type',
      'indeterminate',
      'last-child',
      'last-of-type',
      'not',
      'nth-child',
      'nth-last-child',
      'nth-of-type',
      'nth-last-of-type',
      'only-child',
      'only-of-type',
      'root',
      'target',
      // Level 4 (including Working Drafts)
      'focus-within',
      'focus-visible'
    ],
    // String using single quotes
    'string-quotes': 'single',
    'declaration-colon-newline-after': null,
    'value-list-comma-newline-after': 'always-multi-line',
    // font-family can contain uppercase letters
    // @see https://github.com/stylelint/stylelint/issues/4622#issuecomment-594641799
    'value-keyword-case': [
      'lower',
      {
        ignoreKeywords: ['BlinkMacSystemFont']
      }
    ]
  }
};
