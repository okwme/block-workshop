### Serverless NFTs

------

#### HALLO 👋

- I'm **Billy Rennekamp**, I work for a couple big projects like [**Cosmos Network**](https://cosmos.network), the creators of Tendermint and the Internet of Blockchains, and [**Gnosis**](https://gnosis.pm), a prediction market platform and the creators of the Gnosis Safe and the DutchX decentralized exchange software. I also build on a couple smaller projects like [**Clovers Network**](https://clovers.network), a game for generating rare art, [**MemeLordz**](https://memelordz.com), a curation market of memes (/r/MemeEconomy on the blockchain), [**ENS Nifty**](https://ensnifty.com), a service for wrapping ENS domain names in NFTs so they can be sold on marketplaces like opensea and [**Doneth**](https://doneth.org) a shared wallet for open source projects.


The first part of this tutorial demonstrates how to deploy an NFT using a technique that makes it easy to update the `tokenURI` endpoint which returns information about token metadata. This will keep your token flexible as infrastructure changes so quickly around decentralized technology.

The second part of this tutorial will demonstrate how to create a serverless solution for serving that metadata. This is a widely used web2 infrastructure solution that is cheap and scaleable. It is not decentralized; This is a solution for using the Internet as it exists today. When the infrastructure around decentralized storage is a little faster and more reliable, you can replace this metadata solution for another and update your token accordingly : )

#### Outline

1. ##### Upgradeable Token URI

   1. [Setup Environment](tutorial/1-01.md)
   2. [Make ERC-721](tutorial/1-02.md)
   3. [Make Metadata](tutorial/1-03.md)
   4. [Add Metadata to ERC-721](tutorial/1-04.md)
   5. [Create Migrations](tutorial/1-05.md)
   6. [Make Tests](tutorial/1-06.md)
   7. [Make Migration for Updates](tutorial/1-07.md)
   8. [Update ERC-721 and Tests](tutorial/1-08.md)
   9. [Deploy](tutorial/1-09.md)
   10. [Verify Contracts on Etherescan](tutorial/1-10.md)

2. ##### Serverless Metadata

   1. [Make new netlify project](tutorial/2-01.md)
   2. [Install netlify lambda](tutorial/2-02.md)
   3. [Add helloworld function](tutorial/2-03.md)
   4. [Add metadata](tutorial/2-04.md)
   5. [Add proxy](tutorial/2-05.md)
   6. [Add opensea](tutorial/2-06.md)
   7. [Add rarebits](tutorial/2-07.md)
   8. [Re-deploy and mint a token](tutorial/2-08.md)

-----

[Go to the first step!](tutorial/1-01.md)
