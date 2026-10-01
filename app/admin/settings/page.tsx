"use client";

import { useEffect, useState } from "react";
import MediaPickerModal from "../../../components/story/blocks/image/MediaPickerModal";
import { mediaUrl } from "../../../lib/media";

type Settings = {
  phone:string; email:string; whatsapp:string; instagram:string; facebook:string;
  tiktok:string; pinterest:string; address:string; logo:string; logo_white:string;
  favicon:string; site_description:string; seo_title:string; seo_description:string;
  og_image:string; footer_text:string;
};

const empty: Settings = {
  phone:"", email:"", whatsapp:"", instagram:"", facebook:"", tiktok:"", pinterest:"",
  address:"", logo:"", logo_white:"", favicon:"", site_description:"", seo_title:"",
  seo_description:"", og_image:"", footer_text:""
};

export default function AdminSettingsPage() {
  const [settings,setSettings]=useState<Settings>(empty);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [brandingPicker,setBrandingPicker]=useState<"logo"|"logo_white"|"favicon"|null>(null);

  useEffect(()=>{
    fetch("/api/admin/site-settings",{cache:"no-store"})
      .then(async r=>{const d=await r.json() as { success?: boolean; error?: string; settings?: Partial<Settings> }; if(!r.ok||!d.success) throw new Error(d.error||"Failed to load settings"); setSettings({...empty,...(d.settings ?? {})});})
      .catch(e=>setMessage(e instanceof Error?e.message:"Failed to load settings"))
      .finally(()=>setLoading(false));
  },[]);

  async function save(){
    setSaving(true); setMessage("");
    try{
      const r=await fetch("/api/admin/site-settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(settings)});
      const d=await r.json() as { success?: boolean; error?: string; settings?: Partial<Settings> }; if(!r.ok||!d.success) throw new Error(d.error||"Failed to save settings");
      setSettings({...empty,...(d.settings ?? {})}); setMessage("Settings saved.");
    }catch(e){setMessage(e instanceof Error?e.message:"Failed to save settings")}
    finally{setSaving(false)}
  }

  function field(key:keyof Settings,label:string,placeholder=""){
    return <label className="block">
      <span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">{label}</span>
      <input value={settings[key]} onChange={e=>setSettings(s=>({...s,[key]:e.target.value}))} disabled={loading}
        className="w-full border border-[#d8d3ca] bg-[#faf8f4] px-4 py-3 text-sm outline-none focus:border-[#171717] disabled:opacity-50"
        placeholder={placeholder}/>
    </label>
  }

  function section(title:string,description:string,children:React.ReactNode){
    return <section className="mt-8 border border-[#d8d3ca] bg-white p-6 md:p-8">
      <div className="mb-7 border-b border-[#e3dfd8] pb-5"><h2 className="font-serif text-3xl">{title}</h2><p className="mt-2 text-sm text-[#77736c]">{description}</p></div>
      <div className="grid gap-6 md:grid-cols-2">{children}</div>
    </section>
  }

  return <main className="min-h-screen bg-[#f7f5f0] px-6 py-12 text-[#171717]">
    <div className="mx-auto max-w-5xl">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#77736c]">The Scene Studio / CMS</p>
      <div className="mt-3 flex items-end justify-between gap-6">
        <div><h1 className="font-serif text-5xl tracking-[-0.04em]">Site Settings</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#77736c]">One place for global branding, contact details, social links, SEO and footer information.</p></div>
        <button onClick={save} disabled={loading||saving} className="shrink-0 bg-[#171717] px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-white disabled:opacity-40">{saving?"Saving…":"Save Settings"}</button>
      </div>

      {section("Branding","Upload and choose the brand assets used across the public website.",
        <>
          {(["logo","logo_white","favicon"] as const).map(key => (
            <div key={key} className="border border-[#d8d3ca] bg-[#faf8f4] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">{key === "logo" ? "Logo" : key === "logo_white" ? "Logo on dark background" : "Favicon"}</span>
                <button type="button" onClick={() => setBrandingPicker(key)} className="border border-[#d8d3ca] bg-white px-3 py-2 text-[9px] uppercase tracking-[0.12em] hover:border-[#171717]">Upload / Choose</button>
              </div>
              <div className={key === "favicon" ? "flex min-h-20 items-center justify-center bg-white p-4" : "flex min-h-24 items-center justify-center bg-[#f7f5f0] p-5"}>
                {settings[key] ? <img src={mediaUrl(settings[key])} alt={key === "favicon" ? "Favicon preview" : "Logo preview"} className={key === "favicon" ? "h-12 w-12 object-contain" : "max-h-16 max-w-[260px] object-contain"} /> : <span className="text-xs text-[#aaa49a]">No image selected</span>}
              </div>
            </div>
          ))}
          {brandingPicker && <MediaPickerModal open required={1} selectedIds={[]} collectionId="" onClose={() => setBrandingPicker(null)} onDone={(_collectionId, _mediaIds, selectedMedia) => {
            const selected = selectedMedia[0];
            if (selected) setSettings(current => ({ ...current, [brandingPicker]: selected.path }));
            setBrandingPicker(null);
          }} />}
        </>
      )}

      {section("Contact","These values can be reused by Header, Footer, Contact and inquiry components.",
        <>
          {field("email","Email","hello@thescenestudio.asia")}
          {field("phone","Phone","+84 ...")}
          {field("whatsapp","WhatsApp","+84 ...")}
          {field("address","Address","Da Nang · Vietnam")}
        </>
      )}

      {section("Social","Paste the full profile URL for each platform.",
        <>
          {field("instagram","Instagram","https://instagram.com/...")}
          {field("facebook","Facebook","https://facebook.com/...")}
          {field("tiktok","TikTok","https://tiktok.com/@...")}
          {field("pinterest","Pinterest","https://pinterest.com/...")}
        </>
      )}

      {section("SEO & Website","Default metadata for search engines and social sharing.",
        <>
          {field("seo_title","SEO Title","The Scene Studio — Destination Wedding Photography & Films")}
          {field("seo_description","SEO Description","Destination wedding photography and films in Vietnam and beyond.")}
          {field("site_description","Site Description","Short description of the studio")}
          {field("og_image","Open Graph Image URL / media path","/images/og.jpg")}
        </>
      )}

      {section("Footer","Global footer copy.",
        <div className="md:col-span-2">{field("footer_text","Footer Text","Stories worth remembering.")}</div>
      )}

      {message && <p className="mt-6 text-xs text-[#666158]">{message}</p>}
      <p className="mt-5 text-xs leading-5 text-[#8a857d]">Changing a value here updates the shared site configuration. Components need to read Site Settings to use the new value.</p>
    </div>
  </main>;
}
