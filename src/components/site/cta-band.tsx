import Image from "next/image";
import Link from "next/link";
import { Phone, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CtaBandProps {
  title?: string;
  subtitle?: string;
  phone?: string | null;
  image?: string;
  buttonText?: string;
}

export function CtaBand({
  title = "برای نوبت تعمیر موتور سیکلت تماس بگیرید",
  subtitle = "کارشناسان ما آماده پاسخگویی به سوالات شما و ارائه مشاوره تخصصی هستند.",
  phone,
  image = "/images/cta-bg.jpg",
  buttonText = "تماس فوری",
}: CtaBandProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      {image && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={image}
            alt={title}
            fill
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-ink via-ink/80 to-ink/50" />
        </div>
      )}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-hazard opacity-90" />
      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-hazard opacity-90" />

      <div className="container mx-auto px-4 py-14 md:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl md:text-4xl font-extrabold leading-tight text-balance">
            {title}
          </h2>
          <p className="mt-4 text-sm md:text-base text-white/75 leading-relaxed text-pretty">
            {subtitle}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            {phone && (
              <Button
                asChild
                size="lg"
                className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-600/40"
              >
                <a href={`tel:${phone}`}>
                  <Phone className="w-5 h-5 ml-2" />
                  {buttonText} ({phone})
                </a>
              </Button>
            )}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white rounded-xl"
            >
              <Link href="/contact">
                ارسال درخواست آنلاین
                <ChevronLeft className="w-4 h-4 mr-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
