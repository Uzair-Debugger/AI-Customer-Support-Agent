import DashboardClient from '@/components/DashboardClient'
import { getSession } from '@/lib/getSession'

const page = async () => {
    const response = await getSession()
    const session = await response.json()
    return (
        <DashboardClient user={{ ownerId: session?.user?.id ?? '', name: session?.user?.name ?? '' }} />
    )
}

export default page
