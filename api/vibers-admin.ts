import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function verifyAdminSecret(req: VercelRequest): boolean {
  const secret = process.env.VIBERS_ADMIN_SECRET;
  if (!secret) return false;
  return req.headers['x-vibers-admin-secret'] === secret;
}

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY ?? '{}')),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!verifyAdminSecret(req)) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    return res.status(501).json({ error: 'Not implemented' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = getFirestore(getAdminApp());
    const [usersSnap] = await Promise.all([
      db.collection('users').count().get(),
    ]);
    return res.status(200).json({
      projectId: 'lightstar',
      projectName: '라이트스타',
      stats: { totalUsers: usersSnap.data().count, mau: 0, contentCount: 0, recentSignups: 0 },
      recentActivity: [],
      health: 'healthy',
    });
  } catch {
    return res.status(200).json({
      projectId: 'lightstar',
      projectName: '라이트스타',
      stats: { mau: 0, totalUsers: 0, contentCount: 0, recentSignups: 0 },
      recentActivity: [],
      health: 'error',
    });
  }
}
