pragma solidity ^0.8.24;

contract NexpayMerchantAdd {
    // Mapping from merchant address to an array of payment addresses
    mapping(address => address[]) private merchantAddresses;

    // Mapping from merchant address to registration status
    mapping(address => bool) private isRegistered;

    // Event: Emitted when a merchant registers with their addresses
    event MerchantRegistered(address indexed merchant, address[] addresses);

    // Event: Emitted when a merchant updates their payment addresses
    event AddressesUpdated(address indexed merchant, address[] addresses);

    // Event: Emitted when an address is validated for a merchant
    event AddressValidated(address indexed merchant, address validatedAddress);

    // Register a merchant with their payment addresses
    function registerMerchant(address[] memory addresses) public {
        require(!isRegistered[msg.sender], "Merchant already registered");
        require(addresses.length > 0, "Must provide at least one address");

        // Store addresses
        merchantAddresses[msg.sender] = addresses;
        isRegistered[msg.sender] = true;

        emit MerchantRegistered(msg.sender, addresses);
    }

    // Update the payment addresses for a registered merchant
    function updateAddresses(address[] memory addresses) public {
        require(isRegistered[msg.sender], "Merchant not registered");
        require(addresses.length > 0, "Must provide at least one address");

        // Update addresses
        merchantAddresses[msg.sender] = addresses;

        emit AddressesUpdated(msg.sender, addresses);
    }

    // Get all payment addresses for the caller (only accessible by the merchant)
    function getAddresses() public view returns (address[] memory) {
        require(isRegistered[msg.sender], "Merchant not registered");
        return merchantAddresses[msg.sender];
    }

    // Validate if a given address belongs to a registered merchant (public function)
    function validateAddress(address merchant, address addressToValidate) public returns (bool) {
        require(isRegistered[merchant], "Merchant not registered");

        address[] memory addresses = merchantAddresses[merchant];
        for (uint i = 0; i < addresses.length; i++) {
            if (addresses[i] == addressToValidate) {
                emit AddressValidated(merchant, addressToValidate);
                return true;
            }
        }
        return false;
    }
}