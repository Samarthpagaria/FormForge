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
exports.formVersionsRouter = void 0;
var init_1 = require("../init");
var zod_1 = require("zod");
var db_1 = require("@formforge/db");
var drizzle_orm_1 = require("drizzle-orm");
var server_1 = require("@trpc/server");
exports.formVersionsRouter = (0, init_1.createTRPCRouter)({
    /**
     * @name create
     * @description creates a new version of a form
     * @protected
     * @input formId: string, schema:Object
     * @returns formVersion
     */
    create: init_1.protectedProcedure
        .meta({ openapi: { method: "POST", path: "/form-versions", tags: ["Form Versions"], summary: "Create a new form version", protect: true } })
        .input(zod_1.z.object({ formId: zod_1.z.string(), schema: zod_1.z.record(zod_1.z.string(), zod_1.z.any()) })).mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, latestVersion, nextVersion, newVersion, error_1;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, ctx.db.select().from(db_1.forms).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, input.formId), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId))).limit(1)];
                case 1:
                    form = _c.sent();
                    if (!form[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    }
                    return [4 /*yield*/, ctx.db.select().from(db_1.formVersions).where((0, drizzle_orm_1.eq)(db_1.formVersions.formId, input.formId)).orderBy((0, drizzle_orm_1.desc)(db_1.formVersions.createdAt)).limit(1)];
                case 2:
                    latestVersion = _c.sent();
                    nextVersion = latestVersion[0] ? String(Number(latestVersion[0].version) + 1) : "1";
                    return [4 /*yield*/, ctx.db.insert(db_1.formVersions).values({ formId: input.formId, version: nextVersion, schema: input.schema }).returning()];
                case 3:
                    newVersion = _c.sent();
                    if (!newVersion[0]) {
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create version" });
                    }
                    // update current versionId from form 
                    return [4 /*yield*/, ctx.db.update(db_1.forms).set({ currentVersionId: newVersion[0].id, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(db_1.forms.id, input.formId))];
                case 4:
                    // update current versionId from form 
                    _c.sent();
                    return [2 /*return*/, newVersion[0]];
                case 5:
                    error_1 = _c.sent();
                    if (error_1 instanceof server_1.TRPCError) {
                        throw error_1;
                    }
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create version" });
                case 6: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name createSnapshot
     * @description Creates a new version snapshot from the current draft without publishing it
     * @protected
     * @input formId: string
     * @returns formVersion
     */
    createSnapshot: init_1.protectedProcedure.input(zod_1.z.object({ formId: zod_1.z.string() })).mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, schemaToSave, latestVersion, nextVersion, newVersion, error_2;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, ctx.db.select().from(db_1.forms).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, input.formId), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId))).limit(1)];
                case 1:
                    form = _c.sent();
                    if (!form[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    }
                    schemaToSave = form[0].draftSchema || { fields: [] };
                    return [4 /*yield*/, ctx.db.select().from(db_1.formVersions).where((0, drizzle_orm_1.eq)(db_1.formVersions.formId, input.formId)).orderBy((0, drizzle_orm_1.desc)(db_1.formVersions.createdAt)).limit(1)];
                case 2:
                    latestVersion = _c.sent();
                    nextVersion = latestVersion[0] ? String(Number(latestVersion[0].version) + 1) : "1";
                    return [4 /*yield*/, ctx.db.insert(db_1.formVersions).values({ formId: input.formId, version: nextVersion, schema: schemaToSave }).returning()];
                case 3:
                    newVersion = _c.sent();
                    if (!newVersion[0]) {
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create snapshot" });
                    }
                    return [2 /*return*/, newVersion[0]];
                case 4:
                    error_2 = _c.sent();
                    if (error_2 instanceof server_1.TRPCError) {
                        throw error_2;
                    }
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create snapshot" });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name publishVersion
     * @description Publishes the current draft schema of a form as a new version
     * @protected
     * @input formId: string
     * @returns formVersion
     */
    publishVersion: init_1.protectedProcedure.input(zod_1.z.object({ formId: zod_1.z.string() })).mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, schemaToPublish, latestVersion, nextVersion, newVersion, error_3;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, ctx.db.select().from(db_1.forms).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.forms.id, input.formId), (0, drizzle_orm_1.eq)(db_1.forms.userId, ctx.auth.userId))).limit(1)];
                case 1:
                    form = _c.sent();
                    if (!form[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Form not found" });
                    }
                    schemaToPublish = form[0].draftSchema || { fields: [] };
                    return [4 /*yield*/, ctx.db.select().from(db_1.formVersions).where((0, drizzle_orm_1.eq)(db_1.formVersions.formId, input.formId)).orderBy((0, drizzle_orm_1.desc)(db_1.formVersions.createdAt)).limit(1)];
                case 2:
                    latestVersion = _c.sent();
                    nextVersion = latestVersion[0] ? String(Number(latestVersion[0].version) + 1) : "1";
                    return [4 /*yield*/, ctx.db.insert(db_1.formVersions).values({ formId: input.formId, version: nextVersion, schema: schemaToPublish }).returning()];
                case 3:
                    newVersion = _c.sent();
                    if (!newVersion[0]) {
                        throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create version" });
                    }
                    // update current versionId from form 
                    return [4 /*yield*/, ctx.db.update(db_1.forms).set({ currentVersionId: newVersion[0].id, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(db_1.forms.id, input.formId))];
                case 4:
                    // update current versionId from form 
                    _c.sent();
                    return [2 /*return*/, newVersion[0]];
                case 5:
                    error_3 = _c.sent();
                    if (error_3 instanceof server_1.TRPCError) {
                        throw error_3;
                    }
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to publish version" });
                case 6: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name getAll
   * @description gets all versions of a form
   * @protected
   * @input formId: string
   * @returns FormVersion[]
     */
    getAll: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/form-versions/{formId}", tags: ["Form Versions"], summary: "Get all versions of a form", protect: true } })
        .input(zod_1.z.object({ formId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, err_1;
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
                            .from(db_1.formVersions)
                            .where((0, drizzle_orm_1.eq)(db_1.formVersions.formId, input.formId))
                            .orderBy((0, drizzle_orm_1.desc)(db_1.formVersions.createdAt))];
                case 2: return [2 /*return*/, _c.sent()];
                case 3:
                    err_1 = _c.sent();
                    if (err_1 instanceof server_1.TRPCError)
                        throw err_1;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch versions" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
    /**
 * @name getById
 * @description gets a single version by id
 * @protected
 * @input id: string
 * @returns FormVersion
 */
    getById: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/form-versions/single/{id}", tags: ["Form Versions"], summary: "Get single version", protect: true } })
        .input(zod_1.z.object({ id: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var version, err_2;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, ctx.db
                            .select()
                            .from(db_1.formVersions)
                            .where((0, drizzle_orm_1.eq)(db_1.formVersions.id, input.id))
                            .limit(1)];
                case 1:
                    version = _c.sent();
                    if (!version[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Version not found" });
                    }
                    return [2 /*return*/, version[0]];
                case 2:
                    err_2 = _c.sent();
                    if (err_2 instanceof server_1.TRPCError)
                        throw err_2;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch version" });
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    /**
       * @name rollback
       * @description sets a version as the current version of a form
       * @protected
       * @input formId: string, versionId: string
       * @returns Form
       */
    rollback: init_1.protectedProcedure
        .meta({ openapi: { method: "POST", path: "/form-versions/rollback", tags: ["Form Versions"], summary: "Rollback to a previous version", protect: true } })
        .input(zod_1.z.object({ formId: zod_1.z.string(), versionId: zod_1.z.string() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, version, updated, err_3;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
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
                            .from(db_1.formVersions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.formVersions.id, input.versionId), (0, drizzle_orm_1.eq)(db_1.formVersions.formId, input.formId)))
                            .limit(1)];
                case 2:
                    version = _c.sent();
                    if (!version[0]) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Version not found" });
                    }
                    return [4 /*yield*/, ctx.db
                            .update(db_1.forms)
                            .set({
                            currentVersionId: input.versionId,
                            draftSchema: version[0].schema,
                            updatedAt: new Date()
                        })
                            .where((0, drizzle_orm_1.eq)(db_1.forms.id, input.formId))
                            .returning()];
                case 3:
                    updated = _c.sent();
                    return [2 /*return*/, updated[0]];
                case 4:
                    err_3 = _c.sent();
                    if (err_3 instanceof server_1.TRPCError)
                        throw err_3;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to rollback version" });
                case 5: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name deleteVersion
     * @description Deletes a version snapshot from the history
     * @protected
     * @input formId: string, versionId: string
     * @returns { success: boolean }
     */
    deleteVersion: init_1.protectedProcedure
        .input(zod_1.z.object({ formId: zod_1.z.string(), versionId: zod_1.z.string() }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, deleted, err_4;
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
                    if (form[0].currentVersionId === input.versionId) {
                        throw new server_1.TRPCError({
                            code: "BAD_REQUEST",
                            message: "Cannot delete the officially published version. Please publish another version first."
                        });
                    }
                    return [4 /*yield*/, ctx.db
                            .delete(db_1.formVersions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(db_1.formVersions.id, input.versionId), (0, drizzle_orm_1.eq)(db_1.formVersions.formId, input.formId)))
                            .returning()];
                case 2:
                    deleted = _c.sent();
                    if (deleted.length === 0) {
                        throw new server_1.TRPCError({ code: "NOT_FOUND", message: "Version not found or already deleted" });
                    }
                    return [2 /*return*/, { success: true }];
                case 3:
                    err_4 = _c.sent();
                    if (err_4 instanceof server_1.TRPCError)
                        throw err_4;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete version" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
});
