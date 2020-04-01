module.exports = {
  "parser": "babel-eslint",
  "extends": "airbnb",
  "plugins": ["compat"],
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "mocha": true,
    "jest": true,
    "jasmine": true
  },
  "rules": {
    "generator-star-spacing": [0],
    "consistent-return": [0],
    "react/forbid-prop-types": [0],
    "react/jsx-filename-extension": [1, { "extensions": [".js"] }],
    "global-require": [1],
    "import/prefer-default-export": [0],
    "react/jsx-no-bind": [0],
    "react/prop-types": [0],
    "react/prefer-stateless-function": [0],
    "no-else-return": [0],
    "no-restricted-syntax": [0],
    "import/no-extraneous-dependencies": [0],
    "no-use-before-define": [0],
    "jsx-a11y/no-static-element-interactions": [0],
    "jsx-a11y/no-noninteractive-element-interactions": [0],
    "jsx-a11y/click-events-have-key-events": [0],
    "jsx-a11y/anchor-is-valid": [0],
    "no-nested-ternary": [0],
    "arrow-body-style": [0],
    "import/extensions": [0],
    "no-bitwise": [0],
    "no-cond-assign": [0],
    "import/no-unresolved": [0],
    "comma-dangle": ["error", {
      "arrays": "always-multiline",
      "objects": "always-multiline",
      "imports": "always-multiline",
      "exports": "always-multiline",
      "functions": "ignore"
    }],
    "object-curly-newline": [0],
    "function-paren-newline": [0],
    "no-restricted-globals": [0],
    "require-yield": [1],
    "no-param-reassign": [1],
    "no-plusplus": [0],
    "no-continue": [0],
    "no-prototype-builtins": [0],
    "one-var": [0],
    "one-var-declaration-per-line": [0],
    "no-trailing-spaces": [0],
    "linebreak-style": [0],
    "wrap-iife": [1],
    "no-unused-expressions": [1],
    "array-callback-return": [1],
    "arrow-parens": [0],
    "class-methods-use-this": [0],
    "no-mixed-operators": [1],
    "no-multiple-empty-lines": [1],
    "react/sort-comp": [0],
    "object-curly-spacing": ["error", "always", { "arraysInObjects": false }],
    "prefer-destructuring": ["error", {
      "array": true,
      "object": false
    }, {
      "enforceForRenamedProperties": false
    }],
    "import/no-mutable-exports": [0]
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true,
      "experimentalObjectRestSpread": true
    }
  },
  "settings": {
    "polyfills": ["fetch"]
  }
};
