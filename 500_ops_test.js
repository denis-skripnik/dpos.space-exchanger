var golos = require('golos-js');
let login = 'name';
let wif = '5k';
let op = [];
for (i = 0; i < 500; i++) {
op.push(['transfer', {from:login,to:'denis-skripnik',amount:'0.002 GOLOS',memo:'viz:denis-skripnik'}]);
}

golos.broadcast.send({
  extensions: [],
  operations: op}, [wif], console.log);