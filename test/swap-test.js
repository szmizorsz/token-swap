const { expect } = require("chai");
const { ethers } = require("hardhat");

const WETHAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const DAIAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
const MANAAddress = "0x0f5d2fb29fb7d3cfee444a200298f468908cc942";
const UNISWAPV2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const SUSHISWAP_ROUTER = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
const ROUTERS = [UNISWAPV2_ROUTER, SUSHISWAP_ROUTER];

describe("TokenSwap", function () {

  let account1, account2, account3;
  let tokenSwap;
  let weth;
  let dai;
  let mana;

  beforeEach(async function () {
    provider = ethers.getDefaultProvider("http://localhost:8545");
    [account1, account2, account3] = await ethers.getSigners();

    const TokenSwap = await ethers.getContractFactory("TokenSwap");
    tokenSwap = await TokenSwap.deploy(WETHAddress);
    await tokenSwap.deployed();

    weth = await ethers.getContractAt("WETH9", WETHAddress);
    dai = await ethers.getContractAt("IERC20", DAIAddress);
    mana = await ethers.getContractAt("IERC20", MANAAddress);

    await weth.connect(account2).deposit({ value: ethers.utils.parseEther("15") })
  });

  it("Should should swap 1 weth to dai", async function () {
    let amountIn = ethers.utils.parseEther("1");
    let wethBalanceBefore = await weth.connect(account2).balanceOf(account2.address)
    let daiBalanceBefore = await dai.connect(account2).balanceOf(account2.address)

    // TokenSwap contract has to be approved to handle amountIn of weth in behalf of address2:
    // tokensawp contract will transfer the amount to its contract address
    await weth.connect(account2).approve(tokenSwap.address, amountIn);

    // We execute the swap on one of the routers
    const tx = await tokenSwap.connect(account2).swap(WETHAddress, DAIAddress, amountIn, account2.address, ROUTERS);
    const receipt = await tx.wait();
    // The router where the swap was executed is emitted in the Swap event
    const routerAddress = receipt.events[6].args[0];
    // The amount is also emitted in the Swap event
    const amountSwaped = receipt.events[6].args[1].toString();
    expect(await dai.connect(account2).balanceOf(account2.address)).to.equal(daiBalanceBefore.add(amountSwaped));
    expect(await weth.connect(account2).balanceOf(account2.address)).to.equal(wethBalanceBefore.sub(amountIn));

    // the amount can not be displayed with the BigNumber .toNumber() so we have to manually split for decimals
    const amountDisplay = amountSwaped.substring(0, amountSwaped.length - 18) + "," + amountSwaped.substring(amountSwaped.length - 18);
    console.log("Should should swap 1 weth to dai: the swap was executed on the following router: " + routerAddress);
    console.log("Should should swap 1 weth to dai: the result of the swap: " + amountDisplay);
  });

  it("Should should swap dai to mana", async function () {
    // First we have to swap 1 weth to dai: this is the same as the previous test
    let amountIn = ethers.utils.parseEther("1");
    let wethBalanceBefore = await weth.connect(account2).balanceOf(account2.address)
    let daiBalanceBefore = await dai.connect(account2).balanceOf(account2.address)

    // TokenSwap contract has to be approved to handle amountIn of weth in behalf of address2:
    // tokensawp contract will transfer the amount to its contract address
    await weth.connect(account2).approve(tokenSwap.address, amountIn);

    // We execute the swap on one of the routers
    let tx = await tokenSwap.connect(account2).swap(WETHAddress, DAIAddress, amountIn, account2.address, ROUTERS);
    let receipt = await tx.wait();
    // The router where the swap was executed is emitted in the Swap event
    let routerAddress = receipt.events[6].args[0];
    // The amount is also emitted in the Swap event
    let amountSwaped = receipt.events[6].args[1].toString();
    expect(await dai.connect(account2).balanceOf(account2.address)).to.equal(daiBalanceBefore.add(amountSwaped));
    expect(await weth.connect(account2).balanceOf(account2.address)).to.equal(wethBalanceBefore.sub(amountIn));

    // The real test starts here: now we have dai to swap to mana
    let manaBalanceBefore = await mana.connect(account2).balanceOf(account2.address)
    amountIn = await dai.connect(account2).balanceOf(account2.address);
    await dai.connect(account2).approve(tokenSwap.address, amountIn);

    // We execute the swap on one of the routers
    tx = await tokenSwap.connect(account2).swap(DAIAddress, MANAAddress, amountIn, account2.address, ROUTERS);
    receipt = await tx.wait();

    // The router where the swap was executed is emitted in the Swap event
    routerAddress = receipt.events[9].args[0];
    // The amount is also emitted in the Swap event
    amountSwaped = receipt.events[9].args[1].toString();
    expect(await mana.connect(account2).balanceOf(account2.address)).to.equal(manaBalanceBefore.add(amountSwaped));
    expect(await dai.connect(account2).balanceOf(account2.address)).to.equal(0);

    // the amount can not be displayed with the BigNumber .toNumber() so we have to manually split for decimals
    const amountDisplay = amountSwaped.substring(0, amountSwaped.length - 18) + "," + amountSwaped.substring(amountSwaped.length - 18);
    console.log("Should should swap dai to mana: the swap was executed on the following router: " + routerAddress);
    console.log("Should should swap dai to mana: the result of the swap: " + amountDisplay);
  });

  it("Should should swap dai to weth", async function () {
    // First we have to swap 1 weth to dai: this is the same as the previous test
    let amountIn = ethers.utils.parseEther("1");
    let wethBalanceBefore = await weth.connect(account2).balanceOf(account2.address)
    let daiBalanceBefore = await dai.connect(account2).balanceOf(account2.address)

    // TokenSwap contract has to be approved to handle amountIn of weth in behalf of address2:
    // tokensawp contract will transfer the amount to its contract address
    await weth.connect(account2).approve(tokenSwap.address, amountIn);

    // We execute the swap on one of the routers
    let tx = await tokenSwap.connect(account2).swap(WETHAddress, DAIAddress, amountIn, account2.address, ROUTERS);
    let receipt = await tx.wait();
    // The router where the swap was executed is emitted in the Swap event
    let routerAddress = receipt.events[6].args[0];
    // The amount is also emitted in the Swap event
    let amountSwaped = receipt.events[6].args[1].toString();
    expect(await dai.connect(account2).balanceOf(account2.address)).to.equal(daiBalanceBefore.add(amountSwaped));
    expect(await weth.connect(account2).balanceOf(account2.address)).to.equal(wethBalanceBefore.sub(amountIn));

    // The real test starts here: now we have dai to swap to weth
    wethBalanceBefore = await weth.connect(account2).balanceOf(account2.address)
    amountIn = dai.connect(account2).balanceOf(account2.address);
    await dai.connect(account2).approve(tokenSwap.address, amountIn);

    // We execute the swap on one of the routers
    tx = await tokenSwap.connect(account2).swap(DAIAddress, WETHAddress, amountIn, account2.address, ROUTERS);
    receipt = await tx.wait();

    // The router where the swap was executed is emitted in the Swap event
    routerAddress = receipt.events[6].args[0];
    // The amount is also emitted in the Swap event
    amountSwaped = receipt.events[6].args[1].toString();
    expect(await weth.connect(account2).balanceOf(account2.address)).to.equal(wethBalanceBefore.add(amountSwaped));
    expect(await dai.connect(account2).balanceOf(account2.address)).to.equal(0);

    // the amount can not be displayed with the BigNumber .toNumber() so we have to manually split for decimals
    const amountDisplay = amountSwaped.substring(0, amountSwaped.length - 18) + "," + amountSwaped.substring(amountSwaped.length - 18);
    console.log("Should should swap dai to weth: the swap was executed on the following router: " + routerAddress);
    console.log("Should should swap dai to weth: the result of the swap: " + amountDisplay);
  });

});
