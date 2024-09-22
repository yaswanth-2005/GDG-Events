const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv')
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
dotenv.config()

const adminUser = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("DB Connected.."))

// Event Schema
const eventSchema = new mongoose.Schema({
    eventName: String,
    eventDescription: String,
    eventDate: Date,
    registrationLink: String,
});

const Event = mongoose.model('Event', eventSchema);


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminUser.username && password === adminUser.password) {
        res.json({ message: "login success" }); // Return an object with a message
    } else {
        res.status(401).json({ message: "Invalid credentials" }); // Return 401 for unauthorized
    }
})
// Routes
app.post('/addEvent', async (req, res) => {
    const { eventName, eventDescription, eventDate, registrationLink } = req.body;
    const event = new Event({ eventName, eventDescription, eventDate, registrationLink });
    await event.save();
    res.send('Event added successfully');
});

app.get('/getEvents', async (req, res) => {
    const events = await Event.find({}).sort({ eventDate: 1 });
    const currentDate = new Date();
    const categorizedEvents = {
        upcomingEvents: [],
        liveEvents: [],
        pastEvents: []
    };

    events.forEach(event => {
        const eventDate = new Date(event.eventDate);
        if (eventDate > currentDate) {
            categorizedEvents.upcomingEvents.push(event);
        } else if (eventDate.toDateString() === currentDate.toDateString()) {
            categorizedEvents.liveEvents.push(event);
        } else {
            categorizedEvents.pastEvents.push(event);
        }
    });

    res.json(categorizedEvents);
});

app.listen(5000, () => console.log('Server running on port 5000'));
