"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
const argon2_1 = __importDefault(require("argon2"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function hashPassword(password) {
    try {
        return await argon2_1.default.hash(password);
    }
    catch {
        return await bcryptjs_1.default.hash(password, 10);
    }
}
async function comparePassword(password, hash) {
    try {
        if (hash.startsWith('$argon2')) {
            return await argon2_1.default.verify(hash, password);
        }
        return await bcryptjs_1.default.compare(password, hash);
    }
    catch {
        try {
            return await bcryptjs_1.default.compare(password, hash);
        }
        catch {
            return false;
        }
    }
}
