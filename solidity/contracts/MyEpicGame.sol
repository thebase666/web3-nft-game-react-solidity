// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./libraries/Base64.sol";
// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

// Our contract inherits from ERC721, which is the standard NFT contract!
contract MyEpicGame is ERC721 {
    struct CharacterAttributes {
        uint256 characterIndex;
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 attackDamage;
    }

    struct BigBoss {
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 attackDamage;
    }
    // struct CharacterAttributes       struct BigBoss {
    BigBoss public bigBoss; //初始数据用bigBoss 和 defaultCharacters数组保存
    CharacterAttributes[] defaultCharacters;
    mapping(uint256 => CharacterAttributes) public nftHolderAttributes; // 每个nft的状态
    mapping(address => uint256) public nftHolders; //每个用户的nft 也是可更改可增加新用户的

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event CharacterNFTMinted(
        address sender,
        uint256 tokenId,
        uint256 characterIndex
    );
    event AttackComplete(
        address sender,
        uint256 newBossHp,
        uint256 newPlayerHp
    );

    constructor(
        string[] memory characterNames,
        string[] memory characterImageURIs,
        uint256[] memory characterHp,
        uint256[] memory characterAttackDmg,
        string memory bossName, // These new variables would be passed in via run.js or deploy.js.
        string memory bossImageURI,
        uint256 bossHp,
        uint256 bossAttackDamage
    ) ERC721("Heroes", "HERO") {
        bigBoss = BigBoss({
            name: bossName,
            imageURI: bossImageURI,
            hp: bossHp,
            maxHp: bossHp,
            attackDamage: bossAttackDamage
        });

        for (uint256 i = 0; i < characterNames.length; i += 1) {
            defaultCharacters.push(
                CharacterAttributes({
                    characterIndex: i,
                    name: characterNames[i],
                    imageURI: characterImageURIs[i],
                    hp: characterHp[i],
                    maxHp: characterHp[i],
                    attackDamage: characterAttackDmg[i]
                })
            );

            CharacterAttributes memory c = defaultCharacters[i];

            // Hardhat's use of console.log() allows up to 4 parameters in any order of following types: uint, string, bool, address
            console.log(
                "Done initializing %s w/ HP %s, img %s",
                c.name,
                c.hp,
                c.imageURI
            );
        }

        _tokenIds.increment();
    }

    function mintCharacterNFT(uint256 _characterIndex) external {
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);

        // mapping(uint256 => CharacterAttributes) public nftHolderAttributes;
        nftHolderAttributes[newItemId] = CharacterAttributes({
            characterIndex: _characterIndex,
            name: defaultCharacters[_characterIndex].name,
            imageURI: defaultCharacters[_characterIndex].imageURI,
            hp: defaultCharacters[_characterIndex].hp,
            maxHp: defaultCharacters[_characterIndex].maxHp,
            attackDamage: defaultCharacters[_characterIndex].attackDamage
        });

        nftHolders[msg.sender] = newItemId;
        _tokenIds.increment();
        emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);
    }

    // override重写合约中自带的tokenURI 给nft传metadata
    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        CharacterAttributes memory charAttributes = nftHolderAttributes[
            _tokenId
        ];
        console.log("tokenURI start");
        string memory strHp = Strings.toString(charAttributes.hp);
        string memory strMaxHp = Strings.toString(charAttributes.maxHp);
        string memory strAttackDamage = Strings.toString(
            charAttributes.attackDamage
        );

        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": "',
                charAttributes.name,
                " -- NFT #: ",
                Strings.toString(_tokenId),
                '", "description": "This is an NFT that lets people play in the game Metaverse Slayer!", "image": "',
                charAttributes.imageURI,
                '", "attributes": [ { "trait_type": "Health Points", "value": ',
                strHp,
                ', "max_value":',
                strMaxHp,
                '}, { "trait_type": "Attack Damage", "value": ',
                strAttackDamage,
                "} ]}"
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        console.log("tokenURI finish");
        return output;
    }

    function attackBoss() public {
        // storage的player直接挂钩map表 改动player就改动map表 tokenURI和checkIfUserHasNFT返回的就是map表内容
        // tokenURI给nftmarket返回状态 checkIfUserHasNFT给前端react返回状态
        // 只有这个位置用来storage 其他都是memory
        // function getBigBoss() public view returns (BigBoss memory) {return bigBoss; }
        // 直接调用初始的bigBoss变量修改 bigBoss不是nft 初始的defaultCharacters没有改
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        CharacterAttributes storage player = nftHolderAttributes[
            nftTokenIdOfPlayer
        ];

        require(player.hp > 0, "Error: character must have HP to attack boss.");
        require(bigBoss.hp > 0, "Error: boss must have HP to attack boss.");

        if (bigBoss.hp < player.attackDamage) {
            bigBoss.hp = 0;
        } else {
            bigBoss.hp = bigBoss.hp - player.attackDamage;
        }
        if (player.hp < bigBoss.attackDamage) {
            player.hp = 0;
        } else {
            player.hp = player.hp - bigBoss.attackDamage;
        }
        console.log("Player attacked boss. New boss hp: %s", bigBoss.hp);
        console.log("Boss attacked player. New player hp: %s\n", player.hp);
        emit AttackComplete(msg.sender, bigBoss.hp, player.hp);
    }

    function checkIfUserHasNFT()
        public
        view
        returns (CharacterAttributes memory)
    {
        // Get the tokenId of the user's character NFT
        uint256 userNftTokenId = nftHolders[msg.sender];
        // If the user has a tokenId in the map, return their character.
        if (userNftTokenId > 0) {
            //查询状态时 也返回map表
            return nftHolderAttributes[userNftTokenId];
        }
        // Why do we do userNftTokenId > 0? Well, basically there's no way to check if a key in a map exists. We set up our map like this: mapping(address => uint256) public nftHolders. No matter what key we look for, there will be a default value of 0.
        // Else, return an empty character.
        else {
            CharacterAttributes memory emptyStruct;
            return emptyStruct;
        }
    }

    function getAllDefaultCharacters()
        public
        view
        returns (CharacterAttributes[] memory)
    {
        return defaultCharacters;
    }

    function getBigBoss() public view returns (BigBoss memory) {
        return bigBoss; //BigBoss memory
    }
}
