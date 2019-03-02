var Datastore = require('nedb');
const db= {};
db['viz'] = new Datastore({ filename: './databases/viz_block.db', autoload: true });
db['golos'] = new Datastore({ filename: './databases/golos_block.db', autoload: true });
db['steem'] = new Datastore({ filename: './databases/steem_block.db', autoload: true });
db['whaleshares'] = new Datastore({ filename: './databases/whaleshares_block.db', autoload: true });
  db['viz'].persistence.setAutocompactionInterval(1000 * 300);
  db['golos'].persistence.setAutocompactionInterval(1000 * 300);
  db['steem'].persistence.setAutocompactionInterval(1000 * 300);
  db['whaleshares'].persistence.setAutocompactionInterval(1000 * 300);

  function getBlock(chain, last_irreversible_block_num) {
    return new Promise((resolve, reject) => {
        db[chain].findOne({}, (err,data) => {
               if(err) {
                      reject(err);
               } else {
if (data) {
                resolve(data);
} else {
var data = {};
data.last_block = last_irreversible_block_num;
resolve(data);
}
              }
        });
    });
}

function updateBlock(chain, id) {
  return new Promise((resolve, reject) => {
  db[chain].update({}, {last_block: id}, {upsert:true}, (err, result) => {
if (err) {
  reject(err);
} else {
       resolve(result);
}
  });
  });
}

module.exports.getBlock = getBlock;
module.exports.updateBlock = updateBlock;