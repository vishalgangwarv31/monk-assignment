import React, { useState } from 'react';
import AdminMenu from "../../component/admin/AdminMenu";
import axios from 'axios';
import moment from 'moment';

interface Availability {
    id: number;
    startTime: string;
    endTime: string;
}

interface Employee {
    id: number;
    email: string;
    availabilities: Availability[];
}

const Shifts: React.FC = () => {
    const [date, setDate] = useState<string>("");
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [employees, setEmployees] = useState<Employee[]>([]);

    const handleFetchEmployees = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.post(
                "http://localhost:3004/admin/show-availability",
                { date, startTime, endTime },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(response.data);
            setEmployees(response.data.employees);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const handleBookShift = async (availabilityId: number) => {
        try {
            const token = localStorage.getItem("adminToken");
            const formattedDate = moment(date).format("YYYY-MM-DDT00:00:00.000[Z]");
            const formattedStartTime = moment(`${date} ${startTime}`, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm:ss");
            const formattedEndTime = moment(`${date} ${endTime}`, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm:ss");

            const payload = {
                availabilityId,
                date: formattedDate,
                startTime: formattedStartTime,
                endTime: formattedEndTime
            };

            console.log(payload);

            const response = await axios.post(
                "http://localhost:3004/admin/book-shift",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log(response.data.message);
            handleFetchEmployees();
        } catch (error) {
            console.error("Error booking shift:", error);
        }
    };

    return (
        <div>
            <AdminMenu />
            <div className="shifts-container">
                <h2>Select Shift</h2>
                <div className="shift-form">
                    <label>
                        Date:
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </label>
                    <label>
                        Start Time:
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </label>
                    <label>
                        End Time:
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </label>
                    <button className="fetch-button" onClick={handleFetchEmployees}>
                        Fetch Available Employees
                    </button>
                </div>

                <div>
                    <h3>Available Employees</h3>
                    <ul className="employees-list">
                        {employees.map((employee) => (
                            <li key={employee.id} className="employee-card">
                                <p><strong>ID:</strong> {employee.id}</p>
                                <p><strong>Email:</strong> {employee.email}</p>
                                {employee.availabilities.map((availability) => (
                                    <div key={availability.id} className="availability-section">
                                        <p><strong>Start Time:</strong> {availability.startTime}</p>
                                        <p><strong>End Time:</strong> {availability.endTime}</p>
                                        <button className="book-button" onClick={() => handleBookShift(availability.id)}>
                                            Book Shift
                                        </button>
                                    </div>
                                ))}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Shifts;
