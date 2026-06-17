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
exports.sendSubmissionEmail = sendSubmissionEmail;
var resend_1 = require("resend");
var resend = new resend_1.Resend(process.env.RESEND_API_KEY || "re_mock");
function sendSubmissionEmail(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var previewAnswers, answersHtml, nameFallback, actionUrl, html;
        var formOwnerEmail = _b.formOwnerEmail, formOwnerName = _b.formOwnerName, formId = _b.formId, formName = _b.formName, submissionId = _b.submissionId, answers = _b.answers, submittedAt = _b.submittedAt, totalResponses = _b.totalResponses;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    previewAnswers = answers.slice(0, 3);
                    answersHtml = previewAnswers
                        .map(function (a) {
                        var _a;
                        return "\n      <tr>\n        <td style=\"padding: 8px 0; color: #475467; font-size: 14px; font-weight: 500;\">\n          ".concat(a.fieldKey.replace(/_/g, " "), ": \n          <span style=\"color: #101828; font-weight: 600;\">").concat(String((_a = a.value) !== null && _a !== void 0 ? _a : "—"), "</span>\n        </td>\n      </tr>");
                    })
                        .join("");
                    nameFallback = formOwnerName ? formOwnerName.split(" ")[0] : "there";
                    actionUrl = "".concat(process.env.NEXT_PUBLIC_APP_URL, "/forms/").concat(formId, "/responses?submissionId=").concat(submissionId);
                    html = "\n<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\"/>\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>\n  <title>New Submission on ".concat(formName, "</title>\n</head>\n<body style=\"margin:0; padding:0; background-color:#f9fafb; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\">\n  \n  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f9fafb; padding: 40px 20px;\">\n    <tr>\n      <td align=\"center\">\n        <table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width: 600px; width: 100%; background-color: #ffffff; padding: 40px; border-radius: 8px; border: 1px solid #eaecf0;\">\n          \n          <!-- Logo -->\n          <tr>\n            <td style=\"padding-bottom: 32px;\">\n              <div style=\"display: flex; align-items: center; gap: 8px;\">\n                <div style=\"background-color: #f3f0ff; width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 16px; border: 1px solid #e9d5ff; vertical-align: middle; text-align: center; line-height: 32px;\">\n                  \uD83D\uDD25\n                </div>\n                <span style=\"font-size: 18px; font-weight: 700; color: #101828; display: inline-block; vertical-align: middle; margin-left: 8px;\">\n                  FormForge\n                </span>\n              </div>\n            </td>\n          </tr>\n\n          <!-- Content -->\n          <tr>\n            <td>\n              <p style=\"margin: 0 0 16px; font-size: 16px; color: #344054;\">\n                Hi ").concat(nameFallback, ",\n              </p>\n              \n              <p style=\"margin: 0 0 16px; font-size: 16px; color: #475467; line-height: 1.5;\">\n                You just received a new response on your form <strong>\"").concat(formName, "\"</strong>! This brings your total responses for this form up to <strong>").concat(totalResponses, "</strong>.\n              </p>\n\n              <p style=\"margin: 0 0 16px; font-size: 16px; color: #475467; line-height: 1.5;\">\n                Here is a quick snippet of what they submitted:\n              </p>\n\n              <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom: 24px; background-color: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #eaecf0;\">\n                ").concat(answersHtml, "\n              </table>\n\n              <p style=\"margin: 0 0 8px; font-size: 16px; color: #475467;\">\n                Thanks,\n              </p>\n              <p style=\"margin: 0 0 32px; font-size: 16px; color: #475467;\">\n                The FormForge Team\n              </p>\n            </td>\n          </tr>\n\n          <!-- CTA -->\n          <tr>\n            <td style=\"padding-bottom: 40px;\">\n              <a href=\"").concat(actionUrl, "\" style=\"\n                display: inline-block;\n                background-color: #7c3aed;\n                color: #ffffff;\n                text-decoration: none;\n                padding: 12px 24px;\n                border-radius: 8px;\n                font-size: 16px;\n                font-weight: 600;\n              \">View Full Response</a>\n            </td>\n          </tr>\n\n          <!-- Divider -->\n          <tr>\n            <td style=\"border-top: 1px solid #eaecf0; padding-top: 32px;\">\n              <p style=\"margin: 0 0 16px; font-size: 14px; color: #667085; line-height: 1.5;\">\n                This email was sent to <a href=\"mailto:").concat(formOwnerEmail, "\" style=\"color: #6941c6; text-decoration: none;\">").concat(formOwnerEmail, "</a>. If you'd rather not receive this kind of email, you can <a href=\"#\" style=\"color: #6941c6; text-decoration: underline;\">unsubscribe</a> or <a href=\"#\" style=\"color: #6941c6; text-decoration: underline;\">manage your email preferences</a>.\n              </p>\n              \n              <p style=\"margin: 0 0 32px; font-size: 14px; color: #667085;\">\n                \u00A9 2026 FormForge, 100 Innovation Drive, San Francisco CA 94107\n              </p>\n            </td>\n          </tr>\n\n          <!-- Footer Logo -->\n          <tr>\n            <td>\n              <div style=\"display: flex; align-items: center; gap: 8px;\">\n                <div style=\"background-color: #f3f0ff; width: 24px; height: 24px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; border: 1px solid #e9d5ff; vertical-align: middle; text-align: center; line-height: 24px;\">\n                  \uD83D\uDD25\n                </div>\n                <span style=\"font-size: 14px; font-weight: 700; color: #101828; display: inline-block; vertical-align: middle; margin-left: 8px;\">\n                  FormForge\n                </span>\n              </div>\n            </td>\n          </tr>\n\n        </table>\n      </td>\n    </tr>\n  </table>\n\n</body>\n</html>\n  ");
                    return [4 /*yield*/, resend.emails.send({
                            from: "FormForge <notifications@formforge.com>",
                            to: formOwnerEmail,
                            subject: "\uD83D\uDD25 New response on \"".concat(formName, "\""),
                            html: html,
                        })];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
