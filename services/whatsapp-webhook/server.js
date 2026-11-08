const express = require('express');
const supabase = require('./supabaseClient');
const logMessage = require('./logger');

const app = express();
app.use(express.json());

// Ask the agent API (FastAPI /agent/route) what to do with a message.
// Returns null if the agent is not configured or unreachable, so logging still works.
async function routeWithAgent(tenantId, phone, text) {
    const base = process.env.AGENT_API_URL;
    if (!base || !process.env.AGENT_API_KEY) return null;
    try {
        const res = await fetch(`${base.replace(/\/$/, '')}/agent/route`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Agent-Key': process.env.AGENT_API_KEY },
            body: JSON.stringify({ tenant_id: tenantId, phone, text }),
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error(`agent responded ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error("Agent routing failed:", err.message);
        return null;
    }
}

// Incoming WhatsApp webhook: log the message, route it by intent, store the reply
app.post('/webhook', async (req, res) => {

    const message = req.body;
    const tenantId = Number(message.tenant_id || process.env.DEFAULT_TENANT_ID);

    logMessage("INCOMING", message);

    try {

        const { error } = await supabase
            .from('messages')
            .insert([{
                sender: message.from,
                text: message.text,
                type: "incoming"
            }]);

        if (error) throw error;

    } catch (err) {

        console.error("Database Error:", err);
        return res.status(500).send("Database Error");

    }

    const routed = await routeWithAgent(tenantId, message.from, message.text || "");

    if (!routed) {
        return res.json({ stored: true, routed: false });
    }

    const { error: replyError } = await supabase
        .from('messages')
        .insert([{
            sender: "agent",
            receiver: message.from,
            text: routed.reply,
            type: "outgoing",
            intent: routed.intent,
            confidence: routed.confidence,
            handoff: routed.handoff
        }]);

    if (replyError) console.error("Reply log error:", replyError);
    logMessage("AGENT", { intent: routed.intent, confidence: routed.confidence, action: routed.action });

    res.json({
        stored: true,
        routed: true,
        intent: routed.intent,
        confidence: routed.confidence,
        action: routed.action,
        handoff: routed.handoff,
        reply: routed.reply
    });

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
