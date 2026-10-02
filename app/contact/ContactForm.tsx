"use client";

import { FormEvent, useState } from "react";
import type { ContactBlockVariant } from "../../components/story/picker/blockTypes";

const steps = [
    "About You",
    "Your Wedding",
    "Services",
    "Your Story",
];

type ContactFormProps = {
    variant?: ContactBlockVariant;
    title?: string;
    body?: string;
    image?: string;
    blockMode?: boolean;
};

export default function ContactForm(props: ContactFormProps) {
    const { blockMode, ...contactProps } = props;
    return blockMode ? (
        <PixiesetContactForm {...contactProps} />
    ) : (
        <InquiryContactForm {...contactProps} />
    );
}

function InquiryContactForm({
    variant = "form-1",
    title = "",
    body = "",
    image = "",
}: Omit<ContactFormProps, "blockMode">) {
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        name: "",
        partnerName: "",
        email: "",
        instagram: "",
        weddingDate: "",
        dateStatus: "",
        location: "",
        guests: "",
        celebration: "",
        services: [] as string[],
        coverage: "",
        planner: "",
        budget: "",
        story: "",
    });

    const updateField = (field: string, value: string) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        setErrors((current) => {
            const next = { ...current };
            delete next[field];
            return next;
        });
    };

    const toggleService = (service: string) => {
        setForm((current) => ({
            ...current,
            services: current.services.includes(service)
                ? current.services.filter((item) => item !== service)
                : [...current.services, service],
        }));

        setErrors((current) => {
            const next = { ...current };
            delete next.services;
            return next;
        });
    };

    const validateStep = () => {
        const newErrors: Record<string, string> = {};

        if (step === 0) {
            if (!form.name.trim()) {
                newErrors.name = "Please tell us your name.";
            }

            if (!form.email.trim()) {
                newErrors.email = "Please enter your email.";
            } else if (!/\S+@\S+\.\S+/.test(form.email)) {
                newErrors.email = "Please enter a valid email.";
            }
        }

        if (step === 1) {
            if (!form.dateStatus) {
                newErrors.dateStatus = "Please select an option.";
            }

            if (
                form.dateStatus === "I know my date" &&
                !form.weddingDate
            ) {
                newErrors.weddingDate =
                    "Please choose your wedding date.";
            }

            if (!form.location.trim()) {
                newErrors.location =
                    "Please tell us where you're getting married.";
            }
        }

        if (step === 2) {
            if (form.services.length === 0) {
                newErrors.services =
                    "Please select at least one service.";
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep((current) => current + 1);
        }
    };

    const previousStep = () => {
        setErrors({});
        setStep((current) => current - 1);
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!form.story.trim()) {
            setErrors({
                story: "Please tell us a little about your plans.",
            });
            return;
        }

        setErrors({});
        setSubmitting(true);

        try {
            const response = await fetch(
                "https://inquiry.thescenestudio.workers.dev/inquiry",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    errorText || "Unable to send inquiry."
                );
            }

            setSubmitted(true);
        } catch (error) {
            console.error("Inquiry submission error:", error);

            setErrors({
                story:
                    "Something went wrong while sending your inquiry. Please try again.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const hasSideLayout =
        variant === "form-with-text-left" ||
        variant === "form-with-text-right" ||
        variant === "form-with-image-left" ||
        variant === "form-with-image-right";
    const isTextSide =
        variant === "form-with-text-left" ||
        variant === "form-with-text-right";
    const isLeftSide =
        variant === "form-with-text-left" ||
        variant === "form-with-image-left";

    const formShell = (
        <div className={variant === "form-2"
            ? "mx-auto w-full max-w-5xl"
            : variant === "form-3"
                ? "mx-auto w-full max-w-4xl border border-[#d8d3ca] bg-white p-6 md:p-10"
                : "mx-auto w-full max-w-4xl"}>
            {!hasSideLayout && title && (
                <div className="mb-10 max-w-2xl">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#77736c]">Contact</p>
                    <h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] md:text-6xl">{title}</h2>
                    {body && <p className="mt-4 text-sm leading-7 text-[#77736c]">{body}</p>}
                </div>
            )}
                {submitted ? (
                        <div className="py-20 md:py-32">
                            <p className="font-sans text-xs tracking-[0.2em] uppercase">
                                Inquiry Received
                            </p>

                            <h2 className="mt-8 max-w-3xl font-serif text-5xl leading-[0.95] tracking-[-0.04em] md:text-7xl">
                                Thank you.
                                <br />
                                We&apos;ll be in touch soon.
                            </h2>

                            <p className="mt-8 max-w-xl font-sans text-sm leading-7 text-[#77736c]">
                                We&apos;ve received your inquiry and
                                will get back to you shortly. We&apos;re
                                looking forward to hearing more about
                                your plans.
                            </p>

                            <a
                                href="/"
                                className="mt-12 inline-block font-sans text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-50"
                            >
                                Back to The Scene →
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* Progress */}
                            <div className="mb-20 flex items-center justify-between">
                                {steps.map((label, index) => (
                                    <div
                                        key={label}
                                        className={`flex items-center gap-3 font-sans text-[10px] tracking-[0.15em] uppercase ${index === step
                                            ? "text-[#171717]"
                                            : "text-[#aaa59c]"
                                            }`}
                                    >
                                        <span>
                                            {String(index + 1).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>

                                        <span className="hidden md:inline">
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* STEP 1 */}
                                {step === 0 && (
                                    <div>
                                        <p className="font-sans text-xs tracking-[0.2em] uppercase">
                                            01 — About You
                                        </p>

                                        <h2 className="mt-6 font-serif text-4xl tracking-[-0.03em] md:text-6xl">
                                            Let&apos;s start with the two
                                            of you.
                                        </h2>

                                        <div className="mt-16 space-y-10">
                                            <Field
                                                label="Your name"
                                                value={form.name}
                                                error={errors.name}
                                                onChange={(value) =>
                                                    updateField(
                                                        "name",
                                                        value
                                                    )
                                                }
                                            />

                                            <Field
                                                label="Your partner's name"
                                                value={form.partnerName}
                                                error={
                                                    errors.partnerName
                                                }
                                                onChange={(value) =>
                                                    updateField(
                                                        "partnerName",
                                                        value
                                                    )
                                                }
                                            />

                                            <Field
                                                label="Email"
                                                type="email"
                                                value={form.email}
                                                error={errors.email}
                                                onChange={(value) =>
                                                    updateField(
                                                        "email",
                                                        value
                                                    )
                                                }
                                            />

                                            <Field
                                                label="Instagram / WhatsApp"
                                                value={form.instagram}
                                                onChange={(value) =>
                                                    updateField(
                                                        "instagram",
                                                        value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2 */}
                                {step === 1 && (
                                    <div>
                                        <p className="font-sans text-xs tracking-[0.2em] uppercase">
                                            02 — Your Wedding
                                        </p>

                                        <h2 className="mt-6 font-serif text-4xl tracking-[-0.03em] md:text-6xl">
                                            Tell us about the day.
                                        </h2>

                                        <div className="mt-16 space-y-10">
                                            {/* Wedding Date */}
                                            <div>
                                                <label className="font-sans text-xs tracking-[0.15em] uppercase text-[#77736c]">
                                                    Wedding date
                                                </label>

                                                <div className="mt-5 grid gap-3 md:grid-cols-3">
                                                    {[
                                                        "I know my date",
                                                        "We're flexible",
                                                        "Not decided yet",
                                                    ].map(
                                                        (option) => (
                                                            <button
                                                                type="button"
                                                                key={option}
                                                                onClick={() =>
                                                                    updateField(
                                                                        "dateStatus",
                                                                        option
                                                                    )
                                                                }
                                                                className={`border px-5 py-4 text-left font-sans text-xs tracking-[0.08em] transition-colors ${form.dateStatus ===
                                                                    option
                                                                    ? "border-[#171717] bg-[#171717] text-[#f7f5f0]"
                                                                    : "border-[#d8d3ca] hover:border-[#77736c]"
                                                                    }`}
                                                            >
                                                                {option}
                                                            </button>
                                                        )
                                                    )}
                                                </div>

                                                {errors.dateStatus && (
                                                    <p className="mt-2 font-sans text-xs text-[#9b5c52]">
                                                        {
                                                            errors.dateStatus
                                                        }
                                                    </p>
                                                )}

                                                {form.dateStatus ===
                                                    "I know my date" && (
                                                        <div>
                                                            <input
                                                                type="date"
                                                                value={
                                                                    form.weddingDate
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    updateField(
                                                                        "weddingDate",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                className={`mt-6 w-full border-b bg-transparent py-4 font-serif text-lg outline-none md:text-xl ${errors.weddingDate
                                                                    ? "border-[#9b5c52]"
                                                                    : "border-[#aaa59c]"
                                                                    }`}
                                                            />

                                                            {errors.weddingDate && (
                                                                <p className="mt-2 font-sans text-xs text-[#9b5c52]">
                                                                    {
                                                                        errors.weddingDate
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                            </div>

                                            <Field
                                                label="Where are you getting married?"
                                                value={form.location}
                                                error={errors.location}
                                                onChange={(value) =>
                                                    updateField(
                                                        "location",
                                                        value
                                                    )
                                                }
                                            />

                                            <Field
                                                label="Number of guests"
                                                value={form.guests}
                                                onChange={(value) =>
                                                    updateField(
                                                        "guests",
                                                        value
                                                    )
                                                }
                                            />

                                            <SelectField
                                                label="Type of celebration"
                                                value={form.celebration}
                                                options={[
                                                    "Intimate wedding",
                                                    "Destination wedding",
                                                    "Elopement",
                                                    "Engagement / Pre-wedding",
                                                    "Other",
                                                ]}
                                                onChange={(value) =>
                                                    updateField(
                                                        "celebration",
                                                        value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3 */}
                                {step === 2 && (
                                    <div>
                                        <p className="font-sans text-xs tracking-[0.2em] uppercase">
                                            03 — Services
                                        </p>

                                        <h2 className="mt-6 font-serif text-4xl tracking-[-0.03em] md:text-6xl">
                                            How can we be part of it?
                                        </h2>

                                        <div className="mt-16 grid gap-4 md:grid-cols-2">
                                            {[
                                                "Photography",
                                                "Film",
                                                "Photography + Film",
                                                "Pre-wedding",
                                                "Multi-day coverage",
                                                "Not sure yet",
                                            ].map((service) => {
                                                const selected =
                                                    form.services.includes(
                                                        service
                                                    );

                                                return (
                                                    <button
                                                        type="button"
                                                        key={service}
                                                        onClick={() =>
                                                            toggleService(
                                                                service
                                                            )
                                                        }
                                                        className={`border px-6 py-5 text-left font-sans text-sm transition-colors ${selected
                                                            ? "border-[#171717] bg-[#171717] text-[#f7f5f0]"
                                                            : "border-[#d8d3ca] hover:border-[#77736c]"
                                                            }`}
                                                    >
                                                        {service}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {errors.services && (
                                            <p className="mt-3 font-sans text-xs text-[#9b5c52]">
                                                {errors.services}
                                            </p>
                                        )}

                                        <div className="mt-16 space-y-10">
                                            <SelectField
                                                label="How much coverage are you considering?"
                                                value={form.coverage}
                                                options={[
                                                    "2–4 hours",
                                                    "5–6 hours",
                                                    "8 hours",
                                                    "10+ hours",
                                                    "Multiple days",
                                                    "Not sure yet",
                                                ]}
                                                onChange={(value) =>
                                                    updateField(
                                                        "coverage",
                                                        value
                                                    )
                                                }
                                            />

                                            <SelectField
                                                label="Do you already have a planner?"
                                                value={form.planner}
                                                options={[
                                                    "Yes",
                                                    "No",
                                                    "We're looking",
                                                ]}
                                                onChange={(value) =>
                                                    updateField(
                                                        "planner",
                                                        value
                                                    )
                                                }
                                            />

                                            <SelectField
                                                label="Approximate photography & film budget"
                                                value={form.budget}
                                                options={[
                                                    "Under 30M VND",
                                                    "30–50M VND",
                                                    "50–80M VND",
                                                    "80–120M VND",
                                                    "120M+ VND",
                                                    "Not sure yet",
                                                ]}
                                                onChange={(value) =>
                                                    updateField(
                                                        "budget",
                                                        value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4 */}
                                {step === 3 && (
                                    <div>
                                        <p className="font-sans text-xs tracking-[0.2em] uppercase">
                                            04 — Your Story
                                        </p>

                                        <h2 className="mt-6 font-serif text-4xl tracking-[-0.03em] md:text-6xl">
                                            Tell us about your plans.
                                        </h2>

                                        <div className="mt-16">
                                            <label className="font-sans text-xs tracking-[0.15em] uppercase text-[#77736c]">
                                                Tell us about your day
                                            </label>

                                            <textarea
                                                value={form.story}
                                                onChange={(event) =>
                                                    updateField(
                                                        "story",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Tell us about your story, the kind of celebration you're planning, or anything you'd love us to know."
                                                rows={8}
                                                className={`mt-4 w-full resize-none border-b bg-transparent py-4 font-serif text-2xl outline-none placeholder:text-[#aaa59c] md:text-3xl ${errors.story
                                                    ? "border-[#9b5c52]"
                                                    : "border-[#aaa59c]"
                                                    }`}
                                            />

                                            {errors.story && (
                                                <p className="mt-2 font-sans text-xs text-[#9b5c52]">
                                                    {errors.story}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Navigation */}
                                <div className="mt-20 flex items-center justify-between border-t border-[#d8d3ca] pt-8">
                                    {step > 0 ? (
                                        <button
                                            type="button"
                                            onClick={previousStep}
                                            className="font-sans text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-50"
                                        >
                                            ← Back
                                        </button>
                                    ) : (
                                        <span />
                                    )}

                                    {step < steps.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="font-sans text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-50"
                                        >
                                            Continue →
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="font-sans text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {submitting
                                                ? "Sending..."
                                                : "Send Inquiry →"}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </>
                    )}

        </div>
    );

    return (
        <section data-contact-variant={variant} className={`border-t border-[#d8d3ca] px-6 py-20 md:px-10 md:py-32 ${variant === "form-3" ? "bg-[#eeece6]" : ""}`}>
            {hasSideLayout ? (
                <div className="mx-auto grid max-w-7xl items-stretch gap-6 md:grid-cols-2 md:gap-12">
                    {isLeftSide && (
                        <aside className="order-1">
                            {isTextSide ? (
                                <div className="pt-2">
                                    {title && <h2 className="font-serif text-4xl leading-[0.98] tracking-[-0.03em] md:text-6xl">{title}</h2>}
                                    {body && <p className="mt-5 max-w-md text-sm leading-7 text-[#77736c]">{body}</p>}
                                </div>
                            ) : image ? (
                                <div className="contact-side-image aspect-[4/5] overflow-hidden bg-[#e8e4dc] md:aspect-auto md:min-h-[650px]">
                                    <img src={image} alt={title || "The Scene Studio"} className="h-full w-full object-cover" />
                                </div>
                            ) : (
                                <div className="contact-side-image aspect-[4/5] bg-[#e8e4dc] md:aspect-auto md:min-h-[650px]" />
                            )}
                        </aside>
                    )}
                    <div className="order-2">{formShell}</div>
                    {!isLeftSide && (
                        <aside className="order-2">
                            {isTextSide ? (
                                <div className="pt-2">
                                    {title && <h2 className="font-serif text-4xl leading-[0.98] tracking-[-0.03em] md:text-6xl">{title}</h2>}
                                    {body && <p className="mt-5 max-w-md text-sm leading-7 text-[#77736c]">{body}</p>}
                                </div>
                            ) : image ? (
                                <div className="contact-side-image aspect-[4/5] overflow-hidden bg-[#e8e4dc] md:aspect-auto md:min-h-[650px]">
                                    <img src={image} alt={title || "The Scene Studio"} className="h-full w-full object-cover" />
                                </div>
                            ) : (
                                <div className="contact-side-image aspect-[4/5] bg-[#e8e4dc] md:aspect-auto md:min-h-[650px]" />
                            )}
                        </aside>
                    )}
                </div>
            ) : (
                formShell
            )}
        </section>
    );
}


function PixiesetContactForm({
    variant = "form-1",
    title = "",
    body = "",
    image = "",
}: Omit<ContactFormProps, "blockMode">) {
    const [name, setName] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [date, setDate] = useState("");
    const [email, setEmail] = useState("");
    const [interest, setInterest] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!name.trim() || !email.trim() || !interest || !message.trim()) {
            setError("Please complete the required fields.");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email.");
            return;
        }

        setError("");
        setSubmitting(true);

        try {
            const response = await fetch(
                "https://inquiry.thescenestudio.workers.dev/inquiry",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name,
                        partnerName: "",
                        email,
                        instagram: "",
                        whatsapp,
                        weddingDate: date,
                        dateStatus: date ? "I know my date" : "",
                        location: "",
                        guests: "",
                        celebration: interest,
                        interest,
                        services: [],
                        coverage: "",
                        planner: "",
                        budget: "",
                        story: message,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    (await response.text()) || "Unable to send inquiry."
                );
            }

            setSubmitted(true);
        } catch (submitError) {
            console.error("Contact block submission error:", submitError);
            setError(
                "Something went wrong while sending your message. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const form = (
        <div className="scene-pixieset-form">
            {(title || body) && (
                <div className="scene-pixieset-form__intro">
                    {title && <h2>{title}</h2>}
                    {body && <p>{body}</p>}
                </div>
            )}

            {submitted ? (
                <div className="scene-pixieset-form__success">
                    <span>Thank you.</span>
                    <p>
                        Your message has been received. We&apos;ll be in touch
                        soon.
                    </p>
                </div>
            ) : (
                <form onSubmit={submit}>
                    <label>
                        Name <span>*</span>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                    </label>

                    <label>
                        WhatsApp
                        <input
                            value={whatsapp}
                            onChange={(event) =>
                                setWhatsapp(event.target.value)
                            }
                        />
                    </label>

                    <label>
                        Date
                        <input
                            type="date"
                            value={date}
                            onChange={(event) => setDate(event.target.value)}
                        />
                    </label>

                    <label>
                        Email address <span>*</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </label>

                    <label>
                        Interest <span>*</span>
                        <select
                            value={interest}
                            onChange={(event) => setInterest(event.target.value)}
                        >
                            <option value="">Select an option</option>
                            <option value="Destination wedding">
                                Destination wedding
                            </option>
                            <option value="Intimate wedding">
                                Intimate wedding
                            </option>
                            <option value="Couple">Couple</option>
                            <option value="Elopement">Elopement</option>
                            <option value="Not sure">Not sure</option>
                        </select>
                    </label>

                    <label>
                        Message <span>*</span>
                        <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            rows={7}
                        />
                    </label>

                    {error && (
                        <p className="scene-pixieset-form__error">{error}</p>
                    )}

                    <button type="submit" disabled={submitting}>
                        {submitting ? "Sending..." : "Send Message"}
                    </button>
                </form>
            )}
        </div>
    );

    if (
        variant === "form-with-text-left" ||
        variant === "form-with-text-right"
    ) {
        const left = variant === "form-with-text-left";
        return (
            <section className="scene-contact-block scene-contact-block--soft">
                <div className="scene-contact-block__two-col">
                    <div
                        className={
                            left
                                ? "scene-contact-block__copy scene-contact-block__copy--left"
                                : "scene-contact-block__form scene-contact-block__form--left"
                        }
                    >
                        {left ? (
                            title || body ? (
                                <div>
                                    {title && <h2>{title}</h2>}
                                    {body && <p>{body}</p>}
                                </div>
                            ) : null
                        ) : (
                            form
                        )}
                    </div>

                    <div
                        className={
                            !left
                                ? "scene-contact-block__copy scene-contact-block__copy--right"
                                : "scene-contact-block__form scene-contact-block__form--right"
                        }
                    >
                        {left
                            ? form
                            : title || body
                              ? (
                                    <div>
                                        {title && <h2>{title}</h2>}
                                        {body && <p>{body}</p>}
                                    </div>
                                )
                              : null}
                    </div>
                </div>
            </section>
        );
    }

    if (
        variant === "form-with-image-left" ||
        variant === "form-with-image-right"
    ) {
        const left = variant === "form-with-image-left";
        const media = image ? (
            <div className="scene-contact-block__image">
                <img src={image} alt={title || "The Scene Studio"} />
            </div>
        ) : (
            <div className="scene-contact-block__image scene-contact-block__image--placeholder" />
        );

        return (
            <section className="scene-contact-block">
                <div className="scene-contact-block__two-col">
                    <div
                        className={
                            left
                                ? "scene-contact-block__media"
                                : "scene-contact-block__form"
                        }
                    >
                        {left ? media : form}
                    </div>
                    <div
                        className={
                            left
                                ? "scene-contact-block__form"
                                : "scene-contact-block__media"
                        }
                    >
                        {left ? form : media}
                    </div>
                </div>
            </section>
        );
    }

    const variantClass =
        variant === "form-2"
            ? "scene-contact-block scene-contact-block--soft"
            : variant === "form-3"
              ? "scene-contact-block scene-contact-block--boxed"
              : "scene-contact-block";

    return (
        <section className={variantClass}>
            <div
                className={
                    variant === "form-2"
                        ? "scene-contact-block__form scene-contact-block__form--wide"
                        : "scene-contact-block__form"
                }
            >
                {form}
            </div>
        </section>
    );
}

function Field({
    label,
    value,
    onChange,
    type = "text",
    error,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    error?: string;
}) {
    return (
        <div>
            <label className="font-sans text-xs tracking-[0.15em] uppercase text-[#77736c]">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className={`mt-3 w-full border-b bg-transparent py-4 font-serif text-2xl outline-none md:text-3xl ${error
                    ? "border-[#9b5c52]"
                    : "border-[#aaa59c]"
                    }`}
            />

            {error && (
                <p className="mt-2 font-sans text-xs text-[#9b5c52]">
                    {error}
                </p>
            )}
        </div>
    );
}

function SelectField({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <div>
            <label className="font-sans text-xs tracking-[0.15em] uppercase text-[#77736c]">
                {label}
            </label>

            <div className="relative mt-3 border-b border-[#aaa59c]">
                <select
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    className="w-full appearance-none bg-transparent py-4 pr-10 font-serif text-lg tracking-[-0.02em] text-[#171717] outline-none md:text-xl"
                >
                    <option value="" disabled>
                        Select an option
                    </option>

                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 font-sans text-sm text-[#77736c]">
                    ↓
                </span>
            </div>
        </div>
    );
}