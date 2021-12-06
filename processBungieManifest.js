var fs = require('fs');
var request = require('request');
var sqlite3 = require('sqlite3').verbose();
const StreamZip = require('node-stream-zip');

const tables = [
  'InventoryItem',
  'Objective',
  'SandboxPerk',
  'Stat',
  'TalentGrid',
  'Progression',
  'Record',
  'ItemCategory',
  'VendorCategory',
  'RecordBook',
  'ActivityCategory',
  'ScriptedSkull',
  'Activity',
  'ActivityType',
  'InventoryBucket',
  'Class',
  'Race',
  'Faction',
  'Vendor',
  'DamageType'
];

fs.mkdirSync('manifest', {recursive:true});
fs.mkdirSync('manifest2', {recursive:true});
fs.mkdirSync('d1-manifests', {recursive:true});

function onManifestRequest(error, response, body) {
  var parsedResponse = JSON.parse(body);
  console.log(parsedResponse);

  for (const lang of Object.keys(parsedResponse.Response.mobileWorldContentPaths)) {
    var manifestFile = fs.createWriteStream(`manifest/manifest-${lang}.zip`);
    request
      .get('https://www.bungie.net' + parsedResponse.Response.mobileWorldContentPaths[lang])
      .pipe(manifestFile)
      .on('close', () => onManifestDownloaded(lang));
  }
}

function onManifestDownloaded(lang) {
  console.log(`Downloaded manifest/manifest-${lang}.zip`)
  const zip = new StreamZip({
    file: `manifest/manifest-${lang}.zip`,
    storeEntries: true
  });
  zip.on('ready', () => {
    for (const entry of Object.values(zip.entries())) {
      zip.extract(entry.name, 'manifest2/' + entry.name, () => {
        console.log(`Extracted manifest2/${entry.name}`)
        zip.close();
        dumpDatabase(lang, 'manifest2/' + entry.name);
      });
    }
  });
}

request(
  {
    headers: {
      'X-API-Key': process.env.API_KEY
    },
    uri: 'http://www.bungie.net/platform/Destiny/Manifest/',
    method: 'GET'
  },
  onManifestRequest
);

function dumpDatabase(lang, path) {
  const db = new sqlite3.Database(
    path
  );

  var manifest = {};
  const tablesCopy = [...tables];
  function processTable() {
    const tableShort = tablesCopy.shift();
    if (!tableShort) {
      var defs = fs.createWriteStream(`d1-manifests/d1-manifest-${lang}.json`);
      defs.write(JSON.stringify(manifest));
      defs.close();
      console.log(`Wrote d1-manifests/d1-manifest-${lang}.json`)
      return;
    }
    const table = `Destiny${tableShort}Definition`;
    db.all(`select * from ${table}`, function(err, rows) {
      console.log(lang, table);
      const tableData = {};
      if (err) {
        console.log(lang, err);
        return;
      }
      rows.forEach(function(row) {
        var id = row.id >>> 0;
        var item = JSON.parse(row.json);
        delete item.equippingBlock;
        //console.log(table, id, item);
        tableData[id.toString()] = item;
      });
      manifest[table] = tableData;
      processTable();
    });
  }

  processTable();
}
