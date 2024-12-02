// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract Charity {
    uint public charityCount = 0;
    uint public orgCount = 0;
    uint public transactionCount = 0;

    struct CharityStruct {
        string name;
        string description;
        string bankAccount;
        string bankName;
        uint id;
        address payable charityAddress;
        uint balance;
    }

    struct OrganisationStruct {
        string name;
        string bankAccount;
        string bankName;
        uint id;
        address payable orgAddress;
        uint balance;
    }

    struct TransactionStruct {
        address from;
        address to;
        uint amount;
        uint timestamp;
        uint id;
    }

    mapping(uint => CharityStruct) public charities;
    mapping(uint => OrganisationStruct) public organisations;
    mapping(uint => TransactionStruct) public transactions;

    event CharityCreated(uint id, string name, address charityAddress, uint timestamp);
    event OrganisationCreated(uint id, string name, address orgAddress, uint timestamp);
    event DonationReceived(address from, address to, uint amount, uint timestamp);

    function createCharity(string memory _name, string memory _description, string memory _bankAccount, string memory _bankName) public returns(uint) {
        charityCount++;
        charities[charityCount] = CharityStruct({
            name: _name,
            description: _description,
            bankAccount: _bankAccount,
            bankName: _bankName,
            id: charityCount,
            charityAddress: msg.sender,
            balance: 0
        });

        emit CharityCreated(charityCount, _name, msg.sender, block.timestamp);
        return charityCount;
    }

    function createOrganisation(string memory _name, string memory _bankAccount, string memory _bankName) public returns(uint) {
        orgCount++;
        organisations[orgCount] = OrganisationStruct({
            name: _name,
            bankAccount: _bankAccount,
            bankName: _bankName,
            id: orgCount,
            orgAddress: msg.sender,
            balance: 0
        });

        emit OrganisationCreated(orgCount, _name, msg.sender, block.timestamp);
        return orgCount;
    }

    function donateToCharity(uint _charityId) public payable {
        require(_charityId > 0 && _charityId <= charityCount, "Invalid charity ID");
        require(msg.value > 0, "Donation amount must be greater than 0");

        CharityStruct storage charity = charities[_charityId];
        charity.balance += msg.value;
        charity.charityAddress.transfer(msg.value);

        transactionCount++;
        transactions[transactionCount] = TransactionStruct({
            from: msg.sender,
            to: charity.charityAddress,
            amount: msg.value,
            timestamp: block.timestamp,
            id: transactionCount
        });

        emit DonationReceived(msg.sender, charity.charityAddress, msg.value, block.timestamp);
    }

    function getCharityBalance(uint _charityId) public view returns(uint) {
        require(_charityId > 0 && _charityId <= charityCount, "Invalid charity ID");
        return charities[_charityId].balance;
    }

    function getOrganisationBalance(uint _orgId) public view returns(uint) {
        require(_orgId > 0 && _orgId <= orgCount, "Invalid organisation ID");
        return organisations[_orgId].balance;
    }
}