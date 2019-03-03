// Обменник. Получаем перевод в x блокчейне, даём - в y, указанном в memo.
const helpers = require("./helpers");
const methods = require("./methods");
const trxdb = require("./transactionsdb");
var conf = require('../config.json');
let chains = [];
for (let blockchain in conf) {
    if (conf[blockchain].active === true) {
    chains.push(blockchain);
}
}

async function sendTransfer(chain, active_key, from, to, amount, memo) {
    const transfer = await methods.transfer(chain, active_key, from, to, amount, memo);
    if (transfer !== 0) {
        const time = await helpers.unixTime();
        await trxdb.addTransaction(transfer, from, to, amount, memo, time, chain);
        return 1;
        } else {
        return 0;
        }
}

async function processTransfer(x, data) {
var x_token = conf[x].token;
    var memo = data.memo;
memo = memo.toLowerCase();
    var exchange_data = memo.split(":"); // 0 - блокчейн, 1 - логин.
    if (chains.includes(exchange_data[0])) {
        let y = exchange_data[0];
        let y_token = conf[y].token;
let to = exchange_data[1];
let curs = conf[x].how_to_viz/conf[y].how_to_viz;
curs *= 1000;
curs = parseInt(curs);
curs /= 1000;
let fee = conf[x].fee;
let amount = parseFloat(data.amount)*curs;
let amount_fee = 0.01*amount*fee;
amount = amount - amount_fee;
amount *= 1000;
amount = parseInt(amount);
amount /= 1000;
amount = amount.toFixed(3);
let receive_approve;
try {
        const exchange_receiver = await methods.getAccount(y, to);
if (exchange_receiver.length > 0) {
    receive_approve = 'ok';
} else {
  receive_approve = 'noAccount';
}
} catch(e) {
    receive_approve = 'noConnection';
console.log(e);
}

try {
const from_account = await methods.getAccount(y, conf[y].login);
let balance = parseFloat(from_account[0].balance);
if (balance < amount) {
    receive_approve = 'noBalance';
}
} catch(e) {
receive_approve = 'noConnection';
console.log(e);
}

if (x === 'golos' || x === 'steem') {
    let sender_amount = data.amount.split(' ');
    let sender_token = sender_amount[1];
if (sender_token === 'GBG' || sender_token === 'SBD') {
receive_approve = 'noSupportedToken';
}
}

console.log(`Блокчейн-получатель: ${y}, статус: ${receive_approve}.`);
if (receive_approve === 'ok') {
        amount = amount + ` ${y_token}`;
      let memo = `Обмен ${x_token} на ${y_token}. Шлюз обмена: @${conf[y].login}, 1 ${x_token} =${curs} ${y_token}, комиссия ${conf[x].fee}%.`;
return await sendTransfer(y, conf[y].active_key, conf[y].login, to, amount, memo);
} else     if (receive_approve === 'noBalance') {
    let memo = `Вы отправили сумму, превышающую максимальную. Просьба смотреть максимумы в описании аккаунта шлюза @${conf[x].login}.`;
    return await sendTransfer(x, conf[x].active_key, conf[x].login, data.from, data.amount, memo);
} else     if (receive_approve === 'noSupportedToken') {
    let memo = `Токен не поддерживвается. Пожалуйста, отправьте сумму в ${x_token}`;
    return await sendTransfer(x, conf[x].active_key, conf[x].login, data.from, data.amount, memo);
} else if (receive_approve === 'noConnection' || receive_approve === undefined) {
        let memo = `К сожалению, не удалось соединиться с Нодой для обмена. Повторите попытку, пожалуйста.`;
        return await sendTransfer(x, conf[x].active_key, conf[x].login, data.from, data.amount, memo);
    } else if (receive_approve === 'noAccount') {
    let memo = `Аккаунт ${to} не существует в блокчейне ${y}.`;
    return await sendTransfer(x, conf[x].active_key, conf[x].login, data.from, data.amount, memo);
    }
    } else if (!chains.includes(exchange_data[0])) {
        console.log('Блокчейн: не существующий');
        let memo = `Вероятно вы указали неподдерживаемый блокчейн или ошиблись в написании: поддерживается golos, steem, whaleshares, viz. Повторите попытку, пожалуйста.`;
        return await sendTransfer(x, conf[x].active_key, conf[x].login, data.from, data.amount, memo);
       }
}

async function processBlock(x, bn) {
    const block = await methods.getOpsInBlock(x, bn);
let ok_ops_count = 0;
    for(let tr of block) {
        const [op, opbody] = tr.op;
        switch(op) {
                case "transfer":
if (opbody.to === conf[x].login && opbody.memo.indexOf("Шлюз обмена:") === -1 && opbody.memo.indexOf("с Нодой для обмена") === -1 && opbody.memo.indexOf("Вы отправили сумму, превышающую максимальную") === -1 && opbody.memo.indexOf("withdraw:") === -1 && opbody.memo.indexOf("return:") === -1 && opbody.memo.indexOf("не существует в блокчейне ") === -1 && opbody.memo.indexOf("Вероятно вы указали неподдерживаемый блокчейн или ошиблись в написании:") === -1 && opbody.memo.indexOf("Токен не поддерживвается.") === -1) {
    ok_ops_count += await processTransfer(x, opbody);
}
                break;
    default:
                    //неизвестная команда
            }
        }
if (ok_ops_count > 0) {
        console.log(`Всего операций: ${ok_ops_count}.`);
}
        return ok_ops_count;
    }

module.exports.processBlock = processBlock;