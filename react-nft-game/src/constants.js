const CONTRACT_ADDRESS = '0x619d1BB6dAcD8520C89F07c33916A9E274c8064a';

const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  };
};

export { CONTRACT_ADDRESS, transformCharacterData };



// Deploy again using npx hardhat run scripts/deploy.js --network rinkeby
// Change contractAddress in constants.js to be the new contract address we got from the step above in the terminal (just like we did before the first time we deployed).
// Get the updated abi file from artifacts and copy-paste it into your web app just like we did above.
// Again -- you need to do this every time you change your contract's code or else you'll get errors :).