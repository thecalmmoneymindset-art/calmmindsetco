export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, plan } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const API_KEY   = process.env.MAILCHIMP_API_KEY;
  const LIST_ID   = process.env.MAILCHIMP_LIST_ID;
  const SERVER    = process.env.MAILCHIMP_SERVER; // us17

  try {
    const response = await fetch(
      `https://${SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`,
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            FNAME: name || '',
            PLAN:  plan  || 'Pro',
          },
          tags: [plan || 'Pro', 'waitlist'],
        }),
      }
    );

    const data = await response.json();

    // Already subscribed is fine — treat as success
    if (response.ok || data.title === 'Member Exists') {
      return res.status(200).json({ success: true });
    }

    console.error('Mailchimp error:', data);
    return res.status(500).json({ error: data.detail || 'Mailchimp error' });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
