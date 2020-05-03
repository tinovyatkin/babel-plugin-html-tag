module.exports = {
  verbose: true,
  testEnvironment: "node",
  collectCoverage: true,
  coverageProvider: process.version > "v10." ? "v8" : "babel",
  coverageReporters: ["json", "text"],
};
