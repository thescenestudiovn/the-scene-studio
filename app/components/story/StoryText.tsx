type StoryTextProps = {
    eyebrow?: string;
    title: string;
    body: string;
};

export default function StoryText({
    eyebrow,
    title,
    body,
}: StoryTextProps) {
    return (
        <section className="px-6 py-32 md:px-10 md:py-48">
            <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-12">
                <div className="md:col-span-7">
                    {eyebrow && (
                        <p className="font-sans text-xs tracking-[0.2em] uppercase">
                            {eyebrow}
                        </p>
                    )}

                    <h2 className="mt-10 font-serif text-5xl leading-[1.05] tracking-[-0.03em] md:text-7xl">
                        {title}
                    </h2>
                </div>

                <div className="md:col-span-4 md:col-start-9">
                    <p className="font-sans text-sm leading-7 text-[#77736c]">
                        {body}
                    </p>
                </div>
            </div>
        </section>
    );
}