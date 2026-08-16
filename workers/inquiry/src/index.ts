interface Env {
	RESEND_API_KEY: string;
}

type InquiryData = {
	name: string;
	partnerName?: string;
	email: string;
	instagram?: string;
	weddingDate?: string;
	dateStatus?: string;
	location: string;
	guests?: string;
	celebration?: string;
	services: string[];
	coverage?: string;
	planner?: string;
	budget?: string;
	story: string;
};

const ALLOWED_ORIGINS = [
	"http://localhost:3000",
	"https://inquiry.thescenestudio.workers.dev",

	"https://the-scene-studio.thescenestudio.workers.dev",
	// Sau này thêm domain production của The Scene Studio vào đây.
];

function getCorsHeaders(origin: string | null) {
	const allowedOrigin =
		origin && ALLOWED_ORIGINS.includes(origin)
			? origin
			: ALLOWED_ORIGINS[0];

	return {
		"Access-Control-Allow-Origin": allowedOrigin,
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	};
}

function jsonResponse(
	data: unknown,
	status: number,
	origin: string | null
) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json",
			...getCorsHeaders(origin),
		},
	});
}

export default {
	async fetch(
		request: Request,
		env: Env
	): Promise<Response> {
		const url = new URL(request.url);
		const origin = request.headers.get("Origin");

		// CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: getCorsHeaders(origin),
			});
		}

		// Only accept POST /inquiry
		if (
			url.pathname !== "/inquiry" ||
			request.method !== "POST"
		) {
			return jsonResponse(
				{ error: "Not Found" },
				404,
				origin
			);
		}

		try {
			const data =
				(await request.json()) as InquiryData;

			// Basic validation
			if (
				!data.name?.trim() ||
				!data.email?.trim() ||
				!data.location?.trim() ||
				!data.story?.trim()
			) {
				return jsonResponse(
					{
						error: "Please complete all required fields.",
					},
					400,
					origin
				);
			}

			if (!/\S+@\S+\.\S+/.test(data.email)) {
				return jsonResponse(
					{
						error: "Invalid email address.",
					},
					400,
					origin
				);
			}

			const partnerName =
				data.partnerName?.trim() || "Not specified";

			const services =
				data.services?.length
					? data.services.join(", ")
					: "Not specified";

			const subject = `New Inquiry — ${data.name}${data.partnerName
				? ` & ${data.partnerName}`
				: ""
				}`;

			const html = `
				<div style="font-family: Arial, Helvetica, sans-serif; color: #171717; line-height: 1.7;">
					<h1 style="font-size: 24px; font-weight: 400;">
						New Wedding Inquiry
					</h1>

					<p>
						Someone has submitted a new inquiry through
						The Scene Studio website.
					</p>

					<hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;" />

					<h2 style="font-size: 16px;">
						About Them
					</h2>

					<p>
						<strong>Name:</strong>
						${escapeHtml(data.name)}
					</p>

					<p>
						<strong>Partner:</strong>
						${escapeHtml(partnerName)}
					</p>

					<p>
						<strong>Email:</strong>
						${escapeHtml(data.email)}
					</p>

					${data.instagram
					? `
								<p>
									<strong>Instagram / WhatsApp:</strong>
									${escapeHtml(data.instagram)}
								</p>
							`
					: ""
				}

					<h2 style="font-size: 16px; margin-top: 30px;">
						Wedding
					</h2>

					<p>
						<strong>Date:</strong>
						${escapeHtml(
					data.weddingDate ||
					data.dateStatus ||
					"Not specified"
				)}
					</p>

					<p>
						<strong>Location:</strong>
						${escapeHtml(data.location)}
					</p>

					<p>
						<strong>Guests:</strong>
						${escapeHtml(
					data.guests || "Not specified"
				)}
					</p>

					<p>
						<strong>Celebration:</strong>
						${escapeHtml(
					data.celebration || "Not specified"
				)}
					</p>

					<h2 style="font-size: 16px; margin-top: 30px;">
						Services
					</h2>

					<p>
						<strong>Services:</strong>
						${escapeHtml(services)}
					</p>

					<p>
						<strong>Coverage:</strong>
						${escapeHtml(
					data.coverage || "Not specified"
				)}
					</p>

					<p>
						<strong>Planner:</strong>
						${escapeHtml(
					data.planner || "Not specified"
				)}
					</p>

					<p>
						<strong>Budget:</strong>
						${escapeHtml(
					data.budget || "Not specified"
				)}
					</p>

					<h2 style="font-size: 16px; margin-top: 30px;">
						Their Story
					</h2>

					<p style="white-space: pre-wrap;">
						${escapeHtml(data.story)}
					</p>

					<hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;" />

					<p style="font-size: 12px; color: #777;">
						Sent from The Scene Studio inquiry form.
					</p>
				</div>
			`;

			const resendResponse = await fetch(
				"https://api.resend.com/emails",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${env.RESEND_API_KEY}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						from: "The Scene Studio <onboarding@resend.dev>",
						to: ["thescenestudiovn@gmail.com"],
						reply_to: data.email,
						subject,
						html,
					}),
				}
			);

			if (!resendResponse.ok) {
				const errorText =
					await resendResponse.text();

				console.error(
					"Resend error:",
					errorText
				);

				return jsonResponse(
					{
						error: "Unable to send inquiry.",
					},
					500,
					origin
				);
			}

			return jsonResponse(
				{
					success: true,
				},
				200,
				origin
			);
		} catch (error) {
			console.error(
				"Inquiry error:",
				error
			);

			return jsonResponse(
				{
					error: "Invalid request.",
				},
				400,
				origin
			);
		}
	},
} satisfies ExportedHandler<Env>;

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}