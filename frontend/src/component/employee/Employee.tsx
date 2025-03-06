import { Link, Route, Routes, useLocation } from "react-router-dom";
import EmpSignUp from "./EmpSignUp";
import EmpSignIn from "./EmpSignIn";
import EmpProtectedRoute from "../../Utils/EmpProtectedRoute";
import Availability from "../../pages/Emp/Availability";
import Shifts from "../../pages/Emp/Shifts";

const Employee = () =>{
    const location = useLocation();

    return(
        <div>
      {location.pathname === '/employee/' && (
        <nav>
          <ul>
            <li><Link to="/employee/register">Register</Link></li>
            <li><Link to="/employee/login">Log In</Link></li>
          </ul>
        </nav>
      )}

      <Routes>
        <Route path="/register" element={<EmpSignUp />} />
        <Route path="/login" element={<EmpSignIn />} />

        <Route element={<EmpProtectedRoute />}>
          <Route path="/availability" element = {<Availability/>} />
          <Route path="/shifts" element = {<Shifts/>} />
        </Route>
      </Routes>
    </div>
    )
}
export default Employee