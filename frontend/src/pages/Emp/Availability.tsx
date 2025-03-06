import axios from "axios";
import { useState, useEffect, FormEvent } from "react";
import moment from "moment";
import EmpMenu from "../../component/employee/EmpMenu";
import './emp.css'

type Availability = {
    id: number;
    employeeId: number;
    date: string;
    startTime: string;
    endTime: string;
};

const Availability = () => {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [startDate, setStartDate] = useState(moment().startOf('day'));

    const createAvailability = async () => {
        try {
            const token = localStorage.getItem("empToken");
            const formattedDate = moment(date).add(1, "day").utc().startOf("day").format("YYYY-MM-DDTHH:mm:ss[Z]");
            const response = await axios.post("http://localhost:3004/employee/create-availability", {
                date: formattedDate,
                startTime,
                endTime
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("Availability created successfully:", response.data);
            fetchAvailabilities();
        } catch (error) {
            console.error("Error creating availability:", error);
        }
    };

    const fetchAvailabilities = async () => {
        try {
            const token = localStorage.getItem("empToken");
            const response = await axios.get("http://localhost:3004/employee/get-availability", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailabilities(response.data.availabilities || []);
        } catch (error) {
            console.error("Error fetching availabilities:", error);
        }
    };

    useEffect(() => {
        fetchAvailabilities();
    }, []);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        const start = moment(startTime, "HH:mm");
        const end = moment(endTime, "HH:mm");
    
        if (!start.isValid() || !end.isValid()) {
            alert("Invalid time format.");
            return;
        }
    
        const duration = moment.duration(end.diff(start)).asHours();
        
        if (duration < 4) {
            alert("The availability time range must be at least 4 hours.");
            return;
        }
    
        createAvailability();
    };
    

    const handleNextWeek = () => {
        setStartDate(startDate.clone().add(7, "days"));
    };

    const handlePreviousWeek = () => {
        setStartDate(startDate.clone().subtract(7, "days"));
    };

    const filteredAvailabilities = availabilities.filter(availability => {
        const availabilityDate = moment(availability.date);
        return availabilityDate.isBetween(startDate, startDate.clone().add(7, "days"), "day", "[]");
    });

    return (
        <div>
            <EmpMenu />
            <div className="availability-container">
                <form className="availability-form" onSubmit={handleSubmit}>
                    <label>
                        Date:
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </label>
                    <label>
                        Start Time:
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                    </label>
                    <label>
                        End Time:
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                    </label>
                    <button type="submit">Create Availability</button>
                </form>
                
                <div className="nav-buttons">
                    <button onClick={handlePreviousWeek}>Previous Week</button>
                    <button onClick={handleNextWeek}>Next Week</button>
                </div>

                {filteredAvailabilities.length === 0 ? (
                    <p className="no-availability">No availability data found for this week.</p>
                ) : (
                    <div className="availabilities-list">
                        {filteredAvailabilities.map((availability: Availability) => (
                            <div key={availability.id} className="availability-item">
                                <p className="availability-day">
                                    {moment(availability.date).format("dddd, MMMM D, YYYY")}
                                </p>
                                <p><strong>Start Time:</strong> {availability.startTime}</p>
                                <p><strong>End Time:</strong> {availability.endTime}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Availability;
