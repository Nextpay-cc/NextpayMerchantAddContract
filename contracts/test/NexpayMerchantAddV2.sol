// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract NexpayMerchantAddV2 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    // Mapping from merchant address to an array of payment addresses
    mapping(address => address[]) private merchantAddresses;

    // Mapping from merchant address to an array of item IDs
    mapping(address => string[]) private merchantItems;

    // Mapping from item ID to merchant address
    mapping(string => address) private itemToMerchant;

    // Mapping from item ID to array of associated addresses
    mapping(string => address[]) private itemToAddresses;

    // Event: Emitted when a merchant updates their payment addresses
    event AddressesUpdated(address indexed merchant, address[] addresses);

    // Event: Emitted when an address is validated for a merchant
    event AddressValidated(address indexed merchant, address validatedAddress);

    // Event: Emitted when an item is added for a merchant
    event ItemAdded(address indexed merchant, string itemId, address[] associatedAddresses);

    // Initializer function (replaces constructor)
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
    }

    // Required function to authorize contract upgrades
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // Update the payment addresses for a registered merchant
    function updateAddresses(address[] memory addresses) public {
        require(addresses.length > 0, "Must provide at least one address");

        // Clear old addresses by assigning a new empty array
        delete merchantAddresses[msg.sender];

        // Add new addresses
        merchantAddresses[msg.sender] = addresses;

        emit AddressesUpdated(msg.sender, addresses);
    }

    // Get all payment addresses for the caller (only accessible by the merchant)
    function getAddresses() public view returns (address[] memory) {
        return merchantAddresses[msg.sender];
    }

    // Validate if a given address belongs to a registered merchant (public function)
    function validateAddress(address merchant, address addressToValidate) public view returns (bool) {
        address[] memory addresses = merchantAddresses[merchant];
        for (uint i = 0; i < addresses.length; i++) {
            if (addresses[i] == addressToValidate) {
                return true;
            }
        }
        return false;
    }

    // Add an item for a registered merchant, associating it with existing addresses if available
    function addItem(string calldata itemId) public {
        // Ensure the merchant has at least one address
        address[] memory addresses = merchantAddresses[msg.sender];
        require(addresses.length > 0, "Merchant must have at least one address associated");

        // Add item ID to the merchant's list of items
        merchantItems[msg.sender].push(itemId);
        itemToMerchant[itemId] = msg.sender;  // Map itemId to merchant address

        // Associate the itemId with the merchant's addresses
        itemToAddresses[itemId] = addresses;

        emit ItemAdded(msg.sender, itemId, addresses);
    }

    // Get all items for the caller (only accessible by the merchant)
    function getItems() public view returns (string[] memory) {
        return merchantItems[msg.sender];
    }

    // Find the merchant address associated with an item ID
    function findMerchantByItem(string memory itemId) public view returns (address) {
        return itemToMerchant[itemId];
    }

    // Get addresses associated with a specific item ID
    function getAddressesByItem(string memory itemId) public view returns (address[] memory) {
        return itemToAddresses[itemId];
    }

    function newFunction() public pure returns (string memory) {
        return "New functionality in V2";
    }
}
