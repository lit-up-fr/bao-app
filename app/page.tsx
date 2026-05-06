import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#2B3442" }}>
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-15" style={{ backgroundColor: "#FCC33E", filter: "blur(80px)" }} />
          <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full opacity-20" style={{ backgroundColor: "#00989D", filter: "blur(100px)" }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase mb-6" style={{ color: "#FCC33E" }}>
            Laboratoire pédagogique Lit uP
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight" style={{ color: "white" }}>
            Des outils qui donnent le pouvoir d&apos;agir
          </h1>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mt-2" style={{ color: "#FCC33E" }}>
            aux jeunes comme aux équipes.
          </h1>
          <p className="mt-6 text-lg max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
            Des méthodes concrètes, testées sur le terrain, pour animer, libérer la parole,
            construire un collectif et accompagner les jeunes dans leurs projets.
          </p>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Gratuite, ouverte, faite pour être partagée.
          </p>
        </div>
      </section>

      {/* 3 portes */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { num: "01", title: "Professionnel·le", desc: "Enseignant·e, conseiller·ère, éducateur·ice, formateur·ice. Accédez aux outils pensés pour l'accompagnement structuré.", accent: "#00989D" },
            { num: "02", title: "Pair·e aidant·e", desc: "Vous accompagnez vos pairs par l'expérience. Retrouvez les outils simples, éprouvés, pour faciliter la parole et l'action.", accent: "#FCC33E" },
            { num: "03", title: "Explorer librement", desc: "Parcourez l'ensemble de la boîte sans filtre préalable. Naviguez par étape, par objectif ou par clé d'engagement.", accent: "#6B2468" },
          ].map((card) => (
            <Link key={card.num} href="/bao"
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border transition-all duration-300 hover:-translate-y-1"
              style={{ borderColor: "rgba(43,52,66,0.06)" }}>
              <span className="text-xs font-bold tracking-wider" style={{ color: card.accent }}>{card.num}</span>
              <h3 className="mt-2 text-lg font-bold transition-colors" style={{ color: "#2B3442" }}>{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(43,52,66,0.55)" }}>{card.desc}</p>
              <span className="inline-block mt-4 text-sm font-semibold group-hover:translate-x-1 transition-transform" style={{ color: "#00989D" }}>
                Entrer →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "30", label: "outils référencés" },
            { value: "9", label: "clés d'engagement" },
            { value: "10", label: "étapes de parcours" },
            { value: "6", label: "parcours guidés" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl sm:text-4xl font-bold" style={{ color: "#00989D" }}>{stat.value}</div>
              <div className="text-sm mt-1" style={{ color: "rgba(43,52,66,0.45)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="rounded-2xl p-8 sm:p-12 text-center" style={{ backgroundColor: "#2B3442" }}>
          <h2 className="text-2xl font-bold" style={{ color: "white" }}>
            Vous ne savez pas par où commencer ?
          </h2>
          <p className="mt-3 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            Nos parcours guidés vous accompagnent pas à pas, de la première rencontre
            à l&apos;autonomie du groupe.
          </p>
          <Link href="/parcours"
            className="inline-block mt-6 px-6 py-3 font-bold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: "#FCC33E", color: "#2B3442" }}>
            Découvrir les parcours
          </Link>
        </div>
      </section>
    </>
  );
}
