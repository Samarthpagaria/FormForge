"use strict";
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formsRouter = void 0;
var init_1 = require("../init");
var zod_1 = require("zod");
var db_1 = require("@formforge/db");
var drizzle_orm_1 = require("drizzle-orm");
var server_1 = require("@trpc/server");
exports.formsRouter = (0, init_1.createTRPCRouter)({
    /**
     * @name create
     * @description creates a new form
     * @protected
     * @input name: string, description?: string
     * @returns Form
     */
    create: init_1.protectedProcedure
        .meta({ openapi: { method: "POST", path: "/forms", tags: ["Forms"], summary: "Create a new form", protect: true } })
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        description: zod_1.z.string().max(1000).optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var existingForm, newForm, err_1;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.forms)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.name, input.name), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId)))
                            .limit(1)];
                case 1:
                    existingForm = _c.sent();
                    if (existingForm[0]) {
                        throw new server_1.TRPCError({ code: "CONFLICT", message: "A form with this name already exists. Please choose a different name." });
                    }
                    return [4 /*yield*/, ctx.db
                            .insert(db_1.forms)
                            .values({
                            name: input.name,
                            description: input.description,
                            userId: ctx.auth.userId,
                            slug: "".concat(input.name.toLowerCase().replace(/\s+/g, "-"), "-").concat(Math.random().toString(36).slice(2, 7)),
                            status: "draft",
                        })
                            .returning()];
                case 2:
                    newForm = _c.sent();
                    return [2 /*return*/, newForm[0]];
                case 3:
                    err_1 = _c.sent();
                    if (err_1 instanceof server_1.TRPCError)
                        throw err_1;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create form" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name getAllForms
     * @description gets all forms for logged in user
     * @protected
     * @returns Form[]
     */
    getAllForms: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/forms", tags: ["Forms"], summary: "Get all forms", protect: true } })
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var err_2;
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.forms)
                            .where((0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId))];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    err_2 = _c.sent();
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch forms" });
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name getById
     * @description gets a single form by id
     * @protected
     * @input id: string
     * @returns Form
     */
    getById: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/forms/{id}", tags: ["Forms"], summary: "Get form by ID", protect: true } })
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, err_3;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.forms)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, input.id), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId)))
                            .limit(1)];
                case 1:
                    form = _c.sent();
                    if (!form[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    }
                    return [2 /*return*/, form[0]];
                case 2:
                    err_3 = _c.sent();
                    if (err_3 instanceof server_1.TRPCError)
                        throw err_3;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch form" });
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name update
     * @description updates a form
     * @protected
     * @input id: string, name?: string, description?: string, status?: string, settings?: object
     * @returns Form
     */
    update: init_1.protectedProcedure
        .meta({ openapi: { method: "PATCH", path: "/forms/{id}", tags: ["Forms"], summary: "Update a form", protect: true } })
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().max(1000).optional(),
        status: zod_1.z.enum(["draft", "published"]).optional(),
        settings: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
        draftSchema: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var id, rest, existingForm, updated, err_4;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    id = input.id, rest = __rest(input, ["id"]);
                    if (!rest.name) return [3 /*break*/, 2];
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.forms)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.name, rest.name), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId)))
                            .limit(1)];
                case 1:
                    existingForm = _c.sent();
                    if (existingForm[0] && existingForm[0].id !== id) {
                        throw new server_1.TRPCError({ code: "CONFLICT", message: "A form with this name already exists. Please choose a different name." });
                    }
                    _c.label = 2;
                case 2: return [4 /*yield*/, ctx.db
                        .update(db_1.forms)
                        .set(__assign(__assign({}, rest), { updatedAt: new Date() }))
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, id), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId)))
                        .returning()];
                case 3:
                    updated = _c.sent();
                    if (!updated[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    }
                    return [2 /*return*/, updated[0]];
                case 4:
                    err_4 = _c.sent();
                    if (err_4 instanceof server_1.TRPCError)
                        throw err_4;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update form" });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name setSchedule
     * @description updates the schedule settings of a form
     * @protected
     * @input id: string, activateAt?: string, deactivateAt?: string, isActive?: boolean
     * @returns Form
     */
    setSchedule: init_1.protectedProcedure
        .meta({ openapi: { method: "POST", path: "/forms/{id}/schedule", tags: ["Forms"], summary: "Set form schedule", protect: true } })
        .input(zod_1.z.object({
        id: zod_1.z.string(),
        activateAt: zod_1.z.string().optional(),
        deactivateAt: zod_1.z.string().optional(),
        isActive: zod_1.z.boolean().optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var id, scheduleSettings, existingForm, currentSettings, updatedSettings, updated, err_5;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    id = input.id, scheduleSettings = __rest(input, ["id"]);
                    return [4 /*yield*/, ctx.db
                            .select({ settings: db_1.forms.settings })
                            .from(db_1.forms)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, id), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId)))
                            .limit(1)];
                case 1:
                    existingForm = _c.sent();
                    if (!existingForm[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    }
                    currentSettings = existingForm[0].settings || {};
                    updatedSettings = __assign(__assign({}, currentSettings), scheduleSettings);
                    return [4 /*yield*/, ctx.db
                            .update(db_1.forms)
                            .set({
                            settings: updatedSettings,
                            updatedAt: new Date(),
                        })
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, id), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId)))
                            .returning()];
                case 2:
                    updated = _c.sent();
                    return [2 /*return*/, updated[0]];
                case 3:
                    err_5 = _c.sent();
                    if (err_5 instanceof server_1.TRPCError)
                        throw err_5;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to set form schedule" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name delete
     * @description deletes a form
     * @protected
     * @input id: string
     * @returns { success: boolean }
     */
    delete: init_1.protectedProcedure
        .meta({ openapi: { method: "DELETE", path: "/forms/{id}", tags: ["Forms"], summary: "Delete a form", protect: true } })
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var deleted, err_6;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, ctx.db
                            .delete(db_1.forms)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, input.id), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId)))
                            .returning()];
                case 1:
                    deleted = _c.sent();
                    if (!deleted[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    }
                    return [2 /*return*/, { success: true }];
                case 2:
                    err_6 = _c.sent();
                    if (err_6 instanceof server_1.TRPCError)
                        throw err_6;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete form" });
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name publish
     * @description publishes a form
     * @protected
     * @input id: string
     * @returns Form
     */
    publish: init_1.protectedProcedure
        .meta({ openapi: { method: "POST", path: "/forms/{id}/publish", tags: ["Forms"], summary: "Publish a form", protect: true } })
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var updated, err_7;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, ctx.db
                            .update(db_1.forms)
                            .set({ status: "published", updatedAt: new Date() })
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, input.id), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId)))
                            .returning()];
                case 1:
                    updated = _c.sent();
                    if (!updated[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    }
                    return [2 /*return*/, updated[0]];
                case 2:
                    err_7 = _c.sent();
                    if (err_7 instanceof server_1.TRPCError)
                        throw err_7;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to publish form" });
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name unpublish
     * @description unpublishes a form
     * @protected
     * @input id: string
     * @returns Form
     */
    unpublish: init_1.protectedProcedure
        .meta({ openapi: { method: "POST", path: "/forms/{id}/unpublish", tags: ["Forms"], summary: "Unpublish a form", protect: true } })
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var updated, err_8;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, ctx.db
                            .update(db_1.forms)
                            .set({ status: "draft", updatedAt: new Date() })
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, input.id), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId)))
                            .returning()];
                case 1:
                    updated = _c.sent();
                    if (!updated[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    }
                    return [2 /*return*/, updated[0]];
                case 2:
                    err_8 = _c.sent();
                    if (err_8 instanceof server_1.TRPCError)
                        throw err_8;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to unpublish form" });
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name getBySlug
     * @description gets a form by slug along with its current version
     * @public
     * @input slug: string
     * @returns Form + currentVersion
     */
    getBySlug: init_1.baseProcedure
        .meta({ openapi: { method: "GET", path: "/forms/slug/{slug}", tags: ["Forms"], summary: "Get published form by slug" } })
        .input(zod_1.z.object({ slug: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, activeVersion, v, v, err_9;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.forms)
                            .where((0, drizzle_orm_1.eq)(db_1.forms.slug, input.slug))
                            .limit(1)];
                case 1:
                    form = _c.sent();
                    if (!form[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    }
                    activeVersion = void 0;
                    if (!form[0].currentVersionId) return [3 /*break*/, 3];
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.formVersions)
                            .where((0, drizzle_orm_1.eq)(db_1.formVersions.id, form[0].currentVersionId))
                            .limit(1)];
                case 2:
                    v = _c.sent();
                    activeVersion = v[0];
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, ctx.db
                        .select()
                        .from(db_1.formVersions)
                        .where((0, drizzle_orm_1.eq)(db_1.formVersions.formId, form[0].id))
                        .orderBy((0, drizzle_orm_1.desc)(db_1.formVersions.createdAt))
                        .limit(1)];
                case 4:
                    v = _c.sent();
                    activeVersion = v[0];
                    _c.label = 5;
                case 5: return [2 /*return*/, {
                        form: form[0],
                        currentVersion: activeVersion,
                    }];
                case 6:
                    err_9 = _c.sent();
                    if (err_9 instanceof server_1.TRPCError)
                        throw err_9;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch form by slug" });
                case 7: return [2 /*return*/];
            }
        });
    }); }),
});
