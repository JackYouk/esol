import { Nav } from "@/components/nav/nav";
import { OrganizationProfile } from "@clerk/nextjs";


export default function ManageClassroomOrg() {
    return (
        <div className="min-h-screen w-screen bg-red flex flex-col items-center gap-10 pt-20 px-20 pb-10">
            <Nav />
            <OrganizationProfile path="/classroom/manage" />
        </div>
)
}