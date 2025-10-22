# BlockBeats NFT Contract

A simple ERC721-compatible NFT contract for minting musical signatures created in BlockBeats.

## ✅ **Contract Successfully Compiled!**

The contract has been compiled and is ready for deployment.

## Contract Features

- **Mint Function**: Mint NFTs with custom token IDs and URIs
- **Owner Control**: Only the contract owner can mint NFTs
- **Event Emission**: Emits Transfer and Mint events
- **Basic ERC721 Functions**: name, symbol, token_uri, owner_of, balance_of

## Files Generated

- `target/dev/blockbeats_nft_BlockBeatsNFT.contract_class.json` - Compiled contract
- `target/dev/blockbeats_nft.starknet_artifacts.json` - Artifacts metadata

## Deployment

### Prerequisites

1. **Starknet Wallet**: ArgentX, Braavos, or other Starknet wallet
2. **Testnet ETH**: Get testnet ETH from [Starknet Faucet](https://starknet-faucet.vercel.app/)
3. **Environment Variables**: Set your wallet credentials

### Deploy to Testnet

1. **Set environment variables**:
   ```bash
   export STARKNET_PRIVATE_KEY=0x...
   export STARKNET_ACCOUNT_ADDRESS=0x...
   ```

2. **Run deployment script**:
   ```bash
   python scripts/deploy_contract.py
   ```

3. **Add contract address to frontend**:
   ```bash
   # Add to .env.local
   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
   ```

### Manual Deployment

You can also deploy manually using Starknet CLI tools:

```bash
# Using Starknet Foundry (if installed)
snforge init
# Edit contract and deploy
```

## Contract Interface

```cairo
#[starknet::interface]
trait IBlockBeatsNFT<TContractState> {
    fn mint(ref self: TContractState, to: ContractAddress, token_id: u256, token_uri: felt252);
    fn get_owner(self: @TContractState) -> ContractAddress;
    fn name(self: @TContractState) -> felt252;
    fn symbol(self: @TContractState) -> felt252;
    fn token_uri(self: @TContractState, token_id: u256) -> felt252;
    fn owner_of(self: @TContractState, token_id: u256) -> ContractAddress;
    fn balance_of(self: @TContractState, owner: ContractAddress) -> u256;
}
```

## Usage

Once deployed, the frontend can:

1. **Call mint function** with user's address, token ID, and IPFS URI
2. **Track minting status** in the database
3. **Show OpenSea links** for minted NFTs
4. **Verify ownership** before allowing minting

## Security Notes

- **Owner Only**: Only the contract owner can mint NFTs
- **Testnet First**: Always test on testnet before mainnet
- **Verify Addresses**: Double-check contract addresses before use
- **Private Keys**: Keep your private keys secure

## Next Steps

1. **Deploy to testnet** using the deployment script
2. **Test minting** from the frontend
3. **Deploy to mainnet** when ready for production
4. **Update frontend** with the deployed contract address

The contract is now ready for deployment! 🚀
