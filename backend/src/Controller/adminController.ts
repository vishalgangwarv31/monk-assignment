import { Request, Response } from "express";
import prisma from "../prisma/client";
import bcrypt from "bcrypt"
import { sign } from 'jsonwebtoken'
import dotenv from "dotenv";
import moment from "moment-timezone";


dotenv.config();
const JWT_SECRET = process.env.ADMIN_AUTH_JWT as string;

export const login = async (req: Request , res : Response ): Promise<void> =>{
    try {
        const email = req.body.email;
        const pass = req.body.password;

        const existingAdmin = await prisma.admin.findUnique({
            where : { email : email}
        })
        
        if (existingAdmin === null) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        
        const isMatch = await bcrypt.compare(pass, existingAdmin?.password as string);
        if (!isMatch) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }

        const token = sign(
            { id: existingAdmin.id , email : existingAdmin.email},
            JWT_SECRET,
            { expiresIn: "3d" } 
        )


        res.status(200).json({
            message: "Login successful",
            token,
            admin: { id: existingAdmin?.id, email: existingAdmin?.email }
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



        const existingAdmin = await prisma.admin.findUnique({
            where : {email}
        })

        const hashedPassword = await bcrypt.hash(pass,10);

        if (existingAdmin !== null) {
            res.status(400).json({ error: "Admin already exists" });
            return;
        }


        const newAdmin = await prisma.admin.create({
            data: {
                email: email,
                password: hashedPassword
            }
        });
        res.status(201).json({
            message: "Admin created successfully",
            admin: newAdmin
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid input fields" });
    }
};

export const availability = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.body.id);

        if (!id) {
            res.status(400).json({ error: "Employee ID is required" });
            return;
        }

        const employee = await prisma.employee.findUnique({
            where: { id },
            select: { timezone: true },
        });

        if (!employee) {
            res.status(404).json({ error: "Employee not found" });
            return;
        }

        const availabilities = await prisma.availability.findMany({
            where: { employeeId: id },
        });

        res.status(200).json({
            message: "Employee availability retrieved successfully",
            availabilities,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error retrieving employee availability" });
    }
};



export const getAllEmployees = async (req: Request, res: Response): Promise<void> => {
    try {
        const employees = await prisma.employee.findMany({
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
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Error retrieving employees" });
    }
};


export const getAvailableEmployeesForShift = async (req: Request, res: Response): Promise<void> => {
    try {
        let { date, startTime, endTime } = req.body;

        if (!date || !startTime || !endTime) {
            res.status(400).json({ error: "Date, start time, and end time are required" });
            return;
        }

        const formattedDateUTC = moment.tz(date, "UTC").format("YYYY-MM-DDT00:00:00.000[Z]");

        let shiftStartUTC = moment.tz(`${date.split('T')[0]} ${startTime}`, "YYYY-MM-DD HH:mm", "UTC")
            .format("YYYY-MM-DD HH:mm:ss");
        let shiftEndUTC = moment.tz(`${date.split('T')[0]} ${endTime}`, "YYYY-MM-DD HH:mm", "UTC")
            .format("YYYY-MM-DD HH:mm:ss");

        // Fix overnight shifts by rolling end time to the next day if needed
        if (moment(shiftEndUTC).isBefore(shiftStartUTC)) {
            shiftEndUTC = moment(shiftEndUTC).add(1, "day").format("YYYY-MM-DD HH:mm:ss");
        }

        const employees = await prisma.employee.findMany({
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching available employees" });
    }
};


export const bookShift = async (req: Request, res: Response): Promise<void> => {
    try {
        const { availabilityId, date, startTime, endTime } = req.body;

        const availability = await prisma.availability.findUnique({
            where: { id: availabilityId },
        });

        if (!availability) {
            res.status(404).json({ error: "Availability not found" });
            return;
        }

        const { employeeId, date: availableDate, startTime: availableStart, endTime: availableEnd } = availability;

        const shiftStart = moment.utc(startTime, "YYYY-MM-DD HH:mm:ss");
        const shiftEnd = moment.utc(endTime, "YYYY-MM-DD HH:mm:ss");

        const availableStartMoment = moment.utc(availableStart, "YYYY-MM-DD HH:mm:ss");
        const availableEndMoment = moment.utc(availableEnd, "YYYY-MM-DD HH:mm:ss");

        if (shiftStart.isBefore(availableStartMoment) || shiftEnd.isAfter(availableEndMoment)) {
            res.status(400).json({ error: "Shift time is outside available hours" });
            return;
        }

        await prisma.$transaction(async (tx) => {
            await tx.shiftAssignment.create({
                data: {
                    employeeId,
                    date: availableDate,
                    startTime: shiftStart.format("YYYY-MM-DD HH:mm:ss"), 
                    endTime: shiftEnd.format("YYYY-MM-DD HH:mm:ss"), 
                },
            });

            await tx.availability.delete({
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
                await tx.availability.createMany({ data: newAvailabilities });
            }
        });

        res.status(201).json({ message: "Shift assigned successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error assigning shift" });
    }
};
