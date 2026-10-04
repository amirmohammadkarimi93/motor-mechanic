import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeading } from "./section-heading";

export interface Faq {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: Faq[];
}

// Build FAQPage JSON-LD for Google rich results
function buildFaqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function FaqSection({ faqs }: FaqSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  const jsonLd = buildFaqJsonLd(faqs);

  return (
    <section className="container mx-auto px-4 py-14 md:py-20">
      <SectionHeading
        eyebrow="سوالات متداول"
        title="سوالات متداول تعمیر موتور سیکلت"
        description="پاسخ به پرسش‌های رایج شما درباره خدمات و تعمیرات موتور مکانیک."
        align="center"
        className="mb-10 md:mb-12"
      />

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-xl bg-card border border-border shadow-sm hover:border-brand-300 transition-colors mb-3 px-5 overflow-hidden data-[state=open]:border-brand-300 data-[state=open]:shadow-md"
            >
              <AccordionTrigger className="text-right text-sm md:text-base font-display font-bold text-foreground hover:text-brand-700 hover:no-underline items-center">
                <span className="flex items-center gap-3 flex-1">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">
                    {String(i + 1).toLocaleString("fa-IR")}
                  </span>
                  <span className="flex-1">{f.question}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed text-right pt-2 pb-5 pr-10">
                {f.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* FAQPage JSON-LD for SEO rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
