import axios from "axios";
import { useState, useEffect } from "react";
import EmpMenu from "../../component/employee/EmpMenu";
import moment from "moment";

type Availability = {
    id: number;
    employeeId: number;
    date: string;
    startTime: string;
    endTime: string;
};

const Shifts = () => {
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);

    const fetchAvailabilities = async () => {
        try {
            const token = localStorage.getItem("empToken");
            const response = await axios.get("http://localhost:3004/employee/get-shifts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailabilities(response.data.shifts || []);
        } catch (error) {
            console.error("Error fetching availabilities:", error);
        }
    };

    useEffect(() => {
        fetchAvailabilities();
    }, []);

    return (
        <div>
            <EmpMenu />
            <div className="shifts-container">
                <h2>Assigned Shifts</h2>
                {availabilities.length > 0 ? (
                    <div className="shifts-list">
                        {availabilities.map((availability: Availability) => (
                            <div key={availability.id} className="shift-card">
                                <p className="shift-day">
                                    {moment(availability.date).format("dddd, MMMM D, YYYY")}
                                </p>
                                <p><strong>Start Time:</strong> {availability.startTime}</p>
                                <p><strong>End Time:</strong> {availability.endTime}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-shifts">No shifts assigned.</p>
                )}
            </div>
        </div>
    );
};

export default Shifts;
