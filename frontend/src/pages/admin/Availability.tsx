import axios from "axios";
import { useState, useEffect } from "react";
import AdminMenu from "../../component/admin/AdminMenu";
import './admin.css'

type Employee = {
    id: number;
    email: string;
    timezone: string;
};

type Availability = {
    id: number;
    employeeId: number;
    date: string;
    startTime: string;
    endTime: string;
};

const Availability = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get('http://localhost:3004/admin/employee-data', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setEmployees(response.data.employees || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchAvailabilities = async (employeeId: number) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.post('http://localhost:3004/admin/get-availability', 
                { id: employeeId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
    
            setAvailabilities(response.data.availabilities || []);
        } catch (error) {
            console.error('Error fetching availabilities:', error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const employeeId = parseInt(e.target.value);
        const employee = employees.find(emp => emp.id === employeeId) || null;
        setSelectedEmployee(employee);
        if (employee) {
            fetchAvailabilities(employee.id);
        }
    };

    return (
        <div>
            <AdminMenu />
            <div className="container">
                <label className="label">Select Employee:</label>
                <select onChange={handleEmployeeChange} className="dropdown">
                    <option value="">Select an employee</option>
                    {employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                            {employee.email} ({employee.timezone})
                        </option>
                    ))}
                </select>
                
                {selectedEmployee && (
                    <div>
                        <p className="timezone">Timezone: {selectedEmployee.timezone}</p>
                        <div className="table-container">
                            {availabilities.length > 0 ? (
                                <table className="availability-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Day</th>
                                            <th>Start Time</th>
                                            <th>End Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {availabilities.map((availability) => {
                                            const dateObj = new Date(availability.date);
                                            const formattedDate = dateObj.toLocaleDateString();
                                            const dayOfWeek = dateObj.toLocaleString('en-US', { weekday: 'long' });

                                            return (
                                                <tr key={availability.id}>
                                                    <td>{formattedDate}</td>
                                                    <td>{dayOfWeek}</td>
                                                    <td>{availability.startTime}</td>
                                                    <td>{availability.endTime}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="no-data">No availabilities found for the selected employee.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Availability;
