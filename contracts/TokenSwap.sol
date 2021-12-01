// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./IERC20.sol";
import "./IUniswapV2Router.sol";

contract TokenSwap {
    event Swap(address router, uint256 amount);

    //address of WETH token (or WBNB)
    address private weth;

    constructor(address _weth) {
        weth = _weth;
    }

    //this swap function is used to trade from one token to another
    //the inputs are self explainatory
    //token in = the token address you want to trade out of
    //token out = the token address you want as the output of this trade
    //amount in = the amount of tokens you are sending in
    //to = the address you want the tokens to be sent to
    //routers = array of UniswapV2 like routers where the function will look for the best price
    function swap(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        address _to,
        address[] memory _routers
    ) external {
        //first we need to transfer the amount in tokens from the msg.sender to this contract
        //this contract will have the amount of in tokens
        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn);

        //path is an array of addresses.
        //this path array will have 3 addresses [tokenIn, WETH, tokenOut]
        //the if statement below takes into account if token in or token out is WETH.  then the path is only 2 addresses
        address[] memory path;
        if (_tokenIn == weth || _tokenOut == weth) {
            path = new address[](2);
            path[0] = _tokenIn;
            path[1] = _tokenOut;
        } else {
            path = new address[](3);
            path[0] = _tokenIn;
            path[1] = weth;
            path[2] = _tokenOut;
        }

        address router = address(0);
        uint256 amountOutMin = 0;

        // we look among exchanges (routers) the one that would give the most token as the result of the swap:
        // this is the best price
        for (uint256 i = 0; i < _routers.length; i++) {
            // amountOutMins is the array of swap results along the path
            uint256[] memory amountOutMins = IUniswapV2Router(_routers[i])
                .getAmountsOut(_amountIn, path);
            // we are interested only in the end result
            if (amountOutMins[path.length - 1] > amountOutMin) {
                router = _routers[i];
                amountOutMin = amountOutMins[path.length - 1];
            }
        }

        require(router != address(0), "no router to swap");

        //next we need to allow the uniswapv2 router to spend the token we just sent to this contract
        //by calling IERC20 approve you allow the uniswap contract to spend the tokens in this contract
        IERC20(_tokenIn).approve(router, _amountIn);
        //then we will call swapExactTokensForTokens
        //for the deadline we will pass in block.timestamp
        //the deadline is the latest time the trade is valid for
        uint256[] memory amounts = IUniswapV2Router(router)
            .swapExactTokensForTokens(
                _amountIn,
                amountOutMin,
                path,
                _to,
                block.timestamp
            );

        uint256 amount = amounts[amounts.length - 1];

        emit Swap(router, amount);
    }
}
