// Sources flattened with hardhat v2.28.0 https://hardhat.org

// SPDX-License-Identifier: MIT

// File contracts/FirstSmartContract.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract FirstSmartContract {
    uint256 balance;
    
    function setBalance(uint256 x) public {
        balance = x;
    }
    function getBalance() public view returns(uint256){
        return balance;
    }
}
