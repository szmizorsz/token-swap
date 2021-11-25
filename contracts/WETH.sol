// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface WETH9 {
    function deposit() external payable;

    function balanceOf(address account) external view returns (uint256);

    function approve(address guy, uint256 wad) external returns (bool);
}
