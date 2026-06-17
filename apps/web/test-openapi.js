"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var trpc_openapi_1 = require("trpc-openapi");
var _app_1 = require("./src/trpc/routers/_app");
try {
    var document_1 = (0, trpc_openapi_1.generateOpenApiDocument)(_app_1.appRouter, {
        title: "FormForge API",
        version: "1.0.0",
        baseUrl: "http://localhost:3000/api/rest",
        description: "The FormForge REST API",
        tags: ["Forms"],
    });
    console.log("Success! Generated document with keys:", Object.keys(document_1));
}
catch (e) {
    console.error("Failed to generate OpenAPI Document:");
    console.error(e.message);
    if (e.errors) {
        console.error(e.errors);
    }
}
