import SectionHeading from "@/components/ui/SectionHeading";
import Logo from "@/components/ui/Logo";
import { getSiteSettings, getSiteStats } from "@/lib/data";

export default async function About() {
  const [stats, siteInfo] = await Promise.all([getSiteStats(), getSiteSettings()]);
  return (
    <section id="about" className="bg-brand-cream py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div className="order-2 lg:order-1">
            <div className="relative mx-auto flex aspect-square max-w-sm items-center justify-center rounded-full bg-brand-purple-tint">
              <div className="flex h-4/5 w-4/5 items-center justify-center rounded-full border-2 border-dashed border-brand-purple/25">
                <Logo size={140} />
              </div>
            </div>
          </div>

          <div className="order-1 text-right lg:order-2">
            <SectionHeading
              title="عن الفوج"
              subtitle={`${siteInfo.parent} — ${siteInfo.name}`}
            />

            <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-ink/70 sm:text-lg">
              فوج روضة الفيحاء هو أحد أفواج جمعية الكشاف المسلم في لبنان ضمن
              مفوضية الشمال. نُقيم ونُنظّم مغامرات وتحديات وأوقاتًا كشفية مميزة
              للأشبال والزهرات والكشافة والمرشدات، ضمن رحلة تربوية متكاملة
              تجمع بين القيم الإسلامية وروح القيادة والخدمة.
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-brand-purple/10 pt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-2xl font-bold text-brand-purple sm:text-3xl">
                    {stat.value}
                  </dd>
                  <p className="mt-1 text-xs text-brand-ink/60 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-brand-ink/40">
              * أرقام تقديرية مبدئية، قيد التحديث بالبيانات الرسمية للفوج.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
