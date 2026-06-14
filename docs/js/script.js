// script.js for the docs page
function formatResult(type, data) {
  if (data.error) return `Error: ${data.error}`;

  switch (type) {
    case 'a':
    case 'aaaa':
      return data.records?.join('<br>') ?? JSON.stringify(data, null, 2);
    case 'cname':
      return data.cname ?? JSON.stringify(data, null, 2);
    case 'txt':
      return data.records?.map(r => Array.isArray(r) ? r.join('') : r).join('<br>') ?? JSON.stringify(data, null, 2);
    case 'ns':
      return data.records?.join('<br>') ?? JSON.stringify(data, null, 2);
    case 'mx':
      return data.records?.map(r => `${r.priority}\t${r.exchange}`).join('<br>') ?? JSON.stringify(data, null, 2);
    case 'srv':
      return data.records?.map(r => `${r.priority} ${r.weight} ${r.port} ${r.target}`).join('<br>') ?? JSON.stringify(data, null, 2);
    case 'soa':
      return data.nsname
        ? `Primary NS:  ${data.nsname}<br>Hostmaster:  ${data.hostmaster}<br>Serial:      ${data.serial}<br>Refresh:     ${data.refresh}<br>Retry:       ${data.retry}<br>Expire:      ${data.expire}<br>Min TTL:     ${data.minttl}`
        : JSON.stringify(data, null, 2);
    default:
      return JSON.stringify(data, null, 2);
  }
}

async function doLookup(type, host, resultEl) {
  host = host.trim();
  if (!host) {
    resultEl.textContent = 'Please enter a host or domain name.';
    resultEl.className = 'lookup-error';
    return;
  }

  resultEl.textContent = 'Looking up…';
  resultEl.className = 'lookup-loading';

  try {
    const res = await fetch(`https://him.hackclub.app/query/${type}?host=${encodeURIComponent(host)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const data = await res.json();
    resultEl.innerHTML = formatResult(type, data);
    resultEl.className = data.error ? 'lookup-error' : 'lookup-success';
  } catch (err) {
    resultEl.textContent = `Request failed: ${err.message}`;
    resultEl.className = 'lookup-error';
  }
}

function registerLookup(type) {
  const input = document.getElementById(`${type}-dns-lookup`);
  const button = document.getElementById(`${type}-lookup-submit`);
  const result = document.getElementById(`${type}-lookup-result`);

  if (!input || !button || !result) return;

  const run = () => doLookup(type, input.value, result);
  button.addEventListener('click', run);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
}

['a', 'aaaa', 'cname', 'txt', 'ns', 'mx', 'srv', 'soa'].forEach(registerLookup);

// bulk thing section - slooppy code because it's 3 am, im sleepy
// and i already have racked up "sleep debt" from yesterday so..

const bulkInput = document.getElementById("bulk-dns-lookup");
const bulkButton = document.getElementById("bulk-lookup-submit");
const bulkResult = document.getElementById("bulk-lookup-result");

function formatBulkData(d) {
  let table = `
  <table>
  <tr>
    <th>Record Type</th>
    <th>Record Value</th>
  </tr>
  `

  d.a.forEach((ar) => {
    table = table + `<tr>
    <td>A</td>
    <td>${ar}</td>
    </tr>`
  });

  d.aaaa.forEach((ar) => {
    table = table + `<tr>
    <td>AAAA</td>
    <td>${ar}</td>
    </tr>`
  });

  d.cname.forEach((ar) => {
    table = table + `<tr>
    <td>CNAME</td>
    <td>${ar}</td>
    </tr>`
  });

  d.txt.forEach((ar) => {
    table = table + `<tr>
    <td>TXT</td>
    <td>${ar}</td>
    </tr>`
  });

  d.ns.forEach((ar) => {
    table = table + `<tr>
    <td>NS</td>
    <td>${ar}</td>
    </tr>`
  });

  d.mx.forEach((ar) => {
    table = table + `<tr>
    <td>MX</td>
    <td>${ar}</td>
    </tr>`
  });

  d.srv.forEach((ar) => {
    table = table + `<tr>
    <td>SRV</td>
    <td>${ar}</td>
    </tr>`
  });

  if (d.soa && d.soa.nsname) {
    table += `<tr><td>SOA</td><td>${d.soa.nsname}</td></tr>`;
  }

  table = table + `</table>`;
  return table;
}

bulkButton.onclick = async () => {
  try {
    const res= await fetch("https://him.hackclub.app/query/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: bulkInput.value.trim(),
        recordTypes: ["all"]
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const data = await res.json();

    bulkResult.innerHTML = formatBulkData(data);
  } catch (e) {
    return bulkResult.innerText = `Error! ERR: ${e}`;
  }
}