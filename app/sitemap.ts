import type { MetadataRoute } from "next";
import { getDB } from "../lib/db";
import { destinations } from "../data/destinations";

const baseUrl="https://thescenestudio.asia";

type SlugRow={slug:string};

export default async function sitemap(): Promise<MetadataRoute.Sitemap>{
  const staticPages:MetadataRoute.Sitemap=[
    {url:baseUrl,changeFrequency:"monthly",priority:1},
    {url:`${baseUrl}/about`,changeFrequency:"monthly",priority:0.7},
    {url:`${baseUrl}/contact`,changeFrequency:"monthly",priority:0.8},
    {url:`${baseUrl}/gallery`,changeFrequency:"weekly",priority:0.95},
    {url:`${baseUrl}/destinations`,changeFrequency:"monthly",priority:0.9},
    {url:`${baseUrl}/films`,changeFrequency:"monthly",priority:0.8},
    {url:`${baseUrl}/stories`,changeFrequency:"weekly",priority:0.9},
  ];
  const destinationPages=destinations.map(d=>({url:`${baseUrl}/destinations/${d.country}/${d.slug}`,changeFrequency:"monthly" as const,priority:0.8}));
  let collectionPages:MetadataRoute.Sitemap=[]; let storyPages:MetadataRoute.Sitemap=[];
  try{const db=getDB();const collections=await db.prepare("SELECT slug FROM collections WHERE published=1").all<SlugRow>();const stories=await db.prepare("SELECT slug FROM stories WHERE published=1").all<SlugRow>();collectionPages=(collections.results??[]).map(item=>({url:`${baseUrl}/gallery/${item.slug}`,changeFrequency:"monthly" as const,priority:0.8}));storyPages=(stories.results??[]).map(item=>({url:`${baseUrl}/stories/${item.slug}`,changeFrequency:"monthly" as const,priority:0.8}));}catch(error){console.error("Sitemap database query failed",error);}
  return [...staticPages,...destinationPages,...collectionPages,...storyPages];
}
