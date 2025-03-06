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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookShift = exports.getAvailableEmployeesForShift = exports.getAllEmployees = exports.availability = exports.register = exports.login = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
dotenv_1.default.config();
const JWT_SECRET = process.env.ADMIN_AUTH_JWT;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const pass = req.body.password;
        const existingAdmin = yield client_1.default.admin.findUnique({
            where: { email: email }
        });
        if (existingAdmin === null) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(pass, existingAdmin === null || existingAdmin === void 0 ? void 0 : existingAdmin.password);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        const token = (0, jsonwebtoken_1.sign)({ id: existingAdmin.id, email: existingAdmin.email }, JWT_SECRET, { expiresIn: "3d" });
        res.status(200).json({
            message: "Login successful",
            token,
            admin: { id: existingAdmin === null || existingAdmin === void 0 ? void 0 : existingAdmin.id, email: existingAdmin === null || existingAdmin === void 0 ? void 0 : existingAdmin.email }
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
});
exports.login = login;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const pass = req.body.password;
        const existingAdmin = yield client_1.default.admin.findUnique({
            where: { email }
        });
        const hashedPassword = yield bcrypt_1.default.hash(pass, 10);
        if (existingAdmin !== null) {
            res.status(400).json({ error: "Admin already exists" });
            return;
        }
        const newAdmin = yield client_1.default.admin.create({
            data: {
                email: email,
                password: hashedPassword
            }
        });
        res.status(201).json({
            message: "Admin created successfully",
            admin: newAdmin
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
});
exports.register = register;
const availability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.body.id);
        if (!id) {
            res.status(400).json({ error: "Employee ID is required" });
            return;
        }
        const employee = yield client_1.default.employee.findUnique({
            where: { id },
            select: { timezone: true },
        });
        if (!employee) {
            res.status(404).json({ error: "Employee not found" });
            return;
        }
        const availabilities = yield client_1.default.availability.findMany({
            where: { employeeId: id },
        });
        res.status(200).json({
            message: "Employee availability retrieved successfully",
            availabilities,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving employee availability" });
    }
});
exports.availability = availability;
const getAllEmployees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employees = yield client_1.default.employee.findMany({
            select: {
                id: true,
                email: true,
                timezone: true
            }
        });
        res.status(200).json({
            message: "Employees retrieved successfully",
            employees: employees
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Error retrieving employees" });
    }
});
exports.getAllEmployees = getAllEmployees;
const getAvailableEmployeesForShift = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { date, startTime, endTime } = req.body;
        if (!date || !startTime || !endTime) {
            res.status(400).json({ error: "Date, start time, and end time are required" });
            return;
        }
        const formattedDateUTC = moment_timezone_1.default.tz(date, "UTC").format("YYYY-MM-DDT00:00:00.000[Z]");
        let shiftStartUTC = moment_timezone_1.default.tz(`${date.split('T')[0]} ${startTime}`, "YYYY-MM-DD HH:mm", "UTC")
            .format("YYYY-MM-DD HH:mm:ss");
        let shiftEndUTC = moment_timezone_1.default.tz(`${date.split('T')[0]} ${endTime}`, "YYYY-MM-DD HH:mm", "UTC")
            .format("YYYY-MM-DD HH:mm:ss");
        // Fix overnight shifts by rolling end time to the next day if needed
        if ((0, moment_timezone_1.default)(shiftEndUTC).isBefore(shiftStartUTC)) {
            shiftEndUTC = (0, moment_timezone_1.default)(shiftEndUTC).add(1, "day").format("YYYY-MM-DD HH:mm:ss");
        }
        const employees = yield client_1.default.employee.findMany({
            where: {
                availabilities: {
                    some: {
                        AND: [
                            {
                                startTime: { lte: shiftStartUTC }, // Availability starts before or exactly at shift start
                                endTime: { gte: shiftEndUTC } // Availability ends after or exactly at shift end
                            }
                        ]
                    }
                }
            },
            include: {
                availabilities: {
                    where: {
                        AND: [
                            {
                                startTime: { lte: shiftStartUTC },
                                endTime: { gte: shiftEndUTC }
                            }
                        ]
                    }
                }
            }
        });
        res.status(200).json({
            message: "Employees available for the given shift",
            employees
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching available employees" });
    }
});
exports.getAvailableEmployeesForShift = getAvailableEmployeesForShift;
const bookShift = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { availabilityId, date, startTime, endTime } = req.body;
        const availability = yield client_1.default.availability.findUnique({
            where: { id: availabilityId },
        });
        if (!availability) {
            res.status(404).json({ error: "Availability not found" });
            return;
        }
        const { employeeId, date: availableDate, startTime: availableStart, endTime: availableEnd } = availability;
        const shiftStart = moment_timezone_1.default.utc(startTime, "YYYY-MM-DD HH:mm:ss");
        const shiftEnd = moment_timezone_1.default.utc(endTime, "YYYY-MM-DD HH:mm:ss");
        const availableStartMoment = moment_timezone_1.default.utc(availableStart, "YYYY-MM-DD HH:mm:ss");
        const availableEndMoment = moment_timezone_1.default.utc(availableEnd, "YYYY-MM-DD HH:mm:ss");
        if (shiftStart.isBefore(availableStartMoment) || shiftEnd.isAfter(availableEndMoment)) {
            res.status(400).json({ error: "Shift time is outside available hours" });
            return;
        }
        yield client_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            yield tx.shiftAssignment.create({
                data: {
                    employeeId,
                    date: availableDate,
                    startTime: shiftStart.format("YYYY-MM-DD HH:mm:ss"),
                    endTime: shiftEnd.format("YYYY-MM-DD HH:mm:ss"),
                },
            });
            yield tx.availability.delete({
                where: { id: availabilityId },
            });
            const newAvailabilities = [];
            if (shiftStart.isAfter(availableStartMoment)) {
                newAvailabilities.push({
                    employeeId,
                    date: availableDate,
                    startTime: availableStartMoment.format("YYYY-MM-DD HH:mm:ss"),
                    endTime: shiftStart.format("YYYY-MM-DD HH:mm:ss"),
                });
            }
            if (shiftEnd.isBefore(availableEndMoment)) {
                newAvailabilities.push({
                    employeeId,
                    date: availableDate,
                    startTime: shiftEnd.format("YYYY-MM-DD HH:mm:ss"),
                    endTime: availableEndMoment.format("YYYY-MM-DD HH:mm:ss"),
                });
            }
            if (newAvailabilities.length > 0) {
                yield tx.availability.createMany({ data: newAvailabilities });
            }
        }));
        res.status(201).json({ message: "Shift assigned successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error assigning shift" });
    }
});
exports.bookShift = bookShift;
