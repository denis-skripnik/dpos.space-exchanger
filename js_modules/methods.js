async function getOpsInBlock(chain, bn) {
    return await chain.api.getOpsInBlockAsync(bn, false);
  }
  
  async function getAccount(chain, login) {
  return await chain.api.getAccountsAsync([login]);
  }
  
  async function getProps(chain) {
  return await chain.api.getDynamicGlobalPropertiesAsync();
  }
  
  async function accountUpdate(chain, active_key, login, memo, str) {
      let 					metadata={};
                        metadata.profile={};
                    metadata.profile.about= str;
    var json_metadata=JSON.stringify(metadata);
	  return await chain.broadcast.accountUpdate(active_key, login, undefined, undefined, undefined, memo, json_metadata);
  }
  
  async function transfer(chain, wif, from, to, amount, memo) {
    var newTx = [];
    newTx = [['transfer', {from:from,to:to,amount:amount,memo:memo}]];
    var now = new Date().getTime() + 18e5,
    expire = new Date(now).toISOString().split('.')[0];
  
    const current = await getProps(chain);
    var blockid = current.head_block_id;
    n = [];
    for (var i = 0; i < blockid.length; i += 2)
    {
        n.push(blockid.substr(i, 2));
    }
    var hex = n[7] + n[6] + n[5] + n[4];
    var refBlockNum = current.head_block_number & 0xffff;
    var refBlockPrefix = parseInt(hex, 16)
    var trx = {
        'expiration': expire,
        'extensions': [],
        'operations': newTx,
        'ref_block_num': refBlockNum,
        'ref_block_prefix': refBlockPrefix
    };
    var trxs = "";
    try {
        trxs = await chain.auth.signTransaction(trx, {"active": wif});
    } catch (error) {
        console.log("Не удалось подписать транзакцию: " + error.message);
    }
    try {
    const broadcast_trx_sync = await chain.api.broadcastTransactionSynchronousAsync(trxs);
  return broadcast_trx_sync.id;
    } catch(e) {
  return 0;
    }
  }
  
  async function getBlockHeader(chain, block_num) {
  return await chain.api.getBlockHeaderAsync(block_num);
  }
  
  async function getTransaction(chain, trxId) {
  return await chain.api.getTransactionAsync(trxId);
  }
  
  module.exports.getOpsInBlock = getOpsInBlock;
module.exports.getAccount = getAccount;
module.exports.getProps = getProps;
module.exports.accountUpdate = accountUpdate;
module.exports.transfer = transfer;
module.exports.getBlockHeader = getBlockHeader;
module.exports.getTransaction = getTransaction;