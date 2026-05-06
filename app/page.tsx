import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero — V5 style: white bg, left-aligned, circle right */}
      <section className="relative overflow-hidden bg-white">
        {/* Decorative teal circle */}
        <div className="absolute -right-20 top-8 w-[420px] h-[420px] rounded-full hidden md:flex items-center justify-center"
          style={{ backgroundColor: "#00989D" }}>
          {/* Diagonal stripes */}
          <div className="absolute inset-0 rounded-full overflow-hidden opacity-20">
            <div className="absolute inset-0" style={{
              background: "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(252,195,62,0.5) 8px, rgba(252,195,62,0.5) 10px)"
            }} />
          </div>
          <span className="text-white text-5xl font-bold relative z-10 tracking-tight">lit uP</span>
        </div>

        {/* Small decorative elements */}
        <div className="absolute right-48 top-4 hidden md:block">
          <span style={{ color: "#6B2468", fontSize: "28px" }}>✦</span>
        </div>
        <div className="absolute right-20 bottom-16 hidden md:block">
          <span style={{ color: "#00989D", fontSize: "16px" }}>~</span>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
            style={{ backgroundColor: "rgba(252,195,62,0.15)" }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FCC33E" }} />
            <span className="text-sm font-medium" style={{ color: "#2B3442" }}>
              Ressources pour l&apos;engagement des jeunes
            </span>
          </div>

          {/* Main heading */}
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1]" style={{ color: "#2B3442" }}>
              Des outils
            </h1>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mt-1">
              <span className="relative inline-block" style={{ color: "#00989D" }}>
                qui donnent
                <span className="absolute bottom-1 left-0 right-0 h-2 -z-10 rounded" style={{ backgroundColor: "rgba(252,195,62,0.35)" }} />
              </span>
            </h1>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mt-1" style={{ color: "#2B3442" }}>
              le pouvoir d&apos;agir
            </h1>

            {/* Cursive subtitle */}
            <p className="text-2xl sm:text-3xl mt-3" style={{
              fontFamily: "'Caveat', cursive",
              color: "#B8860B",
            }}>
              — aux jeunes comme aux équipes.
            </p>
          </div>

          {/* Description */}
          <div className="max-w-lg mt-8">
            <p className="text-base leading-relaxed" style={{ color: "rgba(43,52,66,0.7)" }}>
              Bienvenue dans la boîte à outils du <strong style={{ color: "#2B3442" }}>Laboratoire pédagogique Lit uP</strong>.
              Vous y trouverez des méthodes concrètes, testées sur le terrain, pour animer, libérer la parole,
              construire un collectif et accompagner les jeunes dans leurs projets.
            </p>
          </div>

          {/* Baseline */}
          <p className="mt-6 text-sm" style={{
            fontFamily: "'Caveat', cursive",
            color: "#00989D",
            fontSize: "18px",
          }}>
            Gratuite, ouverte, faite pour être partagée.
          </p>
        </div>
      </section>

      {/* Separator */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,152,157,0.2), transparent)" }} />

      {/* Par où commencer */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-lg mb-2" style={{
            fontFamily: "'Caveat', cursive",
            color: "#00989D",
          }}>
            Par où commencer ?
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "#2B3442" }}>
            Trois portes d&apos;entrée, <span style={{ color: "#00989D" }}>selon votre posture</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              num: "01",
              prefix: "Vous êtes",
              title: "un·e professionnel·le",
              desc: "Enseignant·e, conseiller·ère, éducateur·ice, formateur·ice. Accédez aux outils et ateliers pensés pour l'accompagnement structuré.",
              cta: "ENTRER",
              accent: "#00989D",
              bgCircle: "rgba(0,152,157,0.08)",
            },
            {
              num: "02",
              prefix: "Vous êtes",
              title: "pair·e aidant·e",
              desc: "Vous accompagnez vos pairs par l'expérience. Retrouvez les outils simples, éprouvés, pour faciliter la parole et l'action.",
              cta: "ENTRER",
              accent: "#FCC33E",
              bgCircle: "rgba(252,195,62,0.1)",
            },
            {
              num: "03",
              prefix: "Vous préférez",
              title: "explorer librement",
              desc: "Parcourez l'ensemble de la boîte sans filtre préalable. À vous de naviguer par étape, par objectif ou par clé d'engagement.",
              cta: "EXPLORER",
              accent: "#6B2468",
              bgCircle: "rgba(107,36,104,0.06)",
            },
          ].map((card) => (
            <Link
              key={card.num}
              href="/bao"
              className="group relative bg-white rounded-2xl p-7 border-2 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ borderColor: card.accent }}>
              {/* Decorative circle */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full"
                style={{ backgroundColor: card.bgCircle }} />

              <div className="relative z-10">
                <span className="text-2xl font-bold italic" style={{
                  fontFamily: "'Caveat', cursive",
                  color: card.accent,
                }}>
                  {card.num}
                </span>
                <h3 className="mt-2 text-sm" style={{ color: "rgba(43,52,66,0.55)" }}>
                  {card.prefix}
                </h3>
                <h3 className="text-xl font-bold" style={{ color: "#2B3442" }}>
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(43,52,66,0.6)" }}>
                  {card.desc}
                </p>
                <span className="inline-block mt-5 text-xs font-bold tracking-widest group-hover:translate-x-1 transition-transform"
                  style={{ color: card.accent }}>
                  {card.cta} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-t border-b" style={{ borderColor: "rgba(43,52,66,0.08)" }}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap justify-center gap-8 sm:gap-16">
          {[
            { value: "30", label: "outils référencés" },
            { value: "9", label: "clés d'engagement" },
            { value: "10", label: "étapes de parcours" },
            { value: "6", label: "parcours guidés" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold" style={{ color: "#00989D" }}>{stat.value}</span>
              <span className="text-sm" style={{ color: "rgba(43,52,66,0.5)" }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA parcours */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="rounded-2xl p-8 sm:p-12 text-center" style={{ backgroundColor: "#2B3442" }}>
          <h2 className="text-2xl font-bold" style={{ color: "white" }}>
            Vous ne savez pas par où commencer ?
          </h2>
          <p className="mt-3 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            Nos parcours guidés vous accompagnent pas à pas, de la première rencontre
            à l&apos;autonomie du groupe.
          </p>
          <Link href="/parcours"
            className="inline-block mt-6 px-6 py-3 font-bold rounded-full transition-colors hover:opacity-90"
            style={{ backgroundColor: "#FCC33E", color: "#2B3442" }}>
            Découvrir les parcours →
          </Link>
        </div>
      </section>
    </>
  );
}
