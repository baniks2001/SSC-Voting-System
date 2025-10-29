// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;
    
    uint public candidatesCount;
    address public admin;
    bool public electionStarted;
    bool public electionEnded;

    event VoteEvent(uint indexed candidateId, address indexed voter);
    event ElectionStarted();
    event ElectionEnded();

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier electionOngoing() {
        require(electionStarted && !electionEnded, "Election is not ongoing");
        _;
    }

    constructor() {
        admin = msg.sender;
        candidatesCount = 0;
        electionStarted = false;
        electionEnded = false;
    }

    function addCandidate(string memory _name) public onlyAdmin {
        require(!electionStarted, "Cannot add candidates after election starts");
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function startElection() public onlyAdmin {
        require(!electionStarted, "Election already started");
        require(candidatesCount > 0, "Add candidates first");
        electionStarted = true;
        emit ElectionStarted();
    }

    function endElection() public onlyAdmin {
        require(electionStarted && !electionEnded, "Election not in progress");
        electionEnded = true;
        emit ElectionEnded();
    }

    function vote(uint _candidateId) public electionOngoing {
        require(!voters[msg.sender], "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");
        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        emit VoteEvent(_candidateId, msg.sender);
    }

    function getCandidate(uint _candidateId) public view returns (uint, string memory, uint) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");
        Candidate memory candidate = candidates[_candidateId];
        return (candidate.id, candidate.name, candidate.voteCount);
    }

    function getResults() public view returns (uint[] memory, string[] memory, uint[] memory) {
        uint[] memory ids = new uint[](candidatesCount);
        string[] memory names = new string[](candidatesCount);
        uint[] memory votes = new uint[](candidatesCount);

        for (uint i = 1; i <= candidatesCount; i++) {
            ids[i-1] = candidates[i].id;
            names[i-1] = candidates[i].name;
            votes[i-1] = candidates[i].voteCount;
        }

        return (ids, names, votes);
    }

    function getElectionStatus() public view returns (bool, bool) {
        return (electionStarted, electionEnded);
    }
}
