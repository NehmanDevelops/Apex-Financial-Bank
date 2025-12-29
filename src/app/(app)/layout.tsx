import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { authOptions } from "@/lib/auth";
import { TopBar } from "@/components/TopBar";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { InactivityLogout } from "@/components/InactivityLogout";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const deviceId = (await cookies()).get("apex_device")?.value;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.mfaEnabled && user.mfaSecret) {
    if (!deviceId) redirect("/mfa");
    const trusted = await prisma.trustedDevice.findUnique({
      where: { userId_deviceId: { userId: user.id, deviceId } },
    });
    if (!trusted) redirect("/mfa");
    await prisma.trustedDevice.update({ where: { id: trusted.id }, data: { lastSeenAt: new Date() } });
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <InactivityLogout />
      <div className="flex min-h-[calc(100vh-56px)] bg-slate-50">
        <Sidebar />
        <div className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-8 py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
