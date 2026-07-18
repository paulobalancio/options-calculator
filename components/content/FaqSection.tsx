export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FAQ list plus matching FAQPage JSON-LD. Both render from the same array,
 * so the structured data can never drift from the visible content — a
 * requirement for rich-result eligibility.
 */
export function FaqSection({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-lg font-semibold tracking-tight">
        Frequently asked questions
      </h2>
      <dl className="mt-4 divide-y divide-line border-y border-line">
        {items.map((item) => (
          <div key={item.question} className="py-4">
            <dt className="font-medium">{item.question}</dt>
            <dd className="mt-1.5 text-ink-secondary">{item.answer}</dd>
          </div>
        ))}
      </dl>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
