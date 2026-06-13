const BASE_URL = '/query';

function formatResult(type, data) {
  if (data.error) return `Error: ${data.error}`;

  switch (type) {
    case 'a':
    case 'aaaa':
      return data.records?.join('\n') ?? JSON.stringify(data, null, 2);

    case 'cname':
      return data.cname ?? JSON.stringify(data, null, 2);

    case 'txt':
      return data.records
        ?.map(r => (Array.isArray(r) ? r.join('') : r))
        .join('\n') ?? JSON.stringify(data, null, 2);

    case 'ns':
      return data.records?.join('\n') ?? JSON.stringify(data, null, 2);

    case 'mx':
      return data.records
        ?.map(r => `${r.priority}\t${r.exchange}`)
        .join('\n') ?? JSON.stringify(data, null, 2);

    case 'srv':
      return data.records
        ?.map(r => `${r.priority} ${r.weight} ${r.port} ${r.target}`)
        .join('\n') ?? JSON.stringify(data, null, 2);

    case 'soa':
      return data.nsname
        ? [
            `Primary NS:  ${data.nsname}`,
            `Hostmaster:  ${data.hostmaster}`,
            `Serial:      ${data.serial}`,
            `Refresh:     ${data.refresh}`,
            `Retry:       ${data.retry}`,
            `Expire:      ${data.expire}`,
            `Min TTL:     ${data.minttl}`,
          ].join('\n')
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
    const url = `${BASE_URL}/${encodeURIComponent(type)}?host=${encodeURIComponent(host)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = formatResult(type, data);

    resultEl.textContent = text;
    resultEl.className = data.error ? 'lookup-error' : 'lookup-success';
  } catch (err) {
    resultEl.textContent = `Request failed: ${err.message}`;
    resultEl.className = 'lookup-error';
  }
}

function registerLookup(type) {
  const input  = document.getElementById(`${type}-dns-lookup`);
  const button = document.getElementById(`${type}-lookup-submit`);
  const result = document.getElementById(`${type}-lookup-result`);

  if (!input || !button || !result) {
    console.warn(`[ByteDNS] Could not find elements for record type "${type}"`);
    return;
  }

  const run = () => doLookup(type, input.value, result);

  button.addEventListener('click', run);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') run();
  });
}

['a', 'aaaa', 'cname', 'txt', 'ns', 'mx', 'srv', 'soa'].forEach(registerLookup);