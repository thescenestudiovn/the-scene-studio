import Image from "next/image";

type StoryCardProps = {
    number: string;
    couple: string;
    location: string;
    image: string;
    href: string;
};

export default function StoryCard({
    number,
    couple,
    location,
    image,
    href,
}: StoryCardProps) {
    return (
        <article>
            <a href={href} className="group block">
                <div className="mb-5 flex items-center justify-between font-sans text-[10px] tracking-[0.2em] uppercase">
                    <span>{number}</span>
                    <span className="transition-opacity group-hover:opacity-50">
                        View Story →
                    </span>
                </div>

                <div className="relative aspect-[4/3] overflow-hidden bg-[#ddd8cf] md:aspect-[16/9]">
                    <Image
                        src={image}
                        alt={`${couple} — intimate wedding in ${location}`}
                        fill
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 90vw"
                    />
                </div>

                <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                    <h3 className="font-serif text-3xl tracking-[-0.02em] md:text-5xl">
                        {couple}
                    </h3>

                    <p className="font-sans text-xs tracking-[0.15em] uppercase text-[#77736c]">
                        {location}
                    </p>
                </div>
            </a>
        </article>
    );
}