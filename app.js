const express = require('express');
const authenticationRouter = require('./routes/authenticationRoute');

const app = express();

app.use(express.json());
app.use('/api/v1', authenticationRouter);

module.exports = app;
