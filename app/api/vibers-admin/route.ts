export async function GET(request: Request) {
  const secret = process.env.VIBERS_ADMIN_SECRET;
  if (!secret || request.headers.get("x-vibers-admin-secret") !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // TODO: 실제 DB 연결로 교체
    return Response.json({
      projectId: "lightstar",
      projectName: "라이트스타",
      stats: {
        totalUsers: 0,
        contentCount: 0,
        mau: 0,
        recentSignups: 0,
      },
      recentActivity: [],
      health: "healthy",
    });
  } catch (err) {
    return Response.json({
      projectId: "lightstar",
      projectName: "라이트스타",
      stats: { totalUsers: 0, contentCount: 0, mau: 0, recentSignups: 0 },
      recentActivity: [],
      health: "error",
    });
  }
}

export async function POST(request: Request) {
  const secret = process.env.VIBERS_ADMIN_SECRET;
  if (!secret || request.headers.get("x-vibers-admin-secret") !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ error: "Not implemented" }, { status: 501 });
}
