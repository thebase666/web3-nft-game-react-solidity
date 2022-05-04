import React, { useEffect, useState } from 'react';
import './App.css';

import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';
import { ethers } from 'ethers';
import Arena from './Components/Arena';

// Constants


const App = () => {
  // State
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      //获取ethereum 为空则未安装metamask
      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);

        const accounts = await ethereum.request({ method: 'eth_accounts' });
        //获取钱包数据 为空则安装了metamask但是未连接 不弹出钱包

        //请求连接 弹出钱包 用在点击button连接钱包的函数
        // const accounts = await ethereum.request({ method: 'eth_requestAccounts', });


        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log(error);
    }
  };


  const renderContent = () => {
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
            alt="Monty Python Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet To Get Started
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
      /*
      * If there is a connected wallet and characterNFT, it's time to battle!
      */
    } else if (currentAccount && characterNFT) {//有characterNFT 传递setCharacterNFT改状态
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} currentAccount={currentAccount} />;
    }
  };

  /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }
      //请求连接 弹出钱包
      const accounts = await ethereum.request({ method: 'eth_requestAccounts', });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const checkNetwork = async () => {
    try {
      const networkId = await window.ethereum.request({ method: 'net_version' });
      console.log('networkId:', networkId);//4 
      if (networkId !== '4') {
        alert("Please connect to Rinkeby!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    checkNetwork();
  }, []);

  useEffect(() => {
    /*
     * The function we will call that interacts with out smart contract
     */
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );//设置交互

      const txn = await gameContract.checkIfUserHasNFT();//参数为空 但是solidity用钱包地址查询
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }
    };

    /*
     * We only want to run this, if we have a connected wallet
     */
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Metaverse Slayer ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
          {/* This is where our button and image code used to be!
           *	Remember we moved it into the render method.
           */}
          {renderContent()}
        </div>

      </div>
    </div>
  );
};

export default App;