console.clear();

function wavesToText(w) {
  return w / 100000000;
}


class KeeperManager {
  constructor() {
    this.sate = null;
    this.keeper = null;
    this.loaded = false;
    this.canStart = false;
    this.invoke = false;
    this.invokeArg = 0;
    this.testInterval = null;
    this.DU_interval = null;
    this.DU_height = 0;
    this.adr = '';
    this.adr_strength = -1;
    this.adr_choice = -2;
    this.reward = -1;
    this.reward_choice = -1;
  }

  hide(name) {
    document.getElementById(name).style = 'display: none;';
  }

  show(name) {
    document.getElementById(name).style = 'display: block;';
  }

  display(mode, text = '', color = 'black', timer = false) {
    console.log('display', mode);
    switch (mode) {
      case 0:
        this.hide('KeeperInfo');
        this.hide('KeeperLoginBtn');
        //this.show('Keeper');
        this.show('KeeperInstallBtn');
        this.show('KeeperInfo_StatusNotOk');
        window.localStorage.setItem('auto_keeper_login', 'false');
        this.adr = '';
        this.setWalletInfo();
        break;
      case 1:
        this.hide('KeeperInfo');
        this.hide('KeeperInstallBtn');
        this.hide('KeeperInfo_StatusNotOk');
        this.show('KeeperLoginBtn');
        //this.show('Keeper');
        window.localStorage.setItem('auto_keeper_login', 'false');
        this.adr = '';
        this.setWalletInfo();
        break;
      case 2:
        this.setInfo(text, color, timer);
        this.hide('KeeperInstallBtn');
        this.hide('KeeperInfo_StatusNotOk');
        this.show('KeeperInfo');
        this.show('KeeperLoginBtn');
        //this.show('Keeper');
        window.localStorage.setItem('auto_keeper_login', 'false');
        this.adr = '';
        this.setWalletInfo();
        break;
      case 3:
        this.setInfo(text, color, timer);
        this.hide('KeeperInstallBtn');
        this.hide('KeeperInfo_StatusNotOk');
        this.hide('KeeperLoginBtn');
        //this.hide('Keeper');
        this.show('KeeperInfo');
        window.localStorage.setItem('auto_keeper_login', 'true');
        break;

    }
  }

  onload() {
    this.loaded = true;
    if (window.localStorage.getItem('auto_keeper_login') === 'true') {
      this.start();
    }
    else {
      if (this.isKeeperInstalled()) {
        this.display(1);
      }
      this.updateDU();
    }
    this.setInterval();
    this.startDU();
  }

  isKeeperInstalled() {
    this.keeper = window.WavesKeeper;
    if (!this.keeper) {
      this.display(0);
      return false;
    }
    return true;
  }

  setInterval() {
    this.testInterval = setInterval(() => { this.test() }, 7000);
  }

  setInfo(message, color = 'black', timer = false) {
    let info = document.getElementById('KeeperInfo');
    info.innerHTML = message;
    info.style = `color: ${color}`;
    if (timer && this.testInterval) {
      clearInterval(this.testInterval);
      this.testInterval = null;
      setTimeout(() => {
        this.test();
        this.setInterval();
      }, 15000);
    }
  }

  errorHandler(err) {
    switch (err.code) {
      case '14':
        this.display(2, "Add KEEPER account...");
        break;
      case '12':
      case '10':
        this.display(2, "You're rejected this service and can't vote!");
        break;
      case '13':
        this.display(2, "Init KEEPER and add account...");
        break;
      case '15':
        this.display(2, "Attempt to transfer unavailable funds!<br>You must have 0.009 Waves for transaction fee<br>and 0.009 Dodllnode for payment to vote!", 'red', true);
        break;
      default:
        console.log(err);
        this.display(2, err.message, 'red', true);
        break;
    }
  }

  login() {
    this.start();
  }

  async start() {
    if (!this.loaded || !this.isKeeperInstalled()) return;
    let that = this;
    this.canStart = false;
    let intrv = setTimeout(() => {
      this.display(2, 'Auth or Reject for continue...');
    }, 2000);
    this.keeper.initialPromise
      .then((keeperApi) => {
        keeperApi.publicState().then(state => {
          clearTimeout(intrv);
          that.state = state;
          if (state && state.initialized) {
            this.canStart = true;
            window.localStorage.setItem('auto_keeper_login', 'true');
            if (state.account.networkCode === 'W') {
              this.setWallet(state.account.address);
              if (this.invoke) {
                this.invoke = false;
                this.invokeDAPP(this.invokeArg);
              }
            }
            else {
              this.display(2, 'Switch KEEPER to Mainnet...');
            }
          }
        }).catch(err => {
          clearTimeout(intrv);
          window.localStorage.setItem('auto_keeper_login', 'false');
          this.canStart = true;
          this.errorHandler(err);
        });
      });
  }

  setWallet(adr) {
    if (this.adr !== adr) {
      this.adr = adr;
      this.adr_strength = -1;
      this.adr_choice = -2;
      this.setWalletInfo();
      this.updateDU();
      this.startDU(true);
    }
  }

  voteToWaves(v) {
    return v * 0.5;
  }

  wavesToVote(w) {
    return Math.floor(w / 50000000);
  }

  getVotedChoice() {
    let vh = Number(window.localStorage.getItem(`${this.adr}_vote_height`));
    let ch = 0;
    if (vh !== null && vh >= this.DU_height) {
      ch = Number(window.localStorage.getItem(`${this.adr}_vote`));
    }
    else {
      ch = this.adr_choice;
    }
    return ch;
  }

  setWalletInfo() {
    let vh = Number(window.localStorage.getItem(`${this.adr}_vote_height`));
    let ch = this.getVotedChoice();
    let vt = '';
    if (this.reward > 0) {
      if (this.adr === '') {
        vt += `Now Block Reward is ${wavesToText(this.reward)} WAVES for each. `;
      }
      else {
        vt += `Now Block Reward is ${wavesToText(this.reward)} WAVES for each and you can vote to increase or decrease this value. `;
      }
      if (this.reward_choice < 0) {
        this.reward_choice = this.wavesToVote(this.reward);
      }
      if (this.reward_choice >= 0){
        document.getElementById('reward_choice').innerHTML = this.voteToWaves(this.reward_choice);
      }
    }
    if (this.adr === '') {
      vt += 'You need to login with KEEPER to vote. ';
    }
    else if (this.adr_choice >= 0) {
      vt += `If your choice still is ${this.voteToWaves(ch)} WAVES reward for each block then there is no need to vote again. `;
    }
    document.getElementById('voting_txt').innerHTML = vt;

    if (this.adr === '') return;
    let info = [];
    info.push(`<li>Your adress is:</li><li class="bold">${this.adr}</li>`);
    if (this.adr_strength >= 0) {
      info.push(`<li>You have ${wavesToText(this.adr_strength)} Dodllnodes.</li>`);
    }

    if (vh !== null && vh >= this.DU_height) {
      info.push(`<li>You have successfully voted for ${this.voteToWaves(ch)} Waves as block reward. Your vote will be counted for 16 blocks.</li>`);
    }
    else {
      if (this.adr_choice > -2) {
        if (this.adr_choice < 0) {
          info.push(`<li>You doesn't vote yet</li>`);
        }
        else {
          info.push(`<li>You have already voted for ${this.voteToWaves(ch)} Waves as block reward, and your vote is counted in the result table.</li>`);
        }
      }
    }
    this.display(3, info.join(''));
  }

  updateTable(block, reward, result){
    let direct = [0, 0, 0];
    for (let i = 0; i < 17; i++) {
      let key_reward = i * 50000000;
      let value = result[i];
      if (key_reward < reward) direct[0] += value;
      else if (key_reward == reward) direct[1] += value;
      else direct[2] += value;
    }

    let pre_table = [
      {c1: '-', amount: direct[0], c2: 'for decrease miner reward'},
      {c1: '=', amount: direct[1], c2: 'for staying at same level'},
      {c1: '+', amount: direct[2], c2: 'for increase miner reward'},
    ];

    pre_table.sort((a, b) => {
      if (a.amount < b.amount){
        return 1;
      }
      else if (a.amount > b.amount){
        return -1;
      }
      else{
        return 0;
      }
    });

    let sum = direct[0] + direct[1] + direct[2];
    let table = [];
    table.push(`<div id="results_title"><b>Results of voting on Dodllnode pool at ${block} block</b></div>`)
    table.push('<table>');
    for (let n = 0; n < 3; n++){
      let pt = pre_table[n];
      table.push('<tr>');
      table.push(`<td class="fitstcolumn">${pt.c1}</td>`);
      table.push(`<td>${wavesToText(pt.amount)} Dodllnodes</td>`);
      table.push(`<td>${((pt.amount / sum) * 100).toFixed(1)}%</td>`);
      table.push(`<td>${pt.c2}</td>`);

      table.push('</tr>');  
    }
    table.push('</table>');
    document.getElementById('table').innerHTML = table.join('');
  }

  updateDU(update_height = true) {
    let xhr = new XMLHttpRequest();
    let url = `https://dodllnode.com/vote_status`;
    if (this.adr !== '') {
      url += `/${this.adr}`;
    }

    xhr.open("GET", url);
    xhr.send(null);

    xhr.onload = () => {
      let data = JSON.parse(xhr.response);
      console.log(data);
      this.reward = data.reward;
      this.updateTable(data.height, data.reward, data.vote_result);
      if (data.adr !== this.adr) { this.setWalletInfo(); return; };
      if (update_height) this.DU_height = data.height;
      this.adr_strength = data.adr_strength;
      this.adr_choice = data.adr_choice;
      this.setWalletInfo();
    };
  }

  startDU() {
    if (this.DU_interval) {
      clearInterval(this.DU_interval);
    }
    this.DU_interval = setInterval(() => { this.updateDU() }, 60000);
  }

  test() {
    if (this.isKeeperInstalled() && this.canStart) {
      this.start();
    }
  }

  invokeDAPP(arg) {
    this.canStart = false;
    this.keeper.signAndPublishTransaction({
      type: 16,
      data: {
        fee: {
          "tokens": "0.009",
          "assetId": "WAVES"
        },
        dApp: '3PGEh2VpbpYyetTUTCY6bRxv2mpMwZoz5sP',
        call: {
          function: 'vote',
          args: [
            {
              "type": "integer",
              "value": arg
            }
          ]
        },
        payment: [
          {
            "tokens": "0.009",
            "assetId": "Aj1R9wXUEuyZfxAgaKzv8UxgxE3oN2AfouqJgfiNMrFd"
          }
        ]
      }
    }).then((tx) => {
      this.canStart = true;
      window.localStorage.setItem(`${this.adr}_vote`, arg);
      window.localStorage.setItem(`${this.adr}_vote_height`, this.DU_height);
      this.setWalletInfo();
      this.startDU();
      setTimeout(() => {
        this.updateDU(false);
        setTimeout(() => {
          this.updateDU(false);
        }, 10000)
      }, 5000)
    }).catch((err) => {
      this.canStart = true;
      this.errorHandler(err);
    });
  }

  changeRewardChoice(add) {
    this.reward_choice = (17 + this.reward_choice + add) % 17;
    this.setWalletInfo();
  }

  async vote() {
    this.invoke = true;
    this.invokeArg = this.reward_choice;
    await this.start();
  }
}

let cm = null;

function loginWithKeeper() {
  if (!cm) return;
  cm.login();
}

function ready() {
  cm = new KeeperManager();
  cm.onload();
}

function decRewardChoice() {
  if (!cm) return;
  cm.changeRewardChoice(-1);
}

function incRewardChoice() {
  if (!cm) return;
  cm.changeRewardChoice(1);
}

function vote() {
  if (!cm) return;
  cm.vote();
}
window.addEventListener("load", ready);




