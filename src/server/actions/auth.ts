'use server';

import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validators';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { generateSlug } from '@/lib/utils';

type ActionResult = {
  success: boolean;
  errors?: Record<string, string[]>;
};

/**
 * Handles new user registration.
 *
 * Flow:
 * 1. Rate-limit by client IP to prevent brute-force account creation.
 * 2. Validate input with Zod (signupSchema).
 * 3. Check email uniqueness.
 * 4. Hash password with bcrypt (10 rounds — good balance of security and speed).
 * 5. In a single transaction: create User, Organization (with generated slug),
 *    and Membership (role: owner).
 *
 * Returns a flat result object so it works cleanly with useFormState on the client.
 */
export async function signupAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    // ── Rate limiting by IP ────────────────────────────────────────────────
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitKey = `signup:${ip}`;
    const { allowed } = checkRateLimit(rateLimitKey, RATE_LIMITS.auth);

    if (!allowed) {
      return {
        success: false,
        errors: {
          _form: ['Too many signup attempts. Please try again later.'],
        },
      };
    }

    // ── Input validation ───────────────────────────────────────────────────
    const rawInput = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      orgName: formData.get('orgName') as string,
    };

    const parsed = signupSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errors: Record<string, string[]> = {};
      for (const [field, messages] of Object.entries(fieldErrors)) {
        if (messages && messages.length > 0) {
          errors[field] = messages;
        }
      }
      return { success: false, errors };
    }

    const { name, email, password, orgName } = parsed.data;

    // ── Email uniqueness check ─────────────────────────────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        errors: {
          email: ['An account with this email already exists.'],
        },
      };
    }

    // ── Password hashing ───────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 10);

    // ── Create User + Org + Membership in a single transaction ─────────────
    const slug = generateSlug(orgName);

    // Ensure slug uniqueness by appending a short suffix if needed
    let uniqueSlug = slug;
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });
    if (existingOrg) {
      uniqueSlug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug: uniqueSlug,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          orgId: org.id,
          role: 'owner',
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Signup action error:', error);
    return {
      success: false,
      errors: {
        _form: ['Something went wrong. Please try again.'],
      },
    };
  }
}
