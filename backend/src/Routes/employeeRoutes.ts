import { Router } from "express"
import { createAvailability, getAvailability, getShifts, login, register } from "../Controller/employeeController";
import { employeeAuthMiddleware } from "../Middleware/employeeAuthMiddleware";

const empolyeeRoutes = Router()

empolyeeRoutes.post('/login', login);
empolyeeRoutes.post('/register', register);
empolyeeRoutes.post('/create-availability', employeeAuthMiddleware, createAvailability);
empolyeeRoutes.get('/get-availability', employeeAuthMiddleware ,getAvailability);
empolyeeRoutes.get('/get-shifts',employeeAuthMiddleware , getShifts);

export default empolyeeRoutes;