async function sleep(ms) {
    await new Promise(r => setTimeout(r, ms));
    }

    async function unixTime(){
        return parseInt(new Date().getTime()/1000)
        }
    
  async function nowDateTime() {
    var tm = new Date();
    var resTxt = "Обновлено " + tm.getDate() + "." + (tm.getMonth() + 1)
           + "." + tm.getFullYear() + ", " + 
tm.getHours() + ":"
           + tm.getMinutes() + ":" + tm.getSeconds() + " GMT+3";
    
    return resTxt;
}

module.exports.unixTime = unixTime;
module.exports.sleep = sleep;
module.exports.nowDateTime = nowDateTime;