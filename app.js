const logger = require('./logger');
App = {
    loading: false,
    web3Provider: null,
    contracts: {},
    account: '0x0',
    init: async () => {
        console.log('Initializing App...');
        try {
            await App.initWeb3();
            await App.loadContract();
            await App.render();
            await App.initMongoDB();
            await App.initFraudDetectionModel();
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    },

    initWeb3: async () => {
        console.log('Initializing Web3...');
        if (typeof window.ethereum !== 'undefined') {
            App.web3Provider = window.ethereum;
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                App.account = accounts[0];
                console.log('Connected account:', App.account);
                
                window.ethereum.on('accountsChanged', function (accounts) {
                    App.account = accounts[0];
                    console.log('Account changed:', App.account);
                    App.render();
                });
                
                window.ethereum.on('chainChanged', function () {
                    console.log('Chain changed, reloading page...');
                    window.location.reload();
                });
                
                web3 = new Web3(App.web3Provider);
                
            } catch (error) {
                console.error("User denied account access:", error);
                $('#account').html('Please connect MetaMask to continue');
                throw error;
            }
        } else {
            console.error('No ethereum browser detected');
            $('#account').html('Please install MetaMask to use this DApp');
            throw new Error('No ethereum browser detected');
        }
    },

    initMongoDB: async () => {
        console.log('Initializing MongoDB...');
        try {
            const response = await fetch('http://localhost:3000/mongodb/init');
            if (!response.ok) {
                throw new Error('Failed to initialize MongoDB');
            }
            console.log('MongoDB initialized successfully');
        } catch (error) {
            console.error('Error initializing MongoDB:', error);
            $('#account').html('Error initializing MongoDB. Please try again later.');
        }
    },

    initFraudDetectionModel: async () => {
        console.log('Initializing Fraud Detection Model...');
        try {
            const response = await fetch('http://localhost:3001/fraud-detection/init');
            if (!response.ok) {
                throw new Error('Failed to initialize fraud detection model');
            }
            console.log('Fraud detection model initialized successfully');
        } catch (error) {
            console.error('Error initializing fraud detection model:', error);
            $('#account').html('Error initializing fraud detection model. Please try again later.');
        }
    },

    loadContract: async () => {
        console.log('Loading contract...');
        try {
            const response = await fetch('Charity.json');
            if (!response.ok) {
                throw new Error('Failed to load Charity.json');
            }
            const charityJson = await response.json();
    
            App.contracts.Charity = TruffleContract(charityJson);
            App.contracts.Charity.setProvider(App.web3Provider);
            App.charity = await App.contracts.Charity.deployed();
            console.log('Contract loaded:', App.charity.address);
        } catch (error) {
            console.error('Error loading contract:', error);
            throw error;
        }
    },

    render: async () => {
        console.log('Rendering app...');
        try {
            // Update account info
            $('#account').html('Your Account: ' + App.account);

            // Render charities
            await App.renderCharities();
            // Render organisations
            await App.renderOrganisations();
            // Render transactions
            await App.renderTransactions();
            await App.renderLatestCharities();
        } catch (error) {
            console.error('Error rendering:', error);
        }
    },

    renderCharities: async () => {
        console.log('Rendering charities...');
        try {
            const charityCount = await App.charity.charityCount();
            const $charities = $('#charities');
            $charities.empty();
    
            for (let i = 1; i <= charityCount; i++) {
                const charity = await App.charity.charities(i);
                const $charityTemplate = $(`
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${charity.name}</h5>
                            <p class="card-text">${charity.description}</p>
                            <p class="card-text">Bank Account: ${charity.bankAccount}</p>
                            <p class="card-text">Bank Name: ${charity.bankName}</p>
                            <p class="card-text">Balance: ${web3.utils.fromWei(charity.balance.toString(), 'ether')} ETH</p>
                            <p class="card-text">ID: ${charity.id}</p>
                        </div>
                    </div>
                `);
                $charities.append($charityTemplate);
            }
        } catch (error) {
            console.error('Error rendering charities:', error);
        }
    },

    renderOrganisations: async () => {
        console.log('Rendering organisations...');
        try {
            const orgCount = await App.charity.orgCount();
            const $organisations = $('#organisations');
            $organisations.empty();
    
            for (let i = 1; i <= orgCount; i++) {
                const org = await App.charity.organisations(i);
                const $orgTemplate = $(`
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${org.name}</h5>
                            <p class="card-text">Bank Account: ${org.bankAccount}</p>
                            <p class="card-text">Bank Name: ${org.bankName}</p>
                            <p class="card-text">Balance: ${web3.utils.fromWei(org.balance.toString(), 'ether')} ETH</p>
                            <p class="card-text">ID: ${org.id}</p>
                        </div>
                    </div>
                `);
                $organisations.append($orgTemplate);
            }
        } catch (error) {
            console.error('Error rendering organisations:', error);
        }
    },

    renderTransactions: async () => {
        console.log('Rendering transactions...');
        try {
            const transactionCount = await App.charity.transactionCount();
            const $transactions = $('#transactions');
            $transactions.empty();

            for (let i = 1; i <= transactionCount; i++) {
                const transaction = await App.charity.transactions(i);
                const $transactionTemplate = $(`
                    <div class="card mb-3">
                        <div class="card-body">
                            <p class="card-text">From: ${transaction.from}</p>
                            <p class="card-text">To: ${transaction.to}</p>
                            <p class="card-text">Amount: ${web3.utils.fromWei(transaction.amount.toString(), 'ether')} ETH</p>
                            <p class="card-text">Timestamp: ${new Date(transaction.timestamp * 1000).toLocaleString()}</p>
                            <p class="card-text">ID: ${transaction.id}</p>
                        </div>
                    </div>
                `);
                $transactions.append($transactionTemplate);
            }
        } catch (error) {
            console.error('Error rendering transactions:', error);
        }
    },

    renderLatestCharities: async () => {
        console.log('Rendering latest charities...');
        try {
            const charityCount = await App.charity.charityCount();
            const $latestCharities = $('#latest-charities');
            $latestCharities.empty();
    
            for (let i = Math.max(1, charityCount - 2); i <= charityCount; i++) {
                const charity = await App.charity.charities(i);
                const $charityTemplate = $(`
                    <div class="col-md-4">
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">${charity.name}</h5>
                                <p class="card-text">${charity.description}</p>
                                <p class="card-text">Bank Account: ${charity.bankAccount}</p>
                                <p class="card-text">Bank Name: ${charity.bankName}</p>
                                <p class="card-text">Balance: ${web3.utils.fromWei(charity.balance.toString(), 'ether')} ETH</p>
                                <p class="card-text">ID: ${charity.id}</p>
                            </div>
                        </div>
                    </div>
                `);
                $latestCharities.append($charityTemplate);
            }
        } catch (error) {
            console.error('Error rendering latest charities:', error);
        }
    },

    createCharity: async () => {
        console.log('Creating charity...');
        $('.loading').show();
        $('#createCharityForm button').prop('disabled', true);
    
        try {
            const name = $('#charity_name').val();
            const description = $('#charity_description').val();
            const bankAccount = $('#charity_bankAccount').val();
            const bankName = $('#charity_bankName').val();
    
            if (!App.charity) {
                throw new Error('Contract not loaded. Please try again.');
            }
    
            const result = await App.charity.createCharity(
                name,
                description,
                bankAccount,
                bankName,
                {
                    from: App.account,
                    gas: 3000000
                }
            );

            console.log('Saving charity to MongoDB...');
            // Save to MongoDB
            await fetch('http://localhost:3000/mongodb/saveCharity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    description,
                    bankAccount,
                    bankName,
                    charityAddress: App.account
                })
            });
    
            console.log('Charity created:', result);
            $('#createCharityForm')[0].reset();
            await App.render();
            window.alert('Charity created successfully!');
        } catch (error) {
            console.error('Error creating charity:', error);
            window.alert('Error creating charity: ' + error.message);
        } finally {
            $('.loading').hide();
            $('#createCharityForm button').prop('disabled', false);
        }
    },

    createOrganisation: async () => {
        console.log('Creating organisation...');
        $('.loading').show();
        $('#createOrganisationForm button').prop('disabled', true);
        
        try {
            const name = $('#organisation_name').val();
            const bankAccount = $('#organisation_bankAccount').val();
            const bankName = $('#organisation_bankName').val();

            const result = await App.charity.createOrganisation(
                name,
                bankAccount,
                bankName,
                {
                    from: App.account,
                    gas: 3000000
                }
            );

            console.log('Organisation created:', result);
            $('#createOrganisationForm')[0].reset();
            await App.render();
            window.alert('Organisation created successfully!');
        } catch (error) {
            console.error('Error creating organisation:', error);
            window.alert('Error creating organisation: ' + error.message);
        } finally {
            $('.loading').hide();
            $('#createOrganisationForm button').prop('disabled', false);
        }
    },

    donateToCharity: async () => {
        console.log('Donating to charity...');
        $('.loading').show();
        $('#donateToCharityForm button').prop('disabled', true);
        
        try {
            const charityId = $('#charity_id').val();
            const amount = $('#donation_amount').val();
    
            const result = await App.charity.donateToCharity(
                charityId,
                {
                    from: App.account,
                    value: web3.utils.toWei(amount, 'ether'),
                    gas: 3000000
                }
            );

            console.log('Saving transaction to MongoDB...');
            // Save to MongoDB
            await fetch('http://localhost:3000/mongodb/saveTransaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: App.account,
                    to: charityId,
                    amount,
                    timestamp: Date.now()
                })
            });
            console.log('Donation successful:', result);
            $('#donateToCharityForm')[0].reset();
            await App.render();
            window.alert('Donation successful!');
        } catch (error) {
            console.error('Error donating:', error);
            window.alert('Error donating: ' + error.message);
        } finally {
            $('.loading').hide();
            $('#donateToCharityForm button').prop('disabled', false);
        }
    },

    donateToOrganisation: async () => {
        console.log('Donating to organisation...');
        $('.loading').show();
        $('#donateToOrganisationForm button').prop('disabled', true);
        
        try {
            const organisationId = $('#organisation_id').val();
            const amount = $('#donation_amount_org').val();
    
            const result = await App.charity.donateToOrganisation(
                organisationId,
                {
                    from: App.account,
                    value: web3.utils.toWei(amount, 'ether'),
                    gas: 3000000
                }
            );
    
            console.log('Donation successful:', result);
            $('#donateToOrganisationForm')[0].reset();
            await App.render();
            window.alert('Donation successful!');
        } catch (error) {
            console.error('Error donating:', error);
            window.alert('Error donating: ' + error.message);
        } finally {
            $('.loading').hide();
            $('#donateToOrganisationForm button').prop('disabled', false);
        }
    },

    includeHTML: () => {
        console.log('Including HTML...');
        let z, i, elmnt, file, xhttp;
        z = document.getElementsByTagName("*");
        for (i = 0; i < z.length; i++) {
            elmnt = z[i];
            file = elmnt.getAttribute("w3-include-html");
            if (file) {
                xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4) {
                        if (this.status == 200) {elmnt.innerHTML = this.responseText;}
                        if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
                        elmnt.removeAttribute("w3-include-html");
                        App.includeHTML();
                    }
                }
                xhttp.open("GET", file, true);
                xhttp.send();
                return;
            }
        }
    },
};

// Initialize app when document is ready
$(document).ready(function() {
    console.log('Document ready, initializing app...');
    App.includeHTML();
    App.init();

    $('#createCharityForm').on('submit', async function(e) {
        e.preventDefault();
        console.log('Create charity form submitted');
        await App.createCharity();
    });

    $('#createOrganisationForm').on('submit', async function(e) {
        e.preventDefault();
        console.log('Create organisation form submitted');
        await App.createOrganisation();
    });

    $('#donateToCharityForm').on('submit', async function(e) {
        e.preventDefault();
        console.log('Donate to charity form submitted');
        await App.donateToCharity();
    });

    $('#donateToOrganisationForm').on('submit', async function(e) {
        e.preventDefault();
        console.log('Donate to organisation form submitted');
        await App.donateToOrganisation();
    });
});