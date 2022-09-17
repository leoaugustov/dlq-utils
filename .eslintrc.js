module.exports = {
    "env": {
      "es2021": true,
      "node": true
    },
    "extends": [
      "eslint:recommended",
      "plugin:prettier/recommended",
    ],
    "overrides": [
    ],
    "parserOptions": {
      "ecmaVersion": "latest",
      "sourceType": "module"
    },
    "rules": {
      "function-call-argument-newline": ["error", "consistent"],
      "prettier/prettier": [
        "error",
        {
          printWidth: 120,
        },
      ],
    }
}
