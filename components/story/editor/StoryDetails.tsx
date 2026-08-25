"use client";

import type { ReactNode } from "react";
import type { Destination, Story, StoryCategory, StoryLocation } from "./types";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><label className="mb-2 block text-[10px] uppercase tracking-[0.16em] text-[#8a857d]">{label}</label>{children}</div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-4 border-t border-[#e5e0d8] pt-4"><span className="text-xs text-[#514d46]">{label}</span><button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-[#171717]" : "bg-[#d5cfc5]"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} /></button></label>;
}

type Props = {
  story: Story;
  categories: StoryCategory[];
  locations: StoryLocation[];
  destinations: Destination[];
  selectedCategoryIds: string[];
  selectedLocationIds: string[];
  categoryInput: string;
  locationInput: string;
  creatingCategory: boolean;
  creatingLocation: boolean;
  onStoryChange: (story: Story) => void;
  onToggleCategory: (id: string) => void;
  onToggleLocation: (id: string) => void;
  onCategoryInputChange: (value: string) => void;
  onLocationInputChange: (value: string) => void;
  onCreateCategory: () => void;
  onCreateLocation: () => void;
};

const suggestions = ["Wedding", "Destination Wedding", "Prewedding", "Engagement", "Elopement", "Portrait", "Family", "Couple", "Travel"];

export default function StoryDetails({ story, categories, locations, destinations, selectedCategoryIds, selectedLocationIds, categoryInput, locationInput, creatingCategory, creatingLocation, onStoryChange, onToggleCategory, onToggleLocation, onCategoryInputChange, onLocationInputChange, onCreateCategory, onCreateLocation }: Props) {
  const categoryQuery = categoryInput.trim().toLowerCase();
  const locationQuery = locationInput.trim().toLowerCase();
  const filteredCategories = categories.filter(item => !categoryQuery || item.name.toLowerCase().includes(categoryQuery));
  const filteredLocations = locations.filter(item => !locationQuery || item.name.toLowerCase().includes(locationQuery));
  const canCreateCategory = !!categoryInput.trim() && !categories.some(item => item.name.toLowerCase() === categoryQuery);
  const canCreateLocation = !!locationInput.trim() && !locations.some(item => item.name.toLowerCase() === locationQuery);

  return <aside className="space-y-6">
    <div className="border border-[#d9d3ca] bg-white p-6">
      <p className="mb-5 text-[10px] uppercase tracking-[0.2em] text-[#8a857d]">Story Details</p>
      <div className="space-y-5">
        <Field label="Slug"><input value={story.slug} onChange={e => onStoryChange({ ...story, slug: e.target.value })} className="w-full border border-[#d9d3ca] px-4 py-3 text-sm outline-none" /></Field>

        <Field label="Categories">
          <div className="mb-3 flex flex-wrap gap-2">{selectedCategoryIds.map(id => { const item = categories.find(c => c.id === id); return item ? <button key={id} type="button" onClick={() => onToggleCategory(id)} className="rounded-full bg-[#171717] px-3 py-2 text-[10px] uppercase tracking-[0.08em] text-white">{item.name} ×</button> : null; })}</div>
          <input value={categoryInput} onChange={e => onCategoryInputChange(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (canCreateCategory) onCreateCategory(); } }} placeholder="Search or add category..." className="w-full border border-[#d9d3ca] px-4 py-3 text-sm outline-none" />
          {(categoryInput.trim() || filteredCategories.length) > 0 && <div className="mt-2 max-h-56 overflow-y-auto border border-[#d9d3ca] bg-white p-2">{filteredCategories.map(item => { const selected = selectedCategoryIds.includes(item.id); return <button key={item.id} type="button" onClick={() => { onToggleCategory(item.id); onCategoryInputChange(""); }} className={`mb-1 flex w-full items-center justify-between px-3 py-2 text-left text-[11px] ${selected ? "bg-[#171717] text-white" : "hover:bg-[#f5f2ec]"}`}><span>{item.name}</span><span>{selected ? "✓" : "+"}</span></button>; })}{canCreateCategory && <button type="button" disabled={creatingCategory} onClick={onCreateCategory} className="mt-1 w-full border-t border-[#e5e0d8] px-3 py-3 text-left text-[11px] font-medium">+ Create “{categoryInput.trim()}”</button>}{!filteredCategories.length && !canCreateCategory && <p className="px-3 py-3 text-[11px] text-[#77736c]">No matching category.</p>}</div>}
          <div className="mt-3 flex flex-wrap gap-1.5">{suggestions.filter(name => !categories.some(item => item.name.toLowerCase() === name.toLowerCase())).map(name => <button key={name} type="button" onClick={() => onCategoryInputChange(name)} className="rounded-full border border-[#e2ddd5] px-2.5 py-1.5 text-[9px] uppercase tracking-[0.08em] text-[#77736c]">{name}</button>)}</div>
          <p className="mt-3 text-[11px] leading-5 text-[#77736c]">Select one or more categories, or create a new one.</p>
        </Field>

        <Field label="Location">
          <div className="mb-3 flex flex-wrap gap-2">{selectedLocationIds.map(id => { const item = locations.find(l => l.id === id); return item ? <button key={id} type="button" onClick={() => onToggleLocation(id)} className="rounded-full bg-[#171717] px-3 py-2 text-[10px] uppercase tracking-[0.08em] text-white">{item.name} ×</button> : null; })}</div>
          <input value={locationInput} onChange={e => onLocationInputChange(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (canCreateLocation) onCreateLocation(); } }} placeholder="Search or add location..." className="w-full border border-[#d9d3ca] px-4 py-3 text-sm outline-none" />
          {(locationInput.trim() || filteredLocations.length) > 0 && <div className="mt-2 max-h-56 overflow-y-auto border border-[#d9d3ca] bg-white p-2">{filteredLocations.map(item => { const selected = selectedLocationIds.includes(item.id); return <button key={item.id} type="button" onClick={() => { onToggleLocation(item.id); onLocationInputChange(""); }} className={`mb-1 flex w-full items-center justify-between px-3 py-2 text-left text-[11px] ${selected ? "bg-[#171717] text-white" : "hover:bg-[#f5f2ec]"}`}><span>{item.name}</span><span>{selected ? "✓" : "+"}</span></button>; })}{canCreateLocation && <button type="button" disabled={creatingLocation} onClick={onCreateLocation} className="mt-1 w-full border-t border-[#e5e0d8] px-3 py-3 text-left text-[11px] font-medium">+ Create “{locationInput.trim()}”</button>}{!filteredLocations.length && !canCreateLocation && <p className="px-3 py-3 text-[11px] text-[#77736c]">No matching location.</p>}</div>}
          <p className="mt-3 text-[11px] leading-5 text-[#77736c]">Select one or more locations, or create a new one.</p>
        </Field>

        <Field label="Destination"><select value={story.destination_id ?? ""} onChange={e => onStoryChange({ ...story, destination_id: e.target.value || null, destination_name: destinations.find(item => item.id === e.target.value)?.name ?? null })} className="w-full border border-[#d9d3ca] bg-white px-4 py-3 text-sm outline-none"><option value="">No destination</option>{destinations.map(item => <option key={item.id} value={item.id}>{item.name}{item.country_name ? `, ${item.country_name}` : ""}</option>)}</select></Field>
        <Field label="Date"><input type="date" value={story.date ?? ""} onChange={e => onStoryChange({ ...story, date: e.target.value || null })} className="w-full border border-[#d9d3ca] px-4 py-3 text-sm outline-none" /></Field>
        <Field label="Description"><textarea value={story.description ?? ""} onChange={e => onStoryChange({ ...story, description: e.target.value || null })} rows={5} className="w-full resize-y border border-[#d9d3ca] px-4 py-3 text-sm outline-none" /></Field>
        <Field label="Tags"><input value={story.tags ?? ""} onChange={e => onStoryChange({ ...story, tags: e.target.value })} placeholder="wedding, danang, couple" className="w-full border border-[#d9d3ca] px-4 py-3 text-sm outline-none" /></Field>
        <Toggle label="Featured story" checked={!!story.featured} onChange={value => onStoryChange({ ...story, featured: value ? 1 : 0 })} />
        <Toggle label="Hide from search" checked={!!story.hide_from_search} onChange={value => onStoryChange({ ...story, hide_from_search: value ? 1 : 0 })} />
      </div>
    </div>
  </aside>;
}
