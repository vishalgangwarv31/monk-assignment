import { Link, Route, Routes, useLocation } from "react-router-dom";
import AdminSignUp from "./AdminSignUp";
import AdminSignIn from "./AdminSignIn";
import AdminProtectedRoute from "../../Utils/AdminProtectedRoute";
import Availability from "../../pages/admin/Availability";
import Shifts from "../../pages/admin/Shifts";

const Admin = () =>{
    const location = useLocation();

    return(
        <div>
      {location.pathname === '/admin/' && (
        <nav>
          <ul>
            <li><Link to="/admin/register">Register</Link></li>
            <li><Link to="/admin/login">Log In</Link></li>
          </ul>
        </nav>
      )}

      <Routes>
        <Route path="/register" element={<AdminSignUp />} />
        <Route path="/login" element={<AdminSignIn />} />

        <Route element={<AdminProtectedRoute />}>
          <Route path="/availability" element = {<Availability/>} />
          <Route path="/shifts" element = {<Shifts/>} />
        </Route>
      </Routes>
    </div>
    )
}
export default Admin