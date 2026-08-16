"use client";

import { FormEvent, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const steps = [
    "About You",
    "Your Wedding",
    "Services",
    "Your Story",
];

export default function ContactPage() {
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

    return (
        <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
            <Header light />

            {/* Intro */}
            <section className="px-6 pb-24 pt-40 md:px-10 md:pb-32 md:pt-52">
                <div className="mx-auto max-w-7xl">
                    <p className="font-sans text-xs tracking-[0.2em] uppercase">
                        Inquire
                    </p>

                    <h1 className="mt-10 max-w-5xl font-serif text-6xl leading-[0.9] tracking-[-0.04em] md:text-8xl lg:text-9xl">
                        Let&apos;s make
                        <br />
                        something
                        <br />
                        meaningful.
                    </h1>

                    <p className="mt-10 max-w-xl font-sans text-sm leading-7 text-[#77736c]">
                        Tell us a little about yourselves, your plans,
                        and the kind of story you want to remember.
                    </p>
                </div>
            </section>

            {/* Form */}
            <section className="border-t border-[#d8d3ca] px-6 py-20 md:px-10 md:py-32">
                <div className="mx-auto max-w-4xl">
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
            </section>

            <Footer />
        </main>
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