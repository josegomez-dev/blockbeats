#!/usr/bin/env python3

import asyncio
import json
import os
from starknet_py.contract import Contract
from starknet_py.net import AccountClient, KeyPair
from starknet_py.net.gateway_client import GatewayClient
from starknet_py.net.models import StarknetChainId
from starknet_py.net.signer.stark_curve_signer import StarkCurveSigner

# Configuration
NETWORK = "testnet"  # Change to "mainnet" for production
CHAIN_ID = StarknetChainId.TESTNET  # Change to StarknetChainId.MAINNET for production

# Contract configuration
CONTRACT_NAME = "BlockBeatsNFT"
CONTRACT_SYMBOL = "BBEATS"

async def deploy_contract():
    print("🚀 Starting BlockBeats NFT Contract Deployment...")
    
    # Check if we have the required environment variables
    private_key = os.getenv('STARKNET_PRIVATE_KEY')
    account_address = os.getenv('STARKNET_ACCOUNT_ADDRESS')
    
    if not private_key or not account_address:
        print("❌ Error: Please set the following environment variables:")
        print("   export STARKNET_PRIVATE_KEY=0x...")
        print("   export STARKNET_ACCOUNT_ADDRESS=0x...")
        print("\nYou can get these from your Starknet wallet (ArgentX, Braavos, etc.)")
        return None
    
    try:
        # Initialize the client
        client = GatewayClient(NETWORK)
        
        # Create key pair and signer
        key_pair = KeyPair.from_private_key(private_key)
        signer = StarkCurveSigner(account_address, key_pair, CHAIN_ID)
        
        # Create account client
        account = AccountClient(
            address=account_address,
            client=client,
            signer=signer,
            supported_tx_version=1,
        )
        
        print(f"📋 Account: {account_address}")
        print(f"🌐 Network: {NETWORK}")
        
        # Read the compiled contract
        contract_path = "target/dev/blockbeats_nft_BlockBeatsNFT.contract_class.json"
        if not os.path.exists(contract_path):
            print(f"❌ Error: Contract file not found at {contract_path}")
            print("   Make sure you've run 'scarb build' first")
            return None
        
        with open(contract_path, "r") as f:
            contract_compiled = json.load(f)
        
        print("📦 Contract loaded successfully")
        
        # Deploy the contract
        print("⏳ Deploying contract...")
        deployment_result = await Contract.deploy(
            account=account,
            compiled_contract=contract_compiled,
            constructor_args=[CONTRACT_NAME, CONTRACT_SYMBOL, account_address],
        )
        
        print("⏳ Waiting for deployment confirmation...")
        await deployment_result.wait_for_acceptance()
        
        contract_address = deployment_result.deployed_contract.address
        print(f"✅ Contract deployed successfully!")
        print(f"📍 Contract Address: {hex(contract_address)}")
        
        # Save contract address to a file for frontend use
        contract_info = {
            "contract_address": hex(contract_address),
            "network": NETWORK,
            "chain_id": CHAIN_ID.value,
            "deployed_at": deployment_result.transaction_hash,
            "name": CONTRACT_NAME,
            "symbol": CONTRACT_SYMBOL
        }
        
        with open("contract-address.json", "w") as f:
            json.dump(contract_info, f, indent=2)
        
        print(f"💾 Contract info saved to contract-address.json")
        print(f"\n🔗 View on Starknet Explorer:")
        print(f"   https://starknet.io/explorer/contract/{hex(contract_address)}")
        
        print(f"\n📝 Add this to your .env.local:")
        print(f"   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS={hex(contract_address)}")
        
        return contract_address
        
    except Exception as error:
        print(f"❌ Deployment failed: {error}")
        return None

if __name__ == "__main__":
    print("🎵 BlockBeats NFT Contract Deployment Script")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("target/dev/blockbeats_nft_BlockBeatsNFT.contract_class.json"):
        print("❌ Error: Contract not compiled. Please run 'scarb build' first")
        exit(1)
    
    result = asyncio.run(deploy_contract())
    
    if result:
        print("\n🎉 Deployment completed successfully!")
        print("   Your NFT contract is now live on Starknet!")
    else:
        print("\n💥 Deployment failed. Please check the errors above.")
        exit(1)