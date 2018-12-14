### Workshop

------

#### Welcome

- I'm **Billy Rennekamp**, I'm an artist and a developer working part time for a couple big projects like **Cosmos Network**, the creators of Tendermint and the Internet of Blockchains, **Gnosis**, a prediction market platform and creators of the Gnosis Safe and the DutchX decentralized exchange software. I also build on a couple smaller projects like **Clovers Network**, a game for generating rare art, **MemeLordz**, a curation market of memes (/r/MemeEconomy on the blockchain), **ENS Nifty**, a service for wrapping ENS domain names in NFTs so they can be sold on marketplaces like opensea and **Doneth** a shared wallet for open source projects.

#### Outline

1. ##### Part 1

   1. Setup Environment
   2. Make ERC-721
   3. Make Metadata
   4. Add Metadata to ERC-721
   5. Create Migrations
   6. Make Tests
   7. Make Migration for Updates
   8. Update ERC-721 and Tests
   9. Deploy
   10. Verify Contracts on Etherescan

2. ##### Part 2

   1. Make new netlify project
   2. Install netlify lambda
   3. Add helloworld function
   4. Add metadata
   5. Add proxy
   6. Add opensea
   7. Add rarebits
   8. Re-deploy and mint a token

#### Part 1

##### Step 1: Setup Environment

I'm using `node v9.11.2` and `yarn v1.7.0` for this. NPM and other versions of node should, work just a heads up ☝️

If you haven't already, install the following global packages:

```bash
yarn global add truffle
# or
npm install truffle --global

yarn global add truffle-flattener
# or
npm install truffle-flattener --global

yarn global add netlify-lambda
# or
npm install netlify-lambda --global
```

Make a new project folder somewhere:

```bash
mkdir ./workshop && cd ./workshop
```

Unbox truffle shavings and install your dependencies

```bash
truffle unbox okwme/truffle-shavings

yarn
# or
npm install
```

Create your  `.env` and open the project in your favorite editor in order to add your different network specific mnemonic phrases and Infura API key:

```bash
touch .env

code .
# or
atom .
```

```
TRUFFLE_MNEMONIC=candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
GANACHE_MNEMONIC=grid voyage cream cry fence load stove sort grief fuel room save
TESTNET_MNEMONIC=your mnemonic phrase that unlocks accounts with rinkenby balances
INFURA_API_KEY=y0uRiNfUr4k3y 
```

If you don't have an account with Rinkeby ETH you can use the account I made for this workshop. Just be careful cause if we're all using it at the same time and try to run transactions at the same time, there will be nonce collisions which will prevent some transactions from going through.

```
TESTNET_MNEMONIC=flash gravity sister tip question story slam square resemble intact require voyage
```

And you're welcome to use the Infura key I made for this workshop:

```
INFURA_API_KEY=85939c42711147b291a40dc3a77177f8
```

Make sure the boilerplate contracts compile, deploy and pass the dummy test locally and on rinkeby

```bash
$ truffle test
Using network 'test'.

Compiling ./contracts/Migrations.sol...
Compiling ./contracts/Sample.sol...
        Sample deployed at: 0x345cA3e014Aaf5dcA488057592ee47305D9B3e10


  Contract: Sample
        68922 - Deploy sample
        -----------------------
        68,922 - Total Gas
    Sample.sol
      ✓ should pass


  1 passing (171ms)
```

and just make sure our testnet account has gas let's try rinkeby

```bash
$ truffle test --network rinkeby
Using network 'rinkeby'.

Compiling ./contracts/Migrations.sol...
Compiling ./contracts/Sample.sol...
        Sample deployed at: 0x345cA3e014Aaf5dcA488057592ee47305D9B3e10


  Contract: Sample
        68922 - Deploy sample
        -----------------------
        68,922 - Total Gas
    Sample.sol
      ✓ should pass


  1 passing (171ms)
```

Create a new repo on github, gitlab or bitbucket and add our boilerplate

```bash
git init
git add .
git commit -m 'Step 1: Setup Environment'
git remote add origin git@github.com:{username}/{repo}.git
git push -u origin master
```

##### Step 2: Make ERC-721

Rename `Sample.sol` to `Token.sol` or whatever you want to call your NFT and change the content inside to reflect the name change.

```bash
mv ./contracts/Sample.sol ./contracts/Token.sol
```



```solidity
pragma solidity ^0.4.20;

/**
 * The Token contract does this and that...
 */
contract Token {
    constructor () public {}  
}
```

Import the open zeppelin ERC-721 library and add it to the contract class, then alter the constructor

```solidity
pragma solidity ^0.4.20;
import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

/**
 * The Token contract does this and that...
 */
contract Token is ERC721Token {
    constructor(string name, string symbol) public
        ERC721Token(name, symbol)
    { }
}

```

Commit your changes

```
git add . && git commit -m 'Step 2: Make ERC-721'
```



##### Step 3: Make Metadata

Create a file called `./contracts/Metadata.sol` and add contract basics

```bash
touch ./contracts/Metadata.sol
```



```solidity
pragma solidity ^0.4.20;
/**
* Metadata contract is upgradeable and returns metadata about Token
*/
contract Metadata {

}
```

Create a file called  `./contracts/helpers/strings.sol`  and add this modified strings library from Nick Johnson

```bash
mkdir ./contracts/helpers
touch ./contracts/helpers/strings.sol
```



```solid
/*
 * @title String & slice utility library for Solidity contracts.
 * @author Nick Johnson <arachnid@notdot.net>
 */

pragma solidity ^0.4.20;

library strings {
    struct slice {
        uint _len;
        uint _ptr;
    }

    function memcpy(uint dest, uint src, uint len) private {
        // Copy word-length chunks while possible
        for(; len >= 32; len -= 32) {
            assembly {
                mstore(dest, mload(src))
            }
            dest += 32;
            src += 32;
        }

        // Copy remaining bytes
        uint mask = 256 ** (32 - len) - 1;
        assembly {
            let srcpart := and(mload(src), not(mask))
            let destpart := and(mload(dest), mask)
            mstore(dest, or(destpart, srcpart))
        }
    }

    /*
     * @dev Returns a slice containing the entire string.
     * @param self The string to make a slice from.
     * @return A newly allocated slice containing the entire string.
     */
    function toSlice(string memory self) internal returns (slice memory) {
        uint ptr;
        assembly {
            ptr := add(self, 0x20)
        }
        return slice(bytes(self).length, ptr);
    }

    /*
     * @dev Returns a newly allocated string containing the concatenation of
     *      `self` and `other`.
     * @param self The first slice to concatenate.
     * @param other The second slice to concatenate.
     * @return The concatenation of the two strings.
     */
    function concat(slice memory self, slice memory other) internal returns (string memory) {
        var ret = new string(self._len + other._len);
        uint retptr;
        assembly { retptr := add(ret, 32) }
        memcpy(retptr, self._ptr, self._len);
        memcpy(retptr + self._len, other._ptr, other._len);
        return ret;
    }
}
```

Import the library into the `Metadata.sol` and use the strings library for all types

```solidity
pragma solidity ^0.4.20;
/**
* Metadata contract is upgradeable and returns metadata about Token
*/

import "./helpers/strings.sol";

contract Metadata {
    using strings for *;
}
```

Add the `tokenURI` function that accepts a `uint256 tokenId` and returns a `string`

```
function tokenURI(uint _tokenId) public view returns (string _infoUrl) {
    string memory base = "https://yourdomain.com/metadata/";
    string memory id = uint2str(_tokenId);
    return base.toSlice().concat(id.toSlice());
}
```

Now add the function `uint2str` from oraclize

```
function uint2str(uint i) internal pure returns (string){
    if (i == 0) return "0";
    uint j = i;
    uint length;
    while (j != 0){
        length++;
        j /= 10;
    }
    bytes memory bstr = new bytes(length);
    uint k = length - 1;
    while (i != 0){
        bstr[k--] = byte(48 + i % 10);
        i /= 10;
    }
    return string(bstr);
}
```

What's happening here is that we're taking a number and converting it into the UTF8 string value of that number. If theres time at the end we can go over this function step by step to see exactly what it's doing.

Run `truffle compile` to make sure there are no errors. Your final `Metadata.sol` should look like this:

```
pragma solidity ^0.4.20;
/**
* Metadata contract is upgradeable and returns metadata about Token
*/

import "./helpers/strings.sol";

contract Metadata {
    using strings for *;

    function tokenURI(uint _tokenId) public view returns (string _infoUrl) {
        string memory base = "https://domain.com/metadata/";
        string memory id = uint2str(_tokenId);
        return base.toSlice().concat(id.toSlice());
    }
    function uint2str(uint i) internal pure returns (string){
        if (i == 0) return "0";
        uint j = i;
        uint length;
        while (j != 0){
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint k = length - 1;
        while (i != 0){
            bstr[k--] = byte(48 + i % 10);
            i /= 10;
        }
        return string(bstr);
    }
}
```

Commit your changes

```bash
git add . && git commit -m 'Step 3: Make Metadata'
```

##### Step 4: Add Metadata to ERC-721

Import the `Metadata.sol` contract into the header of your ERC-721 token contract, add a new parameter to the contract called `metadata` and set the parameter with the constructor

```solid
pragma solidity ^0.4.20;
import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import './Metadata.sol';

/**
 * The Token contract does this and that...
 */
contract Token is ERC721Token {
    Metadata metadata;
    constructor(string name, string symbol, Metadata _metadata) public
        ERC721Token(name, symbol)
    { 
        metadata = _metadata;
    }
}

```

Add a `tokenURI` function that hands the call off to the metadata contract. This will use assembly because you can't return variable length values from external contracts without using `pragma *experimental* ABIEncoderV2` or sing solc 5.0, both of which are considered unstable (and have created problems with verifying the contract on etherscan).

```solid
function getMetadata() public view returns (address) {
    return metadata;
}
function tokenURI(uint _tokenId) public view returns (string _infoUrl) {
    address _impl = getMetadata();
    bytes memory data = msg.data;
    assembly {
        let result := delegatecall(gas, _impl, add(data, 0x20), mload(data), 0, 0)
        let size := returndatasize
        let ptr := mload(0x40)
        returndatacopy(ptr, 0, size)
        switch result
        case 0 { revert(ptr, size) }
        default { return(ptr, size) }
    }
    // this is how it would be done if returning a variable length were possible:
    // return Metadata(metadata).tokenURI(_tokenId);
}
```

Notice we have to use a function that returns the `metadata` address because it's easier to access it as memory that way than reference in the storage inside of the assembly. If we have time at the end of the workshop we can go over this function line by line.

Run `truffle compile` to make sure there are no errors. Your final file should look like this:

```solidity
pragma solidity ^0.4.20;
import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import './Metadata.sol';

/**
 * The Token contract does this and that...
 */
contract Token is ERC721Token {
    address metadata;
    constructor(string name, string symbol, address _metadata) public
        ERC721Token(name, symbol)
    { 
        metadata = _metadata;
    }
    function getMetadata() public view returns (address) {
        return metadata;
    }
    function tokenURI(uint _tokenId) public view returns (string _infoUrl) {
        address _impl = getMetadata();
        bytes memory data = msg.data;
        assembly {
            let result := delegatecall(gas, _impl, add(data, 0x20), mload(data), 0, 0)
            let size := returndatasize
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)
            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }
}
```

Commit your changes

```bash
git add . && git commit -m 'Step 4: Add Metadata to ERC-721'
```

##### Step 5: Create Migrations

Open your migrations file called `2_deploy_contracts.js` and replace `Sample` with `Token`

```javascript
var Token = artifacts.require('./Token.sol')
let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {
      // Deploy Token.sol
      await deployer.deploy(Token)
      let token = await Token.deployed()
      console.log(_ + 'Token deployed at: ' + token.address)

    } catch (error) {
      console.log(error)
    }
  })
}
```

Import the Metadata at the top of the file then duplicate the token deployment code and replace it with Metadata so Metadata comes first. Then modify the Token deploy parameters to match the constructor arguments.

```javascript
var Metadata = artifacts.require('./Metadata.sol')
var Token = artifacts.require('./Token.sol')

let _ = '        '

module.exports = (deployer, helper, accounts) => {

  deployer.then(async () => {
    try {
      // Deploy Metadata.sol
      await deployer.deploy(Metadata)
      let metadata = await Metadata.deployed()
      console.log(_ + 'Metadata deployed at: ' + metadata.address)

     // Deploy Token.sol
      await deployer.deploy(Token, 'Token Name', 'Token Symbol', metadata.address)
      let token = await Token.deployed()
      console.log(_ + 'Token deployed at: ' + token.address)

    } catch (error) {
      console.log(error)
    }
  })
}
```

To run the migration first begin a local testnet with truffle in another terminal window

```bash
$ truffle develop
Truffle Develop started at http://127.0.0.1:9545/

Accounts:
(0) 0x627306090abab3a6e1400e9345bc60c78a8bef57
(1) 0xf17f52151ebef6c7334fad080c5704d77216b732
(2) 0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef
(3) 0x821aea9a577a9b44299b9c15c88cf3087f3b5544
(4) 0x0d1d4e623d10f9fba5db95830f7d3839406c6af2
(5) 0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e
(6) 0x2191ef87e392377ec08e7c08eb105ef5448eced5
(7) 0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5
(8) 0x6330a553fc93768f612722bb8c2ec78ac90b3bbc
(9) 0x5aeda56215b167893e80b4fe645ba6d5bab767de

Private Keys:
(0) c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3
(1) ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f
(2) 0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1
(3) c88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c
(4) 388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418
(5) 659cbb0e2411a44db63778987b1e22153c086a95eb6b18bdf89de078917abc63
(6) 82d052c865f5763aad42add438569276c00d3d88a2d062d36b2bae914d58b8c8
(7) aa3680d5d48a8283413f7a108367c7299ca73f553735860a87b08f39395618b7
(8) 0f62d96d6675f32685bbdb8ac13cda7c23436f63efbb9d07700d8669ff12b7c4
(9) 8d5366123cb560bb606379f90a0bfd4769eecc0557f1b362dcae9012b548b1e5

Mnemonic: candy maple cake sugar pudding cream honey rich smooth crumble sweet treat

⚠️  Important ⚠️  : This mnemonic was created for you by Truffle. It is not secure.
Ensure you do not use it on production blockchains, or else you risk losing funds.

truffle(develop)>
```

Run the migration from the original window with the local test network to make sure there are no errors

```bash
$ truffle migrate --network develop --reset
Using network 'develop'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0x6baaa7955d7815f8629b969c7a33da9ee5d13657e623c19fd0f9f592a8d68e87
  Migrations: 0x8cdaf0cd259887258bc13a92c0a6da92698644c0
Saving successful migration to network...
  ... 0xd7bc86d31bee32fa3988f1c1eabce403a1b5d570340a3a9cdba53a472ee8c956
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Running step...
  Deploying Metadata...
  ... 0xed77a8f6e9e3157a9166dbafab94308b470e2d1679e6b3f0946e2534da02b461
  Metadata: 0x345ca3e014aaf5dca488057592ee47305d9b3e10
        Metadata deployed at: 0x345ca3e014aaf5dca488057592ee47305d9b3e10
  Deploying Token...
  ... 0xff932f6634ac4fb800abd8e3421564013397edaa1d0701a28744d28e02c1998c
  Token: 0xf25186b5081ff5ce73482ad761db0eb0d25abfbf
        Token deployed at: 0xf25186b5081ff5ce73482ad761db0eb0d25abfbf
Saving successful migration to network...
  ... 0x059cf1bbc372b9348ce487de910358801bbbd1c89182853439bec0afaee6c7db
Saving artifacts...
```

If you get strange errors it's sometimes good to delete the `build` folder that truffle makes when compiling or migrating, or just add the `--reset` flag to the command.

```bash
rm -r ./build
```

Commit your changes

```bash
git add . && git commit -m 'Step 5: Create Migrations'
```

##### Step 6: Make Tests

Rename `Sample.test.js` to `Token.test.js` or whatever your token contract is called, then replace all references to "Sample" with "Token".

```bash
mv ./test/Sample.test.js ./test/Token.test.js
```



```javascript
var Token = artifacts.require('./Token.sol')
var BigNumber = require('bignumber.js')
let gasPrice = 1000000000 // 1GWEI

let _ = '        '

contract('Token', async function(accounts) {
  let token

  before(done => {
    ;(async () => {
      try {
        var totalGas = new BigNumber(0)

        // Deploy Token.sol
        token = await Token.new()
        var tx = await web3.eth.getTransactionReceipt(token.transactionHash)
        totalGas = totalGas.plus(tx.gasUsed)
        console.log(_ + tx.gasUsed + ' - Deploy Token')
        token = await Token.deployed()

        console.log(_ + '-----------------------')
        console.log(_ + totalGas.toFormat(0) + ' - Total Gas')
        done()
      } catch (error) {
        console.error(error)
        done(false)
      }
    })()
  })

  describe('Token.sol', function() {
    it('should pass', async function() {
      assert(
        true === true,
        'this is true'
      )
    })

  })
})
```

Add the Metadata file and repeat the process in the migrations file.

Also don't forget to set the deploy parameters for the token, including the metadata address.

```javascript
var Metadata = artifacts.require('./Metadata.sol')
var Token = artifacts.require('./Token.sol')
var BigNumber = require('bignumber.js')
let gasPrice = 1000000000 // 1GWEI

let _ = '        '

contract('Token', async function(accounts) {
  let token, metadata

  before(done => {
    ;(async () => {
      try {
        var totalGas = new BigNumber(0)

        // Deploy Metadata.sol
        metadata = await Metadata.new()
        var tx = await web3.eth.getTransactionReceipt(metadata.transactionHash)
        totalGas = totalGas.plus(tx.gasUsed)
        console.log(_ + tx.gasUsed + ' - Deploy Metadata')
        metadata = await Metadata.deployed()

        // Deploy Token.sol
        token = await Token.new("Token", "TKN", metadata.address)
        var tx = await web3.eth.getTransactionReceipt(token.transactionHash)
        totalGas = totalGas.plus(tx.gasUsed)
        console.log(_ + tx.gasUsed + ' - Deploy Token')
        token = await Token.deployed()

        console.log(_ + '-----------------------')
        console.log(_ + totalGas.toFormat(0) + ' - Total Gas')
        done()
      } catch (error) {
        console.error(error)
        done(false)
      }
    })()
  })

  describe('Token.sol', function() {
    it('should pass', async function() {
      assert(
        true === true,
        'this is true'
      )
    })
  })
})
```

Add a test to confirm the tokenURI is returning strings of numbers correctly:

```javascript
it('should return metadata uints as strings', async function() {
    const URI = 'https://domain.com/metadata/'

    let tokenURI_uint = 12
    let tokenURI_result = await token.tokenURI(tokenURI_uint)
    assert(
        URI + tokenURI_uint.toString() === tokenURI_result,
        'incorrect value "' + tokenURI_result + '" returned'
    )
})
```

Run the test to confirm it works

```bash
$ truffle test
Using network 'test'.

Compiling ./contracts/Metadata.sol...
Compiling ./contracts/Token.sol...
Compiling ./contracts/helpers/strings.sol...
Compiling zeppelin-solidity/contracts/AddressUtils.sol...
Compiling zeppelin-solidity/contracts/introspection/ERC165.sol...
Compiling zeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol...
Compiling zeppelin-solidity/contracts/math/SafeMath.sol...
Compiling zeppelin-solidity/contracts/token/ERC721/ERC721.sol...
Compiling zeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol...
Compiling zeppelin-solidity/contracts/token/ERC721/ERC721BasicToken.sol...
Compiling zeppelin-solidity/contracts/token/ERC721/ERC721Receiver.sol...
Compiling zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol...

....

        Metadata deployed at: 0x345ca3e014aaf5dca488057592ee47305d9b3e10
        Token deployed at: 0xf25186b5081ff5ce73482ad761db0eb0d25abfbf


  Contract: Token
        319325 - Deploy Metadata
        2147381 - Deploy Token
        -----------------------
        2,466,706 - Total Gas
    Token.sol
      ✓ should return metadata uints as strings (182ms)


  1 passing (667ms)
```

Add a few more numbers to make sure it's not just a one off thing and run the test again to confirm

```javascript
 describe('Token.sol', function() {
    it('should return metadata uints as strings', async function() {
      const URI = 'https://domain.com/metadata/'

      let tokenURI_uint = 0
      let tokenURI_result = await token.tokenURI(tokenURI_uint)
      assert(
        URI + tokenURI_uint.toString() === tokenURI_result,
        'incorrect value "' + tokenURI_result + '" returned'
      )

      tokenURI_uint = 2345
      tokenURI_result = await token.tokenURI(tokenURI_uint)
      assert(
        URI + tokenURI_uint.toString() === tokenURI_result,
        'incorrect value "' + tokenURI_result + '" returned'
      )

      tokenURI_uint = 23452345
      tokenURI_result = await token.tokenURI(tokenURI_uint)
      assert(
        URI + tokenURI_uint.toString() === tokenURI_result,
        'incorrect value "' + tokenURI_result + '" returned'
      )

      tokenURI_uint = 134452
      tokenURI_result = await token.tokenURI(tokenURI_uint)
      assert(
        URI + tokenURI_uint.toString() === tokenURI_result,
        'incorrect value "' + tokenURI_result + '" returned'
      )
    })
  })
})
```

Commit your changes

```bash
git add . && git commit -m 'Step 6: Make Tests'
```

##### Step 7: Make Migration for Updates

The point of this format is to allow you to update the migration contract in case you come up with a more complicated schema, or if your endpoint changes, or if the tokenURI standard updates in the future. Let's make a migration file that we can run for just that situation.

Inside of your `Token.sol` import the `ownable.sol` contract from open-zeppelin and make your token inherit it. Then add a function that can update the `metadata` contract address and restrict the access with the `onlyOwner` modifier

```solid
pragma solidity ^0.4.20;
import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './Metadata.sol';

/**
 * The Token contract does this and that...
 */
contract Token is ERC721Token, Ownable {
    address metadata;
    constructor(string name, string symbol, address _metadata) public
        ERC721Token(name, symbol)
    { 
        metadata = _metadata;
    }
    
    function updateMetadata(address _metadata) public onlyOwner {
        metadata = _metadata;
    }
 
	...
	
}
```

Duplicate the file  `2_deploy_contracts.js` and call it  `3_update_metadata.js` 

```bash
cp ./migrations/2_deploy_contracts.js  ./migrations/3_update_metadata.js
```

Begin by modifying the metadata deploy so that it contains an object that specified this contract will be replaced

```javascript
await deployer.deploy(Metadata, {replace: true})
```

Then remove the deployment of the token, and just let the already deployed token be found

```javascript
// Deployed Token.sol
// await deployer.deploy(Token, 'Token Name', 'Token Symbol', metadata.address)
let token = await Token.deployed()
console.log(_ + 'Token deployed at: ' + token.address)
```

Then update the token with the new metadata address

```javascript
await token.updateMetadata(metadata.address)
console.log(_ + 'Token metadta updated to ' + metadata.address)
```

Run the migration to make sure it worked. If the nonces get weird try deleting the `build` directory

```bash
$ truffle migrate --network develop --reset
Compiling ./contracts/Metadata.sol...
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/Token.sol...
Compiling ./contracts/helpers/strings.sol...
Compiling zeppelin-solidity/contracts/AddressUtils.sol...
Compiling zeppelin-solidity/contracts/introspection/ERC165.sol...
Compiling zeppelin-solidity/contracts/introspection/SupportsInterfaceWithLookup.sol...
Compiling zeppelin-solidity/contracts/math/SafeMath.sol...
Compiling zeppelin-solidity/contracts/ownership/Ownable.sol...
Compiling zeppelin-solidity/contracts/token/ERC721/ERC721.sol...
Compiling zeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol...
Compiling zeppelin-solidity/contracts/token/ERC721/ERC721BasicToken.sol...
Compiling zeppelin-solidity/contracts/token/ERC721/ERC721Receiver.sol...
Compiling zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol...

...

Using network 'develop'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0x7184b833b0437ab2f71b7d081c43974c4f92a7a3f9f71d3617f2e0e6cada163f
  Migrations: 0x30753e4a8aad7f8597332e813735def5dd395028
Saving successful migration to network...
  ... 0xffbca182e82402c9ad7c75c7625270725c565fd54b8e69d673e44f6a6d3e17ab
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Running step...
  Deploying Metadata...
  ... 0x07dfc916e1b333c3b9bdd7d7570d15539580a5c80c620eb9bfd1e78ea15daea5
  Metadata: 0xaa588d3737b611bafd7bd713445b314bd453a5c8
        Metadata deployed at: 0xaa588d3737b611bafd7bd713445b314bd453a5c8
  Deploying Token...
  ... 0x13c33499116a456afd5ce282feb19e5a5c64a1e7d35140033aedf40e9bad7526
  Token: 0xf204a4ef082f5c04bb89f7d5e6568b796096735a
        Token deployed at: 0xf204a4ef082f5c04bb89f7d5e6568b796096735a
Saving successful migration to network...
  ... 0xbe915fd410713e530bce5c53fd25e8d3a25b7fca593f32d5ae1d0131d3a1375c
Saving artifacts...
Running migration: 3_update_metadata.js
  Running step...
  Replacing Metadata...
  ... 0xf5523deea43659d73a3344d61952a63d1e001e3bc040e3683736e412480d6e38
  Metadata: 0x82d50ad3c1091866e258fd0f1a7cc9674609d254
        Metadata deployed at: 0x82d50ad3c1091866e258fd0f1a7cc9674609d254
        Token deployed at: 0xf204a4ef082f5c04bb89f7d5e6568b796096735a
  ... 0x9771108c608ec65cd120660337e286e4d5d007e79f4ec30865ed754af0179dd8
        Token metadta updated to 0x82d50ad3c1091866e258fd0f1a7cc9674609d254
Saving successful migration to network...
  ... 0x345372f43457f3ab10a972f82d68a6c25436cbb5c42a28c88f14c79ea7c25ceb
Saving artifacts...
```

You can see that the Token address didn't change but the metadata did. If you have to update the metadata more than once you can tell truffle explicitly which migrations to run with the following options:

```bash
truffle migrate --network develop -f 3 --to 3
```

This will only run **from** (`-f`) migration number 3 **until** (`--to`) migration 3 (ie it will only run migration 3)

Commit your changes

```bash
git add . && git commit -m 'Step 7: Make Migrations for Updates'
```

##### Step 8: Update ERC-721 and Tests

Since we'll want to be able to mint tokens some way let's add a public function for minting to our Token contract and protect it with the `onlyOwner` modifier

```solid
pragma solidity ^0.4.20;
import "zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './Metadata.sol';

/**
 * The Token contract does this and that...
 */
contract Token is ERC721Token, Ownable {
    address metadata;
    constructor(string name, string symbol, address _metadata) public
        ERC721Token(name, symbol)
    { 
        metadata = _metadata;
    }
    function mint(address recepient) public onlyOwner {
        _mint(recepient, totalSupply() + 1);
    }

   ...
   
}
```

I've added one where it mints them incrementally. You can come up with obviously more creative restrictions or patterns for minting your tokens.

Now we can add a test to make sure that it is minting correctly

```javascript
    it('should mint a token from the owner account', async function() {
      // begin with zero balance
      let zeroBalance = await token.totalSupply()
      assert(
        zeroBalance.toString(10) === '0',
        "Contract should have no tokens at this point"
      )

      // try minting a new token and checking the totalSupply
      try {
        await token.mint(accounts[0])
      } catch (error) {
        console.log(error)
        assert(false, error)
      }
      let totalSupply = await token.totalSupply()
      assert(
        totalSupply.toString(10) === '1',
        "Contract should have balance of 1 instead it has " + totalSupply.toString(10)
      )

      // check that the balance increased to 1
      let ownerBalance = await token.balanceOf(accounts[0])
      assert(
        ownerBalance.toString(10) === '1',
        "Owner account should have 1 token instead it has " + ownerBalance.toString(10)
      )
      
      // make sure the token at index 0 has id 1
      let tokenId = await token.tokenOfOwnerByIndex(accounts[0], "0")
      assert(
        tokenId.toString(10) === '1',
        "Token at index 0 is " + tokenId.toString(10)
      )
    })
```

Run the tests to make sure they pass

```bash
$ truffle test
Using network 'test'.

...

        Metadata deployed at: 0x345ca3e014aaf5dca488057592ee47305d9b3e10
        Token deployed at: 0xf25186b5081ff5ce73482ad761db0eb0d25abfbf
        Metadata deployed at: 0x9fbda871d559710256a2502a2517b794b482db40
        Token deployed at: 0xf25186b5081ff5ce73482ad761db0eb0d25abfbf
        Token metadta updated to 0x9fbda871d559710256a2502a2517b794b482db40


  Contract: Token
        319325 - Deploy Metadata
        2372607 - Deploy Token
        -----------------------
        2,691,932 - Total Gas
    Token.sol
      ✓ should return metadata uints as strings (173ms)
      ✓ should mint a token from the owner account (129ms)


  2 passing (776ms)
```

Commit your changes

```bash
git add . && git commit -m 'Step 8: Update ERC-721 and tests'
```

##### Step 9: Deploy

Now that we have some tests in place that prove out metadata works and our token can be minted let's deploy it to our local network, then deploy it to Rinkeby. First is the local version like we did before. In one console window set Truffle's local RPC running (you'll notice the mnemonic phrase is always the same).

```bash
$ truffle develop
Truffle Develop started at http://127.0.0.1:9545/

Accounts:
(0) 0x627306090abab3a6e1400e9345bc60c78a8bef57
(1) 0xf17f52151ebef6c7334fad080c5704d77216b732
(2) 0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef
(3) 0x821aea9a577a9b44299b9c15c88cf3087f3b5544
(4) 0x0d1d4e623d10f9fba5db95830f7d3839406c6af2
(5) 0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e
(6) 0x2191ef87e392377ec08e7c08eb105ef5448eced5
(7) 0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5
(8) 0x6330a553fc93768f612722bb8c2ec78ac90b3bbc
(9) 0x5aeda56215b167893e80b4fe645ba6d5bab767de

Private Keys:
(0) c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3
(1) ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f
(2) 0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1
(3) c88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c
(4) 388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418
(5) 659cbb0e2411a44db63778987b1e22153c086a95eb6b18bdf89de078917abc63
(6) 82d052c865f5763aad42add438569276c00d3d88a2d062d36b2bae914d58b8c8
(7) aa3680d5d48a8283413f7a108367c7299ca73f553735860a87b08f39395618b7
(8) 0f62d96d6675f32685bbdb8ac13cda7c23436f63efbb9d07700d8669ff12b7c4
(9) 8d5366123cb560bb606379f90a0bfd4769eecc0557f1b362dcae9012b548b1e5

Mnemonic: candy maple cake sugar pudding cream honey rich smooth crumble sweet treat

⚠️  Important ⚠️  : This mnemonic was created for you by Truffle. It is not secure.
Ensure you do not use it on production blockchains, or else you risk losing funds.

truffle(develop)>
```

Now run the deploy command in the original terminal window. We'll set it to just be the first two migrations so that we don't update the metadata contract on this deploy. If you get something weird it might be because of the build folder, it's meant to help but it's often just a pain. You can `rm -r build` to get rid of it. This is fine to do until you've deployed to a network where you care that it remains. Because the contract address is actually stored in this `build` folder, if you want your migration process to remember that it'll need access to those files. So like when we updated the metadata by specifying the third migration file, it knew where the token was deployed because it had the file in the `build` folder. So now it's fine but just remember that information may be important to you before deleting it.

```bash
$ truffle migrate --network develop -f 1 --to 2

...


Writing artifacts to ./build/contracts

Using network 'develop'.

Running migration: 1_initial_migration.js
  Replacing Migrations...
  ... 0x6baaa7955d7815f8629b969c7a33da9ee5d13657e623c19fd0f9f592a8d68e87
  Migrations: 0x8cdaf0cd259887258bc13a92c0a6da92698644c0
Saving successful migration to network...
  ... 0xd7bc86d31bee32fa3988f1c1eabce403a1b5d570340a3a9cdba53a472ee8c956
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Running step...
  Replacing Metadata...
  ... 0xe3772c4b0d577fe44ee19414a124ef24f1d2a16ad3c98931253279dad8e4fd56
  Metadata: 0x345ca3e014aaf5dca488057592ee47305d9b3e10
        Metadata deployed at: 0x345ca3e014aaf5dca488057592ee47305d9b3e10
  Replacing Token...
  ... 0x4c3b1d9db3970110fa8d0396ae7f3d446a9aad619449f736e92fa60cd2cf0676
  Token: 0xf25186b5081ff5ce73482ad761db0eb0d25abfbf
        Token deployed at: 0xf25186b5081ff5ce73482ad761db0eb0d25abfbf
Saving successful migration to network...
  ... 0x059cf1bbc372b9348ce487de910358801bbbd1c89182853439bec0afaee6c7db
Saving artifacts...
```

You can see that this command says "Replacing" because it can see from the previous artifacts that we have in fact deployed these contracts before. Now let's try deploying to Rinkeby, make sure that the mnemonic phrase you have has some ether in it.

```bash
$ truffle migrate --network rinkeby -f 1 --to 2
Using network 'rinkeby'.

Running migration: 1_initial_migration.js
  Replacing Migrations...
  ... 0xcc78688c19e982cb493b99db2252daa074287e9fbe22906f105801700550bab7
  Migrations: 0xd1aaf438955055c35aeb46b4bd695997bcd21abd
Saving successful migration to network...
  ... 0xaa69e3196f1928c6dfc0f91dd58e65e1217a6d4a560a7636d17b6e56bf52aeb3
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Running step...
  Deploying Metadata...
  ... 0x19e5eaa13843cea2178792c57fd1f35c99d563a1aec4b7f2b1613209c1e5a930
  Metadata: 0x61bda2050eafa50fb46ebeb39c75fbe4781bdf55
        Metadata deployed at: 0x61bda2050eafa50fb46ebeb39c75fbe4781bdf55
  Deploying Token...
  ... 0x9f74c46ffd6c339246baee70b4b90f649d43de5d274ccdcc82ee10bc680c010d
  Token: 0x1170a2c7d4913d399f74ee5270ac65730ff961bf
        Token deployed at: 0x1170a2c7d4913d399f74ee5270ac65730ff961bf
Saving successful migration to network...
  ... 0xb650e010b55dab9cf82a3fc2074ce75b1987015cad8e44d93bb0546df5f411d8
Saving artifacts...
```

If you're feeling really brave and have a mnemonic phrase with some mainnet ether feel free to go big : )

Commit your changes

```bash
git add . && git commit -m 'Step 9: Deploy'
```

##### Step 10: Verify Contracts on Etherscan

Now you'll be able to see your contracts on the block explorer etherscan.io. What you don't see if the actual code that you used to generate the contract. In order to add that and provide a user the security of knowing exactly what this code does (and to provide a place to track the token) you can verify the contract. The easiest way to do that is with a flattener, which will import every referenced file and combine them into one single file. A good one is called `truffle-flattener` because it works with the truffle framework in mind. We installed it earlier so you should be able to use it from your project directory and generate the files. I'll begin by making a folder where they can go.

```bash
mkdir flat
truffle-flattener contracts/Token.sol > flat/Token.sol
truffle-flattener contracts/Metadata.sol > flat/Metadata.sol
```

You should see now in that folder new files with the same names as your contracts, but consisting of all their inherited contracts as well. Now we can go to the etherscan.io endpoint for your deployed contracts. You may need to scroll back up to your deploy messages which will tell you the address where your contract lives. Use this address and go to `https://rinkeby.etherscan.io/address/_CONTACT_ADDRESS_`

Go to the tab called "Code" and click "Verify And Publish".  Enter "Token" under contract name, and select the compiler version that was used. It may be good to confirm this inside of that `./build` directory. If you open that then the json file with the same name as your contract `Token.json`and then search for the word "network", you will get a record of the deployment of your contract relevant to each network (rinkeby is number 4). You will also be able to see the compiler version. Mine is `0.4.24+commit.e67f0147` so I will select that on the drop down on etherscan. I will turn "Optimization" to off, since by default truffle does not run the compiler with optimization turned on. Then copy and paste the contents of `./flat/Token.sol` into the text box.

![](https://www.dropbox.com/s/403vw7lrskvty09/Screenshot%202018-12-13%2016.04.22.png?dl=1)

Confirm you are not a robot and then click "Verify and Publish". If everything worked out correctly you will see a success message like this:

![](https://www.dropbox.com/s/wrs6mabjzrmypg8/Screenshot%202018-12-13%2016.06.37.png?dl=1)

If you click your address link you will now see that your contract has a lot more information on it:

![](https://www.dropbox.com/s/ooh5fzd18elyr3y/Screenshot%202018-12-13%2016.08.44.png?dl=1)

What's nice about this is that via the "Write Contract" tab you can now directly access that "mint" function and if your metamask has the same seed phrase as your deploy account you can mint from the browser. Since your contract is a compliant ERC-721 you can also look at it via the lens of a token account. To do that just change the word "address" in the URL to "token" like https://rinkeby.etherscan.io/token/_CONTRACT_ADDRESS_

You may notice it doesn't have a name yet, or it is called ERC-20 even though it is ERC-721, this is because there hasn't been any transactions yet and etherscan isn't that smart....

End of part 1, celebrate by minting a token or two

Commit your code

```bash
git add . && git commit -m 'Step 10: Verify Contracts on Etherscan'
```



------

#### Part 2

##### Step 1: Make new netlify project

We're going to begin Part 2 by creating a website.

```bash
touch ./index.html && echo "hello world : )" > ./index.html
```

Great that's a beautiful website! Let's deploy it to the internet. First add it to your git repo and push to your origin:

```bash
git add . && git commit -m 'new website' && git push
```

Now go to netlify.com and register using your github/gitlab/bitbucket account. I'm going to use netlify for this because they have a nice all in one package for deploying sites from git, running a build process, adding SSL for custom domains and a simple method for adding lambda functions. They also have authentication and form handling, but i've never used those features. You could also use AWS (which is what netlify is doing) or google firebase for basically all the same thing.

We're going to create an API endpoint that will return the metadata for our NFT. I know what you're thinking, "isn't this an evil centralized solution??". Yes it is. Why? Because the alternative still sucks. Until we live in a world where I can expect my IPFS file to persist after I stop seeding it, and where I don't have to wait forever for the content anyway, we're going to have to use the current Internet infrastructure. If you look at any successful NFT project, they're already doing the same thing. The biggest NFT marketplace, opensea.io, caches all the NFT data they can find and serve it directly. This is because it's better than relying on decentralized solutions at this point. When the decentralized solutions are viable... TA DA: our NFT has an upgradeable metadata endpoint!

So until then we use The Internet.

![](https://www.dropbox.com/s/80bg2jgcss87bro/Screenshot%202018-12-13%2018.21.08.png?dl=1)

Back to netlify, we allow them to have api access to our code so that they can deploy.

![](https://www.dropbox.com/s/cuzf1hvikmof4ac/Screenshot%202018-12-13%2018.22.03.png?dl=1)

We find our repo and select it

![](https://www.dropbox.com/s/eb0e5d92h8wd7el/Screenshot%202018-12-13%2018.23.23.png?dl=1)

We don't need to add a build command or a publish directory because our website is just that one `index.html` file and it's in the project root. You are probably already on `master` branch so that won't need to change (although netlify will auto-deploy each branch on a new domain if you want it to). So we just click "Deploy site".

![](https://www.dropbox.com/s/ii4kiya1vwuuffa/Screenshot%202018-12-13%2018.25.14.png?dl=1)

You might want to change your site from `laughing-lalande-74167d` so you can click "Site settings" then scroll down to "Change site name". I'll change mine to `block-workshop` which will make it available at https://block-workshop.netlify.com once the deploy process is over. Since there isn't really much to the process it's probably already done and you can check your own site at your own deploy link.

If everything went well you should see this beautiful website:

![](https://www.dropbox.com/s/0hwnvr2a1c7imfg/Screenshot%202018-12-13%2018.29.16.png?dl=1)

##### Step 2: Install netlify lambda

Hopefully you already installed this library before the workshop or at the beginning of the workshop. If not install it now:

```bash
yarn global add netlify-lambda
# or
npm install netlify-lambda --global
```

Now add a directory where your lambda functions that will serve your metadata will live. Let's call it `functions` since that kind of makes sense.

```bash
mkdir lambda
```

And lets make a configuration `.toml` file for netlify so they know where our functions live:

```bash
touch netlify.toml
```

Now add the function name to our toml file where we want them built:

```toml
[build]
  functions = "functions"
```

Let's make a dummy function to go in our lambda folder by creating a file called `helloworld.js`

```bash
touch ./lambda/helloworld.js
```

and fill the file with the boilerplate that netlify provides from their docs:

```javascript
exports.handler = function(event, context, callback) {
  callback(null, {
    statusCode: 200,
    body: "Hello, World"
  });
};
```

Here you can see that the file exports a function called handler. This is the same format that AWS uses for their lambda functions (because netlify is really just a fancy wrapper around AWS). If you have a lambda function you've used there, you can use it here, and if you have any advanced trouble shooting requests regarding these functions, you'll do better adding AWS to your query than "netlify".

Now let's run a local server so we can test our endpoint using the `netlify-lambda` utility

```bash
$ netlify-lambda serve lambda
netlify-lambda: Starting server
Lambda server is listening on 9000
Hash: 47a70dc1b032c7c81a89
Version: webpack 4.27.1
Time: 745ms
Built at: 2018-12-13 18:52:53
        Asset      Size  Chunks             Chunk Names
helloworld.js  1.03 KiB       0  [emitted]  helloworld
Entrypoint helloworld = helloworld.js
[0] ./helloworld.js 129 bytes {0} [built]
```

This will build a new folder called `functions` where your `helloworld.js` file will get compiled and served from. It's accessible from port 9000 by default so you can visit it at `https://localhost:9000/helloworld`

![](https://www.dropbox.com/s/6jk666r53q91u26/Screenshot%202018-12-13%2018.56.41.png?dl=1)

Commit your code and push to your repo. Netlify should notice the push to master and auto-deploy it.

```bash
git add . && git commit -m 'Step 2: Install netlify lambda' && git push
```

You will now have access to a functions section on netlify where you can see that you have one helloworld function

![](https://www.dropbox.com/s/4uq2rsx60c5qrc4/Screenshot%202018-12-13%2019.02.26.png?dl=1)

And if the deploy is finished you should be able to access it at https://block-workshop.netlify.com/.netlify/functions/helloworld 

This is the deployed format for the functions so that there aren't any name conflicts with your current routing. This is pretty ugly though, we'll add some proxy rules later to make it look better on the real metadata endpoint.

##### Step 4:  Add Metadata

Now that we've seen how a dummy endpoint can be sprung up so easily, let's make one that's a little more useful. Create a new file in your `lambda` directory called `metadata.js` and fill it with the same hello world code from before. (Or just duplicate the `helloworld.js` file)

```bash
cp ./lambda/helloworld.js ./lambda/metadata.js
```

Now we can take a moment to actually read what's going on in our helloworld.js file

```javascript
exports.handler = function(event, context, callback) {
  callback(null, {
    statusCode: 200,
    body: "Hello, World"
  });
};
```

The handler function takes 3 parameters, `event` which has to do with the event that triggers the function, `context` which tells you about the context of the event, and `callback` which can be called to end the request and fill it with content and header information. We'll be handling requests for or token metadata that will follow the format we built into our metadata.sol contract. That means it will be a `GET` request with the token ID built into the route of the URL like `https://domain.com/metadata/{tokenId}`. In order to pass get parameters typically we would use a format like: `https://domain.com/metadata?tokenId={tokenId}`. We could define our `tokenURI` to follow a format like that, but that's pretty ugly. Let's work with that format for now and make it look pretty later. So for now let's use that ugly format for testing. If we access our domain like that let's try to log out the event to see if we can find the `tokenId` parameter being passed. Of course this is easier to do in our local setup so let's follow that URL like `https://localhost:9000/metadata?tokenId=666`

And add a `console.log` to our handler function so we can read what's going on in those parameters:

```javascript
exports.handler = function(event, context, callback) {
  console.log("EVENT", event)
  console.log("CONTEXT", context)
  callback(null, {
    statusCode: 200,
    body: "Hello, World"
  });
};
```

Now restart your `netlify-lambda` utility (if it's still running)

```bash
netlify-lambda serve lambda
```

and visit the URL. Now if you check the console that was running the server you'll see the contents of `event` and `context`

```bash
$ netlify-lambda serve lambda
netlify-lambda: Starting server
Lambda server is listening on 9000
Hash: 6507b49ec95292f0e68a
Version: webpack 4.27.1
Time: 665ms
Built at: 2018-12-13 19:18:56
        Asset      Size  Chunks             Chunk Names
helloworld.js  1.03 KiB       0  [emitted]  helloworld
  metadata.js  1.08 KiB       1  [emitted]  metadata
Entrypoint helloworld = helloworld.js
Entrypoint metadata = metadata.js
[0] ./helloworld.js 129 bytes {0} [built]
[1] ./metadata.js 195 bytes {1} [built]
Request from ::1: GET /metadata?tokenId=666
EVENT { path: '/metadata',
  httpMethod: 'GET',
  queryStringParameters: { tokenId: '666' },
  headers:
   { host: 'localhost:9000',
     connection: 'keep-alive',
     'cache-control': 'max-age=0',
     'upgrade-insecure-requests': '1',
     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
     accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
     'accept-encoding': 'gzip, deflate, br',
     'accept-language': 'en-US,en;q=0.9' },
  body: 'W29iamVjdCBPYmplY3Rd',
  isBase64Encoded: true }
CONTEXT {}
Response with status 200 in 8 ms.
```

There you can see it's inside of the `event` parameter under `queryStringParameters`.

to be compliant with EIP-721 and EIP-1047: Token Metadata JSON Schema it should follow the format like so:

```json
{
    "title": "Asset Metadata",
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "description": "Identifies the asset to which this token represents",
        },
        "description": {
            "type": "string",
            "description": "Describes the asset to which this token represents",
        },
        "image": {
            "type": "string",
            "description": "A URI pointing to a resource with mime type image/* representing the asset to which this token represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive.",
        }
    }
}
```

Lets just try returning this, except replacing the name with the tokenId. And returning an image that can be autogenerated, like `https://dummyimage.com/600x400/000000/fff/&text=test image`

![/](https://dummyimage.com/600x400/000000/fff/&text=test image)

```javascript
const tokenId = event.queryStringParameters.tokenId
const metadata =  {
    "name": "Token #" + tokenId,
    "description": "Describes the asset to which this token represents",
    "image": "https://dummyimage.com/600x400/000000/fff/&text=token%20" + tokenId,
}
```

Then return it in our call back function, making sure to stringify the JSON object before returning it

```js
callback(null, {
    statusCode: 200,
    body: JSON.stringify(metadata)
});
```

Now when we check our endpoint (and if you have a nice JSON prettier chrome extension) it will look like this:

![](https://www.dropbox.com/s/cub0guf0ij2fofp/Screenshot%202018-12-13%2020.16.14.png?dl=1)

Commit your code and push to git / netlify

```bash
git add . && git commit -m 'metadata endpoint' && git push
```

##### Step 5: Add proxy routing

On netlify you'll have to use that extra ugly format again `/.netlify/functions/metadata?tokenId=666` to see your new endpoint. Lets add some configuration to make the URL a little prettier. Go back into your `netlify.toml` file and add some re-write rules so that we can transform a pretty URL like `/metadata/666` into something that our lambda function will understand like `/.netlify/functions/metadata?tokenId=666`

```toml
[build]
  functions = "functions"

[[redirects]]
  from = "/metadata/:tokenId"
  to = "/.netlify/functions/metadata?tokenId=:tokenId"
  status = 200
```

This will redirect queries to `/metadata` to whatever is at the location `/.netlify/functions/metadata`. The `:tokenId` placeholder designates that that value should be carried over to the same place in the other url. The status it should give in the header is `200` which means success.

##### Step 6: Add opensea.io

To make sure our metadata shows up on sites like opensea we want to make sure they're familiar with the format we're serving. Their docs say they will be expecting metadata that adheres to the standard, they give an the following example:

```json
{
  "description": "Friendly OpenSea Creature that enjoys long swims in the ocean.", 
  "external_url": "https://openseacreatures.io/3", 
  "image": "https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png", 
  "name": "Dave Starbelly",
  "attributes": [ ... ], 
}
```

With an additional `attributes` key that can be populated like:

```json
{
"attributes": [
    {
      "trait_type": "base", 
      "value": "starfish"
    }, 
    {
      "trait_type": "eyes", 
      "value": "big"
    }, 
    {
      "trait_type": "mouth", 
      "value": "surprised"
    }, 
    {
      "trait_type": "level", 
      "value": 5
    }, 
    {
      "trait_type": "stamina", 
      "value": 1.4
    }, 
    {
      "trait_type": "personality", 
      "value": "sad"
    }, 
    {
      "display_type": "boost_number", 
      "trait_type": "aqua_power", 
      "value": 40
    }, 
    {
      "display_type": "boost_percentage", 
      "trait_type": "stamina_increase", 
      "value": 10
    }, 
    {
      "display_type": "number", 
      "trait_type": "generation", 
      "value": 2
    }
  ]
}
```

Let's add some attributes like this for our endpoint. Maybe our token Id should reflect a zodiac sign ✨

```javascript
exports.handler = function(event, context, callback) {
  const tokenId = event.queryStringParameters.tokenId
  const metadata =  {
    "name": "Token #" + tokenId,
    "external_url": "https://block-workshop.netlify.com/", 
    "description": "This is a very basic NFT with token Id #" + tokenId,
    "image": "https://dummyimage.com/600x400/000000/fff/&text=token%20" + tokenId,
    "attributes": [
      {
        "trait_type": "zodiac", 
        "value": returnZodiac(tokenId)
      }
    ]
  } 
  callback(null, {
    statusCode: 200,
    body: JSON.stringify(metadata)
  });
};
function returnZodiac(tokenId) {
  const month = ((tokenId - 1) % 12) + 1
  switch(month) {
    case(1):
      return 'Capricorn'
    case(2):
      return 'Aquarius'
    case(3):
      return 'Pisces'
    case(4):
      return 'Aries'
    case(5):
      return 'Taurus'
    case(6):
      return 'Gemini'
    case(7):
      return 'Cancer'
    case(8):
      return 'Leo'
    case(9):
      return 'Virgo'
    case(10):
      return 'Libra'
    case(11):
      return 'Scorpio'
    case(12):
      return 'Sagittarius'
  }
}
```

Commit your code and push to git / netlify

```bash
git add . && git commit -m 'Step 6: Add opensea' && git push
```

##### Step 7: Add rarebits

Another popular NFT marketblace is rarebits. Let's check their API format to make sure we're adhering to what it expects as well.

```json
{
  "name": "Robot token #14",
  "image_url": "https://www.robotgame.com/images/14.png",
  "home_url": "https://www.robotgame.com/robots/14.html",
  "description": "This is the amazing Robot #14, please buy me!",
  "properties": [
    {"key": "generation", "value": 4, type: "integer"}, 
    {"key": "cooldown", "value": "slow", type: "string"}
  ],
  "tags": ["red","rare","fire"]
}
```

What do you know! It follows it's own spec! Now you can maybe see why it's important to maintain some flexibility around your metadata endpoint until we live in a world that has really settled on a standard that everyone uses and isn't just hosted on a lambda function on netlify somewhere 😜

Anyway let's add some info to our token so it adheres to rarebits as well

```javascript
exports.handler = function(event, context, callback) {
  const tokenId = event.queryStringParameters.tokenId
  const metadata =  {

    // both opensea and rarebits
    "name": "Token #" + tokenId, 
    "description": "This is a very basic NFT with token Id #" + tokenId,
      
    // opensea
    "external_url": "https://block-workshop.netlify.com/",
    // rarebits
    "home_url": "https://block-workshop.netlify.com/", 

    // opensea
    "image": "https://dummyimage.com/600x400/000/fff/&text=token%20" + tokenId, 
    // rarebits
    "image_url": "https://dummyimage.com/600x400/000/fff/&text=token%20" + tokenId, 

    // opensea
    "attributes": [ 
      {
        "trait_type": "zodiac", 
        "value": returnZodiac(tokenId)
      }
    ],
    // rarebits
    "properties": [ 
      {"key": "zodiac", "value": returnZodiac(tokenId), type: "string"}, 
    ],

    // rarebits
    "tags": ["cool","hot","mild"]
  } 
  callback(null, {
    statusCode: 200,
    body: JSON.stringify(metadata)
  });
};
```

Now we have a nice and fat json object being returned

![](https://www.dropbox.com/s/evfhgwhs4t6ij60/Screenshot%202018-12-13%2020.44.16.png?dl=1)

Commit your code and push to git / netlify

```bash
git add . && git commit -m 'Step 7: Add rarebits' && git push
```

##### Step 8: Re-deploy and mint a token

So now we've got a great metadata API endpoint and we don't have to do anything to service it. We know that it will be quick and cheap to serve up our content. We've even got an amazing website that has been minified and seeded across a Content Delivery Network. All we're missing is our Token!

When we deployed our Token we were using a metadata endpoint that returned `https://domain.com/metadata/{tokenId}`but `domain.com` isn't our domain! Looks like we'll have to update our metadata endpoint! 

Thank goodness we built in that ability as well a migration for doing just that. So let's go back to our `Metadata.sol` contract and update the URI with our nice and pretty netlify subdomain!

```solidity
function tokenURI(uint _tokenId) public view returns (string _infoUrl) {
    string memory base = "https://block-workshop.netlify.com/metadata/";
    string memory id = uint2str(_tokenId);
    return base.toSlice().concat(id.toSlice());
}
```

Now let's run our migration so that only the metadata is replaced, and updated inside of the contract

```bash
$ truffle migrate --network rinkeby -f 3 --to 3

...

Using network 'rinkeby'.

Running migration: 3_update_metadata.js
  Running step...
  Replacing Metadata...
  ... 0xe596fcf7f20073988c4c57167d19a529b086ddd978ce386bf66485a97f3ad2d9
  Metadata: 0xfb66019e647cec020cf5d1277c81ad463e4574a4
        Metadata deployed at: 0xfb66019e647cec020cf5d1277c81ad463e4574a4
        Token deployed at: 0x1170a2c7d4913d399f74ee5270ac65730ff961bf
  ... 0xc3316fa072e84038ee30c360bc70cdc4107d3fcb74780e33e34b0e117e1534aa
Saving successful migration to network...
  ... 0x416630f6fad98eef2f065014c55ac8b43901ef804435b92d4d02f804a7d4c242
Saving artifacts...
```

Now let's go back to our etherscan certified token and mint our first token!

You'll see that our `updateMetadata` transaction is listed there now

![](https://www.dropbox.com/s/tv756wlfbj5tt3o/Screenshot%202018-12-13%2020.54.35.png?dl=1)

Since I'm using a metamask account that is the same as my deploy account I should have permission to mint a token. I'll go to the write contract tab, authenticate with metamask, and do just that : )

![](https://www.dropbox.com/s/n5h7wg9khhqwzi4/Screenshot%202018-12-13%2020.56.00.png?dl=1)

Since I added my own address to be the recipient I should be the proud owner of token #1. I can check using the token view of etherscan we saw before.

![](https://www.dropbox.com/s/1zm2l8b1n9mt6bs/Screenshot%202018-12-13%2020.57.28.png?dl=1)

Wow! There's a token.

Let's jump over to opensea and see if they've noticed that we exist. With both rarebits and open sea you have to request for your token to be tracked before it shows up in the sidebar, but you can skip that by hard coding the contract address in to the URL. Let's try it knowing our token address is at `0x1170a2c7d4913d399f74ee5270ac65730ff961bf` and our token Id is `1`. We should be able to visit the rinkeby version of the URL like this:

https://rinkeby.opensea.io/assets/0x1170a2c7d4913d399f74ee5270ac65730ff961bf/1

![](https://www.dropbox.com/s/k6djvdkyms1bctk/Screenshot%202018-12-13%2021.00.28.png?dl=1)

WOW 🎉

They even know our token's zodiac sign!

![](https://www.dropbox.com/s/b78ltttja9hbjo2/Screenshot%202018-12-13%2021.01.17.png?dl=1)

Let's add it to the app officially and we can see it in the rinkeby section

![](https://www.dropbox.com/s/w4wg6u8w9b3rae7/Screenshot%202018-12-13%2021.08.22.png?dl=1)

![](https://www.dropbox.com/s/mgm9r9dyhohd72j/Screenshot%202018-12-13%2021.09.05.png?dl=1)

![](https://www.dropbox.com/s/xa4000qhg4cl4zr/Screenshot%202018-12-13%2021.09.23.png?dl=1)

And we're up!

![](https://www.dropbox.com/s/ofzn8w59ozf26of/Screenshot%202018-12-13%2021.10.54.png?dl=1)

Let's add it to rarebits too!

![](https://www.dropbox.com/s/9v0cjc0jvweo6ug/Screenshot%202018-12-13%2021.06.14.png?dl=1)

![](https://www.dropbox.com/s/np167hbcy8p53ht/Screenshot%202018-12-13%2021.11.54.png?dl=1)

Commit your code and push to git : )

```bash
git add . && git commit -m 'Step 7: Re-deploy and mint a token' && git push
```

### Complete!

**Bonus**: Make your background change color depending on the number of the ID (more interesting than modulo 256^2 on the id)

**Bonus**: Go over the assembly in the delegate call function

**Bonus**: Go over the `uint2str` function

**Bonus**: make a more interesting token!