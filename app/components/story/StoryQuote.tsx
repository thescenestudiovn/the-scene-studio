type StoryQuoteProps = {
    text: string;
};

export default function StoryQuote({ text }: StoryQuoteProps) {
    return (
        <section className="px-6 py-32 md:px-10 md:py-48">
            <div className="mx-auto max-w-5xl">
                <p className="font-serif text-4xl leading-tight tracking-[-0.02em] md:text-7xl">
                    “{text}”
                </p>
            </div>
        </section>
    );
}