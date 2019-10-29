function dodlladdresscopy(id) {

  let copyText = document.getElementById(id);
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
  
  if (document.body.clientWidth < 768){
    return;
  }

  let nel = document.getElementById('notification');
  let ntxt = document.getElementById('notification_text');
  ntxt.innerHTML = `<b>'${copyText.value}'</b> copied to clipboard`;
  nel.style = 'display: block;';
  setTimeout(() => {
    nel.style = 'display: none;';
  }, 3000);
}

function setGenBalanceText() {
  let xhr = new XMLHttpRequest();
  let url = `https://nodes.wavesnodes.com/addresses/balance/details/3PLp1QsFxukK5nnTBYHAqjz9duWMriDkHeT`;

  xhr.open("GET", url);
  xhr.send(null);

  xhr.onload = function () {
    let el = document.getElementById('gen_balance_num');
    let generating = Math.floor(((JSON.parse(xhr.response)).generating) / 100000000);
    el.innerHTML = new Intl.NumberFormat("jp-JP",{minimumIntegerDigits: 1, minimumFractionDigits: 0, maximumFractionDigits: 0}).format(generating);
    document.getElementById('gen_balance_caption').innerHTML = 'Generating Balance';
  };
}

window.onload = (event) => {
  setGenBalanceText();
};