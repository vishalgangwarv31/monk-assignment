import { Request, Response } from "express";
import prisma from "../prisma/client";
import bcrypt from "bcrypt"
import { sign } from 'jsonwebtoken'
import dotenv from "dotenv";
import { IGetUserAuthInfoRequest } from "../config/defination";
import moment from "moment-timezone";

dotenv.config();
const JWT_SECRET = process.env.EMPLOYEE_AUTH_JWT as string;

export const login = async (req: Request , res : Response ): Promise<void> =>{
    try {
        const email = req.body.email;
        const pass = req.body.password;

        const existingEmployee = await prisma.employee.findUnique({
            where : { email : email}
        })
        
        if (existingEmployee === null) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        
        const isMatch = await bcrypt.compare(pass, existingEmployee?.password as string);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        const token = sign(
            { id: existingEmployee.id , email : existingEmployee.email},
            JWT_SECRET,
            { expiresIn: "3d" } 
        )


        res.status(200).json({
            message: "Login successful",
            token,
            admin: { id: existingEmployee?.id, email: existingEmployee?.email }
    });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
}

export const register = async (req: Request, res: Response) : Promise<void> => {
    try {
        const email = req.body.email;
        const pass = req.body.password;
        const timezone = req.body.timezone || 'America/New_York';

        const existingEmployee = await prisma.employee.findUnique({
            where : {email}
        })

        const hashedPassword = await bcrypt.hash(pass,10);

        if (existingEmployee !== null) {
            res.status(400).json({ error: "employee already exists" });
            return;
        }


        const newEmployee = await prisma.employee.create({
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
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
};


export const createAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date, startTime, endTime } = req.body;
        const employeeId = (req as IGetUserAuthInfoRequest).user.id;

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: { timezone: true },
        });

        const employeeTimezone = employee?.timezone || "America/New_York";

        const dateUTC = moment.tz(date, "UTC").format("YYYY-MM-DD");

        const startDateTimeUTC = moment.tz(`${dateUTC} ${startTime}`, "YYYY-MM-DD HH:mm", employeeTimezone)
            .tz("UTC")
            .format("YYYY-MM-DD HH:mm:ss");

        const endDateTimeUTC = moment.tz(`${dateUTC} ${endTime}`, "YYYY-MM-DD HH:mm", employeeTimezone)
            .tz("UTC")
            .format("YYYY-MM-DD HH:mm:ss");

        const newAvailability = await prisma.availability.create({
            data: {
                date: moment.tz(dateUTC, "UTC").toDate(),
                startTime: startDateTimeUTC,
                endTime: endDateTimeUTC,
                employeeId: employeeId
            }
        });

        res.status(201).json({
            message: "Availability created successfully",
            availability: newAvailability
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
};

export const getAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
        const employeeId = (req as IGetUserAuthInfoRequest).user.id;

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: { timezone: true },
        });

        const employeeTimezone = employee?.timezone || "America/New_York";

        const availabilities = await prisma.availability.findMany({
            where: { employeeId: employeeId }
        });

        const availabilitiesInOriginalTimezone = availabilities.map(availability => {
            const startTimeInUserTz = moment.tz(availability.startTime, "UTC")
                .tz(employeeTimezone)
                .format("HH:mm");

            const endTimeInUserTz = moment.tz(availability.endTime, "UTC")
                .tz(employeeTimezone)
                .format("HH:mm");

            const dateInUserTz = moment.tz(availability.date, "UTC")
                .add(1, "day")
                .tz(employeeTimezone)
                .format("YYYY-MM-DD");

            return {
                ...availability,
                date: dateInUserTz,  
                startTime: startTimeInUserTz,  
                endTime: endTimeInUserTz  
            };
        });

        res.status(200).json({
            message: "Availabilities retrieved successfully",
            availabilities: availabilitiesInOriginalTimezone
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Error retrieving availabilities" });
    }
};

export const getShifts = async (req: Request, res: Response): Promise<void> => {
    try {
        const employeeId = (req as IGetUserAuthInfoRequest).user.id;

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: { timezone: true },
        });

        const employeeTimezone = employee?.timezone || "America/New_York";

        const shifts = await prisma.shiftAssignment.findMany({
            where: { employeeId: employeeId }
        });

        const shiftsInOriginalTimezone = shifts.map(shift => {
            const startTimeInUserTz = moment.tz(shift.startTime, "UTC")
                .tz(employeeTimezone)
                .format("HH:mm");

            const endTimeInUserTz = moment.tz(shift.endTime, "UTC")
                .tz(employeeTimezone)
                .format("HH:mm");

            const dateInUserTz = moment.tz(shift.date, "UTC")
                .add(1, "day")
                .tz(employeeTimezone)
                .format("YYYY-MM-DD");

            return {
                ...shift,
                date: dateInUserTz,  
                startTime: startTimeInUserTz,  
                endTime: endTimeInUserTz  
            };
        });

        res.status(200).json({
            message: "Shifts retrieved successfully",
            shifts: shiftsInOriginalTimezone
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Error retrieving shifts" });
    }
};
