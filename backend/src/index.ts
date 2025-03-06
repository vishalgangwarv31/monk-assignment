import express, { Request, Response } from 'express'
import adminRoutes from './Routes/adminRoutes';
import empolyeeRoutes from './Routes/employeeRoutes';
import cors from 'cors'

const app = express();
const port = 3004;

const corsOptions = {
    origin: 'http://localhost:5173', 
  };
app.use(cors(corsOptions));

app.use(express.json());

app.get('/',( req : Request, res : Response )=>{
    res.json({
        message : "appp is working"
    })
})

app.use('/admin',adminRoutes);
app.use('/employee',empolyeeRoutes);


app.listen(port, ()=>{
    console.log(`server is running on port ${port}`)
})