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
    it('should return metadata uints as strings', async function() {

      const URI = 'https://domain.com/metadata/'

      let tokenURI_uint = 0
      let tokenURI_result = await token.tokenURI(tokenURI_uint)
      assert(
        URI + tokenURI_uint.toString() === tokenURI_result,
        'incorrect value "' + tokenURI_result + '" returned instead of ' +  URI + tokenURI_uint.toString()
      )

      tokenURI_uint = 2345
      tokenURI_result = await token.tokenURI(tokenURI_uint)
      assert(
        URI + tokenURI_uint.toString() === tokenURI_result,
        'incorrect value "' + tokenURI_result + '" returned instead of ' +  URI + tokenURI_uint.toString()
      )

      tokenURI_uint = 23452345
      tokenURI_result = await token.tokenURI(tokenURI_uint)
      assert(
        URI + tokenURI_uint.toString() === tokenURI_result,
        'incorrect value "' + tokenURI_result + '" returned instead of ' +  URI + tokenURI_uint.toString()
      )

      tokenURI_uint = 134452
      tokenURI_result = await token.tokenURI(tokenURI_uint)
      assert(
        URI + tokenURI_uint.toString() === tokenURI_result,
        'incorrect value "' + tokenURI_result + '" returned instead of ' +  URI + tokenURI_uint.toString()
      )
    })

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
  })
})