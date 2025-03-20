const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 8800;

const API_ENDPOINTS = {
    primes: "http://20.244.56.144/test/primes",
    fibo: "http://20.244.56.144/test/fibo",
    even: "http://20.244.56.144/test/even",
    rand: "http://20.244.56.144/test/rand"
};

const windowSize = 10;

let windowNumbers = [];

const Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQyNDc0OTgzLCJpYXQiOjE3NDI0NzQ2ODMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjM5NzBlZjM2LWI5ZTctNDRjYy1iM2RjLTdlNzU4YWU1MTFmNyIsInN1YiI6InNzMjU2OUBzcm1pc3QuZWR1LmluIn0sImNvbXBhbnlOYW1lIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIiwiY2xpZW50SUQiOiIzOTcwZWYzNi1iOWU3LTQ0Y2MtYjNkYy03ZTc1OGFlNTExZjciLCJjbGllbnRTZWNyZXQiOiJWVG5QYkhJZFJzTUFRSmFHIiwib3duZXJOYW1lIjoiU0FISUwiLCJvd25lckVtYWlsIjoic3MyNTY5QHNybWlzdC5lZHUuaW4iLCJyb2xsTm8iOiJSQTIyMTEwMzIwMjAwMDkifQ.3Av-rypDNUieC1xccCXWCTWjKek7DnmlN5JVJoegKek";

const fetchNumbers = async (type) => {
    try {
        const response = await axios.get(API_ENDPOINTS[type], {
            headers: {
                Authorization: `Bearer ${Token}`
            },
            
            timeout: 5000
        });
        return response.data.numbers || [];
    } catch (error) {
        console.error(`Error fetching ${type} numbers:`, error.message);
        return [];
    }
};


const updateWindow = (newNumbers) => {
    try {
        const prevState = [...windowNumbers];
        
        newNumbers.forEach((num) => {
            if (!windowNumbers.includes(num)) {
                windowNumbers.push(num);
            }
        });
        
        if (windowNumbers.length > windowSize) {
            windowNumbers = windowNumbers.slice(windowNumbers.length - windowSize);
        }
        
        return prevState;
    } catch (error) {
        console.error("Error updating window:", error.message);
        return [];
    }
};

const calculateAverage = () => {
    if (windowNumbers.length === 0) return 0;
    const sum = windowNumbers.reduce((acc, num) => acc + num, 0);
    return parseFloat((sum / windowNumbers.length).toFixed(2));
};

app.get("/numbers/:type", async (req, res) => {
    const { type } = req.params;
    
    if (!API_ENDPOINTS[type]) {
        return res.status(400).json({ error: "Invalid number type" });
    }
    
    try {
        const newNumbers = await fetchNumbers(type);
        
        const prevState = updateWindow(newNumbers);
        
        const avg = calculateAverage();

        res.send(
            JSON.stringify({
                windowPrevState: prevState,
                windowCurrState: windowNumbers,
                numbers: newNumbers,
                avg: avg
            }, null, 0) 
        );
    } catch (error) {
        res.status(500).json({ 
            error: "Internal server error",
            message: error.message
        });
    }
});


app.listen(PORT, () => {
    console.log(`Average Calculator Microservice running on http://localhost:${PORT}`);
});
