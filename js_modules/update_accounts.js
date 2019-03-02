const helpers = require("./helpers");
const methods = require("./methods");
const conf = require('../config.json');

    let msg_strings = [];
async function updateAccounts() {
    for (let x in conf) {
if (conf[x].active === true) {
    let x_token = conf[x].token;
    let balance_str = `Вы можете обменять максимум `;
    let curs_str = `Курс: 1 ${x_token} = `;
        for (let y in conf) {
        if (conf[y].active === true && y !== x) {
    var curs = conf[x].how_to_viz/conf[y].how_to_viz;
curs *= 1000;
curs = parseInt(curs);
curs /= 1000;
            let y_token = conf[y].token;
    const get_account = await methods.getAccount(y, conf[y].login);
    var fee = conf[x].fee;
    var balance = parseFloat(get_account[0].balance)/curs;
    var balance_fee = 0.01*balance*fee;
balance = balance - balance_fee;
    balance *= 1000;
balance = parseInt(balance);
balance /= 1000;
    balance_str += `${balance} ${x_token} на ${y_token},`;
curs_str += `${curs} ${y_token},`;
        }
    }
balance_str = balance_str.replace(/,\s*$/, ""); 
curs_str = curs_str.replace(/,\s*$/, ""); 

if (msg_strings[x] !== `${balance_str}. ${curs_str}.` || !msg_strings[x]) {
const account_x = await methods.getAccount(x, conf[x].login);
var memo = account_x[0].memo_key;
let 					metadata={};
                        metadata.profile={};
                    metadata.profile.about= `${balance_str},${curs_str},Комиссия ${conf[x].fee}%,${await helpers.nowDateTime()}`;
    var json_metadata=JSON.stringify(metadata);
await methods.accountUpdate(x, conf[x].active_key, conf[x].login, memo, json_metadata);
}

msg_strings[x] = {};
msg_strings[x] = `${balance_str}. ${curs_str}.`;
}
}
}

module.exports.updateAccounts = updateAccounts;