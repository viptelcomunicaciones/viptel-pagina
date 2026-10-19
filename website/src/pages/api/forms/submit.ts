export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { Resend } from 'resend';
import siteConfig from '@/config/site.config';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { payload } from '@/lib/payload-client';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const submissionSchema = z.object({
  form: z.union([z.number(), z.string().min(1)]),
  honeypot: z.string().optional(),
  submissionData: z
    .array(
      z.object({
        field: z.string().min(1).max(100),
        value: z.string().max(5000),
      })
    )
    .min(1, 'Form submission cannot be empty'),
});

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = getClientIp(request, clientAddress);
  if (rateLimit(ip)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Too many requests. Please try again later.',
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const parsed = submissionSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: parsed.error.issues[0]?.message || 'Invalid form data',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Honeypot check (silent 200 for bots)
    if (parsed.data.honeypot && parsed.data.honeypot.length > 0) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stored = await payload
      .forms()
      .submit(parsed.data.form, parsed.data.submissionData);

    if (!stored) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Could not save form submission',
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Optional email notification via Resend
    const apiKey = import.meta.env.RESEND_API_KEY;
    if (apiKey) {
      try {
        const resend = new Resend(apiKey);
        const toEmail = siteConfig.email;
        const fromEmail = import.meta.env.RESEND_FROM_EMAIL || toEmail;
        const replyToEntry = parsed.data.submissionData.find(
          (item) => item.field.toLowerCase() === 'email'
        );
        const rowsHtml = parsed.data.submissionData
          .map(
            (item) =>
              `<p><strong>${escapeHtml(item.field)}:</strong> ${escapeHtml(item.value).replace(/\n/g, '<br>')}</p>`
          )
          .join('');

        await resend.emails.send({
          from: `${siteConfig.name} Forms <${fromEmail}>`,
          to: toEmail,
          ...(replyToEntry?.value ? { replyTo: replyToEntry.value } : {}),
          subject: `[${siteConfig.name}] Nueva respuesta de formulario (#${String(parsed.data.form)})`,
          html: rowsHtml,
        });
      } catch (emailErr) {
        console.error('[Forms Submit] Optional Resend notification failed:', emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[Forms Submit] Unexpected error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'An unexpected error occurred',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
