"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.responsesRouter = void 0;
var init_1 = require("../init");
var zod_1 = require("zod");
var db_1 = require("@formforge/db");
var drizzle_orm_1 = require("drizzle-orm");
var server_1 = require("@trpc/server");
var email_1 = require("../../services/email");
exports.responsesRouter = (0, init_1.createTRPCRouter)({
    /**
     * @name submit
     * @description submits a form (public route - no auth required)
     * @public
     * @input formId, formVersionId, sessionId, answers, meta
     * @returns Submission
     */
    submit: init_1.baseProcedure
        .meta({ openapi: { method: "POST", path: "/responses/submit", tags: ["Responses"], summary: "Submit a form response" } })
        .input(zod_1.z.object({
        formId: zod_1.z.string(),
        formVersionId: zod_1.z.string(),
        sessionId: zod_1.z.string().optional(),
        answers: zod_1.z.array(zod_1.z.object({
            fieldKey: zod_1.z.string(),
            value: zod_1.z.any(),
        })),
        meta: zod_1.z.object({
            ip: zod_1.z.string().optional(),
            userAgent: zod_1.z.string().optional(),
            country: zod_1.z.string().optional(),
            lat: zod_1.z.number().optional(),
            lng: zod_1.z.number().optional(),
            completionTime: zod_1.z.number().optional(),
            device: zod_1.z.enum(["desktop", "mobile", "tablet"]).optional(),
            browser: zod_1.z.string().optional(),
            os: zod_1.z.string().optional(),
        }).optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, settings, ip, existingByIp, existingBySession, formVersion, newSubmission_1, formOwner, totalSubmissionsQuery, emailErr_1, err_1;
        var _c, _d, _e, _f, _g;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _h.trys.push([0, 16, , 17]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.forms)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, input.formId), (0, drizzle_orm_1.eq)(db_1.forms.status, "published")))
                            .limit(1)];
                case 1:
                    form = _h.sent();
                    if (!form[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found or not published" });
                    }
                    settings = (_c = form[0].settings) !== null && _c !== void 0 ? _c : {};
                    if (settings.isActive === false) {
                        throw new server_1.TRPCError({
                            code: "FORBIDDEN",
                            message: "This form is currently deactivated",
                        });
                    }
                    if (settings.activateAt && new Date() < new Date(settings.activateAt)) {
                        throw new server_1.TRPCError({
                            code: "FORBIDDEN",
                            message: "This form opens on ".concat(new Date(settings.activateAt).toLocaleString()),
                        });
                    }
                    if (settings.deactivateAt && new Date() > new Date(settings.deactivateAt)) {
                        throw new server_1.TRPCError({
                            code: "FORBIDDEN",
                            message: "This form has closed",
                        });
                    }
                    if (!(settings.allowMultipleSubmissions === false)) return [3 /*break*/, 5];
                    ip = (_e = (_d = input.meta) === null || _d === void 0 ? void 0 : _d.ip) !== null && _e !== void 0 ? _e : "unknown";
                    if (!(ip !== "unknown")) return [3 /*break*/, 3];
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.submissions.formId, input.formId), (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["meta->>'ip' = ", ""], ["meta->>'ip' = ", ""])), ip)))
                            .limit(1)];
                case 2:
                    existingByIp = _h.sent();
                    if (existingByIp[0]) {
                        throw new server_1.TRPCError({
                            code: "CONFLICT",
                            message: "You have already submitted this form",
                        });
                    }
                    _h.label = 3;
                case 3:
                    if (!input.sessionId) return [3 /*break*/, 5];
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.submissions.formId, input.formId), (0, drizzle_orm_1.eq)(db_1.submissions.sessionId, input.sessionId)))
                            .limit(1)];
                case 4:
                    existingBySession = _h.sent();
                    if (existingBySession[0]) {
                        throw new server_1.TRPCError({
                            code: "CONFLICT",
                            message: "You have already submitted this form",
                        });
                    }
                    _h.label = 5;
                case 5: return [4 /*yield*/, ctx.db
                        .select()
                        .from(db_1.formVersions)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.formVersions.id, input.formVersionId), (0, drizzle_orm_1.eq)(db_1.formVersions.formId, input.formId)))
                        .limit(1)];
                case 6:
                    formVersion = _h.sent();
                    if (!formVersion[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form version not found" });
                    }
                    return [4 /*yield*/, ctx.db
                            .insert(db_1.submissions)
                            .values({
                            formId: input.formId,
                            formVersionId: input.formVersionId,
                            sessionId: input.sessionId,
                            meta: input.meta,
                        })
                            .returning()];
                case 7:
                    newSubmission_1 = _h.sent();
                    if (!(input.answers.length > 0 && newSubmission_1[0])) return [3 /*break*/, 9];
                    return [4 /*yield*/, ctx.db.insert(db_1.submissionAnswers).values(input.answers.map(function (answer) { return ({
                            submissionId: newSubmission_1[0].id,
                            fieldKey: answer.fieldKey,
                            value: answer.value,
                        }); }))];
                case 8:
                    _h.sent();
                    _h.label = 9;
                case 9:
                    _h.trys.push([9, 14, , 15]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.users)
                            .where((0, drizzle_orm_1.eq)(db_1.users.id, form[0].userId))
                            .limit(1)];
                case 10:
                    formOwner = _h.sent();
                    return [4 /*yield*/, ctx.db
                            .select({ count: (0, drizzle_orm_1.count)() })
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.eq)(db_1.submissions.formId, form[0].id))];
                case 11:
                    totalSubmissionsQuery = _h.sent();
                    if (!(((_f = formOwner[0]) === null || _f === void 0 ? void 0 : _f.email) && newSubmission_1[0])) return [3 /*break*/, 13];
                    return [4 /*yield*/, (0, email_1.sendSubmissionEmail)({
                            formOwnerEmail: formOwner[0].email,
                            formOwnerName: formOwner[0].name,
                            formId: form[0].id,
                            formName: form[0].name,
                            submissionId: newSubmission_1[0].id,
                            answers: input.answers,
                            submittedAt: new Date(),
                            totalResponses: ((_g = totalSubmissionsQuery[0]) === null || _g === void 0 ? void 0 : _g.count) || 1,
                        })];
                case 12:
                    _h.sent();
                    _h.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    emailErr_1 = _h.sent();
                    console.error("Email notification failed:", emailErr_1);
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/, newSubmission_1[0]];
                case 16:
                    err_1 = _h.sent();
                    if (err_1 instanceof server_1.TRPCError)
                        throw err_1;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to submit form" });
                case 17: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name checkDuplicate
     * @description Checks if a specific IP or session has already submitted the form
     */
    checkDuplicate: init_1.baseProcedure
        .input(zod_1.z.object({ formId: zod_1.z.string(), ip: zod_1.z.string(), sessionId: zod_1.z.string().optional() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var existingByIp, existingBySession;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(input.ip !== "unknown")) return [3 /*break*/, 2];
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.submissions.formId, input.formId), (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["meta->>'ip' = ", ""], ["meta->>'ip' = ", ""])), input.ip)))
                            .limit(1)];
                case 1:
                    existingByIp = _c.sent();
                    if (existingByIp[0])
                        return [2 /*return*/, { hasSubmitted: true }];
                    _c.label = 2;
                case 2:
                    if (!input.sessionId) return [3 /*break*/, 4];
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.submissions.formId, input.formId), (0, drizzle_orm_1.eq)(db_1.submissions.sessionId, input.sessionId)))
                            .limit(1)];
                case 3:
                    existingBySession = _c.sent();
                    if (existingBySession[0])
                        return [2 /*return*/, { hasSubmitted: true }];
                    _c.label = 4;
                case 4: return [2 /*return*/, { hasSubmitted: false }];
            }
        });
    }); }),
    /**
     * @name getAll
     * @description gets all submissions for a form
     * @protected
     * @input formId
     * @returns Submission[]
     */
    getAll: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/responses/{formId}", tags: ["Responses"], summary: "Get all responses for a form", protect: true } })
        .input(zod_1.z.object({ formId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, err_2;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.forms)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, input.formId), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId)))
                            .limit(1)];
                case 1:
                    form = _c.sent();
                    if (!form[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    }
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.eq)(db_1.submissions.formId, input.formId))
                            .orderBy((0, drizzle_orm_1.desc)(db_1.submissions.submittedAt))];
                case 2: return [2 /*return*/, _c.sent()];
                case 3:
                    err_2 = _c.sent();
                    if (err_2 instanceof server_1.TRPCError)
                        throw err_2;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch submissions" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name getById
     * @description gets a single submission with all answers
     * @protected
     * @input id
     * @returns Submission + Answers
     */
    getById: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/responses/single/{id}", tags: ["Responses"], summary: "Get single response with answers", protect: true } })
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var submission, form, answers, err_3;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.eq)(db_1.submissions.id, input.id))
                            .limit(1)];
                case 1:
                    submission = _c.sent();
                    if (!submission[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Submission not found" });
                    }
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.forms)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, submission[0].formId), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId)))
                            .limit(1)];
                case 2:
                    form = _c.sent();
                    if (!form[0]) {
                        throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Not authorized to view this submission" });
                    }
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.submissionAnswers)
                            .where((0, drizzle_orm_1.eq)(db_1.submissionAnswers.submissionId, input.id))];
                case 3:
                    answers = _c.sent();
                    return [2 /*return*/, __assign(__assign({}, submission[0]), { answers: answers })];
                case 4:
                    err_3 = _c.sent();
                    if (err_3 instanceof server_1.TRPCError)
                        throw err_3;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch submission" });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name exportCSV
     * @description exports all submissions of a form as CSV string
     * @protected
     * @input formId
     * @returns { csv: string }
     */
    exportCSV: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/responses/{formId}/export", tags: ["Responses"], summary: "Export responses as CSV", protect: true } })
        .input(zod_1.z.object({ formId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, allSubmissions, allAnswers, allAnswersForAll_1, fieldKeys_1, headers, rows, csv, err_4;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.forms)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, input.formId), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId)))
                            .limit(1)];
                case 1:
                    form = _c.sent();
                    if (!form[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    }
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.eq)(db_1.submissions.formId, input.formId))
                            .orderBy((0, drizzle_orm_1.desc)(db_1.submissions.submittedAt))];
                case 2:
                    allSubmissions = _c.sent();
                    if (allSubmissions.length === 0) {
                        return [2 /*return*/, { csv: "" }];
                    }
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.submissionAnswers)
                            .where((0, drizzle_orm_1.eq)(db_1.submissionAnswers.submissionId, allSubmissions[0].id))];
                case 3:
                    allAnswers = _c.sent();
                    return [4 /*yield*/, Promise.all(allSubmissions.map(function (sub) {
                            return ctx.db
                                .select()
                                .from(db_1.submissionAnswers)
                                .where((0, drizzle_orm_1.eq)(db_1.submissionAnswers.submissionId, sub.id));
                        }))];
                case 4:
                    allAnswersForAll_1 = _c.sent();
                    fieldKeys_1 = __spreadArray([], new Set(allAnswersForAll_1.flat().map(function (a) { return a.fieldKey; })), true);
                    headers = __spreadArray(["id", "submittedAt", "sessionId"], fieldKeys_1, true);
                    rows = allSubmissions.map(function (sub, i) {
                        var _a, _b;
                        var answers = allAnswersForAll_1[i];
                        if (!answers) {
                            throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Answers not found" });
                        }
                        var answerMap = Object.fromEntries(answers.map(function (a) { return [a.fieldKey, a.value]; }));
                        return __spreadArray([
                            sub.id,
                            (_a = sub.submittedAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                            (_b = sub.sessionId) !== null && _b !== void 0 ? _b : ""
                        ], fieldKeys_1.map(function (key) { var _a; return (_a = answerMap[key]) !== null && _a !== void 0 ? _a : ""; }), true).map(function (v) { return "\"".concat(String(v).replace(/"/g, '""'), "\""); })
                            .join(",");
                    });
                    csv = __spreadArray([headers.join(",")], rows, true).join("\n");
                    return [2 /*return*/, { csv: csv }];
                case 5:
                    err_4 = _c.sent();
                    if (err_4 instanceof server_1.TRPCError)
                        throw err_4;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to export submissions" });
                case 6: return [2 /*return*/];
            }
        });
    }); }),
});
var templateObject_1, templateObject_2;
