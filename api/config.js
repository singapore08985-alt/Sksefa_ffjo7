import { redis, getConfig, getChannels, envStatus, explain } from './_lib.js';
// Public settings for the website (branding, channels, limits). Everything here is editable from /admin.
export default async function handler(req, res) {
  try {
    const [c, ch, nSites] = await Promise.all([getConfig(), getChannels(), redis.scard('sites:all').catch(() => 0)]);
    res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=60');
    return res.json({
      name: c.name, logo: c.logo, tagline: c.tagline, heroTitle: c.heroTitle, heroText: c.heroText, accent: c.accent,
      footer: c.footer, devName: c.devName, devLink: c.devLink, contact: c.contact, seoDesc: c.seoDesc,
      announce: c.announceOn && c.announce ? c.announce : '',
      signupOpen: c.signupOpen, maintenance: c.maintenance, maintenanceMsg: c.maintenanceMsg,
      maxSites: c.maxSites, maxZipMB: c.maxZipMB, liveSites: Number(nSites) || 0,
      channels: ch.filter(x => x.on).map(x => ({ id: x.id, name: x.name, platform: x.platform, desc: x.desc }))
    });
  } catch (e) {
    const env = envStatus();
    return res.status(500).json({ error: env.redis ? explain(e) : 'Upstash env variables nahi mile (' + env.missing.filter(x => x.startsWith('UPSTASH')).join(', ') + ')', setup: true });
  }
}
