// Google Apps Script V2 — wklej w Rozszerzenia → Apps Script w Google Sheets
// Po wklejeniu: Wdróż → Nowe wdrożenie → Aplikacja internetowa
// Wykonaj jako: Ja | Kto ma dostęp: Każdy
//
// Obsługuje dwa typy payloadów:
// 1. type: "search_results" — wyniki wyszukiwania kandydatów
// 2. type: "lead_capture" — email z formularza lead capture

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);
  var type = data.type || 'search_results';

  if (type === 'lead_capture') {
    return handleLeadCapture(ss, data);
  }

  return handleSearchResults(ss, data);
}

function handleSearchResults(ss, data) {
  var sheet = ss.getSheetByName('Wyniki') || ss.insertSheet('Wyniki');

  // Nagłówki — dodaj automatycznie jeśli arkusz jest pusty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Data',
      'Job description',
      'Branża',
      'Seniority',
      'LinkedIn ref',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'Liczba kandydatów',
      'Kandydaci (JSON)',
      'Kandydaci (czytelne)',
    ]);
  }

  var candidates = data.candidates || [];
  var allCandidates = candidates.map(function (c, i) {
    return (i + 1) + '. ' + c.name + ' — ' + c.currentRole + ' @ ' + c.currentCompany + ' (' + c.tier + ')';
  }).join('\n');

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.role || '',
    data.industry || '',
    data.level || '',
    data.referenceLinkedin || '',
    data.utmSource || '',
    data.utmMedium || '',
    data.utmCampaign || '',
    candidates.length,
    JSON.stringify(candidates),
    allCandidates,
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleLeadCapture(ss, data) {
  var sheet = ss.getSheetByName('Leady') || ss.insertSheet('Leady');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Data',
      'Email',
      'Szukana rola',
      'Branża',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
    ]);
  }

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.email || '',
    data.searchRole || '',
    data.searchIndustry || '',
    data.utmSource || '',
    data.utmMedium || '',
    data.utmCampaign || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
