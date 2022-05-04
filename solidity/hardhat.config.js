require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// // You need to export an object to set up your config
// // Go to https://hardhat.org/config/ to learn more

// /**
//  * @type import('hardhat/config').HardhatUserConfig
//  */

module.exports = {
  solidity: '0.8.1',
  networks: {
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/Tyo47a6JILTHmrObJ5aK-b_PoHQLpCYh',
      accounts: ['fa674ebf2b662e2b7f95c4d54751f7c40cb849a38fbb327c1bea0ac3274e1274'],
    },
  },
};