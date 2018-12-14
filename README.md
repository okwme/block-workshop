### Workshop

------

#### Welcome

- I'm **Billy Rennekamp**, I'm an artist and a developer working part time for a couple big projects like **Cosmos Network**, the creators of Tendermint and the Internet of Blockchains, **Gnosis**, a prediction market platform and creators of the Gnosis Safe and the DutchX decentralized exchange software. I also build on a couple smaller projects like **Clovers Network**, a game for generating rare art, **MemeLordz**, a curation market of memes (/r/MemeEconomy on the blockchain), **ENS Nifty**, a service for wrapping ENS domain names in NFTs so they can be sold on marketplaces like opensea and **Doneth** a shared wallet for open source projects.


The point of this workshop is to show how to deploy an NFT using a technique that makes it easy to update the `tokenURI` endpoint which returns information about token metadata. This will keep your token flexible as infrastructure changes so quickly.

The second part of this workshop will help you create a serverless solution for serving that metadata. This is a widely used web2 infrastructure solution that is cheap and scaleable. It is not decentralized. This is a solution for using the internet as it exists today. When better infrastructure is available for web3, you can replace this metadata solution for another, and update your token accordingly : )

#### Outline

1. ##### Part 1

   1. [Setup Environment](tutorial/1-1.md)
   2. [Make ERC-721](tutorial/1-2.md)
   3. [Make Metadata](tutorial/1-3.md)
   4. [Add Metadata to ERC-721](tutorial/1-4.md)
   5. [Create Migrations](tutorial/1-5.md)
   6. [Make Tests](tutorial/1-6.md)
   7. [Make Migration for Updates](tutorial/1-7.md)
   8. [Update ERC-721 and Tests](tutorial/1-8.md)
   9. [Deploy](tutorial/1-9.md)
   10. [Verify Contracts on Etherescan](tutorial/1-10.md)

2. ##### Part 2

   1. [Make new netlify project](tutorial/2-1.md)
   2. [Install netlify lambda](tutorial/2-2.md)
   3. [whoops](tutorial/2-3.md)
   4. [Add helloworld function](tutorial/2-4.md)
   5. [Add metadata](tutorial/2-5.md)
   6. [Add proxy](tutorial/2-6.md)
   7. [Add opensea](tutorial/2-7.md)
   8. [Add rarebits](tutorial/2-8.md)
   9. [Re-deploy and mint a token](tutorial/2-9.md)

-----

[Go to first step](tutorial/1-1.md)