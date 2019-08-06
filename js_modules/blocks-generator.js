const x2y = require("./x2y");
const bdb = require("./blocksdb");
const LONG_DELAY = 12000;
const SHORT_DELAY = 3000;

async function generate(connect, helpers, methods, trxdb, conf, chains, chain) {
    let PROPS = await methods.getProps(connect[chain]);
			const block_n = await bdb.getBlock(chain, PROPS.last_irreversible_block_num);
let bn = block_n.last_block;

delay = SHORT_DELAY;
while (true) {
    try {
        if (bn > PROPS.last_irreversible_block_num) {
            await helpers.sleep(delay);
            PROPS = await methods.getProps(connect[chain]);
        } else {
            if(0 < await x2y.processBlock(connect, helpers, methods, trxdb, conf, chains, chain, bn)) {
                delay = SHORT_DELAY;
            } else {
                delay = LONG_DELAY;
            }
            bn++;
            await bdb.updateBlock(chain, bn);
        }
    } catch (e) {
        console.log("error in main loop" + e);
        await helpers.sleep(1000);
        }
    }
}

module.exports.generate = generate;