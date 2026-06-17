"use strict";
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
exports.templatesRouter = void 0;
var init_1 = require("../init");
var zod_1 = require("zod");
var schema_1 = require("@formforge/db/schema");
var drizzle_orm_1 = require("drizzle-orm");
var server_1 = require("@trpc/server");
exports.templatesRouter = (0, init_1.createTRPCRouter)({
    /**
     * @name getAllCategories
     * @description gets all global categories + user's own categories
     * @protected
     * @returns TemplateCategory[]
     */
    getAllCategories: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/templates/categories", tags: ["Templates"], summary: "Get all template categories", protect: true } })
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var err_1;
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(schema_1.templateCategories)
                            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.templateCategories.isGlobal, true), (0, drizzle_orm_1.eq)(schema_1.templateCategories.userId, ctx.auth.userId)))];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    err_1 = _c.sent();
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch categories" });
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name createCategory
     * @description creates a custom category for the user
     * @protected
     * @input name: string
     * @returns TemplateCategory
     */
    createCategory: init_1.protectedProcedure
        .meta({ openapi: { method: "POST", path: "/templates/categories", tags: ["Templates"], summary: "Create custom category", protect: true } })
        .input(zod_1.z.object({ name: zod_1.z.string().min(1).max(50) }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var existing, newCategory, err_2;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(schema_1.templateCategories)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.templateCategories.name, input.name), (0, drizzle_orm_1.eq)(schema_1.templateCategories.userId, ctx.auth.userId)))
                            .limit(1)];
                case 1:
                    existing = _c.sent();
                    if (existing[0]) {
                        throw new server_1.TRPCError({ code: "CONFLICT", message: "Category with this name already exists" });
                    }
                    return [4 /*yield*/, ctx.db
                            .insert(schema_1.templateCategories)
                            .values({
                            name: input.name,
                            userId: ctx.auth.userId,
                            isGlobal: false,
                        })
                            .returning()];
                case 2:
                    newCategory = _c.sent();
                    return [2 /*return*/, newCategory[0]];
                case 3:
                    err_2 = _c.sent();
                    if (err_2 instanceof server_1.TRPCError)
                        throw err_2;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create category" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name updateCategory
     * @description updates a user's custom category
     * @protected
     * @input id: string, name: string
     * @returns TemplateCategory
     */
    updateCategory: init_1.protectedProcedure
        .input(zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string().min(1).max(100) }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var category, existing, updatedCategory, err_3;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(schema_1.templateCategories)
                            .where((0, drizzle_orm_1.eq)(schema_1.templateCategories.id, input.id))
                            .limit(1)];
                case 1:
                    category = _c.sent();
                    if (!category[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Category not found" });
                    }
                    // prevent editing global categories
                    if (category[0].isGlobal) {
                        throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Cannot edit global category" });
                    }
                    // ensure user owns category
                    if (category[0].userId !== ctx.auth.userId) {
                        throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Not authorized to edit this category" });
                    }
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(schema_1.templateCategories)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.templateCategories.name, input.name), (0, drizzle_orm_1.eq)(schema_1.templateCategories.userId, ctx.auth.userId)))
                            .limit(1)];
                case 2:
                    existing = _c.sent();
                    if (existing[0] && existing[0].id !== input.id) {
                        throw new server_1.TRPCError({ code: "CONFLICT", message: "Category with this name already exists" });
                    }
                    return [4 /*yield*/, ctx.db
                            .update(schema_1.templateCategories)
                            .set({ name: input.name })
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.templateCategories.id, input.id), (0, drizzle_orm_1.eq)(schema_1.templateCategories.userId, ctx.auth.userId)))
                            .returning()];
                case 3:
                    updatedCategory = _c.sent();
                    return [2 /*return*/, updatedCategory[0]];
                case 4:
                    err_3 = _c.sent();
                    if (err_3 instanceof server_1.TRPCError)
                        throw err_3;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update category" });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name deleteCategory
     * @description deletes a user's custom category
     * @protected
     * @input id: string
     * @returns { success: boolean }
     */
    deleteCategory: init_1.protectedProcedure
        .meta({ openapi: { method: "DELETE", path: "/templates/categories/{id}", tags: ["Templates"], summary: "Delete custom category", protect: true } })
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var category, err_4;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(schema_1.templateCategories)
                            .where((0, drizzle_orm_1.eq)(schema_1.templateCategories.id, input.id))
                            .limit(1)];
                case 1:
                    category = _c.sent();
                    if (!category[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Category not found" });
                    }
                    if (category[0].isGlobal) {
                        throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Cannot delete global category" });
                    }
                    if (category[0].userId !== ctx.auth.userId) {
                        throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete this category" });
                    }
                    return [4 /*yield*/, ctx.db
                            .delete(schema_1.templateCategories)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.templateCategories.id, input.id), (0, drizzle_orm_1.eq)(schema_1.templateCategories.userId, ctx.auth.userId)))];
                case 2:
                    _c.sent();
                    return [2 /*return*/, { success: true }];
                case 3:
                    err_4 = _c.sent();
                    if (err_4 instanceof server_1.TRPCError)
                        throw err_4;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete category" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name getAll
     * @description gets all global templates + user's own templates
     * @protected
     * @returns Template[]
     */
    getAll: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/templates", tags: ["Templates"], summary: "Get all templates", protect: true } })
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var err_5;
        var ctx = _b.ctx;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(schema_1.templates)
                            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.templates.isGlobal, true), (0, drizzle_orm_1.eq)(schema_1.templates.userId, ctx.auth.userId)))];
                case 1: return [2 /*return*/, _c.sent()];
                case 2:
                    err_5 = _c.sent();
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch templates" });
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name getByCategory
     * @description gets templates by categoryId
     * @protected
     * @input categoryId: string
     * @returns Template[]
     */
    getByCategory: init_1.protectedProcedure
        .input(zod_1.z.object({ categoryId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var category, err_6;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(schema_1.templateCategories)
                            .where((0, drizzle_orm_1.eq)(schema_1.templateCategories.id, input.categoryId))
                            .limit(1)];
                case 1:
                    category = _c.sent();
                    if (!category[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Category not found" });
                    }
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(schema_1.templates)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.templates.categoryId, input.categoryId), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.templates.isGlobal, true), (0, drizzle_orm_1.eq)(schema_1.templates.userId, ctx.auth.userId))))];
                case 2: return [2 /*return*/, _c.sent()];
                case 3:
                    err_6 = _c.sent();
                    if (err_6 instanceof server_1.TRPCError)
                        throw err_6;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch templates" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name createUserTemplate
     * @description creates a custom template for the user
     * @protected
     * @input name, description, categoryId, icon, schema
     * @returns Template
     */
    createUserTemplate: init_1.protectedProcedure
        .meta({ openapi: { method: "POST", path: "/templates", tags: ["Templates"], summary: "Create custom template", protect: true } })
        .input(zod_1.z.object({
        name: zod_1.z.string().min(1).max(255),
        description: zod_1.z.string().max(1000).optional(),
        categoryId: zod_1.z.string().optional(),
        icon: zod_1.z.string().optional(),
        schema: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var category, newTemplate, err_7;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    if (!input.categoryId) return [3 /*break*/, 2];
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(schema_1.templateCategories)
                            .where((0, drizzle_orm_1.eq)(schema_1.templateCategories.id, input.categoryId))
                            .limit(1)];
                case 1:
                    category = _c.sent();
                    if (!category[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Category not found" });
                    }
                    if (!category[0].isGlobal && category[0].userId !== ctx.auth.userId) {
                        throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Not authorized to use this category" });
                    }
                    _c.label = 2;
                case 2: return [4 /*yield*/, ctx.db
                        .insert(schema_1.templates)
                        .values({
                        name: input.name,
                        description: input.description,
                        categoryId: input.categoryId,
                        icon: input.icon,
                        schema: input.schema,
                        userId: ctx.auth.userId,
                        isGlobal: false,
                    })
                        .returning()];
                case 3:
                    newTemplate = _c.sent();
                    return [2 /*return*/, newTemplate[0]];
                case 4:
                    err_7 = _c.sent();
                    if (err_7 instanceof server_1.TRPCError)
                        throw err_7;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create template" });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name deleteUserTemplate
     * @description deletes a user's custom template
     * @protected
     * @input id: string
     * @returns { success: boolean }
     */
    deleteUserTemplate: init_1.protectedProcedure
        .meta({ openapi: { method: "DELETE", path: "/templates/{id}", tags: ["Templates"], summary: "Delete custom template", protect: true } })
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var template, err_8;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(schema_1.templates)
                            .where((0, drizzle_orm_1.eq)(schema_1.templates.id, input.id))
                            .limit(1)];
                case 1:
                    template = _c.sent();
                    if (!template[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Template not found" });
                    }
                    if (template[0].isGlobal) {
                        throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Cannot delete global template" });
                    }
                    if (template[0].userId !== ctx.auth.userId) {
                        throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete this template" });
                    }
                    return [4 /*yield*/, ctx.db
                            .delete(schema_1.templates)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.templates.id, input.id), (0, drizzle_orm_1.eq)(schema_1.templates.userId, ctx.auth.userId)))];
                case 2:
                    _c.sent();
                    return [2 /*return*/, { success: true }];
                case 3:
                    err_8 = _c.sent();
                    if (err_8 instanceof server_1.TRPCError)
                        throw err_8;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete template" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name createFormFromTemplate
     * @description creates a new form from a template
     * @protected
     * @input templateId, name, description
     * @returns Form
     */
    createFormFromTemplate: init_1.protectedProcedure
        .meta({ openapi: { method: "POST", path: "/templates/{templateId}/use", tags: ["Templates"], summary: "Create form from template", protect: true } })
        .input(zod_1.z.object({
        templateId: zod_1.z.string(),
        name: zod_1.z.string().min(1).max(100),
        description: zod_1.z.string().max(1000).optional(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var finalName, existingForm, counter, template, newForm, err_9;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 7, , 8]);
                    finalName = input.name;
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(schema_1.forms)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.forms.name, finalName), (0, drizzle_orm_1.eq)(schema_1.forms.userId, ctx.auth.userId)))
                            .limit(1)];
                case 1:
                    existingForm = _c.sent();
                    counter = 1;
                    _c.label = 2;
                case 2:
                    if (!existingForm[0]) return [3 /*break*/, 4];
                    finalName = "".concat(input.name, " (").concat(counter, ")");
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(schema_1.forms)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.forms.name, finalName), (0, drizzle_orm_1.eq)(schema_1.forms.userId, ctx.auth.userId)))
                            .limit(1)];
                case 3:
                    existingForm = _c.sent();
                    counter++;
                    return [3 /*break*/, 2];
                case 4: return [4 /*yield*/, ctx.db
                        .select()
                        .from(schema_1.templates)
                        .where((0, drizzle_orm_1.eq)(schema_1.templates.id, input.templateId))
                        .limit(1)];
                case 5:
                    template = _c.sent();
                    if (!template[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Template not found" });
                    }
                    // verify user has access to this template
                    if (!template[0].isGlobal && template[0].userId !== ctx.auth.userId) {
                        throw new server_1.TRPCError({ code: "FORBIDDEN", message: "Not authorized to use this template" });
                    }
                    return [4 /*yield*/, ctx.db
                            .insert(schema_1.forms)
                            .values({
                            name: finalName,
                            description: input.description,
                            userId: ctx.auth.userId,
                            slug: "".concat(finalName.toLowerCase().replace(/\s+/g, "-"), "-").concat(Math.random().toString(36).slice(2, 7)),
                            status: "draft",
                            draftSchema: template[0].schema,
                        })
                            .returning()];
                case 6:
                    newForm = _c.sent();
                    return [2 /*return*/, newForm[0]];
                case 7:
                    err_9 = _c.sent();
                    if (err_9 instanceof server_1.TRPCError)
                        throw err_9;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create form from template" });
                case 8: return [2 /*return*/];
            }
        });
    }); }),
});
