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
                businessName:    settings?.businessName    ?? '',
                supportEmail:    settings?.supportEmail    ?? '',
                chatbotName:     settings?.chatbotName     ?? '',
                logo:            settings?.logo            ?? '',
                primaryColor:    settings?.primaryColor    ?? '#6366f1',
                secondaryColor:  settings?.secondaryColor  ?? '#4f46e5',
                widgetPosition:  (settings?.widgetPosition ?? 'bottom-right') as 'bottom-right' | 'bottom-left',
                greetingMessage: settings?.greetingMessage ?? '👋 Hi! How can I help you today?',
                isActive:        settings?.isActive        ?? true,
                knowledge:       settings?.knowledge       ?? '',
            }}
        />
    )
}

export default page
