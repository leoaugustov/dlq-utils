const INTEGRATION_TESTS_TYPE = 'integration';

const createProject = (type) => {
  let config = {
    displayName: type,
    verbose: true,
    clearMocks: true,
    transformIgnorePatterns: [
      "/node_modules/(?!(tempy|fs|unique-string|crypto-random-string|is-stream)/)"
    ],
  };

  if (type === INTEGRATION_TESTS_TYPE) {
    config.setupFilesAfterEnv = [
      "jest-extended/all",
      "<rootDir>/test/integration/utils/helpers.js"
    ];
    config.testRegex = "/integration/";
    config.testPathIgnorePatterns = ["/integration/utils"];
  } else {
    config.setupFilesAfterEnv = [
      "jest-extended/all"
    ];
    config.testPathIgnorePatterns = ["/integration/"];
  }
  return config;
};

module.exports = {
  projects: [
    createProject('unit'),
    createProject(INTEGRATION_TESTS_TYPE)
  ]
};
