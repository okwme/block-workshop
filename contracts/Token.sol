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
