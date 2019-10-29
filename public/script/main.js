function dodlladdresscopy(id) {
  let copyText = document.getElementById(id);
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");

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
    function fixed3(x) {
      if (x < 10) {
        return `00${x}`;
      }
      else if(x < 100){
        return `0${x}`;
      }
      return x;
    }

    let generating = Math.floor(((JSON.parse(xhr.response)).generating) / 100000000);
    let el = document.getElementById('gen_balance_num');
    let k6 = Math.floor(generating / 1000000);
    let k3 = Math.floor((generating - k6 * 1000000) / 1000);
    let k1 = Math.floor(generating - k3 * 1000 - k6 * 1000000);
    if (k3 > 0) {
      k1 = fixed3(k1);
    }
    if (k6 > 0) {
      k3 = fixed3(k3);
    }

    el.innerHTML = `${k6},${k3},${k1}`;
    document.getElementById('gen_balance_caption').innerHTML = 'Generating Balance';
  };
}

window.onload = (event) => {
  setGenBalanceText();
};