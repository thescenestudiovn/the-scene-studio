import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12 lg:px-7 lg:py-14">
      <div className="mb-10 max-w-[760px] sm:mb-12">
        <p className="mb-2.5 text-[11px] uppercase tracking-[1.5px] text-[#999]">The Scene Studio</p>
        <h1 className="text-[34px] font-medium leading-[1.1] tracking-[-1.5px] sm:text-[42px]">Admin</h1>
        <p className="mt-3.5 text-[14px] leading-[1.6] text-[#777] sm:text-[15px]">Manage destinations, galleries, stories, pages and global site settings.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        <AdminCard href="/admin/destinations" number="01" title="Destinations" description="Shared SEO taxonomy used by Gallery and Stories." />
        <AdminCard href="/admin/gallery" number="02" title="Gallery" description="Manage client galleries, collections, media and Gallery page content." />
        <AdminCard href="/admin/stories" number="03" title="Stories" description="Editorial stories built from flexible content blocks." />
        <AdminCard href="/admin/pages" number="04" title="Pages" description="Build Home and About from the shared block editor." />
        <AdminCard href="/admin/settings" number="05" title="Site Settings" description="Manage global phone, email, Instagram and Facebook information used across the website." />
      </div>
    </main>
  );
}

function AdminCard({ href, number, title, description }: { href: string; number: string; title: string; description: string }) {
  return (
    <Link href={href} className="block min-h-[200px] border border-[#e2e2e2] bg-white p-5 text-inherit no-underline transition-colors hover:border-[#cfcfcf] sm:min-h-[220px] sm:p-7">
      <div className="mb-12 flex justify-between text-[11px] tracking-[1.2px] text-[#999] sm:mb-[60px]">{number}<span>↗</span></div>
      <h2 className="mb-2.5 text-[21px] font-medium sm:text-2xl">{title}</h2>
      <p className="m-0 max-w-[480px] text-[13px] leading-[1.6] text-[#777] sm:text-sm">{description}</p>
    </Link>
  );
}
