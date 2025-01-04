import swaggerAutogen from "swagger-autogen";

swaggerAutogen();

const doc = {
  info: {
    version: "1.0.0",
    title: "Rest-API",
  },
  host: "localhost:3000",
};

const outputFile = "../swagger.json";
const endpointsFiles = ["../src/routes/index.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
