function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  var body = data.body || "";
  var dateReceived = data.date || new Date().toISOString().split('T')[0];

  var scholarships = parseScholarshipsCanada(body);

  // Get existing scholarship names to avoid duplicates
  var existingData = sheet.getDataRange().getValues();
  var existingNames = existingData.slice(1).map(function(row) {
    return row[1].toString().toLowerCase().trim();
  });

  var added = 0;
  var skipped = 0;

  scholarships.forEach(function(s) {
    var normalizedName = s.name.toLowerCase().trim();
    if (existingNames.indexOf(normalizedName) === -1) {
      sheet.appendRow([dateReceived, s.name, s.amount, "", s.deadline, "New"]);
      existingNames.push(normalizedName);
      added++;
    } else {
      skipped++;
    }
  });

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    added: added,
    skipped: skipped
  })).setMimeType(ContentService.MimeType.JSON);
}

function parseScholarshipsCanada(body) {
  var results = [];

  var lines = body.split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });

  var i = 0;
  while (i < lines.length) {
    if (i + 2 < lines.length &&
        lines[i + 1].indexOf("Award Amount:") === 0 &&
        lines[i + 2].indexOf("Deadline:") === 0) {

      var name = lines[i];
      var amount = lines[i + 1].replace("Award Amount:", "").trim();
      var deadline = lines[i + 2].replace("Deadline:", "").trim();

      results.push({
        name: name,
        amount: amount,
        deadline: formatDeadline(deadline)
      });

      i += 3;
    } else {
      i += 1;
    }
  }

  return results;
}

function formatDeadline(rawDate) {
  var parsed = new Date(rawDate);
  if (isNaN(parsed.getTime())) {
    return rawDate;
  }
  var year = parsed.getFullYear();
  var month = String(parsed.getMonth() + 1).padStart(2, '0');
  var day = String(parsed.getDate()).padStart(2, '0');
  return year + "-" + month + "-" + day;
}
