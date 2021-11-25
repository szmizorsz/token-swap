# Token swap Project

This project exposes UniswapV2 like swapping functionality.

# Unit test

In order to run the unit test you need to use hardhat mainnet forking functionality.
You can run the hardhat node with the forking option before running unit tests.
```shell
npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/<key>
```
Or you can add to the .env the following key:
ALCHEMY_URL=<key>

Unit tests will run against the forked mainnet:

```shell
 npx hardhat test --network local
```
