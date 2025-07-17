import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import usersRouter from './routes/users.js';

dotenv.config()

const uri = process.env.MONGODB_URI
mongoose.connect(uri)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error: ', err))


const app = express();
const PORT = process.env.PORT || 3300;

app.use(express.json());
app.use('/api/users', usersRouter)

app.get('/', (req, res) => {
    res.send('User AUTH API is running')
})

app.listen(PORT, () => console.log(`Server is listening on PORT: ${PORT}`))