const express = require('express');
const supabase = require('./supabaseClient');
const logMessage = require('./logger');

const app = express();
app.use(express.json());

// Incoming WhatsApp webhook
app.post('/webhook', async (req, res) => {

    const message = req.body;

    logMessage("INCOMING", message);

    try {

        const { data, error } = await supabase
            .from('messages')
            .insert([{
                sender: message.from,
                text: message.text,
                type: "incoming"
            }]);

        if (error) throw error;

        console.log("Stored in Supabase:", data);

        res.sendStatus(200);

    } catch (err) {

        console.error("Database Error:", err);
        res.status(500).send("Database Error");

    }

});


// Send WhatsApp message (simulation)
app.post('/send', async (req, res) => {

    const { to, text } = req.body;

    logMessage("OUTGOING", req.body);

    try {

        const { data, error } = await supabase
            .from('messages')
            .insert([{
                sender: "system",
                receiver: to,
                text: text,
                type: "outgoing"
            }]);

        if (error) throw error;

        res.json({
            status: "Message stored successfully",
            data: data
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Error sending message");

    }

});


// View stored messages
app.get('/messages', async (req, res) => {

    const { data, error } = await supabase
        .from('messages')
        .select('*');

    if (error) {
        console.error(error);
        return res.status(500).send("Database Error");
    }

    res.json(data);

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
