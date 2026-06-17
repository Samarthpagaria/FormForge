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
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
var init_1 = require("../init");
var zod_1 = require("zod");
var db_1 = require("@formforge/db");
var drizzle_orm_1 = require("drizzle-orm");
var server_1 = require("@trpc/server");
var eventTypes = zod_1.z.enum([
    "form_view",
    "form_start",
    "form_submit",
    "form_dropoff",
    "field_focus",
    "field_blur",
]);
exports.analyticsRouter = (0, init_1.createTRPCRouter)({
    /**
     * @name trackEvent
     * @description tracks a raw event (public - called from form page)
     * @public
     * @input formId, formVersionId, sessionId, event, metadata
     * @returns Event
     */
    trackEvent: init_1.baseProcedure
        .meta({ openapi: { method: "POST", path: "/analytics/track", tags: ["Analytics"], summary: "Track a form event" } })
        .input(zod_1.z.object({
        formId: zod_1.z.string(),
        formVersionId: zod_1.z.string().optional(),
        sessionId: zod_1.z.string().optional(),
        event: eventTypes,
        metadata: zod_1.z.object({
            fieldKey: zod_1.z.string().optional(),
            timeSpent: zod_1.z.number().optional(),
            device: zod_1.z.enum(["desktop", "mobile", "tablet"]).optional(),
            browser: zod_1.z.string().optional(),
            os: zod_1.z.string().optional(),
            country: zod_1.z.string().optional(),
        }).optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, newEvent, err_1;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.forms)
                            .where((0, drizzle_orm_1.eq)(db_1.forms.id, input.formId))
                            .limit(1)];
                case 1:
                    form = _c.sent();
                    if (!form[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    }
                    return [4 /*yield*/, ctx.db
                            .insert(db_1.events)
                            .values({
                            formId: input.formId,
                            formVersionId: input.formVersionId,
                            sessionId: input.sessionId,
                            event: input.event,
                            metadata: input.metadata,
                        })
                            .returning()];
                case 2:
                    newEvent = _c.sent();
                    return [2 /*return*/, newEvent[0]];
                case 3:
                    err_1 = _c.sent();
                    if (err_1 instanceof server_1.TRPCError)
                        throw err_1;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to track event" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name getSummary
     * @description gets summary metrics for a form
     * @protected
     * @input formId
     * @returns { views, starts, submissions, completionRate, avgTimeSpent }
     */
    getSummary: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/analytics/{formId}/summary", tags: ["Analytics"], summary: "Get analytics summary", protect: true } })
        .input(zod_1.z.object({ formId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, views, starts, submits, dropoffs, viewCount, startCount, submitCount, dropoffCount, completionRate, timeSpentResult, err_2;
        var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    _o.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.forms)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, input.formId), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId)))
                            .limit(1)];
                case 1:
                    form = _o.sent();
                    if (!form[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    }
                    return [4 /*yield*/, ctx.db
                            .select({ count: (0, drizzle_orm_1.count)() })
                            .from(db_1.events)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.events.formId, input.formId), (0, drizzle_orm_1.eq)(db_1.events.event, "form_view")))];
                case 2:
                    views = _o.sent();
                    return [4 /*yield*/, ctx.db
                            .select({ count: (0, drizzle_orm_1.count)() })
                            .from(db_1.events)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.events.formId, input.formId), (0, drizzle_orm_1.eq)(db_1.events.event, "form_start")))];
                case 3:
                    starts = _o.sent();
                    return [4 /*yield*/, ctx.db
                            .select({ count: (0, drizzle_orm_1.count)() })
                            .from(db_1.events)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.events.formId, input.formId), (0, drizzle_orm_1.eq)(db_1.events.event, "form_submit")))];
                case 4:
                    submits = _o.sent();
                    return [4 /*yield*/, ctx.db
                            .select({ count: (0, drizzle_orm_1.count)() })
                            .from(db_1.events)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.events.formId, input.formId), (0, drizzle_orm_1.eq)(db_1.events.event, "form_dropoff")))];
                case 5:
                    dropoffs = _o.sent();
                    viewCount = (_d = (_c = views[0]) === null || _c === void 0 ? void 0 : _c.count) !== null && _d !== void 0 ? _d : 0;
                    startCount = (_f = (_e = starts[0]) === null || _e === void 0 ? void 0 : _e.count) !== null && _f !== void 0 ? _f : 0;
                    submitCount = (_h = (_g = submits[0]) === null || _g === void 0 ? void 0 : _g.count) !== null && _h !== void 0 ? _h : 0;
                    dropoffCount = (_k = (_j = dropoffs[0]) === null || _j === void 0 ? void 0 : _j.count) !== null && _k !== void 0 ? _k : 0;
                    completionRate = startCount > 0
                        ? Math.round((submitCount / startCount) * 100)
                        : 0;
                    return [4 /*yield*/, ctx.db
                            .select({
                            avg: (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["avg((metadata->>'timeSpent')::numeric)"], ["avg((metadata->>'timeSpent')::numeric)"]))),
                        })
                            .from(db_1.events)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.events.formId, input.formId), (0, drizzle_orm_1.eq)(db_1.events.event, "form_submit")))];
                case 6:
                    timeSpentResult = _o.sent();
                    return [2 /*return*/, {
                            views: viewCount,
                            starts: startCount,
                            submissions: submitCount,
                            dropoffs: dropoffCount,
                            completionRate: completionRate,
                            avgTimeSpent: Math.round((_m = (_l = timeSpentResult[0]) === null || _l === void 0 ? void 0 : _l.avg) !== null && _m !== void 0 ? _m : 0),
                        }];
                case 7:
                    err_2 = _o.sent();
                    if (err_2 instanceof server_1.TRPCError)
                        throw err_2;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch summary" });
                case 8: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name getDropoffAnalysis
     * @description gets drop-off analysis per field
     * @protected
     * @input formId
     * @returns { fieldKey, dropoffs }[]
     */
    getDropoffAnalysis: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/analytics/{formId}/dropoff", tags: ["Analytics"], summary: "Get field dropoff analysis", protect: true } })
        .input(zod_1.z.object({ formId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, dropoffs, err_3;
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
                            .select({
                            fieldKey: (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["metadata->>'fieldKey'"], ["metadata->>'fieldKey'"]))),
                            count: (0, drizzle_orm_1.count)(),
                        })
                            .from(db_1.events)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.events.formId, input.formId), (0, drizzle_orm_1.eq)(db_1.events.event, "form_dropoff")))
                            .groupBy((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["metadata->>'fieldKey'"], ["metadata->>'fieldKey'"]))))];
                case 2:
                    dropoffs = _c.sent();
                    return [2 /*return*/, dropoffs];
                case 3:
                    err_3 = _c.sent();
                    if (err_3 instanceof server_1.TRPCError)
                        throw err_3;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch dropoff analysis" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name getDeviceStats
     * @description gets device breakdown for a form
     * @protected
     * @input formId
     * @returns { device, count }[]
     */
    getDeviceStats: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/analytics/{formId}/devices", tags: ["Analytics"], summary: "Get device breakdown", protect: true } })
        .input(zod_1.z.object({ formId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, deviceStats, err_4;
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
                            .select({
                            device: (0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["metadata->>'device'"], ["metadata->>'device'"]))),
                            count: (0, drizzle_orm_1.count)(),
                        })
                            .from(db_1.events)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.events.formId, input.formId), (0, drizzle_orm_1.eq)(db_1.events.event, "form_view")))
                            .groupBy((0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["metadata->>'device'"], ["metadata->>'device'"]))))];
                case 2:
                    deviceStats = _c.sent();
                    return [2 /*return*/, deviceStats];
                case 3:
                    err_4 = _c.sent();
                    if (err_4 instanceof server_1.TRPCError)
                        throw err_4;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch device stats" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name getRawEvents
     * @description gets raw events for a form
     * @protected
     * @input formId
     * @returns Event[]
     */
    getRawEvents: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/analytics/{formId}/events", tags: ["Analytics"], summary: "Get raw event log", protect: true } })
        .input(zod_1.z.object({ formId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, err_5;
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
                            .from(db_1.events)
                            .where((0, drizzle_orm_1.eq)(db_1.events.formId, input.formId))
                            .orderBy((0, drizzle_orm_1.desc)(db_1.events.timestamp))];
                case 2: return [2 /*return*/, _c.sent()];
                case 3:
                    err_5 = _c.sent();
                    if (err_5 instanceof server_1.TRPCError)
                        throw err_5;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch events" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // ─── GLOBAL STATS (across all user's forms) ───────────────────────────────
    getGlobalStats: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/analytics/global/stats", tags: ["Analytics"], summary: "Get global stats across all forms", protect: true } })
        .input(zod_1.z.object({ formIds: zod_1.z.array(zod_1.z.string()).optional() }).optional())
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var userForms, formIds, _c, subCount, viewCount, startCount, submitCount, timeResult, completionRate, err_6;
        var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_r) {
            switch (_r.label) {
                case 0:
                    _r.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.forms)
                            .where((0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId))];
                case 1:
                    userForms = _r.sent();
                    if (userForms.length === 0) {
                        return [2 /*return*/, {
                                totalForms: 0,
                                totalSubmissions: 0,
                                totalViews: 0,
                                completionRate: 0,
                                avgCompletionTime: 0,
                            }];
                    }
                    formIds = userForms.map(function (f) { return f.id; });
                    if ((input === null || input === void 0 ? void 0 : input.formIds) && input.formIds.length > 0) {
                        formIds = formIds.filter(function (id) { return input.formIds.includes(id); });
                    }
                    if (formIds.length === 0) {
                        return [2 /*return*/, { totalForms: 0, totalSubmissions: 0, totalViews: 0, completionRate: 0, avgCompletionTime: 0 }];
                    }
                    return [4 /*yield*/, Promise.all([
                            ctx.db.select({ count: (0, drizzle_orm_1.count)() }).from(db_1.submissions).where((0, drizzle_orm_1.inArray)(db_1.submissions.formId, formIds)),
                            ctx.db.select({ count: (0, drizzle_orm_1.count)() }).from(db_1.events).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(db_1.events.formId, formIds), (0, drizzle_orm_1.eq)(db_1.events.event, "form_view"))),
                            ctx.db.select({ count: (0, drizzle_orm_1.count)() }).from(db_1.events).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(db_1.events.formId, formIds), (0, drizzle_orm_1.eq)(db_1.events.event, "form_start"))),
                            ctx.db.select({ count: (0, drizzle_orm_1.count)() }).from(db_1.events).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(db_1.events.formId, formIds), (0, drizzle_orm_1.eq)(db_1.events.event, "form_submit"))),
                            ctx.db.select({ avg: (0, drizzle_orm_1.sql)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["avg((metadata->>'completionTime')::numeric)"], ["avg((metadata->>'completionTime')::numeric)"]))) }).from(db_1.events).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(db_1.events.formId, formIds), (0, drizzle_orm_1.eq)(db_1.events.event, "form_submit"))),
                        ])];
                case 2:
                    _c = _r.sent(), subCount = _c[0], viewCount = _c[1], startCount = _c[2], submitCount = _c[3], timeResult = _c[4];
                    completionRate = ((_e = (_d = startCount[0]) === null || _d === void 0 ? void 0 : _d.count) !== null && _e !== void 0 ? _e : 0) > 0
                        ? Math.round((((_g = (_f = submitCount[0]) === null || _f === void 0 ? void 0 : _f.count) !== null && _g !== void 0 ? _g : 0) / ((_j = (_h = startCount[0]) === null || _h === void 0 ? void 0 : _h.count) !== null && _j !== void 0 ? _j : 1)) * 100)
                        : 0;
                    return [2 /*return*/, {
                            totalForms: formIds.length,
                            totalSubmissions: (_l = (_k = subCount[0]) === null || _k === void 0 ? void 0 : _k.count) !== null && _l !== void 0 ? _l : 0,
                            totalViews: (_o = (_m = viewCount[0]) === null || _m === void 0 ? void 0 : _m.count) !== null && _o !== void 0 ? _o : 0,
                            completionRate: completionRate,
                            avgCompletionTime: Math.round((_q = (_p = timeResult[0]) === null || _p === void 0 ? void 0 : _p.avg) !== null && _q !== void 0 ? _q : 0),
                        }];
                case 3:
                    err_6 = _r.sent();
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch global stats" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // ─── GLOBAL SUBMISSIONS OVER TIME (last 30 days) ──────────────────────────
    getGlobalSubmissionsOverTime: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/analytics/global/submissions-over-time", tags: ["Analytics"], summary: "Get global submissions over time", protect: true } })
        .input(zod_1.z.object({ days: zod_1.z.number().default(30), formIds: zod_1.z.array(zod_1.z.string()).optional() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var userForms, formIds, startDate, data, err_7;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db.select({ id: db_1.forms.id }).from(db_1.forms).where((0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId))];
                case 1:
                    userForms = _c.sent();
                    if (userForms.length === 0)
                        return [2 /*return*/, []];
                    formIds = userForms.map(function (f) { return f.id; });
                    if (input.formIds && input.formIds.length > 0) {
                        formIds = formIds.filter(function (id) { return input.formIds.includes(id); });
                    }
                    if (formIds.length === 0)
                        return [2 /*return*/, []];
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - input.days);
                    return [4 /*yield*/, ctx.db
                            .select({
                            date: (0, drizzle_orm_1.sql)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["DATE(submitted_at)"], ["DATE(submitted_at)"]))),
                            count: (0, drizzle_orm_1.count)(),
                        })
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(db_1.submissions.formId, formIds), (0, drizzle_orm_1.gte)(db_1.submissions.submittedAt, startDate)))
                            .groupBy((0, drizzle_orm_1.sql)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["DATE(submitted_at)"], ["DATE(submitted_at)"]))))
                            .orderBy((0, drizzle_orm_1.sql)(templateObject_9 || (templateObject_9 = __makeTemplateObject(["DATE(submitted_at)"], ["DATE(submitted_at)"]))))];
                case 2:
                    data = _c.sent();
                    return [2 /*return*/, data];
                case 3:
                    err_7 = _c.sent();
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch submissions over time" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // ─── GLOBAL TOP PERFORMING FORMS ──────────────────────────────────────────
    getTopForms: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/analytics/global/top-forms", tags: ["Analytics"], summary: "Get top performing forms", protect: true } })
        .input(zod_1.z.object({ limit: zod_1.z.number().default(6) }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var userForms_1, formIds, topForms, err_8;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db.select().from(db_1.forms).where((0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId))];
                case 1:
                    userForms_1 = _c.sent();
                    if (userForms_1.length === 0)
                        return [2 /*return*/, []];
                    formIds = userForms_1.map(function (f) { return f.id; });
                    return [4 /*yield*/, ctx.db
                            .select({ formId: db_1.submissions.formId, count: (0, drizzle_orm_1.count)() })
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.inArray)(db_1.submissions.formId, formIds))
                            .groupBy(db_1.submissions.formId)
                            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.count)()))
                            .limit(input.limit)];
                case 2:
                    topForms = _c.sent();
                    return [2 /*return*/, topForms.map(function (f) {
                            var _a, _b;
                            return ({
                                formId: f.formId,
                                formName: (_b = (_a = userForms_1.find(function (form) { return form.id === f.formId; })) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "Unknown",
                                submissions: f.count,
                            });
                        })];
                case 3:
                    err_8 = _c.sent();
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch top forms" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // ─── GLOBAL DEVICE BREAKDOWN ──────────────────────────────────────────────
    getGlobalDeviceBreakdown: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/analytics/global/devices", tags: ["Analytics"], summary: "Get global device breakdown", protect: true } })
        .input(zod_1.z.object({ formIds: zod_1.z.array(zod_1.z.string()).optional() }).optional())
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var userForms, formIds, data, err_9;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db.select({ id: db_1.forms.id }).from(db_1.forms).where((0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId))];
                case 1:
                    userForms = _c.sent();
                    if (userForms.length === 0)
                        return [2 /*return*/, []];
                    formIds = userForms.map(function (f) { return f.id; });
                    if ((input === null || input === void 0 ? void 0 : input.formIds) && input.formIds.length > 0) {
                        formIds = formIds.filter(function (id) { return input.formIds.includes(id); });
                    }
                    if (formIds.length === 0)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, ctx.db
                            .select({
                            device: (0, drizzle_orm_1.sql)(templateObject_10 || (templateObject_10 = __makeTemplateObject(["metadata->>'device'"], ["metadata->>'device'"]))),
                            count: (0, drizzle_orm_1.count)(),
                        })
                            .from(db_1.events)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(db_1.events.formId, formIds), (0, drizzle_orm_1.eq)(db_1.events.event, "form_view")))
                            .groupBy((0, drizzle_orm_1.sql)(templateObject_11 || (templateObject_11 = __makeTemplateObject(["metadata->>'device'"], ["metadata->>'device'"]))))];
                case 2:
                    data = _c.sent();
                    return [2 /*return*/, data];
                case 3:
                    err_9 = _c.sent();
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch device breakdown" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // ─── GLOBAL WEEKLY ACTIVITY HEATMAP ───────────────────────────────────────
    getWeeklyActivityHeatmap: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/analytics/global/heatmap", tags: ["Analytics"], summary: "Get weekly activity heatmap", protect: true } })
        .input(zod_1.z.object({ formIds: zod_1.z.array(zod_1.z.string()).optional() }).optional())
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var userForms, formIds, ninetyDaysAgo, data, err_10;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db.select({ id: db_1.forms.id }).from(db_1.forms).where((0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId))];
                case 1:
                    userForms = _c.sent();
                    if (userForms.length === 0)
                        return [2 /*return*/, []];
                    formIds = userForms.map(function (f) { return f.id; });
                    if ((input === null || input === void 0 ? void 0 : input.formIds) && input.formIds.length > 0) {
                        formIds = formIds.filter(function (id) { return input.formIds.includes(id); });
                    }
                    if (formIds.length === 0)
                        return [2 /*return*/, []];
                    ninetyDaysAgo = new Date();
                    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                    return [4 /*yield*/, ctx.db
                            .select({
                            dayOfWeek: (0, drizzle_orm_1.sql)(templateObject_12 || (templateObject_12 = __makeTemplateObject(["EXTRACT(DOW FROM submitted_at)"], ["EXTRACT(DOW FROM submitted_at)"]))),
                            hour: (0, drizzle_orm_1.sql)(templateObject_13 || (templateObject_13 = __makeTemplateObject(["EXTRACT(HOUR FROM submitted_at)"], ["EXTRACT(HOUR FROM submitted_at)"]))),
                            count: (0, drizzle_orm_1.count)(),
                        })
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(db_1.submissions.formId, formIds), (0, drizzle_orm_1.gte)(db_1.submissions.submittedAt, ninetyDaysAgo)))
                            .groupBy((0, drizzle_orm_1.sql)(templateObject_14 || (templateObject_14 = __makeTemplateObject(["EXTRACT(DOW FROM submitted_at)"], ["EXTRACT(DOW FROM submitted_at)"]))), (0, drizzle_orm_1.sql)(templateObject_15 || (templateObject_15 = __makeTemplateObject(["EXTRACT(HOUR FROM submitted_at)"], ["EXTRACT(HOUR FROM submitted_at)"]))))];
                case 2:
                    data = _c.sent();
                    return [2 /*return*/, data];
                case 3:
                    err_10 = _c.sent();
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch heatmap data" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // ─── GLOBAL COMPLETION TIME DISTRIBUTION ──────────────────────────────────
    getCompletionTimeDistribution: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/analytics/global/completion-time", tags: ["Analytics"], summary: "Get completion time distribution", protect: true } })
        .input(zod_1.z.object({ formIds: zod_1.z.array(zod_1.z.string()).optional() }).optional())
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var userForms, formIds, data, err_11;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db.select({ id: db_1.forms.id }).from(db_1.forms).where((0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId))];
                case 1:
                    userForms = _c.sent();
                    if (userForms.length === 0)
                        return [2 /*return*/, []];
                    formIds = userForms.map(function (f) { return f.id; });
                    if ((input === null || input === void 0 ? void 0 : input.formIds) && input.formIds.length > 0) {
                        formIds = formIds.filter(function (id) { return input.formIds.includes(id); });
                    }
                    if (formIds.length === 0)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, ctx.db
                            .select({
                            bucket: (0, drizzle_orm_1.sql)(templateObject_16 || (templateObject_16 = __makeTemplateObject(["\n              CASE \n                WHEN (metadata->>'completionTime')::numeric < 30 THEN '0-30s'\n                WHEN (metadata->>'completionTime')::numeric < 60 THEN '30-60s'\n                WHEN (metadata->>'completionTime')::numeric < 120 THEN '1-2m'\n                WHEN (metadata->>'completionTime')::numeric < 300 THEN '2-5m'\n                ELSE '5m+'\n              END\n            "], ["\n              CASE \n                WHEN (metadata->>'completionTime')::numeric < 30 THEN '0-30s'\n                WHEN (metadata->>'completionTime')::numeric < 60 THEN '30-60s'\n                WHEN (metadata->>'completionTime')::numeric < 120 THEN '1-2m'\n                WHEN (metadata->>'completionTime')::numeric < 300 THEN '2-5m'\n                ELSE '5m+'\n              END\n            "]))),
                            count: (0, drizzle_orm_1.count)(),
                        })
                            .from(db_1.events)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(db_1.events.formId, formIds), (0, drizzle_orm_1.eq)(db_1.events.event, "form_submit")))
                            .groupBy((0, drizzle_orm_1.sql)(templateObject_17 || (templateObject_17 = __makeTemplateObject(["\n            CASE \n              WHEN (metadata->>'completionTime')::numeric < 30 THEN '0-30s'\n              WHEN (metadata->>'completionTime')::numeric < 60 THEN '30-60s'\n              WHEN (metadata->>'completionTime')::numeric < 120 THEN '1-2m'\n              WHEN (metadata->>'completionTime')::numeric < 300 THEN '2-5m'\n              ELSE '5m+'\n            END\n          "], ["\n            CASE \n              WHEN (metadata->>'completionTime')::numeric < 30 THEN '0-30s'\n              WHEN (metadata->>'completionTime')::numeric < 60 THEN '30-60s'\n              WHEN (metadata->>'completionTime')::numeric < 120 THEN '1-2m'\n              WHEN (metadata->>'completionTime')::numeric < 300 THEN '2-5m'\n              ELSE '5m+'\n            END\n          "]))))];
                case 2:
                    data = _c.sent();
                    return [2 /*return*/, data];
                case 3:
                    err_11 = _c.sent();
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch completion time distribution" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // ─── GLOBAL TRAFFIC SOURCES ───────────────────────────────────────────────
    getTrafficSources: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/analytics/global/traffic-sources", tags: ["Analytics"], summary: "Get traffic sources", protect: true } })
        .input(zod_1.z.object({ formIds: zod_1.z.array(zod_1.z.string()).optional() }).optional())
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var userForms, formIds, data, err_12;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db.select({ id: db_1.forms.id }).from(db_1.forms).where((0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId))];
                case 1:
                    userForms = _c.sent();
                    if (userForms.length === 0)
                        return [2 /*return*/, []];
                    formIds = userForms.map(function (f) { return f.id; });
                    if ((input === null || input === void 0 ? void 0 : input.formIds) && input.formIds.length > 0) {
                        formIds = formIds.filter(function (id) { return input.formIds.includes(id); });
                    }
                    if (formIds.length === 0)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, ctx.db
                            .select({
                            source: (0, drizzle_orm_1.sql)(templateObject_18 || (templateObject_18 = __makeTemplateObject(["metadata->>'source'"], ["metadata->>'source'"]))),
                            count: (0, drizzle_orm_1.count)(),
                        })
                            .from(db_1.events)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(db_1.events.formId, formIds), (0, drizzle_orm_1.eq)(db_1.events.event, "form_view")))
                            .groupBy((0, drizzle_orm_1.sql)(templateObject_19 || (templateObject_19 = __makeTemplateObject(["metadata->>'source'"], ["metadata->>'source'"]))))];
                case 2:
                    data = _c.sent();
                    return [2 /*return*/, data.map(function (d) {
                            var _a;
                            return ({
                                source: (_a = d.source) !== null && _a !== void 0 ? _a : "direct",
                                count: d.count,
                            });
                        })];
                case 3:
                    err_12 = _c.sent();
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch traffic sources" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // ─── GLOBAL MAP DATA ──────────────────────────────────────────────────────
    getGlobalMapData: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/analytics/global/map", tags: ["Analytics"], summary: "Get global map data", protect: true } })
        .input(zod_1.z.object({ formIds: zod_1.z.array(zod_1.z.string()).optional() }).optional())
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var userForms, formIds, regionData, pointData, err_13;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, ctx.db.select({ id: db_1.forms.id }).from(db_1.forms).where((0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId))];
                case 1:
                    userForms = _c.sent();
                    if (userForms.length === 0)
                        return [2 /*return*/, { regions: [], points: [] }];
                    formIds = userForms.map(function (f) { return f.id; });
                    if ((input === null || input === void 0 ? void 0 : input.formIds) && input.formIds.length > 0) {
                        formIds = formIds.filter(function (id) { return input.formIds.includes(id); });
                    }
                    if (formIds.length === 0)
                        return [2 /*return*/, { regions: [], points: [] }];
                    return [4 /*yield*/, ctx.db
                            .select({
                            country: (0, drizzle_orm_1.sql)(templateObject_20 || (templateObject_20 = __makeTemplateObject(["meta->>'country'"], ["meta->>'country'"]))),
                            count: (0, drizzle_orm_1.count)(),
                        })
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(db_1.submissions.formId, formIds), (0, drizzle_orm_1.sql)(templateObject_21 || (templateObject_21 = __makeTemplateObject(["meta->>'country' IS NOT NULL"], ["meta->>'country' IS NOT NULL"]))), (0, drizzle_orm_1.sql)(templateObject_22 || (templateObject_22 = __makeTemplateObject(["meta->>'country' != 'Unknown'"], ["meta->>'country' != 'Unknown'"])))))
                            .groupBy((0, drizzle_orm_1.sql)(templateObject_23 || (templateObject_23 = __makeTemplateObject(["meta->>'country'"], ["meta->>'country'"]))))];
                case 2:
                    regionData = _c.sent();
                    return [4 /*yield*/, ctx.db
                            .select({
                            lat: (0, drizzle_orm_1.sql)(templateObject_24 || (templateObject_24 = __makeTemplateObject(["(meta->>'lat')::numeric"], ["(meta->>'lat')::numeric"]))),
                            lng: (0, drizzle_orm_1.sql)(templateObject_25 || (templateObject_25 = __makeTemplateObject(["(meta->>'lng')::numeric"], ["(meta->>'lng')::numeric"]))),
                            count: (0, drizzle_orm_1.count)(),
                        })
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(db_1.submissions.formId, formIds), (0, drizzle_orm_1.sql)(templateObject_26 || (templateObject_26 = __makeTemplateObject(["meta->>'lat' IS NOT NULL"], ["meta->>'lat' IS NOT NULL"])))))
                            .groupBy((0, drizzle_orm_1.sql)(templateObject_27 || (templateObject_27 = __makeTemplateObject(["(meta->>'lat')::numeric"], ["(meta->>'lat')::numeric"]))), (0, drizzle_orm_1.sql)(templateObject_28 || (templateObject_28 = __makeTemplateObject(["(meta->>'lng')::numeric"], ["(meta->>'lng')::numeric"]))))];
                case 3:
                    pointData = _c.sent();
                    return [2 /*return*/, {
                            regions: regionData.map(function (d) { return ({ id: d.country, value: d.count }); }),
                            points: pointData.map(function (d) { return ({ lat: Number(d.lat), lng: Number(d.lng), value: d.count }); })
                        }];
                case 4:
                    err_13 = _c.sent();
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch map data" });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    // ─── FORM-SPECIFIC SUBMISSIONS OVER TIME ──────────────────────────────────
    getSubmissionsOverTime: init_1.protectedProcedure
        .input(zod_1.z.object({ formId: zod_1.z.string(), days: zod_1.z.number().default(30) }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, startDate, data, err_14;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db.select().from(db_1.forms).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, input.formId), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId))).limit(1)];
                case 1:
                    form = _c.sent();
                    if (!form[0])
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - input.days);
                    return [4 /*yield*/, ctx.db
                            .select({
                            date: (0, drizzle_orm_1.sql)(templateObject_29 || (templateObject_29 = __makeTemplateObject(["DATE(submitted_at)"], ["DATE(submitted_at)"]))),
                            count: (0, drizzle_orm_1.count)(),
                        })
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.submissions.formId, input.formId), (0, drizzle_orm_1.gte)(db_1.submissions.submittedAt, startDate)))
                            .groupBy((0, drizzle_orm_1.sql)(templateObject_30 || (templateObject_30 = __makeTemplateObject(["DATE(submitted_at)"], ["DATE(submitted_at)"]))))
                            .orderBy((0, drizzle_orm_1.sql)(templateObject_31 || (templateObject_31 = __makeTemplateObject(["DATE(submitted_at)"], ["DATE(submitted_at)"]))))];
                case 2:
                    data = _c.sent();
                    return [2 /*return*/, data];
                case 3:
                    err_14 = _c.sent();
                    if (err_14 instanceof server_1.TRPCError)
                        throw err_14;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch submissions over time" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    // ─── RECENT SUBMISSIONS GLOBAL ────────────────────────────────────────────
    getRecentSubmissions: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/analytics/global/recent-submissions", tags: ["Analytics"], summary: "Get recent submissions across all forms", protect: true } })
        .input(zod_1.z.object({ limit: zod_1.z.number().default(8) }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var userForms_2, formIds, recentSubs, err_15;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db.select().from(db_1.forms).where((0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId))];
                case 1:
                    userForms_2 = _c.sent();
                    if (userForms_2.length === 0)
                        return [2 /*return*/, []];
                    formIds = userForms_2.map(function (f) { return f.id; });
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.submissions)
                            .where((0, drizzle_orm_1.inArray)(db_1.submissions.formId, formIds))
                            .orderBy((0, drizzle_orm_1.desc)(db_1.submissions.submittedAt))
                            .limit(input.limit)];
                case 2:
                    recentSubs = _c.sent();
                    return [2 /*return*/, recentSubs.map(function (sub) {
                            var _a, _b;
                            return (__assign(__assign({}, sub), { formName: (_b = (_a = userForms_2.find(function (f) { return f.id === sub.formId; })) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "Unknown" }));
                        })];
                case 3:
                    err_15 = _c.sent();
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch recent submissions" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20, templateObject_21, templateObject_22, templateObject_23, templateObject_24, templateObject_25, templateObject_26, templateObject_27, templateObject_28, templateObject_29, templateObject_30, templateObject_31;
