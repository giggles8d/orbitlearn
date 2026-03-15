import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 max-w-4xl text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-foreground leading-tight">
          Five weeknight dinners.
          <br />
          One grocery run.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Tell us your budget and we&apos;ll plan your week, build your grocery list,
          and send it straight to Instacart.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-8 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Get my free meal plan &rarr;
          </Link>
          <a
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            See how it works &darr;
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-card border-y border-border">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h2 className="text-3xl font-heading font-bold text-center text-foreground mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Answer 5 quick questions',
                description: 'Tell us about your household, budget, and food preferences.',
              },
              {
                step: '2',
                title: 'Get a personalized plan',
                description: '5 budget-friendly dinners built around what your family actually likes.',
              },
              {
                step: '3',
                title: 'Send to Instacart',
                description: 'One tap sends your full grocery list for delivery or pickup.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto">
                  {item.step}
                </div>
                <h3 className="font-heading font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Trusted by 2,000+ families
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: 'DinnerDrop cut our grocery bill by 30%. The meal plans are actually things my kids will eat.',
              name: 'Sarah M.',
              detail: 'Family of 4',
            },
            {
              quote: 'I used to spend 45 minutes just deciding what to cook. Now it takes zero minutes.',
              name: 'James L.',
              detail: 'Family of 2',
            },
            {
              quote: 'The Instacart integration is a game changer. Sunday planning takes 5 minutes now.',
              name: 'Priya K.',
              detail: 'Family of 3',
            },
          ].map((testimonial) => (
            <div
              key={testimonial.name}
              className="p-5 rounded-lg border border-border bg-card space-y-3"
            >
              <p className="text-sm text-foreground italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">{testimonial.name}</span> &middot; {testimonial.detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-card border-y border-border">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h2 className="text-3xl font-heading font-bold text-center text-foreground mb-12">
            Simple pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="p-6 rounded-lg border border-border bg-background space-y-4">
              <h3 className="font-heading font-semibold text-foreground">Free</h3>
              <p className="text-3xl font-bold text-foreground">
                $0<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>1 meal plan per month</li>
                <li>5 dinners per plan</li>
                <li>Grocery list (no cart push)</li>
              </ul>
              <Link
                href="/signup"
                className="block text-center px-4 py-2 rounded-md border border-input text-foreground font-medium hover:bg-muted transition-colors"
              >
                Get started
              </Link>
            </div>

            <div className="p-6 rounded-lg border-2 border-primary bg-background space-y-4 relative">
              <div className="absolute -top-3 left-6 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                Most popular
              </div>
              <h3 className="font-heading font-semibold text-foreground">Basic</h3>
              <p className="text-3xl font-bold text-foreground">
                $9<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Weekly meal plans</li>
                <li>5 dinners per plan</li>
                <li>Instacart cart push</li>
                <li>Budget optimization</li>
              </ul>
              <Link
                href="/signup"
                className="block text-center px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 max-w-4xl text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <p>&copy; 2026 DinnerDrop. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
