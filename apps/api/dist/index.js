"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const api_1 = __importDefault(require("./routes/api"));
const stripe_1 = __importDefault(require("./routes/stripe"));
const auth_1 = __importDefault(require("./routes/auth"));
const exercises_1 = __importDefault(require("./routes/exercises"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Connect to MongoDB
const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri)
            throw new Error('MONGODB_URI is undefined');
        await mongoose_1.default.connect(uri);
        console.log('[API] Successfully connected to MongoDB');
    }
    catch (error) {
        console.error('[API] Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
// Use CORS for our frontend requests
app.use((0, cors_1.default)({ origin: ['http://localhost:5173', 'https://yurifitness.aceddivision.com'] }));
// Stripe webhook needs raw body, not JSON
app.use('/stripe/webhook', express_1.default.raw({ type: 'application/json' }));
app.use(express_1.default.json());
// Routes
app.use('/auth', auth_1.default);
app.use('/api/exercises', exercises_1.default);
app.use('/api', api_1.default);
app.use('/stripe', stripe_1.default);
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Add simple health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Serve frontend static assets from public_html
const candidates = [
    path_1.default.resolve(__dirname, '../../../public_html'),
    path_1.default.resolve(__dirname, '../../public_html'),
    path_1.default.resolve(__dirname, '../public_html')
];
const publicHtmlPath = candidates.find(p => fs_1.default.existsSync(p)) || candidates[0];
app.use(express_1.default.static(publicHtmlPath));
// Fallback for client-side SPA routing (only for non-API/non-auth routes)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/stripe')) {
        return next();
    }
    const indexPath = path_1.default.join(publicHtmlPath, 'index.html');
    if (fs_1.default.existsSync(indexPath)) {
        return res.sendFile(indexPath);
    }
    next();
});
// Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`[API] Server is running on port ${PORT}`);
    });
});
