export async function POST(req: Request) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    return Response.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const data = await req.json();

  if (!data.email || !data.email.includes('@')) {
    return Response.json({ error: 'Invalid email' }, { status: 400 });
  }

  const payload = {
    type: 'lead_capture',
    email: data.email,
    searchRole: data.searchRole || '',
    searchIndustry: data.searchIndustry || '',
    utmSource: data.utmSource || '',
    utmMedium: data.utmMedium || '',
    utmCampaign: data.utmCampaign || '',
    timestamp: new Date().toISOString(),
  };

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return Response.json({ error: 'Failed to save' }, { status: 500 });
  }

  return Response.json({ status: 'ok' });
}
