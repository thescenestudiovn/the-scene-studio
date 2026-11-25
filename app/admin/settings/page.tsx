"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "../../../lib/site-settings";

const empty: SiteSettings = {
  phone: "",
  email: "",
  whatsapp: "",
  instagram: "",
  facebook: "",
  logo_url: "",
  header_studio_name: "The Scene Studio",
  footer_bio: "",
  footer_copyright: "© 2026 The Scene Studio",
  default_meta_title: "Wedding Stories — The Scene Studio",
  default_meta_description: "Editorial and documentary wedding photography and cinematography by The Scene Studio.",
  default_og_image: "",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"general" | "header" | "footer" | "seo">("general");

  useEffect(() => {
    fetch("/api/admin/site-settings", { cache: "no-store" })
      .then(async response => {
        const data = await response.json() as { success?: boolean; settings?: SiteSettings; error?: string };
        if (!response.ok || !data.success) throw new Error(data.error || "Failed to load site settings");
        setSettings(data.settings ?? empty);
      })
      .catch(error => setMessage(error instanceof Error ? error.message : "Failed to load site settings"))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json() as { success?: boolean; settings?: SiteSettings; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to save site settings");
      if (data.settings) setSettings(data.settings);
      setMessage("Site settings saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save site settings");
    } finally {
      setSaving(false);
    }
  }

  function field(key: keyof SiteSettings, label: string, placeholder: string, helper?: string) {
    return (
      <label className="block">
        <span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">{label}</span>
        <input
          value={settings[key] ?? ""}
          onChange={event => setSettings(current => ({ ...current, [key]: event.target.value }))}
          disabled={loading}
          className="w-full border border-[#d8d3ca] bg-[#faf8f4] px-4 py-3 text-sm outline-none transition focus:border-[#171717] disabled:opacity-50"
          placeholder={placeholder}
        />
        {helper && <span className="mt-1.5 block text-[11px] text-[#8a857d]">{helper}</span>}
      </label>
    );
  }

  function textarea(key: keyof SiteSettings, label: string, placeholder: string, helper?: string) {
    return (
      <label className="block">
        <span className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">{label}</span>
        <textarea
          value={settings[key] ?? ""}
          onChange={event => setSettings(current => ({ ...current, [key]: event.target.value }))}
          disabled={loading}
          rows={3}
          className="w-full border border-[#d8d3ca] bg-[#faf8f4] px-4 py-3 text-sm outline-none transition focus:border-[#171717] disabled:opacity-50"
          placeholder={placeholder}
        />
        {helper && <span className="mt-1.5 block text-[11px] text-[#8a857d]">{helper}</span>}
      </label>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-6 py-12 text-[#171717]">
      <div className="mx-auto max-w-4xl">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#77736c]">The Scene Studio</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl tracking-[-0.04em]">Site Settings</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#77736c]">
              Centralized control for contact info, header, footer, and default SEO metadata.
            </p>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={loading || saving}
            className="shrink-0 bg-[#171717] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-white transition hover:bg-[#333] disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>

        <div className="mt-8 flex gap-2 border-b border-[#d8d3ca]">
          {[
            { id: "general", label: "Contact & Socials" },
            { id: "header", label: "Header & Branding" },
            { id: "footer", label: "Footer" },
            { id: "seo", label: "Global SEO" },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`border-b-2 px-4 py-3 text-xs uppercase tracking-[0.14em] transition ${
                activeTab === tab.id
                  ? "border-[#171717] font-medium text-[#171717]"
                  : "border-transparent text-[#77736c] hover:text-[#171717]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="mt-6 border border-[#d8d3ca] bg-white p-6 md:p-8">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-2xl">Studio Contact & Social Media</h3>
                <p className="mt-1 text-xs text-[#77736c]">Global contact details used in footers, inquiry forms, and contact cards.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {field("email", "Email Address", "hello@thescenestudio.asia")}
                {field("phone", "Phone Number", "+84 905 123 456")}
                {field("whatsapp", "WhatsApp Number / Link", "https://wa.me/84905123456")}
                {field("instagram", "Instagram Profile URL", "https://instagram.com/thescenestudiovn")}
                {field("facebook", "Facebook Page URL", "https://facebook.com/thescenestudiovn")}
              </div>
            </div>
          )}

          {activeTab === "header" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-2xl">Header & Studio Identity</h3>
                <p className="mt-1 text-xs text-[#77736c]">Configure logo and typography presentation for public navigation.</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {field("header_studio_name", "Studio Name Text", "The Scene Studio", "Displayed next to logo on desktop.")}
                {field("logo_url", "Logo Image / SVG URL", "/logo.svg", "Main logo icon for desktop and mobile.")}
              </div>
              <div className="rounded-md border border-[#eeeae3] bg-[#faf8f4] p-4 text-xs text-[#77736c]">
                <strong>Approved Display Rule:</strong> Desktop displays logo together with studio text. Mobile displays logo only (studio text is hidden).
              </div>
            </div>
          )}

          {activeTab === "footer" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-2xl">Footer Content</h3>
                <p className="mt-1 text-xs text-[#77736c]">Manage studio blurb and copyright statement appearing across all pages.</p>
              </div>
              <div className="space-y-5">
                {textarea("footer_bio", "Footer Studio Philosophy", "Documenting the poetry of natural human connection through quiet, editorial imagery.", "Short studio bio or editorial statement in footer.")}
                {field("footer_copyright", "Copyright Statement", "© 2026 The Scene Studio. All rights reserved.")}
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-2xl">Global SEO & Metadata</h3>
                <p className="mt-1 text-xs text-[#77736c]">Default metadata applied when individual pages or stories do not specify custom SEO.</p>
              </div>
              <div className="space-y-5">
                {field("default_meta_title", "Default Meta Title", "The Scene Studio — Editorial Wedding Photography & Films")}
                {textarea("default_meta_description", "Default Meta Description", "Documenting destination weddings through editorial imagery and thoughtful cinematography in Vietnam and worldwide.")}
                {field("default_og_image", "Default Social Sharing Thumbnail (OG Image URL)", "https://thescenestudio.asia/og-image.jpg", "Image shown when website link is shared on Facebook, Zalo, iMessage.")}
              </div>
            </div>
          )}

          {message && <p className="mt-6 text-xs font-medium text-[#10b981]">{message}</p>}
        </section>

        <p className="mt-6 text-xs leading-5 text-[#8a857d]">
          Changes saved here update the database in Cloudflare D1 immediately. Components read these settings automatically.
        </p>
      </div>
    </main>
  );
}
