"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../Controller/adminController");
const adminAuthMiddleware_1 = require("../Middleware/adminAuthMiddleware");
const adminRoutes = (0, express_1.Router)();
adminRoutes.post('/login', adminController_1.login);
adminRoutes.post('/register', adminController_1.register);
adminRoutes.post('/get-availability', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.availability); // for one empl
adminRoutes.post('/show-availability', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.getAvailableEmployeesForShift);
adminRoutes.post('/book-shift', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.bookShift);
adminRoutes.get('/employee-data', adminAuthMiddleware_1.adminAuthMiddleware, adminController_1.getAllEmployees);
exports.default = adminRoutes;
