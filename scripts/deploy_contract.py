#!/usr/bin/env python3

import asyncio
import json
import os
from dotenv import load_dotenv
from starknet_py.contract import Contract
from starknet_py.net.full_node_client import FullNodeClient
from starknet_py.net.account.account import Account
from starknet_py.net.signer.stark_curve_signer import StarkCurveSigner
from starknet_py.net.signer.key_pair import KeyPair
from starknet_py.net.models import StarknetChainId

# Load environment variables from .env.local
load_dotenv('.env.local')

# Configuration
NETWORK = "mainnet"
CHAIN_ID = StarknetChainId.MAINNET

# Contract configuration
CONTRACT_NAME = "BlockBeatsNFT"
CONTRACT_SYMBOL = "BBEATS"

async def deploy_contract():
    print("🚀 Starting BlockBeats NFT Contract Deployment...")
    print("🌐 Deploying to Starknet MAINNET")
    print("=" * 50)
    
    # Check if we have the required environment variables
    private_key = os.getenv('STARKNET_PRIVATE_KEY')
    account_address = os.getenv('STARKNET_ACCOUNT_ADDRESS')
    
    if not private_key or not account_address:
        print("❌ Error: Please set the following environment variables:")
        print("   export STARKNET_PRIVATE_KEY=0x...")
        print("   export STARKNET_ACCOUNT_ADDRESS=0x...")
        return None
    
    try:
        # Initialize the client - using public RPC
        client = FullNodeClient(node_url="https://starknet-mainnet.public.blastapi.io/rpc/v0_7")
        
        # Create key pair and signer
        key_pair = KeyPair.from_private_key(int(private_key, 16))
        signer = StarkCurveSigner(
            account_address=account_address,
            key_pair=key_pair,
            chain_id=CHAIN_ID
        )
        
        # Create account
        account = Account(
            address=account_address,
            client=client,
            signer=signer,
        )
        
        print(f"📋 Account: {account_address}")
        print(f"🌐 Network: {NETWORK}")
        
        # Read the compiled contract
        contract_path = "contracts/target/dev/blockbeats_nft_BlockBeatsNFT.contract_class.json"
        if not os.path.exists(contract_path):
            print(f"❌ Error: Contract file not found at {contract_path}")
            print("   Make sure you've run 'scarb build' in the contracts directory")
            return None
        
        with open(contract_path, "r") as f:
            contract_compiled = json.load(f)
        
        print("📦 Contract loaded successfully")
        
        # First declare the contract
        print("⏳ Declaring contract...")
        declare_result = await Contract.declare_v3(
            account=account,
            compiled_contract=contract_compiled,
        )
        
        print("⏳ Waiting for declaration confirmation...")
        await declare_result.wait_for_acceptance()
        
        print(f"✅ Contract declared with class hash: {declare_result.class_hash}")
        
        # Now deploy the contract
        print("⏳ Deploying contract...")
        
        # Convert strings to felt252 for constructor
        name_felt = int.from_bytes(CONTRACT_NAME.encode('utf-8'), 'big')
        symbol_felt = int.from_bytes(CONTRACT_SYMBOL.encode('utf-8'), 'big')
        owner_address = account.address
        
        deployment_result = await Contract.deploy_contract_v1(
            account=account,
            class_hash=declare_result.class_hash,
            abi=contract_compiled.get('abi', []),
            constructor_args=[name_felt, symbol_felt, owner_address],
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
            "deployed_at": hex(deployment_result.hash),
            "name": CONTRACT_NAME,
            "symbol": CONTRACT_SYMBOL,
            "class_hash": hex(declare_result.class_hash)
        }
        
        with open("contract-address.json", "w") as f:
            json.dump(contract_info, f, indent=2)
        
        print(f"💾 Contract info saved to contract-address.json")
        print(f"\n🔗 View on Starknet Mainnet Explorer:")
        print(f"   https://starknet.io/explorer/contract/{hex(contract_address)}")
        
        print(f"\n📝 Add this to your .env.local:")
        print(f"   NEXT_PUBLIC_NFT_CONTRACT_ADDRESS={hex(contract_address)}")
        
        print(f"\n🎉 Your NFT contract is now live on Starknet MAINNET!")
        print(f"\n📋 What this enables:")
        print(f"   ✅ Real wallet interaction")
        print(f"   ✅ Actual NFT minting to Starknet wallet")
        print(f"   ✅ NFTs appear in wallet's NFT tab")
        print(f"   ✅ OpenSea integration")
        print(f"   ✅ Real blockchain transactions")
        
        return contract_address
        
    except Exception as error:
        print(f"❌ Deployment failed: {error}")
        return None

if __name__ == "__main__":
    print("🎵 BlockBeats NFT Contract Deployment Script")
    print("🌐 Deploying to Starknet MAINNET")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("contracts/target/dev/blockbeats_nft_BlockBeatsNFT.contract_class.json"):
        print("❌ Error: Contract not compiled. Please run 'scarb build' in the contracts directory")
        exit(1)
    
    result = asyncio.run(deploy_contract())
    
    if result:
        print("\n🎉 Deployment completed successfully!")
        print("   Your NFT contract is now live on Starknet!")
        print("   Update your .env.local with the contract address above.")
    else:
        print("\n💥 Deployment failed. Please check the errors above.")
        exit(1)