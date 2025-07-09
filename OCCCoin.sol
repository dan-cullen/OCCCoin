// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract OCCCoin is ERC20, ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BLACKLISTER_ROLE = keccak256("BLACKLISTER_ROLE");

    AggregatorV3Interface public reserveFeed;
    mapping(address => bool) private _blacklisted;

    event Blacklisted(address indexed account);
    event Unblacklisted(address indexed account);

    constructor(address _reserveFeed) ERC20("OCC Coin", "OCCC") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        _setupRole(BLACKLISTER_ROLE, msg.sender);
	reserveFeed = AggregatorV3Interface(_reserveFeed);
    }

    function decimals() public view virtual override returns (uint8) {
        return 6; // OCCC uses 6 decimals
    }

    function setReserveFeed(address _reserveFeed) public onlyRole(DEFAULT_ADMIN_ROLE) {
        reserveFeed = AggregatorV3Interface(_reserveFeed);
    }

    function mint(address account, uint256 amount) public onlyRole(MINTER_ROLE) whenNotPaused {
        (, int256 reserveBalance,,,) = reserveFeed.latestRoundData();
    	require(reserveBalance >= int256(totalSupply() + amount), "USDCoin: Insufficient reserves");
    	require(!_blacklisted[account], "OCCCoin: Account is blacklisted");
        _mint(account, amount);
    }

    function burn(uint256 amount) public override whenNotPaused {
        require(!_blacklisted[msg.sender], "OCCCoin: Account is blacklisted");
        super.burn(amount);
    }

    function burnFrom(address account, uint256 amount) public override whenNotPaused {
        require(!_blacklisted[account], "OCCCoin: Account is blacklisted");
        super.burnFrom(account, amount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function blacklist(address account) public onlyRole(BLACKLISTER_ROLE) {
        require(account != address(0), "OCCCoin: Cannot blacklist zero address");
        require(!_blacklisted[account], "OCCCoin: Account already blacklisted");
        _blacklisted[account] = true;
        emit Blacklisted(account);
    }

    function unblacklist(address account) public onlyRole(BLACKLISTER_ROLE) {
        require(_blacklisted[account], "OCCCoin: Account not blacklisted");
        _blacklisted[account] = false;
        emit Unblacklisted(account);
    }

    function isBlacklisted(address account) public view returns (bool) {
        return _blacklisted[account];
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override
        whenNotPaused
    {
        require(!_blacklisted[from], "OCCCoin: Sender is blacklisted");
        require(!_blacklisted[to], "OCCCoin: Recipient is blacklisted");
        super._beforeTokenTransfer(from, to, amount);
    }
}
