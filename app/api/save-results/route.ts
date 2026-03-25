export async function POST(req: Request) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('GOOGLE_SHEETS_WEBHOOK_URL not configured');
    return Response.json({ error: 'not configured' }, { status: 500 });
  }

  const data = await req.json();

  const payload = {
    type: 'search_results',
    role: data.role || '',
    industry: data.industry || '',
    level: data.level || '',
    referenceLinkedin: data.referenceLinkedin || '',
    utmSource: data.utmSource || '',
    utmMedium: data.utmMedium || '',
    utmCampaign: data.utmCampaign || '',
    candidates: data.candidates || [],
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return Response.json({ status: 'ok' });
  } catch (err) {
    console.error('Failed to save to Google Sheets:', err);
    return Response.json({ error: 'save failed' }, { status: 500 });
  }
}
