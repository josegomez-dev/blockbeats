// src/lib.cairo
#[starknet::contract]
mod PixelMusicNFT {
    // ────────────────────────────────
    // Imports
    use starknet::ContractAddress;
    use starknet::context::ContextTrait;

    // OpenZeppelin components
    use openzeppelin_introspection::src5::SRC5Component;
    use openzeppelin_token::erc721::{
        ERC721Component,
        ERC721HooksEmptyImpl    // we don’t need custom hooks
    };

    // ────────────────────────────────
    // Storage
    component!(
        path: SRC5Component,   storage: src5,  event: SRC5Event
    );
    component!(
        path: ERC721Component, storage: erc721, event: ERC721Event
    );

    // ────────────────────────────────
    // Constructor
    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: felt252,          // e.g. "BlockBeats Pixels"
        symbol: felt252,        // e.g. "BBPIX"
        base_uri: felt252       // optional – pass 0 if you handle URIs client-side
    ) {
        // 1. ERC-721 initialisation
        self.erc721.initialise(
            name=name,
            symbol=symbol,
            owner=ContextTrait::get_caller_address(),   // deployer is default owner
            // Next tokenId will start at 1 unless we override it
            max_supply=0   // 0 => unlimited supply
        );
        // 2. Register interfaces (SRC-5 = ERC-165 analogue)
        self.src5.initialise();
        // 3. Store base-URI if you want on-chain concatenation
        self.base_uri.write(base_uri);
    }

    // ────────────────────────────────
    // Simple public mint
    // `external_id` comes straight from your Web2 DB
    // We use it *as* the tokenId, so no mapping storage is needed.
    #[external]
    fn mint_pixel_nft(
        ref self: ContractState,
        to: ContractAddress,
        external_id: u128        // fits in felt252 and is easy to handle off-chain
    ) {
        // Anyone may mint; add access-control if you need it
        self.erc721.mint(recipient=to, token_id=external_id);
    }

    // ────────────────────────────────
    // Optional: tokenURI getter that concatenates `base_uri + tokenId`
    #[view]                       // doesn’t cost gas
    fn token_uri(
        ref self: ContractState,
        token_id: u128
    ) -> felt252 {
        let base = self.base_uri.read();
        // If you prefer pure off-chain URI logic, delete this fn entirely.
        return base + token_id.into();
    }

    // ────────────────────────────────
    // Storage slots for variables we added
    #[storage] struct Storage {
        base_uri: felt252
    }
}
