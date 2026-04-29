import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#2B3442" }}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-litup-gold blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-litup-teal blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center">
          <p className="text-litup-gold font-semibold text-sm tracking-widest uppercase mb-6">
            Laboratoire pédagogique Lit uP
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
            Des outils qui donnent le pouvoir d&apos;agir
            <br />
            <span className="text-litup-gold">aux jeunes comme aux équipes.</span>
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
            Des méthodes concrètes, testées sur le terrain, pour animer, libérer la parole,
            construire un collectif et accompagner les jeunes dans leurs projets.
          </p>
          <p className="mt-2 text-sm text-white/50">
            Gratuite, ouverte, faite pour être partagée.
          </p>
        </div>
      </section>

      {/* 3 portes d'entrée */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              num: "01",
              title: "Professionnel·le",
              desc: "Enseignant·e, conseiller·ère, éducateur·ice, formateur·ice. Accédez aux outils pensés pour l'accompagnement structuré.",
              href: "/bao",
              accent: "#00989D",
            },
            {
              num: "02",
              title: "Pair·e aidant·e",
              desc: "Vous accompagnez vos pairs par l'expérience. Retrouvez les outils simples, éprouvés, pour faciliter la parole et l'action.",
              href: "/bao",
              accent: "#FCC33E",
            },
            {
              num: "03",
              title: "Explorer librement",
              desc: "Parcourez l'ensemble de la boîte sans filtre préalable. Naviguez par étape, par objectif ou par clé d'engagement.",
              href: "/bao",
              accent: "#6B2468",
            },
          ].map((card) => (
            <Link
              key={card.num}
              href={card.href}
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl 
                         border border-litup-dark/5 hover:border-litup-teal/30
                         transition-all duration-300 hover:-translate-y-1"
            >
              <span className="text-xs font-bold tracking-wider" style={{ color: card.accent }}>
                {card.num}
              </span>
              <h3 className="mt-2 text-lg font-bold text-litup-dark group-hover:text-litup-teal transition-colors">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-litup-dark/60 leading-relaxed">
                {card.desc}
              </p>
              <span className="inline-block mt-4 text-sm font-semibold text-litup-teal 
                               group-hover:translate-x-1 transition-transform">
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
              <div className="text-3xl sm:text-4xl font-bold text-litup-teal">
                {stat.value}
              </div>
              <div className="text-sm text-litup-dark/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA parcours */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-litup-dark rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-white">
            Vous ne savez pas par où commencer ?
          </h2>
          <p className="mt-3 text-white/60 max-w-lg mx-auto">
            Nos parcours guidés vous accompagnent pas à pas, de la première rencontre
            à l&apos;autonomie du groupe.
          </p>
          <Link
            href="/parcours"
            className="inline-block mt-6 px-6 py-3 bg-litup-gold text-litup-dark 
                       font-bold rounded-lg hover:bg-litup-gold/90 transition-colors"
          >
            Découvrir les parcours
          </Link>
        </div>
      </section>
    </>
  );
}
