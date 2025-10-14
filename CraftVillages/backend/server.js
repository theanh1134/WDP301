const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    try {
        res.send({ message: 'Welcome to Craft Villages API!' });
    } catch (error) {
        res.send({ error: error.message });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api', emailRoutes);

const indexRoutes = require('./routes/index.js');

app.use("/", indexRoutes);    

app.use(errorHandler);

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));