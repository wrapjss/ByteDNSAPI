// index.js is the expres.js server and the backend for the thing

const express = require("express");
const dns = require("node:dns/promises");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.redirect("/docs")
});

app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/docs/index.html");
});

app.get("/style.css", (req, res) => {
  res.sendFile(__dirname + "/docs/css/style.css");
});

app.get("/script.js", (req, res) => {
  res.sendFile(__dirname + "/docs/js/script.js");
});

app.get("/query/a", async (req, res) => {
  const { host } = req.query;
  if (!host) return res.status(400).json({ error: "Missing host parameter" });
  try {
    const records = await dns.resolve4(host);
    res.json({ records });
  } catch (err) {
    res.status(404).json({ error: err.message });
    console.log(err.message);
  }
});

app.get("/query/aaaa", async (req, res) => {
  const { host } = req.query;
  if (!host) return res.status(400).json({ error: "Missing host parameter" });
  try {
    const records = await dns.resolve6(host);
    res.json({ records });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.get("/query/cname", async (req, res) => {
  const { host } = req.query;
  if (!host) return res.status(400).json({ error: "Missing host parameter" });
  try {
    const records = await dns.resolveCname(host);
    res.json({ cname: records[0] });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.get("/query/txt", async (req, res) => {
  const { host } = req.query;
  if (!host) return res.status(400).json({ error: "Missing host parameter" });
  try {
    const records = await dns.resolveTxt(host);
    res.json({ records });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.get("/query/ns", async (req, res) => {
  const { host } = req.query;
  if (!host) return res.status(400).json({ error: "Missing host parameter" });
  try {
    const records = await dns.resolveNs(host);
    res.json({ records });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.get("/query/mx", async (req, res) => {
  const { host } = req.query;
  if (!host) return res.status(400).json({ error: "Missing host parameter" });
  try {
    const records = await dns.resolveMx(host);
    res.json({ records });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.get("/query/srv", async (req, res) => {
  const { host } = req.query;
  if (!host) return res.status(400).json({ error: "Missing host parameter" });
  try {
    const records = await dns.resolveSrv(host);
    res.json({ records });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.get("/query/soa", async (req, res) => {
  const { host } = req.query;
  if (!host) return res.status(400).json({ error: "Missing host parameter" });
  try {
    const record = await dns.resolveSoa(host);
    res.json(record);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// This endpoint was largely produced by AI — just a heads up.
app.post("/query/bulk", async (req, res) => {
  const { host, recordTypes } = req.body;

  if (!host) return res.status(400).json({ error: "Missing host parameter" });
  if (!recordTypes || !Array.isArray(recordTypes))
    return res.status(400).json({ error: "Missing or invalid recordTypes parameter" });

  let results = {};

  try {
    await Promise.all(
      recordTypes.map(async (recordType) => {
        const result = await resolveRecordFromRecordTypeAndHost(recordType, host);
        if (result && recordType == "all") results = result;
        else if (result) results[recordType.toLowerCase()] = result;
      })
    );
    res.json(results);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

async function resolveRecordFromRecordTypeAndHost(recordType, host) {
  switch (recordType.toLowerCase()) {
    case "a":
      return await dns.resolve4(host);
      break;
    case "aaaa":
      return await dns.resolve6(host);
      break;
    case "cname":
      return await dns.resolveCname(host);
      break;
    case "txt":
      return await dns.resolveTxt(host);
      break;
    case "ns":
      return await dns.resolveNs(host);
      break;
    case "mx":
      return await dns.resolveMx(host);
      break;
    case "srv":
      return await dns.resolveSrv(host);
      break;
    case "soa":
      return await dns.resolveSoa(host);
      break;
    case "all":
      let allRecords = {};

      try {
        allRecords["a"] = await dns.resolve4(host);
      } catch (e) { allRecords["a"] = [] }

      try {
        allRecords["aaaa"] = await dns.resolve6(host);
      } catch (e) { allRecords["aaaa"] = [] }

      try {
        allRecords["cname"] = await dns.resolveCname(host);
      } catch (e) { allRecords["cname"] = [] }

      try {
        allRecords["txt"] = await dns.resolveTxt(host);
      } catch (e) { allRecords["txt"] = [] }

      try {
        allRecords["ns"] = await dns.resolveNs(host);
      } catch (e) { allRecords["ns"] = [] }

      try {
        allRecords["mx"] = await dns.resolveMx(host);
      } catch (e) { allRecords["mx"] = [] }

      try {
        allRecords["srv"] = await dns.resolveSrv(host);
      } catch (e) { allRecords["srv"] = [] }

      try {
        allRecords["soa"] = await dns.resolveSoa(host);
      } catch (e) { allRecords["soa"] = [] }

      return allRecords;
      break;
    default:
      throw new Error(`Unsupported record type: ${recordType}`);
  }
}

app.listen(6701, () => {
  console.log("ByteDNS API listening now on port 6701");
});