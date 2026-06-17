"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
var init_1 = require("../init");
var forms_1 = require("./forms");
var responses_1 = require("./responses");
var analytics_1 = require("./analytics");
var templates_1 = require("./templates");
var formVerisons_1 = require("./formVerisons");
var share_1 = require("./share");
exports.appRouter = (0, init_1.createTRPCRouter)({
    forms: forms_1.formsRouter,
    responses: responses_1.responsesRouter,
    analytics: analytics_1.analyticsRouter,
    templates: templates_1.templatesRouter,
    formVersions: formVerisons_1.formVersionsRouter,
    share: share_1.shareRouter,
});
