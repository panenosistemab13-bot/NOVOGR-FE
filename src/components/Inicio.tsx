import React, { useMemo, useState } from "react";
import "./Inicio.css";

type Candidate = {
  name: string;
  party: string;
  percentage: string;
  color: string;
};

type StateResult = {
  uf: string;
  leader: string;
  party: string;
  valid: string;
  counted: string;
  color: string;
};

const candidates: Candidate[] = [
  {
    name: "Flavio Bolsonaro",
    party: "PL",
    percentage: "48,47%",
    color: "#ff7418",
  },
  {
    name: "Lula",
    party: "PT",
    percentage: "43,49%",
    color: "#1677ff",
  },
];

const states: StateResult[] = [
  ["AC", "Flavio Bolsonaro", "PL", "64,62%", "98,59%", "#ff7418"],
  ["AL", "Lula", "PT", "56,78%", "59,75%", "#1677ff"],
  ["AM", "Flavio Bolsonaro", "PL", "46,79%", "87,24%", "#ff7418"],
  ["AP", "Lula", "PT", "46,19%", "86,68%", "#1677ff"],
  ["BA", "Lula", "PT", "64,85%", "70,54%", "#1677ff"],
  ["CE", "Lula", "PT", "61,82%", "71,49%", "#1677ff"],
  ["DF", "Flavio Bolsonaro", "PL", "51,31%", "99,74%", "#ff7418"],
  ["ES", "Flavio Bolsonaro", "PL", "54,85%", "99,32%", "#ff7418"],
  ["GO", "Flavio Bolsonaro", "PL", "53,94%", "93,21%", "#ff7418"],
  ["MA", "Lula", "PT", "50,12%", "94,76%", "#1677ff"],
  ["MG", "Flavio Bolsonaro", "PL", "48,85%", "84,51%", "#ff7418"],
  ["MS", "Flavio Bolsonaro", "PL", "53,73%", "99,51%", "#ff7418"],
  ["MT", "Flavio Bolsonaro", "PL", "65,32%", "97,31%", "#ff7418"],
  ["PA", "Lula", "PT", "48,45%", "86,60%", "#1677ff"],
  ["PB", "Lula", "PT", "61,20%", "98,40%", "#1677ff"],
  ["PE", "Lula", "PT", "62,54%", "79,50%", "#1677ff"],
  ["PI", "Lula", "PT", "70,29%", "96,54%", "#1677ff"],
  ["PR", "Flavio Bolsonaro", "PL", "59,95%", "99,20%", "#ff7418"],
  ["RJ", "Flavio Bolsonaro", "PL", "53,34%", "77,56%", "#ff7418"],
  ["RN", "Lula", "PT", "59,75%", "86,24%", "#1677ff"],
  ["RO", "Flavio Bolsonaro", "PL", "67,40%", "98,89%", "#ff7418"],
  ["RR", "Flavio Bolsonaro", "PL", "71,37%", "98,29%", "#ff7418"],
  ["RS", "Flavio Bolsonaro", "PL", "55,59%", "98,14%", "#ff7418"],
  ["SC", "Flavio Bolsonaro", "PL", "66,60%", "95,84%", "#ff7418"],
  ["SE", "Lula", "PT", "62,33%", "94,72%", "#1677ff"],
  ["SP", "Flavio Bolsonaro", "PL", "52,09%", "91,76%", "#ff7418"],
  ["TO", "Flavio Bolsonaro", "PL", "50,41%", "99,20%", "#ff7418"],
].map(
  ([uf, leader, party, valid, counted, color]) => ({
    uf,
    leader,
    party,
    valid,
    counted,
    color,
  })
);

// MANTENDO A LÓGICA DO MAPA EXISTENTE
const mapStates = [
  { uf: "RR", x: 48, y: 5 },
  { uf: "AP", x: 64, y: 8 },
  { uf: "AM", x: 36, y: 19 },
  { uf: "PA", x: 55, y: 23 },
  { uf: "AC", x: 23, y: 30 },
  { uf: "RO", x: 35, y: 33 },
  { uf: "TO", x: 51, y: 35 },
  { uf: "MA", x: 67, y: 26 },
  { uf: "PI", x: 67, y: 35 },
  { uf: "CE", x: 79, y: 27 },
  { uf: "RN", x: 86, y: 28 },
  { uf: "PB", x: 87, y: 34 },
  { uf: "PE", x: 83, y: 39 },
  { uf: "AL", x: 88, y: 43 },
  { uf: "SE", x: 87, y: 48 },
  { uf: "BA", x: 73, y: 48 },
  { uf: "MT", x: 46, y: 47 },
  { uf: "GO", x: 55, y: 54 },
  { uf: "DF", x: 61, y: 52 },
  { uf: "MG", x: 64, y: 61 },
  { uf: "ES", x: 77, y: 61 },
  { uf: "MS", x: 45, y: 63 },
  { uf: "RJ", x: 73, y: 70 },
  { uf: "SP", x: 57, y: 69 },
  { uf: "PR", x: 55, y: 78 },
  { uf: "SC", x: 60, y: 86 },
  { uf: "RS", x: 55, y: 94 },
];

function BrazilMap() {
  const [active, setActive] = useState<string | null>(null);

  const resultMap = useMemo(() => {
    return new Map(states.map((state) => [state.uf, state]));
  }, []);

  return (
    <div className="map-stage">
      <div className="map-silhouette">
        {mapStates.map((state) => {
          const result = resultMap.get(state.uf);
          const isActive = active === state.uf;

          return (
            <button
              key={state.uf}
              className={`map-state ${isActive ? "active" : ""}`}
              style={{
                left: `${state.x}%`,
                top: `${state.y}%`,
                background: result?.color,
              }}
              onMouseEnter={() => setActive(state.uf)}
              onMouseLeave={() => setActive(null)}
            >
              {state.uf}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Header() {
  const menu = [
    ["INÍCIO", "PAINEL GERAL"],
    ["ISCAS", "MAPA GERAL"],
    ["BLITZ", "CHECK LISTS"],
    ["CREDENCIADOS", "CADASTRO"],
    ["CHECKLIST", "CONFERÊNCIAS"],
    ["AVERBAÇÃO", "SERVIÇOS"],
    ["SM", "MONITORAMENTO"],
    ["PRÉ ALERTA", "ISCAS / ALERTAS"],
    ["ESCALA 3C", "ROTAPA"],
    ["CALENDÁRIO", "PROGRAMAÇÃO"],
    ["ROTAS", "POR"],
  ];

  return (
    <header className="top-header">
      <div className="brand">
        <div className="brand-logo">BN</div>
        <div className="brand-text">
          <span>PRESIDENTE</span>
          <strong>GR</strong>
        </div>
      </div>

      <nav className="main-navigation">
        {menu.map(([title, subtitle], index) => (
          <button key={title} className={`nav-item ${index === 0 ? "selected" : ""}`}>
            <strong>{title}</strong>
            <small>{subtitle}</small>
          </button>
        ))}
      </nav>

      <div className="header-right">
        <strong>02:13:06</strong>
      </div>
    </header>
  );
}

function NationalProgress() {
  return (
    <div className="national-card glass-card">
      <div className="progress-ring">
        <div className="progress-ring-inner">85%</div>
      </div>
      <div className="national-content">
        <span>SEÇÕES APURADAS — BRASIL</span>
        <strong>84,96%</strong>
        <div className="progress-bar">
          <div style={{ width: "84.96%" }} />
        </div>
      </div>
    </div>
  );
}

function Candidates() {
  return (
    <div className="candidate-card glass-card">
      {candidates.map((candidate) => (
        <div className="candidate" key={candidate.name}>
          <div className="candidate-avatar">{candidate.name[0]}</div>
          <div className="candidate-name">
            <i style={{ background: candidate.color }} />
            <strong>{candidate.name}</strong>
          </div>
          <strong className="candidate-percentage">{candidate.percentage}</strong>
        </div>
      ))}
    </div>
  );
}

function StateTable() {
  return (
    <div className="state-table glass-card">
      <div className="table-body">
        {states.map((state) => (
          <div className="table-row" key={state.uf}>
            <strong>{state.uf}</strong>
            <div className="leader-cell">
              <i style={{ background: state.color }} />
              <span>{state.leader}</span>
            </div>
            <strong>{state.valid}</strong>
            <span className="counted">{state.counted}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Inicio() {
  return (
    <div className="dashboard">
      <Header />
      <main className="dashboard-content">
        <section className="hero-title glass-card">
          <h1>BRASIL</h1>
        </section>
        <NationalProgress />
        <section className="dashboard-grid">
          <section className="map-container glass-card">
            <BrazilMap />
          </section>
          <aside className="right-panel">
            <Candidates />
            <StateTable />
          </aside>
        </section>
      </main>
    </div>
  );
}
