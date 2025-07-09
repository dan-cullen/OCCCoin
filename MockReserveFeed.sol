// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract MockReserveFeed is AggregatorV3Interface {
    uint80 public roundId;
    int256 public reserveBalance;
    uint256 public startedAt;
    uint256 public updatedAt;
    uint80 public answeredInRound;

    constructor(int256 _initialBalance) {
        reserveBalance = _initialBalance;
        roundId = 1;
        startedAt = block.timestamp;
        updatedAt = block.timestamp;
        answeredInRound = 1;
    }

    function decimals() external pure override returns (uint8) {
        return 6; // Match OCC decimals
    }

    function description() external pure override returns (string memory) {
        return "Mock Reserve Feed";
    }

    function version() external pure override returns (uint256) {
        return 1;
    }

    function getRoundData(uint80 _roundId)
        external
        view
        override
        returns (
            uint80,
            int256,
            uint256,
            uint256,
            uint80
        )
    {
        // Silence unused parameter warning; _roundId not used in mock
        _roundId;
        return (roundId, reserveBalance, startedAt, updatedAt, answeredInRound);
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80,
            int256,
            uint256,
            uint256,
            uint80
        )
    {
        return (roundId, reserveBalance, startedAt, updatedAt, answeredInRound);
    }

    function setReserveBalance(int256 _reserveBalance) external {
        reserveBalance = _reserveBalance;
        roundId++;
        updatedAt = block.timestamp;
        answeredInRound = roundId;
    }
}
