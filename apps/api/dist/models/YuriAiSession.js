"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YuriAiSessionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MessageSchema = new mongoose_1.default.Schema({
    role: {
        type: String,
        enum: ['system', 'user', 'assistant', 'tool'],
        required: true
    },
    content: { type: String, required: true },
    toolCalls: [{
            name: { type: String },
            arguments: { type: mongoose_1.default.Schema.Types.Mixed }
        }]
}, { timestamps: true });
const YuriAiSessionSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true, index: true },
    activeWorkoutId: { type: String, index: true },
    messages: [MessageSchema],
    stateSnapshot: { type: mongoose_1.default.Schema.Types.Mixed }
}, { timestamps: true });
exports.YuriAiSessionModel = mongoose_1.default.model('YuriAiSession', YuriAiSessionSchema);
