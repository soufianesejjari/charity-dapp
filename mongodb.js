const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());


mongoose.connect('mongodb://localhost:27017/charity-dapp', { useNewUrlParser: true, useUnifiedTopology: true });

const charitySchema = new mongoose.Schema({
    name: String,
    description: String,
    bankAccount: String,
    bankName: String,
    charityAddress: String
});

const transactionSchema = new mongoose.Schema({
    from: String,
    to: String,
    amount: Number,
    timestamp: Date
});

const Charity = mongoose.model('Charity', charitySchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

app.use(express.json());

app.get('/mongodb/init', async (req, res) => {
    try {
        // Perform any necessary initialization steps here
        res.status(200).send('MongoDB initialized successfully');
    } catch (error) {
        res.status(500).send('Error initializing MongoDB');
    }
});

app.post('/mongodb/saveCharity', async (req, res) => {
    try {
        const charity = new Charity(req.body);
        await charity.save();
        res.status(200).send('Charity saved successfully');
    } catch (error) {
        res.status(500).send('Error saving charity');
    }
});

app.post('/mongodb/saveTransaction', async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.status(200).send('Transaction saved successfully');
    } catch (error) {
        res.status(500).send('Error saving transaction');
    }
});

app.listen(3000, () => {
    console.log('MongoDB server running on port 3000');
});