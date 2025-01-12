const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./logger');

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

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request for ${req.url}`);
    next();
});

app.get('/mongodb/init', async (req, res) => {
    try {
        // Perform any necessary initialization steps here
        res.status(200).send('MongoDB initialized successfully');
        logger.info('MongoDB initialized successfully');
    } catch (error) {
        res.status(500).send('Error initializing MongoDB');
        logger.error('Error initializing MongoDB: ' + error.message);
    }
});

app.post('/mongodb/saveCharity', async (req, res) => {
    try {
        const charity = new Charity(req.body);
        await charity.save();
        res.status(200).send('Charity saved successfully');
        logger.info('Charity saved successfully: ' + JSON.stringify(req.body));
    } catch (error) {
        res.status(500).send('Error saving charity');
        logger.error('Error saving charity: ' + error.message);
    }
});

app.post('/mongodb/saveTransaction', async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.status(200).send('Transaction saved successfully');
        logger.info('Transaction saved successfully: ' + JSON.stringify(req.body));
    } catch (error) {
        res.status(500).send('Error saving transaction');
        logger.error('Error saving transaction: ' + error.message);
    }
});

app.listen(3000, () => {
    console.log('MongoDB server running on port 3000');
    logger.info('MongoDB server running on port 3000');
});