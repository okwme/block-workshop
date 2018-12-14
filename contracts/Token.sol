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