// server.js
require("dotenv").config()
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require("cors")
var validator = require('validator');

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI; // Replace with your MongoDB URI

app.use(bodyParser.json());
app.use(cors())

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Define a mongoose schema for your email data
const emailSchema = new mongoose.Schema({
    valid: [String],
    invalid: [String],
});

const Email = mongoose.model('Email', emailSchema);

app.post('/saveEmails', async (req, res) => {
    const { emails } = req.body;

    // Separate valid and invalid emails (you can add your validation logic here)
    const validEmails = emails.filter(email => validator.isEmail(email));
    const invalidEmails = emails.filter(email => !validEmails.includes(email));

    // Save the emails to the MongoDB collection
    const emailDocument = new Email({ valid: validEmails, invalid: invalidEmails });
    try {
        const savedEmail = await emailDocument.save();
        res.json(savedEmail);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save emails' });
    }
});

app.get('/getEmails', async (req, res) => {
    try {
        const emailData = await Email.find().sort({ _id: -1 });
        res.json(emailData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
