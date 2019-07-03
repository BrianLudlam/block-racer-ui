# Block Racer Dapp

A decentralized application, allowing Ethereum users (requires a Web3 Provider, such as MetaMask, installed in browser) to create ERC721 extended tokens, and race them against each other in a virtual race using blockchain mechanics. Each race's results are settled on-chain, via a transaction that is open to any Ethereum account holder. Race results are playable live, as well as replayable in the future. Block Racer tokens each have relatively unique and random "genes", which translate into racing skill potentials. Each Block Racer can be trained up to their potential, using experience points gained by racing, per account.

## Block Racers = Tokens

All created Block Racers are standard ERC721 tokens, therefore can be bought, sold, and traded at will. This Dapp UI does not concern with trading tokens though, as that would be better implemented with a seperate market oriented interface. This is in the future development scope of the project. For now, tokens can still be traded using manual transactions and even Remix, so very possible. 

### Creating, Spawning, and Genes

There is a transaction fee required for creating a new Block Racer, which can be reclaimed by spawning a Block Racer. When creating each Block Racer, future block mechanics are used to randomize each Block Racer's genes / skill potentials, as well as relative verification of each creation transaction. Exactly 12 blocks after a Block Racer creation transaction is successful, that Block Racer can be Spawned (via spawnEntity transaction). Spawning is simply the process of giving a Block Racer it's relatively-random genes. A created Block Racer that is not Spawned before the 256 block limit (due to Eth blockhash history limit), will result in permanently zeroed genes. Still useful, but much less. Spawning is queued semi-blindly depending on transaction order, first-come-first-served, and open to anyone with an account. A successful spawning transaction pays 4 finney. Likewise, a successful creation transaction cost 4 finney.

### Parents and Rarity

A Block Racer can be created with "parents" or without. Prarents can be any two created Block Racers, already Spawned, and owned by the creator. A Block Racer created with parents will have genes relatively-randomized between each gene value of it's parents. A Block Racer created without parents will receive relatively-random genes on an exponential scale of rarity. Most Block Racers will have skill potentials less than 100, with every 8 points above that being exponentially more rare, maxing at 255. The odds of getting all three Block Racer skill potentials at 255, is 256^3, or one in 16,777,216. *Miners may have a slight advantage here, but effects are minimalized, individualized, and far below block rewards in any ultimate value of transaction manipulation.

### Genes

Block Racer genes represent the potential of a Block Racer to be trained in any of three skills: acceleration, top speed, and traction. Acceleration governs the relative minimum speed of a Block Racer each split, with top speed governing the relative max speed each split, and traction skill governs the effect that track conditions have on slowing the racer down. Each Block Racer has a total of 32 8bit genes after Spawning. This project is only using 3 of them so far. More skills can be added that further translate racing performance, as well as virtual charactoristics of the Block Racer itself. At the current scope of this project, racing Block Racers are simply represented by a progress bar. 

## Racing

Any created Block Racer can enter the race queue at any time, unless already queued or racing. Block Racers entering are queued by level. As soon as 6 are queued at the same level, a race at that level will begin in exactly 12 blocks. Queued Block Racers can exit the race queue at any time before the race starts, but not after it starts, which is at the exact instant that a 6th entry transaction is processed at any given race level. 

### Race Performance

Starting on the 12th block after all 6 Block Racers are queued at a specific level, each block after that transaltes into part-skill part-randomish race performance until each racer reaches the finish line. The trained performance of each Block Racer can be combined with some relative-randness in block creation mechanics to give a distance travelled for each of 32 "splits" per block. Each Block Racer is individually processed to compute 32 split values per block, representing distance traveled each split. Each race result can be calculated (by a UI) in parallel to it's eventual smart contract's official calculations, however the smart contracts know nothing about the race result until informed with a set of Settlement transactions. The race ends when all Block Racers have reached a specified level-based distance (calculated and displayed by the UI) and coming in one of: 1st - 6th place. Each race requires Settlement transactions to finalize the race result on-chain and payout winners. Race entry has a fee, part of which is later passed on to race settlers, and the rest is payed out to race winners. Contracts do not retain any fees, all fees are passed on to players in some way.

### Settlement Fees and Rewards

Settling each race requires 7 transactions total, one for each of 6 lanes, and a final to compare results. Settlement transactions are open to anyone, and pay a reward, which is previously collected from each Block Racer's race entry transaction. Settlment fees for each race entry are 4 finney per racer, eventually paying out: 4 finney to the first race settlement transaction, 5 finney to the last, and 3 finney to the middle 5 settlement transactions. If a race settlement transaction occurs after all 6 settlement transactions occur for a given race, the contract will attempt to find another race to settle, before failing.

### Racing Fees and Winner Rewards

Each race also pays out rewards to it's: 1st, 2nd, and 3rd place winners. The amount payed out each race to winners is scaled by level, and collected beforehand as racing fees from each Block Racer's entry transaction. Racing fees are 18 finney per racer at level zero, and 1.8 finney more per each level. Race winners at level zero win a 4:3:2 split of collected racing fees, which at level zero is rewards of: 48 finney for 1st place, 36 finney for second plae, and 24 finney for third place. Each level above that adds to rewards: 4.8 finney, 3.6 finney, and 2.4 finney, respectively. 

### Block Racer Training and Levels

Block Racers can be trained in each of their 3 skills: acceleration, top speed, and traction. The specifc genes of each Block Racer govern the maximum amount each skill can be trained. Training Block Racers costs experience points at a 1:1 ratio. Eperience points are collected, per account, by racing Block Racers. At least 1 experience point (sometimes 2, rarely 3) is earned for every Block Racer race entry, upon settlement of the race, regardless of performance in the race. Experience points can be applied to any Block Racer, given that Block Racer has the skill potential. For every 8 levels a Block Racer is trained in any skill, that Block Racer automatically goes up a level. The maximum amount of training a Block Racer can receive, is governed by it's genes as skill potential, which has a max of 255. Therefore, a Block Racer with max genes, and max training, would find a max level Block Racer at 95. A Block Racer with zeroed genes (zero skill potential), due to not being spawned in time to receive genes, can never be trained, but can always race at level zero with no training. Level zero races are the most random, with each level adding more and more player skill in training strategy. Level zero races will be very close, with generally greater differential as level gets higher. Racing fees (not settlement fees) go up per level, as well as their matching payout table.

## Contract Repos

### Block Racer Token Contract

https://github.com/BrianLudlam/nft-entity

### Block Racer Contract

https://github.com/BrianLudlam/block-racer

## Deployment

### Ropsten testnet

https://block-racer.web.app/<br/>
*requires a browser with Web3 Provider, like MetaMask, and an account with some test Eth on Ropsten testnet.

Block Racer Token Contract Address: 0xf48D50efc893cA6B41B93De06Fa2D703D523Cb9C<br/>
Block Racer Contract Address: 0x92d03676E75a01993B3179Dc4d55fe56Ac24f2A6

(Ropsten Faucet for test ether: https://faucet.ropsten.be/)

### Mainnet

Coming soon, once testing is sufficient on testnet

# Create React App Instructions

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
