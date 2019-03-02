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

async function processTransfer(x, data) {
var x_token = conf[x].token;
    var memo = data.memo;
memo = memo.toLowerCase();
    var exchange_data = memo.split(":"); // 0 - блокчейн, 1 - логин.
    if (chains.includes(exchange_data[0])) {
    var y = exchange_data[0];
    } else {
var y = x;
    }
    var y_token = conf[y].token;
var to = exchange_data[1];
var curs = conf[x].how_to_viz/conf[y].how_to_viz;
curs *= 1000;
curs = parseInt(curs);
curs /= 1000;
var fee = conf[x].fee;
var amount = parseFloat(data.amount)*curs;
var amount_fee = 0.01*amount*fee;
amount = amount - amount_fee;
amount *= 1000;
amount = parseInt(amount);
amount /= 1000;
amount = amount.toFixed(3);
    try {
        const exchange_receiver = await methods.getAccount(y, to);
if (exchange_receiver.length > 0) {
    var receive_approve = true;
} else {
    var receive_approve = false;
}
} catch(e) {
    var receive_approve = 'noConnection';
console.log(e);
}

try {
const from_account = await methods.getAccount(y, conf[y].login);
var balance = parseFloat(from_account[0].balance);
if (balance < amount) {
    receive_approve = 'noBalance';
}
} catch(e) {
var receive_approve = 'noConnection';
console.log(e);
}
console.log(`Блокчейн-получатель: ${y}, статус: ${receive_approve}.`);
try {
    if (receive_approve === true) {
        amount = amount + ` ${y_token}`;
       
        var memo = `Обмен ${x_token} на ${y_token}. Шлюз обмена: @${conf[y].login}, 1 ${x_token} =${curs} ${y_token}.`;
        const transfer = await methods.transfer(y, conf[y].active_key, conf[y].login, to, amount, memo);
        if (transfer !== 0) {
            const time = await helpers.unixTime();
await trxdb.addTransaction(transfer, conf[y].login, to, amount, memo, time, y);
return 1;
} else {
return 0;
}
} else     if (receive_approve === 'noBalance') {
    var memo = `Баланс у шлюза @${conf[x].login} меньше, чем необходимо вам отдать. Просьба смотреть максимальную сумму в описании аккаунта.`;
    const transfer = await methods.transfer(x, conf[x].active_key, conf[x].login, data.from, data.amount, memo);
    if (transfer !== 0) {
        const time = await helpers.unixTime();
        await trxdb.addTransaction(transfer, conf[x].login, data.from, data.amount, memo, time, x);
        return 1;
    } else {
        return 0;
        }
        } else     if (receive_approve === 'noConnection' || receive_approve === undefined) {
    var memo = `К сожалению, не удалось соединиться с Нодой для обмена. Возможно вы указали неподдерживаемый блокчейн: поддерживается golos, steem, whaleshares, viz. Повторите попытку, пожалуйста.`;
    const transfer = await methods.transfer(x, conf[x].active_key, conf[x].login, data.from, data.amount, memo);
    if (transfer !== 0) {
        const time = await helpers.unixTime();
        await trxdb.addTransaction(transfer, conf[x].login, data.from, data.amount, memo, time, x);
        return 1;
        } else {
        return 0;
        }
} else if (receive_approve === false) {
var memo = `Аккаунт ${to} не существует в блокчейне ${y}.`;
const transfer = await methods.transfer(x, conf[x].active_key, conf[x].login, data.from, data.amount, memo);
if (transfer !== 0) {
    const time = await helpers.unixTime();
    await trxdb.addTransaction(transfer, conf[x].login, data.from, data.amount, memo, time, x);
    return 1;
} else {
    return 0;
    }
}
} catch(e) {
    console.log(e);
    }
   
}

async function processBlock(x, bn) {
    const block = await methods.getOpsInBlock(x, bn);
let ok_ops_count = 0;
    for(let tr of block) {
        const [op, opbody] = tr.op;
        switch(op) {
                case "transfer":
if (opbody.to === conf[x].login && opbody.memo.indexOf("Шлюз обмена:") === -1 && opbody.memo.indexOf("с Нодой для обмена") === -1 && opbody.memo.indexOf("Баланс у шлюза @") === -1 && opbody.memo.indexOf("withdraw:") === -1 && opbody.memo.indexOf("return:") === -1) {
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