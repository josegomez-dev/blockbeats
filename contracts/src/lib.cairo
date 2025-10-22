use starknet::ContractAddress;

#[starknet::interface]
trait IBlockBeatsNFT<TContractState> {
    fn mint(ref self: TContractState, to: ContractAddress, token_id: u256, token_uri: felt252);
    fn get_owner(self: @TContractState) -> ContractAddress;
    fn name(self: @TContractState) -> felt252;
    fn symbol(self: @TContractState) -> felt252;
    fn token_uri(self: @TContractState, token_id: u256) -> felt252;
    fn owner_of(self: @TContractState, token_id: u256) -> ContractAddress;
    fn balance_of(self: @TContractState, owner: ContractAddress) -> u256;
    fn total_supply(self: @TContractState) -> u256;
}

#[starknet::contract]
mod BlockBeatsNFT {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::storage::StoragePointerReadAccess;
    use starknet::storage::StoragePointerWriteAccess;
    
    #[storage]
    struct Storage {
        owner: ContractAddress,
        name: felt252,
        symbol: felt252,
        token_count: u256,
        // Simple storage - we'll track the latest minted token
        latest_token_id: u256,
        latest_token_owner: ContractAddress,
        latest_token_uri: felt252,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Transfer: Transfer,
        Mint: Mint,
    }

    #[derive(Drop, starknet::Event)]
    struct Transfer {
        #[key]
        from: ContractAddress,
        #[key]
        to: ContractAddress,
        #[key]
        token_id: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Mint {
        #[key]
        to: ContractAddress,
        #[key]
        token_id: u256,
        token_uri: felt252,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: felt252,
        symbol: felt252,
        owner: ContractAddress
    ) {
        self.name.write(name);
        self.symbol.write(symbol);
        self.owner.write(owner);
        self.token_count.write(0);
        self.latest_token_id.write(0);
    }

    #[external(v0)]
    fn mint(
        ref self: ContractState,
        to: ContractAddress,
        token_id: u256,
        token_uri: felt252
    ) {
        let caller = get_caller_address();
        assert(caller == self.owner.read(), 'Not owner');
        
        // Store the latest minted token info
        self.latest_token_id.write(token_id);
        self.latest_token_owner.write(to);
        self.latest_token_uri.write(token_uri);
        
        // Increment token count
        let current_count = self.token_count.read();
        self.token_count.write(current_count + 1);
        
        // Emit events
        let zero_address: ContractAddress = 0.try_into().unwrap();
        self.emit(Transfer { from: zero_address, to, token_id });
        self.emit(Mint { to, token_id, token_uri });
    }

    #[external(v0)]
    fn get_owner(self: @ContractState) -> ContractAddress {
        self.owner.read()
    }

    #[external(v0)]
    fn name(self: @ContractState) -> felt252 {
        self.name.read()
    }

    #[external(v0)]
    fn symbol(self: @ContractState) -> felt252 {
        self.symbol.read()
    }

    #[external(v0)]
    fn token_uri(self: @ContractState, token_id: u256) -> felt252 {
        // Simple implementation - return the latest token URI if it matches
        let latest_id = self.latest_token_id.read();
        if token_id == latest_id {
            self.latest_token_uri.read()
        } else {
            0 // Return empty for non-existent tokens
        }
    }

    #[external(v0)]
    fn owner_of(self: @ContractState, token_id: u256) -> ContractAddress {
        // Simple implementation - return the latest token owner if it matches
        let latest_id = self.latest_token_id.read();
        if token_id == latest_id {
            self.latest_token_owner.read()
        } else {
            0.try_into().unwrap() // Return zero address for non-existent tokens
        }
    }

    #[external(v0)]
    fn balance_of(self: @ContractState, owner: ContractAddress) -> u256 {
        // Simple implementation - return 1 if owner has the latest token, 0 otherwise
        let latest_owner = self.latest_token_owner.read();
        if owner == latest_owner {
            1
        } else {
            0
        }
    }

    #[external(v0)]
    fn total_supply(self: @ContractState) -> u256 {
        self.token_count.read()
    }
}