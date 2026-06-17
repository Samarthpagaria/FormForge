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
exports.shareRouter = void 0;
var init_1 = require("../init");
var zod_1 = require("zod");
var db_1 = require("@formforge/db");
var drizzle_orm_1 = require("drizzle-orm");
var server_1 = require("@trpc/server");
var qr_1 = require("../../services/qr");
exports.shareRouter = (0, init_1.createTRPCRouter)({
    /**
     * @name getShareLink
     * @description gets the public share link for a form
     * @protected
     * @input formId
     * @returns { url: string, slug: string }
     */
    getShareLink: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/share/{formId}/link", tags: ["Share"], summary: "Get share link for a form", protect: true } })
        .input(zod_1.z.object({ formId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, url, err_1;
        var ctx = _b.ctx, input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
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
                    if (form[0].status !== "published") {
                        throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "Form must be published to share" });
                    }
                    url = "".concat(process.env.NEXT_PUBLIC_APP_URL, "/f/").concat(form[0].slug);
                    return [2 /*return*/, { url: url, slug: form[0].slug }];
                case 2:
                    err_1 = _c.sent();
                    if (err_1 instanceof server_1.TRPCError)
                        throw err_1;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get share link" });
                case 3: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * @name getQRCode
     * @description generates a QR code for a form
     * @protected
     * @input formId
     * @returns { qrCode: string, url: string }
     */
    getQRCode: init_1.protectedProcedure
        .meta({ openapi: { method: "GET", path: "/share/{formId}/qr", tags: ["Share"], summary: "Generate QR code for a form", protect: true } })
        .input(zod_1.z.object({ formId: zod_1.z.string() }))
        .query(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var form, url, qrCode, err_2;
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
                    if (form[0].status !== "published") {
                        throw new server_1.TRPCError({ code: "BAD_REQUEST", message: "Form must be published to generate QR" });
                    }
                    url = "".concat(process.env.NEXT_PUBLIC_APP_URL, "/f/").concat(form[0].slug);
                    return [4 /*yield*/, (0, qr_1.generateQRCode)(url)];
                case 2:
                    qrCode = _c.sent();
                    return [2 /*return*/, { qrCode: qrCode, url: url }];
                case 3:
                    err_2 = _c.sent();
                    if (err_2 instanceof server_1.TRPCError)
                        throw err_2;
                    throw new server_1.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate QR code" });
                case 4: return [2 /*return*/];
            }
        });
    }); }),
});
