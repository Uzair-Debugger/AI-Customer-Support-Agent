import DashboardClient from '@/components/DashboardClient'
import { getSession } from '@/lib/getSession'
import { prisma } from '@/lib/prisma'

const page = async () => {
    const response = await getSession()
    const session = await response.json()
    const ownerId = session?.user?.id ?? ''

    const settings = ownerId ? await prisma.settings.findFirst({ where: { ownerId } }) : null

    return (
        <DashboardClient
            user={{ ownerId, name: session?.user?.name ?? '' }}
            initialSettings={{
                businessName: settings?.businessName ?? '',
                supportEmail: settings?.supportEmail ?? '',
                knowledge: settings?.knowledge ?? '',
            }}
        />
    )
}

export default page
