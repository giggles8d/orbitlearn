import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy — DinnerDrop',
  description: 'DinnerDrop privacy policy — how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 max-w-3xl flex items-center justify-between">
          <Link href="/" className="font-heading text-xl font-bold text-foreground">
            DinnerDrop
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: March 2026
        </p>

        <div className="space-y-8 text-sm text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
              1. What Data We Collect
            </h2>
            <p className="mb-3">
              When you use DinnerDrop, we collect the following types of information:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Account information:</span> Name,
                email address, and password
              </li>
              <li>
                <span className="font-medium text-foreground">Profile preferences:</span> Household
                size, weekly grocery budget, maximum cook time, cuisine preferences, and dietary
                needs or restrictions
              </li>
              <li>
                <span className="font-medium text-foreground">Meal history:</span> Generated meal
                plans, saved recipes, favorited meals, and grocery lists
              </li>
              <li>
                <span className="font-medium text-foreground">Usage data:</span> How you interact
                with the Service, including pages visited, features used, and meal swaps
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
              2. How We Use Your Data
            </h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Generate personalized meal plans tailored to your preferences and budget</li>
              <li>Create accurate, consolidated grocery lists from your meal plans</li>
              <li>Improve meal recommendations over time based on your favorites and swaps</li>
              <li>Process payments and manage your subscription</li>
              <li>Send transactional emails (account verification, password resets, plan updates)</li>
              <li>Analyze aggregated, anonymized usage patterns to improve the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
              3. Third-Party Services
            </h2>
            <p className="mb-3">
              We use the following third-party services to operate DinnerDrop. Each service
              processes your data according to their own privacy policies:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Supabase:</span> Authentication,
                database, and data storage
              </li>
              <li>
                <span className="font-medium text-foreground">Anthropic (Claude):</span> AI-powered
                meal plan and recipe generation — your dietary preferences and household information
                are sent to Anthropic to generate personalized plans
              </li>
              <li>
                <span className="font-medium text-foreground">Instacart:</span> Grocery delivery
                integration — your grocery list is shared with Instacart when you choose to push
                your cart
              </li>
              <li>
                <span className="font-medium text-foreground">Kroger:</span> Grocery pricing and
                product matching
              </li>
              <li>
                <span className="font-medium text-foreground">Stripe:</span> Payment processing
                for paid subscriptions — we do not store your full credit card number
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
              4. Data Retention
            </h2>
            <p className="mb-3">
              We retain your account data and meal history for as long as your account is active.
              If you delete your account, we will remove your personal data within 30 days, except
              where we are required to retain it for legal or compliance purposes.
            </p>
            <p>
              Anonymized, aggregated data (such as overall usage statistics) may be retained
              indefinitely to improve the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
              5. Your Rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Access your data:</span> View all
                personal data we store about you through your account settings
              </li>
              <li>
                <span className="font-medium text-foreground">Export your data:</span> Request a
                copy of your meal plans, favorites, and profile in a machine-readable format
              </li>
              <li>
                <span className="font-medium text-foreground">Delete your account:</span> Permanently
                delete your account and all associated personal data
              </li>
              <li>
                <span className="font-medium text-foreground">Correct your data:</span> Update
                inaccurate personal information through your profile settings
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:info@dinnerdrop.app" className="text-primary hover:underline">
                info@dinnerdrop.app
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
              6. Cookies
            </h2>
            <p>
              DinnerDrop uses cookies to manage authentication sessions and remember your
              preferences. We do not use third-party advertising or tracking cookies. Essential
              cookies are required for the Service to function and cannot be disabled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
              7. Children&rsquo;s Privacy
            </h2>
            <p>
              DinnerDrop is not intended for children under the age of 13. We do not knowingly
              collect personal information from children under 13. If you believe a child under 13
              has provided us with personal data, please contact us at{' '}
              <a href="mailto:info@dinnerdrop.app" className="text-primary hover:underline">
                info@dinnerdrop.app
              </a>{' '}
              and we will promptly delete the information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
              8. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your personal data,
              including encryption in transit (TLS) and at rest. However, no method of electronic
              transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by posting the updated policy on this page and updating the &ldquo;Last
              updated&rdquo; date. Your continued use of the Service after changes are posted
              constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
              10. Contact Us
            </h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices,
              please contact us at{' '}
              <a href="mailto:info@dinnerdrop.app" className="text-primary hover:underline">
                info@dinnerdrop.app
              </a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6 max-w-3xl flex items-center justify-between text-xs text-muted-foreground">
          <p>&copy; 2026 DinnerDrop. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <span className="font-medium text-foreground">Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
