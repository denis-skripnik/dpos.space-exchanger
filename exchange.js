const bg = require("./js_modules/blocks-generator");
const au = require("./js_modules/update_accounts");
const helpers = require("./js_modules/helpers");
const methods = require("./js_modules/methods");
const trxdb =                  require("./js_modules/transactionsdb");
const conf = require('./config.json');
let chains = [];
                for (let chain in conf) {
if (conf[chain].active === true) {
    chains.push(chain);
}
                }

                async function noReturn() {
                    chains.forEach(async function(chain) {
await bg.generate(chain);
});
                }                    

                noReturn()

async function workingTrx() {
    const time = await helpers.unixTime();
    const trx_time = time-90;
const trx_list = await trxdb.findTransactions(trx_time);
for (let trx of trx_list) {
    try {
    const get_trx = await methods.getTransaction(trx.blockchain, trx.trx_id);
    const block = await methods.getProps(trx.blockchain);
    const block_data = await methods.getBlockHeader(trx.blockchain, block.last_irreversible_block_num);
    const lest_block_time = Date.parse(block_data.timestamp);
if (lest_block_time >= trx.time) {
    await trxdb.removeTransaction(trx._id);
}    
} catch(e) {
    if(e 
          && e.payload 
          && e.payload.error 
          && e.payload.error.data 
          && e.payload.error.data.code 
         && e.payload.error.data.code == 1020200) {
            const transfer = await methods.transfer(trx.blockchain, conf[trx.blockchain].active_key, trx.from, trx.to, trx.amount, trx.memo);
            if (transfer !== 0) {
                const send_time = await helpers.unixTime();
                await trxdb.updateTransaction(trx._id, transfer, trx.from, trx.to, trx.amount, trx.memo, send_time, trx.blockchain);
                }
     }
}}
}

setInterval(() => workingTrx(), 90000);
setInterval(() => au.updateAccounts(), 3000);