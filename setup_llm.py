#!/usr/bin/env python3
"""
LLM Setup Script for Travel Assistant Pro
This script helps you configure and test LLM integration
"""

import os
import sys
from pathlib import Path

def create_env_file():
    """Create .env file with API keys"""
    env_path = Path(".env")
    
    if env_path.exists():
        print("⚠️  .env file already exists. Do you want to overwrite it? (y/n): ", end="")
        if input().lower() != 'y':
            print("Setup cancelled.")
            return False
    
    print("\n🚀 Setting up LLM integration for Travel Assistant Pro...")
    print("\nYou'll need API keys from one or both of these providers:")
    print("1. OpenAI (GPT-3.5/4): https://platform.openai.com/api-keys")
    print("2. Anthropic (Claude): https://console.anthropic.com/")
    
    print("\n" + "="*50)
    
    openai_key = input("Enter your OpenAI API key (or press Enter to skip): ").strip()
    anthropic_key = input("Enter your Anthropic API key (or press Enter to skip): ").strip()
    
    if not openai_key and not anthropic_key:
        print("\n❌ No API keys provided. LLM features will not be available.")
        print("You can still use the local AI model for basic functionality.")
        return False
    
    # Create .env file
    env_content = []
    if openai_key:
        env_content.append(f"OPENAI_API_KEY={openai_key}")
    if anthropic_key:
        env_content.append(f"ANTHROPIC_API_KEY={anthropic_key}")
    
    env_content.append("\n# Optional: Set your preferred LLM provider")
    if openai_key and anthropic_key:
        env_content.append("# PREFERRED_LLM=openai  # or anthropic")
    elif openai_key:
        env_content.append("PREFERRED_LLM=openai")
    elif anthropic_key:
        env_content.append("PREFERRED_LLM=anthropic")
    
    with open(env_path, "w") as f:
        f.write("\n".join(env_content))
    
    print(f"\n✅ Created .env file with your API keys")
    return True

def install_dependencies():
    """Install required LLM packages"""
    print("\n📦 Installing LLM dependencies...")
    
    try:
        import subprocess
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def test_llm_integration():
    """Test if LLM integration is working"""
    print("\n🧪 Testing LLM integration...")
    
    try:
        # Test import
        from src.services.llm import LLMService
        
        # Initialize service
        llm_service = LLMService()
        
        if llm_service.is_available():
            print("✅ LLM service initialized successfully!")
            print(f"   - OpenAI: {'✅' if llm_service.openai_api_key else '❌'}")
            print(f"   - Anthropic: {'✅' if llm_service.anthropic_api_key else '❌'}")
            return True
        else:
            print("❌ LLM service not available. Check your API keys.")
            return False
            
    except ImportError as e:
        print(f"❌ Failed to import LLM service: {e}")
        return False
    except Exception as e:
        print(f"❌ LLM service error: {e}")
        return False

def main():
    """Main setup function"""
    print("🌟 Travel Assistant Pro - LLM Setup")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not Path("src/services/llm.py").exists():
        print("❌ Please run this script from the project root directory.")
        return
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Setup failed. Please check the error messages above.")
        return
    
    # Create .env file
    if not create_env_file():
        print("⚠️  LLM setup incomplete. You can still use local AI features.")
        return
    
    # Test integration
    if test_llm_integration():
        print("\n🎉 LLM setup completed successfully!")
        print("\nNext steps:")
        print("1. Restart your backend server: uvicorn src.api:app --reload")
        print("2. Open your frontend: http://localhost:8080")
        print("3. Try asking questions - you should now get LLM-powered responses!")
    else:
        print("\n❌ LLM setup failed. Check your API keys and try again.")
        print("You can still use the local AI features.")

if __name__ == "__main__":
    main() 