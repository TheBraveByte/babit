const HOW_TO_READ = [
  {
    title: "Principal",
    body: "A person with authority, such as Yusuf Akinleye, Operations Lead.",
  },
  {
    title: "Grant",
    body: "A signed permission ticket with a scope, capabilities and an expiry. BAL-998258 is the root grant.",
  },
  {
    title: "Delegation",
    body: "A principal or agent hands a narrower slice to a subject. Each child carries the parent's signature.",
  },
  {
    title: "Chain check",
    body: "Revoke or tamper with any link and the whole subtree below it fails verification.",
  },
];

export function SectionAuthorityChain() {
  return (
    <section id="authority" className="dark-section relative overflow-hidden section-y-lg">
      <div className="absolute inset-0 bg-dot-subtle pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 70% 50%, rgba(45, 212, 191, 0.06), transparent 70%)",
        }}
      />
      <div className="container-babit relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: heading + how to read it */}
          <div className="space-y-8">
            <div>
              <p className="type-eyebrow mb-4" style={{ color: "var(--brand-accent)" }}>
                Authority
              </p>
              <h2 className="type-h2" style={{ color: "var(--dark-section-fg)" }}>
                Every action traces back to a person.
              </h2>
              <p className="type-lead mt-5" style={{ color: "var(--dark-section-muted)" }}>
                A principal authorizes an agent, which can hand a narrower slice to a sub-agent.
                Revoke a grant and every grant beneath it goes dark.
              </p>
            </div>

            <div
              className="rounded-babit-md p-5 space-y-4"
              style={{
                backgroundColor: "var(--dark-section-surface)",
                border: "1px solid var(--dark-section-border)",
              }}
            >
              <div
                className="flex items-center justify-between pb-3"
                style={{ borderBottom: "1px solid var(--dark-section-border)" }}
              >
                <span className="type-eyebrow" style={{ color: "var(--dark-section-muted)" }}>
                  How to read it
                </span>
                <span className="font-mono text-[11px]" style={{ color: "var(--dark-section-fg)" }}>
                  Live delegation data
                </span>
              </div>
              <ul className="space-y-4" style={{ color: "var(--dark-section-muted)" }}>
                {HOW_TO_READ.map((item, i) => (
                  <li key={i} className="space-y-1">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "var(--dark-section-fg)" }}
                    >
                      {item.title}
                    </span>
                    <p className="text-sm">{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: real delegations screenshot */}
          <div
            className="rounded-babit-md overflow-hidden"
            style={{
              backgroundColor: "var(--dark-section-bg)",
              border: "1px solid var(--dark-section-border)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--dark-section-border)" }}
            >
              <span className="type-eyebrow" style={{ color: "var(--dark-section-muted)" }}>
                Delegation grants
              </span>
              <span className="font-mono text-[11px]" style={{ color: "var(--dark-section-fg)" }}>
                Brave Byte Labs
              </span>
            </div>

            <img
              src="/dashboard-shots/delegations.png"
              alt="Babit Delegations dashboard showing principal to subject grant relationships"
              className="w-full"
            />

            <p className="px-5 py-4 text-xs" style={{ color: "var(--dark-section-muted)" }}>
              A root principal delegates to agents, which may delegate further to sub-agents. Each
              box is a live grant; the labels show role, subject, capabilities and scope.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
