export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, plan } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  const listId = process.env.MAILCHIMP_LIST_ID || '88539de407'
  const apiKey = process.env.MAILCHIMP_API_KEY
  const server = process.env.MAILCHIMP_SERVER || 'us17'

  if (!apiKey) {
    console.error('Missing MAILCHIMP_API_KEY')
    return res.status(200).json({ ok: true }) // fail silently to user
  }

  try {
    const resp = await fetch(
      `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          merge_fields: { FNAME: name || '', PLAN: plan || 'Pro' },
        }),
      }
    )
    const data = await resp.json()
    if (!resp.ok && data.title !== 'Member Exists') {
      console.error('Mailchimp error:', data)
    }
  } catch (err) {
    console.error('Waitlist fetch error:', err)
  }

  res.status(200).json({ ok: true })
}
