"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.generateSecureToken = generateSecureToken;
const node_crypto_1 = __importDefault(require("node:crypto"));
function generateOtp() {
    return node_crypto_1.default.randomInt(100000, 999999).toString();
}
function generateSecureToken() {
    return node_crypto_1.default.randomBytes(32).toString('hex');
}
