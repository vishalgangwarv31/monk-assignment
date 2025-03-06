import { Router } from "express"
import { availability, bookShift, getAllEmployees, getAvailableEmployeesForShift, login, register } from "../Controller/adminController";
import { adminAuthMiddleware } from "../Middleware/adminAuthMiddleware";

const adminRoutes = Router()

adminRoutes.post('/login', login);
adminRoutes.post('/register', register);
adminRoutes.post('/get-availability',adminAuthMiddleware, availability); // for one empl
adminRoutes.post('/show-availability', adminAuthMiddleware , getAvailableEmployeesForShift);
adminRoutes.post('/book-shift',adminAuthMiddleware , bookShift);
adminRoutes.get('/employee-data',adminAuthMiddleware , getAllEmployees)

export default adminRoutes;