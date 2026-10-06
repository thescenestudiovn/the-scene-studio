"use client";

import { useEffect, useState } from "react";

type MenuSlide = { id:string; title:string; subtitle:string; buttonText:string; buttonUrl:string; openNewWindow:boolean; media?: { path:string }; focalX:number; focalY:number; altText:string; tint:number };
type MenuConfig = { style:1|2|3|4; display:"logo"|"name"|"both"; autoPlay:boolean; slides:MenuSlide[] };
const DEFAULT_MENU_CONFIG: MenuConfig = { style:1, display:"both", autoPlay:true, slides:[] };

function parseMenuConfig(raw?: string|null): MenuConfig {
    if (!raw) return DEFAULT_MENU_CONFIG;
    try {
        const parsed=JSON.parse(raw) as Partial<MenuConfig>;
        return {
            style:parsed.style===2||parsed.style===3||parsed.style===4?parsed.style:1,
            display:parsed.display==="logo"||parsed.display==="name"?parsed.display:"both",
            autoPlay:parsed.autoPlay!==false,
            slides:Array.isArray(parsed.slides)?parsed.slides:[],
        };
    } catch {
        return DEFAULT_MENU_CONFIG;
    }
}
type Settings = { logo:string; logo_white:string };

export default function Header({ light = false }: { light?: boolean }) {
    const [scrolled, setScrolled] = useState(false), [menuOpen, setMenuOpen] = useState(false);
    const [settings, setSettings] = useState<Settings>({ logo:"", logo_white:"" });
    const [pages, setPages] = useState<Array<{ slug:string; title:string; menu_visibility?:string; page_status?:string; homepage?:number; menu_config?:string|null }>>([]);
    const [config, setConfig] = useState<MenuConfig>({ style:1, display:"both", autoPlay:true, slides:[] });
    const [slideIndex, setSlideIndex] = useState(0);
    useEffect(() => {
        const handleScroll=()=>setScrolled(window.scrollY>80); window.addEventListener("scroll",handleScroll); handleScroll();
        fetch("/api/admin/site-settings",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{const data=d as {settings?:Settings}; if(data.settings)setSettings({logo:data.settings.logo||"",logo_white:data.settings.logo_white||""});}).catch(()=>{});
        fetch("/api/admin/pages",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{
            const data=d as {pages?:Array<{slug:string;title:string;menu_visibility?:string;page_status?:string;homepage?:number;menu_config?:string|null}>};
            if(data.pages){
                const visible=data.pages.filter(p=>p.menu_visibility==="visible"&&p.page_status!=="offline");
                setPages(visible);
                const pathname=window.location.pathname.replace(/^\\/|\\$/g,"");
                const current=visible.find(p => (Number(p.homepage)===1 ? "" : p.slug) === pathname);
                setConfig(current?.menu_config ? parseMenuConfig(current.menu_config) : DEFAULT_MENU_CONFIG);
            }
        }).catch(()=>{});
        return()=>window.removeEventListener("scroll",handleScroll);
    },[]);
    useEffect(()=>{if(!config.autoPlay||config.style<3||config.slides.length<2)return; const id=window.setInterval(()=>setSlideIndex(i=>(i+1)%config.slides.length),5000); return()=>window.clearInterval(id);},[config.autoPlay,config.style,config.slides.length]);
    const closeMenu=()=>setMenuOpen(false), darkHeader=light||scrolled||menuOpen||config.style>=3, logo=darkHeader?(settings.logo||settings.logo_white):(settings.logo_white||settings.logo), slide=config.slides[slideIndex]||config.slides[0], bg=slide?.media?.path;
    const nav=<>{pages.map(p=><a key={p.slug} href={Number(p.homepage)===1?"/":"/"+p.slug} onClick={closeMenu} className="transition-opacity hover:opacity-50">{p.title}</a>)}</>;
    if(config.style>=3 && slide){return <header className={"relative z-50 w-full overflow-hidden text-white " + (config.style===4 ? "aspect-[3/2]" : "aspect-video")} style={{backgroundImage:`linear-gradient(rgba(0,0,0,${(slide.tint??25)/100}),rgba(0,0,0,${(slide.tint??25)/100})),url(${slide.media?.path||""})`,backgroundSize:"cover",backgroundPosition:`${slide.focalX??50}% ${slide.focalY??50}%`}}>
        <nav className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 md:px-10 md:py-6">{config.style===4?<><div className="flex flex-1 items-center gap-8 text-xs uppercase tracking-[0.15em]"><a href="/">Home</a><a href="/about">About</a><a href="/portfolio">Portfolio</a></div><a href="/" className="flex w-40 flex-col items-center gap-2 text-center">{(config.display==="logo"||config.display==="both")&&logo?<img src={logo} alt="The Scene Studio" className="max-h-10 max-w-[140px] object-contain"/>:null}{(config.display==="name"||config.display==="both")&&<span className="font-serif text-lg">The Scene Studio</span>}</a><div className="flex flex-1 justify-end gap-8 text-xs uppercase tracking-[0.15em]"><a href="/blog">Blog</a><a href="/film">Film</a><a href="/contact">Contact</a></div></>:<><a href="/" className="flex items-center gap-3">{(config.display==="logo"||config.display==="both")&&logo?<img src={logo} alt="The Scene Studio" className="max-h-10 max-w-[180px] object-contain"/>:null}{(config.display==="name"||config.display==="both")&&<span className="font-serif text-lg">The Scene Studio</span>}</a><div className="flex items-center gap-8 text-xs uppercase tracking-[0.15em]">{nav}</div></>}</nav>
        <div className="absolute inset-0 z-10 flex items-center justify-center p-8 text-center"><div className="max-w-2xl">{slide.title?<p className="font-serif text-4xl md:text-6xl">{slide.title}</p>:null}{slide.subtitle?<p className="mt-3 text-sm md:text-base">{slide.subtitle}</p>:null}{slide.buttonText?<a href={slide.buttonUrl||"#"} target={slide.openNewWindow?"_blank":undefined} rel={slide.openNewWindow?"noreferrer":undefined} className="mt-6 inline-flex border border-white px-5 py-2 text-[10px] uppercase tracking-[0.14em]">{slide.buttonText}</a>:null}</div></div>
        {config.slides.length>1&&<div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 text-[9px] uppercase tracking-[0.12em]"><button onClick={()=>setSlideIndex(i=>(i-1+config.slides.length)%config.slides.length)}>←</button><span>{String(slideIndex+1).padStart(2,"0")} / {String(config.slides.length).padStart(2,"0")}</span><button onClick={()=>setSlideIndex(i=>(i+1)%config.slides.length)}>→</button></div>}
    </header>}
    return <><header className={`fixed left-0 top-0 z-50 w-full px-6 py-5 transition-all duration-500 md:px-10 md:py-6 ${darkHeader?"bg-[#f7f5f0]/95 text-[#171717] backdrop-blur-md":"bg-transparent text-white"}`}><nav className="flex items-center justify-between"><a href="/" onClick={closeMenu} className="flex items-center gap-3">{(config.display==="logo"||config.display==="both")&&logo?<img src={logo} alt="The Scene Studio" className="h-auto max-h-10 w-auto max-w-[180px] object-contain"/>:null}{(config.display==="name"||config.display==="both")&&<span className="hidden font-serif text-lg leading-none md:block">The Scene Studio</span>}</a><div className="hidden items-center gap-8 font-sans text-xs tracking-[0.15em] uppercase md:flex">{nav}</div><button onClick={()=>setMenuOpen(!menuOpen)} className="font-sans text-xs tracking-[0.2em] uppercase md:hidden">{menuOpen?"Close":"Menu"}</button></nav></header><div className={`fixed right-0 top-[58px] z-40 w-[260px] rounded-b-sm bg-[#f7f5f0] p-8 text-[#171717] shadow-xl ${menuOpen?"visible translate-y-0 opacity-100":"invisible -translate-y-2 opacity-0"}`}><nav className="flex flex-col gap-6">{nav}</nav></div></>;
}
