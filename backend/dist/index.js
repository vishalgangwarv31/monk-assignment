"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminRoutes_1 = __importDefault(require("./Routes/adminRoutes"));
const employeeRoutes_1 = __importDefault(require("./Routes/employeeRoutes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3004;
const corsOptions = {
    origin: 'http://localhost:5173',
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.json({
        message: "appp is working"
    });
});
app.use('/admin', adminRoutes_1.default);
app.use('/employee', employeeRoutes_1.default);
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
