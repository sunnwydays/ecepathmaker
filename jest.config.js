
export default {
    testEnvironment: "jsdom",
    transform: {
      "^.+\\.tsx?$": "ts-jest",
    },
  
    moduleNameMapper: {
      "\\.(css|less|sass|scss)$": "identity-obj-proxy",
      "^.+\\.svg$": "jest-transformer-svg",
      "@vercel/analytics/react": "<rootDir>/src/__mocks__/@vercel/analytics/react.ts",
      "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/src/__mocks__/fileMock.ts",
    },

    transformIgnorePatterns: [
      "/node_modules/(?!(@vercel/analytics)/)"
    ],
  
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  };