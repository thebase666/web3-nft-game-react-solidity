import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';

/*
 * Don't worry about setCharacterNFT just yet, we will talk about it soon!
 */
const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);

  const mintCharacterNFTAction = async (characterId) => {
    try {
      if (gameContract) {
        console.log('Minting character in progress...');
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log('mintTxn:', mintTxn);
      }
    } catch (error) {
      console.warn('MintCharacterAction Error:', error);
    }
  };

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      /*
       * This is the big difference. Set our gameContract in state.
       */
      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);


  useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log('Getting contract characters to mint');

        const charactersTxn = await gameContract.getAllDefaultCharacters();
        console.log('charactersTxn:', charactersTxn);

        const characters = charactersTxn.map((characterData) =>
          transformCharacterData(characterData)
        );

        setCharacters(characters);
      } catch (error) {
        console.error('Something went wrong fetching characters:', error);
      }
    };

    /*
     * Add a callback method that will fire when this event is received
     */
    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );

      /*
       * Once our character NFT is minted we can fetch the metadata from our contract
       * and set it in state to move onto the Arena
       */
      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        console.log('CharacterNFT: ', characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
        // setCharacterNFT 是app.js传过来 用来设置app.js中的characterNFT 一旦设置 将切换页面 unmount这个组件
      }
    };

    if (gameContract) {
      getCharacters();

      /*
       * Setup NFT Minted Listener
       */
      gameContract.on('CharacterNFTMinted', onCharacterMint);
      // 合约mint函数最后 emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);
      // 而且直接把参数给过去
    }

    return () => {
      // 当SelectCharacter组件unmount时 SelectCharacter组件的useEffect执行return () => {
      /*
       * When your component unmounts, let;s make sure to clean up this listener
       */
      if (gameContract) {
        gameContract.off('CharacterNFTMinted', onCharacterMint);
      }
    };
  }, [gameContract]);


  const renderCharacters = () =>
    characters.map((character, index) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={() => mintCharacterNFTAction(index)}
        >{`Mint ${character.name}`}</button>
      </div>
    ));




  return (
    <div className="select-character-container">
      <h2>Mint Your Hero. Choose wisely.</h2>
      {/* Only show this when there are characters in state */}
      {characters.length > 0 && (
        <div className="character-grid">{renderCharacters()}</div>
      )}
    </div>
  );
};

export default SelectCharacter;