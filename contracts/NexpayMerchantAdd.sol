// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract NexpayMerchantAdd {
    // Mapping from merchant address to an array of payment addresses
    mapping(address => address[]) private merchantAddresses;

    // Mapping from merchant address to registration status
    mapping(address => bool) public isRegistered;

    // Mapping from merchant address to an array of item IDs
    mapping(address => string[]) private merchantItems;

    // Mapping from item ID to merchant address
    mapping(string => address) private itemToMerchant;

    // Event: Emitted when a merchant registers with their addresses
    event MerchantRegistered(address indexed merchant);

    // Event: Emitted when a merchant updates their payment addresses
    event AddressesUpdated(address indexed merchant, address[] addresses);

    // Event: Emitted when an address is validated for a merchant
    event AddressValidated(address indexed merchant, address validatedAddress);

    // Event: Emitted when an item is added for a merchant
    event ItemAdded(address indexed merchant, string itemId);

    // Register a merchant with their payment addresses
    function registerMerchant() public {
        require(!isRegistered[msg.sender], "Merchant already registered");

        // Store addresses
        isRegistered[msg.sender] = true;

        emit MerchantRegistered(msg.sender);
    }

    // Update the payment addresses for a registered merchant
    function updateAddresses(address[] memory addresses) public {
        require(isRegistered[msg.sender], "Merchant not registered");
        require(addresses.length > 0, "Must provide at least one address");

        // Clear old addresses by assigning a new empty array
        delete merchantAddresses[msg.sender];

        // Add new addresses
        merchantAddresses[msg.sender] = addresses;

        emit AddressesUpdated(msg.sender, addresses);
    }

    // Get all payment addresses for the caller (only accessible by the merchant)
    function getAddresses() public view returns (address[] memory) {
        require(isRegistered[msg.sender], "Merchant not registered");
        return merchantAddresses[msg.sender];
    }

    // Validate if a given address belongs to a registered merchant (public function)
    function validateAddress(address merchant, address addressToValidate) public view returns (bool) {
        require(isRegistered[merchant], "Merchant not registered");

        address[] memory addresses = merchantAddresses[merchant];
        for (uint i = 0; i < addresses.length; i++) {
            if (addresses[i] == addressToValidate) {
                return true;
            }
        }
        return false;
    }

    // Add an item for a registered merchant
    function addItem(string calldata itemId) public {
        require(isRegistered[msg.sender], "Merchant not registered");

        // Add item ID to the merchant's list of items
        merchantItems[msg.sender].push(itemId);
        itemToMerchant[itemId] = msg.sender;  // Map itemId to merchant address

        emit ItemAdded(msg.sender, itemId);
    }

    // Get all items for the caller (only accessible by the merchant)
    function getItems() public view returns (string[] memory) {
        require(isRegistered[msg.sender], "Merchant not registered");
        return merchantItems[msg.sender];
    }

    // Find the merchant address associated with an item ID
    function findMerchantByItem(string memory itemId) public view returns (address) {
        return itemToMerchant[itemId];
    }
}
