function dodlladdresscopy(id) {

  let copyText = document.getElementById(id);
  copyText.select();
  //copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");

  /*
  if (document.body.clientWidth < 768){
    return;
  }*/

  let nel = document.getElementById('notification');
  let ntxt = document.getElementById('notification_text');
  ntxt.innerHTML = `Address copied to clipboard`;
  nel.style = 'display: block;';
  setTimeout(() => {
    nel.style = 'display: none;';
  }, 3000);
}

function setWavesText(id, num){
  str = String(Math.floor(num/100000000));
  let pos = str.length - 3;
  while(pos > 0){
    str = `${str.slice(0, pos)},${str.slice(pos)}`;
    pos -= 3;
  }
  document.getElementById(id).innerHTML = str;
}

function setGenBalanceText() {
  let xhr = new XMLHttpRequest();
  let url = `https://nodes.wavesnodes.com/addresses/balance/details/3PLp1QsFxukK5nnTBYHAqjz9duWMriDkHeT`;

  xhr.open("GET", url);
  xhr.send(null);

  xhr.onload = function () {
    let balances = JSON.parse(xhr.response);
    setWavesText('gen_balance_num', balances.generating);
    setWavesText('mined_num', balances.available);
    setWavesText('mined_num2', balances.available);
    document.getElementById('gen_balance_caption').innerHTML = 'Generating&nbsp;Balance';
    document.getElementById('mined_txt').innerHTML = 'WAVES mined';
    document.getElementById('mined_txt2').innerHTML = 'since last payout';
  };
}

window.onload = (event) => {
  setGenBalanceText();
};