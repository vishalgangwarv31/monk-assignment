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
exports.getShifts = exports.getAvailability = exports.createAvailability = exports.register = exports.login = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
dotenv_1.default.config();
const JWT_SECRET = process.env.EMPLOYEE_AUTH_JWT;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const pass = req.body.password;
        const existingEmployee = yield client_1.default.employee.findUnique({
            where: { email: email }
        });
        if (existingEmployee === null) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(pass, existingEmployee === null || existingEmployee === void 0 ? void 0 : existingEmployee.password);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        const token = (0, jsonwebtoken_1.sign)({ id: existingEmployee.id, email: existingEmployee.email }, JWT_SECRET, { expiresIn: "3d" });
        res.status(200).json({
            message: "Login successful",
            token,
            admin: { id: existingEmployee === null || existingEmployee === void 0 ? void 0 : existingEmployee.id, email: existingEmployee === null || existingEmployee === void 0 ? void 0 : existingEmployee.email }
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
        const timezone = req.body.timezone || 'America/New_York';
        const existingEmployee = yield client_1.default.employee.findUnique({
            where: { email }
        });
        const hashedPassword = yield bcrypt_1.default.hash(pass, 10);
        if (existingEmployee !== null) {
            res.status(400).json({ error: "employee already exists" });
            return;
        }
        const newEmployee = yield client_1.default.employee.create({
            data: {
                email: email,
                password: hashedPassword,
                timezone: timezone
            }
        });
        res.status(201).json({
            message: "employee created successfully",
            employee: newEmployee
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
});
exports.register = register;
const createAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, startTime, endTime } = req.body;
        const employeeId = req.user.id;
        const employee = yield client_1.default.employee.findUnique({
            where: { id: employeeId },
            select: { timezone: true },
        });
        const employeeTimezone = (employee === null || employee === void 0 ? void 0 : employee.timezone) || "America/New_York";
        const dateUTC = moment_timezone_1.default.tz(date, "UTC").format("YYYY-MM-DD");
        const startDateTimeUTC = moment_timezone_1.default.tz(`${dateUTC} ${startTime}`, "YYYY-MM-DD HH:mm", employeeTimezone)
            .tz("UTC")
            .format("YYYY-MM-DD HH:mm:ss");
        const endDateTimeUTC = moment_timezone_1.default.tz(`${dateUTC} ${endTime}`, "YYYY-MM-DD HH:mm", employeeTimezone)
            .tz("UTC")
            .format("YYYY-MM-DD HH:mm:ss");
        const newAvailability = yield client_1.default.availability.create({
            data: {
                date: moment_timezone_1.default.tz(dateUTC, "UTC").toDate(),
                startTime: startDateTimeUTC,
                endTime: endDateTimeUTC,
                employeeId: employeeId
            }
        });
        res.status(201).json({
            message: "Availability created successfully",
            availability: newAvailability
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
});
exports.createAvailability = createAvailability;
const getAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employeeId = req.user.id;
        const employee = yield client_1.default.employee.findUnique({
            where: { id: employeeId },
            select: { timezone: true },
        });
        const employeeTimezone = (employee === null || employee === void 0 ? void 0 : employee.timezone) || "America/New_York";
        const availabilities = yield client_1.default.availability.findMany({
            where: { employeeId: employeeId }
        });
        const availabilitiesInOriginalTimezone = availabilities.map(availability => {
            const startTimeInUserTz = moment_timezone_1.default.tz(availability.startTime, "UTC")
                .tz(employeeTimezone)
                .format("HH:mm");
            const endTimeInUserTz = moment_timezone_1.default.tz(availability.endTime, "UTC")
                .tz(employeeTimezone)
                .format("HH:mm");
            const dateInUserTz = moment_timezone_1.default.tz(availability.date, "UTC")
                .add(1, "day")
                .tz(employeeTimezone)
                .format("YYYY-MM-DD");
            return Object.assign(Object.assign({}, availability), { date: dateInUserTz, startTime: startTimeInUserTz, endTime: endTimeInUserTz });
        });
        res.status(200).json({
            message: "Availabilities retrieved successfully",
            availabilities: availabilitiesInOriginalTimezone
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Error retrieving availabilities" });
    }
});
exports.getAvailability = getAvailability;
const getShifts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employeeId = req.user.id;
        const employee = yield client_1.default.employee.findUnique({
            where: { id: employeeId },
            select: { timezone: true },
        });
        const employeeTimezone = (employee === null || employee === void 0 ? void 0 : employee.timezone) || "America/New_York";
        const shifts = yield client_1.default.shiftAssignment.findMany({
            where: { employeeId: employeeId }
        });
        const shiftsInOriginalTimezone = shifts.map(shift => {
            const startTimeInUserTz = moment_timezone_1.default.tz(shift.startTime, "UTC")
                .tz(employeeTimezone)
                .format("HH:mm");
            const endTimeInUserTz = moment_timezone_1.default.tz(shift.endTime, "UTC")
                .tz(employeeTimezone)
                .format("HH:mm");
            const dateInUserTz = moment_timezone_1.default.tz(shift.date, "UTC")
                .add(1, "day")
                .tz(employeeTimezone)
                .format("YYYY-MM-DD");
            return Object.assign(Object.assign({}, shift), { date: dateInUserTz, startTime: startTimeInUserTz, endTime: endTimeInUserTz });
        });
        res.status(200).json({
            message: "Shifts retrieved successfully",
            shifts: shiftsInOriginalTimezone
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Error retrieving shifts" });
    }
});
exports.getShifts = getShifts;
