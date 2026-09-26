"use strict";
var { Client } = require("pg");
var path = require("path");
var fss = require("fs");

function loadEnv(fp) {
  if (!fss.existsSync(fp)) return;
  fss.readFileSync(fp, "utf8").split(/\r?\n/).forEach(function(line) {
    var t = line.trim();
    if (!t || t[0] === "#") return;
    var eq = t.indexOf("=");
    if (eq === -1) return;
    var k = t.slice(0, eq).trim(), v = t.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  });
}

loadEnv(path.resolve(__dirname, "../.env.development"));

var DB = {
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432", 10),
  database: process.env.DATABASE_NAME || "redsea",
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD || "admin"
};

var AMOUNT = 100000;
var T_NAME = "الخزينه";
var C_NAME = "جارى الشركاء";

function pad2(n) { return String(n).padStart(2, "0"); }
function dateStr() { var d = new Date(); return d.getFullYear() + pad2(d.getMonth()+1) + pad2(d.getDate()); }

async function genCode(c) {
  var r = await c.query("SELECT COALESCE(MAX(id),0)+1 AS nid FROM transactions");
  var nid = r.rows[0].nid;
  var base = "TRN-" + dateStr() + nid;
  var ex = await c.query("SELECT id FROM transactions WHERE code = $1", [base]);
  return ex.rows.length === 0 ? base : "TRN-" + dateStr() + (Number(nid) + 1);
}

async function main() {
  var client = new Client(DB);
  console.log("\nConnecting to " + DB.host + ":" + DB.port + "  db=" + DB.database);
  await client.connect();
  console.log("Connected.\n");
  try {
    var ar = await client.query(
      "SELECT id, name, type, \"normalBalance\" FROM accounts WHERE name = ANY($1::text[])",
      [[T_NAME, C_NAME]]
    );
    var treasury = ar.rows.find(function(a){return a.name===T_NAME;});
    var counter  = ar.rows.find(function(a){return a.name===C_NAME;});
    if (!treasury) throw new Error("Not found: " + T_NAME);
    if (!counter)  throw new Error("Not found: " + C_NAME);
    console.log("Accounts:");
    console.log("  DEBIT  id=" + treasury.id + "  " + treasury.name + "  (" + treasury.type + "/" + treasury.normalBalance + ")");
    console.log("  CREDIT id=" + counter.id  + "  " + counter.name  + "  (" + counter.type  + "/" + counter.normalBalance  + ")\n");

    var bl = await client.query(
      "SELECT COALESCE(SUM(CASE WHEN \"entryType\"='DEBIT'  THEN amount ELSE 0 END),0) dt," +
      "       COALESCE(SUM(CASE WHEN \"entryType\"='CREDIT' THEN amount ELSE 0 END),0) ct " +
      "FROM transaction_lines WHERE account_id=$1",
      [treasury.id]
    );
    var obr = await client.query("SELECT opening_balance FROM accounts WHERE id=$1", [treasury.id]);
    var ob = parseFloat(obr.rows[0].opening_balance)||0;
    var cur = ob + (parseFloat(bl.rows[0].dt)||0) - (parseFloat(bl.rows[0].ct)||0);
    console.log("Current " + T_NAME + " balance: " + cur.toLocaleString() + " EGP\n");

    var code = await genCode(client);
    var txnDate = new Date().toISOString().split("T")[0];
    var desc = "إيداع نقدي 100,000 في الخزينه من جارى الشركاء";
    var now = new Date().toISOString();
    console.log("Code: " + code + "  date: " + txnDate);
    console.log("Desc: " + desc + "\n");

    await client.query("BEGIN");
    try {
      var tr = await client.query(
        "INSERT INTO transactions (code,date,description,status,created_at,updated_at)" +
        " VALUES ($1,$2,$3,'POSTED',$4,$4) RETURNING id",
        [code, txnDate, desc, now]
      );
      var txnId = tr.rows[0].id;
      console.log("  Transaction header id=" + txnId);

      await client.query(
        "INSERT INTO transaction_lines (transaction_id,account_id,\"entryType\",amount,description,created_at,updated_at)" +
        " VALUES ($1,$2,'DEBIT',$3,$4,$5,$5)",
        [txnId, treasury.id, AMOUNT, "DEBIT " + T_NAME, now]
      );
      console.log("  DEBIT  " + T_NAME + "  +100,000");

      await client.query(
        "INSERT INTO transaction_lines (transaction_id,account_id,\"entryType\",amount,description,created_at,updated_at)" +
        " VALUES ($1,$2,'CREDIT',$3,$4,$5,$5)",
        [txnId, counter.id, AMOUNT, "CREDIT " + C_NAME, now]
      );
      console.log("  CREDIT " + C_NAME + "  +100,000");

      await client.query(
        "UPDATE accounts SET opening_balance_locked=true, updated_at=$1 WHERE id=ANY($2::int[])",
        [now, [treasury.id, counter.id]]
      );
      console.log("  Opening balances locked.");

      await client.query("COMMIT");
      console.log("\nCOMMITTED SUCCESSFULLY!\n");

      var nb = await client.query(
        "SELECT COALESCE(SUM(CASE WHEN \"entryType\"='DEBIT'  THEN amount ELSE 0 END),0) dt," +
        "       COALESCE(SUM(CASE WHEN \"entryType\"='CREDIT' THEN amount ELSE 0 END),0) ct " +
        "FROM transaction_lines WHERE account_id=$1",
        [treasury.id]
      );
      var newBal = ob + (parseFloat(nb.rows[0].dt)||0) - (parseFloat(nb.rows[0].ct)||0);
      console.log("NEW balance " + T_NAME + ": " + newBal.toLocaleString() + " EGP");
      console.log("Delta: +" + (newBal - cur).toLocaleString() + " EGP\n");
    } catch(e) { await client.query("ROLLBACK"); throw e; }
  } finally {
    await client.end();
    console.log("Connection closed.");
  }
}

main().catch(function(e){ console.error("FAILED:", e.message||e); process.exit(1); });
