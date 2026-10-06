import React from "react";
import "./HomePage.css";

type NavItem = {
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  { label: "Início", icon: "⌂" },
  { label: "Checklist", icon: "✓" },
  { label: "Averbação", icon: "▣" },
  { label: "SM", icon: "◉" },
  { label: "Controle", icon: "▥" },
  { label: "Escala", icon: "▤" },
  { label: "Lista de Presença", icon: "◎" },
  { label: "Rotas", icon: "⌖" },
];

function ProgressRing({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="progressItem">
      <div
        className="progressRing"
        style={{
          background: `conic-gradient(#168c5a ${value}%, #e5e0d6 0)`,
        }}
      >
        <div className="progressRingCenter">
          <strong>{value}%</strong>
        </div>
      </div>

      <div className="progressText">
        <strong>{label}</strong>
        <span>OPERAÇÃO ATIVA</span>
      </div>
    </div>
  );
}

function DonutChart() {
  return (
    <div className="donutWrapper">
      <div className="donutChart">
        <div className="donutCenter">
          <strong>42</strong>
          <span>ROTAS</span>
        </div>
      </div>

      <div className="donutLegend">
        <div>
          <i className="legendRed" />
          <span>SUDESTE</span>
          <b>14</b>
          <small>33%</small>
        </div>

        <div>
          <i className="legendCyan" />
          <span>SUL</span>
          <b>9</b>
          <small>21%</small>
        </div>

        <div>
          <i className="legendGreen" />
          <span>NORDESTE</span>
          <b>7</b>
          <small>17%</small>
        </div>

        <div>
          <i className="legendOrange" />
          <span>CENTRO-OESTE</span>
          <b>6</b>
          <small>14%</small>
        </div>

        <div>
          <i className="legendBlue" />
          <span>NORTE</span>
          <b>6</b>
          <small>14%</small>
        </div>
      </div>
    </div>
  );
}

function BrazilMap() {
  return (
    <div className="mapVisual">
      <div className="mapAtmosphere" />

      <svg
        className="brazilSvg"
        viewBox="0 0 500 560"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="landGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2b8057" />
            <stop offset="50%" stopColor="#78a946" />
            <stop offset="100%" stopColor="#d19b35" />
          </linearGradient>

          <filter id="mapShadow">
            <feDropShadow
              dx="0"
              dy="12"
              stdDeviation="12"
              floodOpacity=".45"
            />
          </filter>

          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          className="brazilLand"
          filter="url(#mapShadow)"
          d="
          M170 42
          L230 28
          L276 47
          L325 43
          L359 67
          L388 67
          L420 96
          L408 126
          L437 153
          L420 183
          L445 215
          L425 244
          L440 276
          L415 304
          L401 344
          L371 362
          L352 405
          L320 423
          L299 462
          L260 484
          L238 518
          L201 500
          L174 467
          L140 459
          L119 424
          L91 408
          L80 373
          L56 349
          L72 317
          L58 282
          L78 251
          L67 218
          L92 190
          L83 154
          L112 128
          L105 98
          L139 82
          Z"
        />

        <path
          className="routeLine routeOne"
          d="M116 383 C170 325 192 285 238 242 S307 160 370 125"
        />

        <path
          className="routeLine routeTwo"
          d="M96 335 C156 350 201 373 270 361 S337 319 390 270"
        />

        <path
          className="routeLine routeThree"
          d="M150 122 C182 177 228 212 271 260 S337 362 316 432"
        />

        <path
          className="routeLine routeFour"
          d="M238 242 C291 230 326 246 390 270"
        />

        {[
          { x: 116, y: 383, name: "Porto Alegre" },
          { x: 96, y: 335, name: "S. Paulo/Rio" },
          { x: 238, y: 242, name: "Brasília" },
          { x: 316, y: 432, name: "Salvador" },
          { x: 370, y: 125, name: "Fortaleza" },
          { x: 390, y: 270, name: "Recife" },
          { x: 150, y: 122, name: "Manaus" },
          { x: 184, y: 92, name: "Belém" },
        ].map((point) => (
          <g key={point.name} className="mapPoint">
            <circle cx={point.x} cy={point.y} r="12" />
            <circle cx={point.x} cy={point.y} r="5" />
            <text x={point.x + 13} y={point.y - 10}>
              {point.name}
            </text>
          </g>
        ))}
      </svg>

      <div className="mapControls">
        <button>⌖</button>
        <button>◈</button>
        <button>＋</button>
        <button>−</button>
        <button>➤</button>
      </div>

      <div className="mapStatus">
        <strong>●</strong>
        <div>
          <b>8 ROTAS ATIVAS</b>
          <span>Sistema em operação</span>
        </div>
      </div>
    </div>
  );
}

function TelemetryChart() {
  return (
    <div className="telemetryChart">
      <svg viewBox="0 0 760 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="redArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e52d37" stopOpacity=".35" />
            <stop offset="100%" stopColor="#e52d37" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00c987" stopOpacity=".32" />
            <stop offset="100%" stopColor="#00c987" stopOpacity="0" />
          </linearGradient>

          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[45, 95, 145, 195, 245].map((y) => (
          <line
            key={y}
            x1="55"
            x2="735"
            y1={y}
            y2={y}
            className="chartGrid"
          />
        ))}

        {[55, 190, 325, 460, 595, 735].map((x) => (
          <line
            key={x}
            x1={x}
            x2={x}
            y1="25"
            y2="260"
            className="chartGrid"
          />
        ))}

        <path
          d="
          M55 205
          C100 184 125 190 155 160
          S225 140 255 170
          S320 194 355 118
          S420 76 455 112
          S515 142 545 94
          S625 58 655 84
          S700 112 735 72
          L735 260
          L55 260 Z"
          fill="url(#redArea)"
        />

        <path
          d="
          M55 225
          C100 211 125 200 155 180
          S225 166 255 192
          S320 214 355 148
          S420 111 455 136
          S515 167 545 124
          S625 95 655 118
          S700 150 735 120
          L735 260
          L55 260 Z"
          fill="url(#greenArea)"
        />

        <path
          d="
          M55 205
          C100 184 125 190 155 160
          S225 140 255 170
          S320 194 355 118
          S420 76 455 112
          S515 142 545 94
          S625 58 655 84
          S700 112 735 72"
          className="chartRed"
          filter="url(#lineGlow)"
        />

        <path
          d="
          M55 225
          C100 211 125 200 155 180
          S225 166 255 192
          S320 214 355 148
          S420 111 455 136
          S515 167 545 124
          S625 95 655 118
          S700 150 735 120"
          className="chartGreen"
          filter="url(#lineGlow)"
        />

        {[
          [55, 205],
          [155, 160],
          [255, 170],
          [355, 118],
          [455, 112],
          [545, 94],
          [655, 84],
          [735, 72],
        ].map(([x, y], index) => (
          <circle
            key={`r-${index}`}
            cx={x}
            cy={y}
            r="5"
            className="chartPointRed"
          />
        ))}

        {[
          [55, 225],
          [155, 180],
          [255, 192],
          [355, 148],
          [455, 136],
          [545, 124],
          [655, 118],
          [735, 120],
        ].map(([x, y], index) => (
          <circle
            key={`g-${index}`}
            cx={x}
            cy={y}
            r="5"
            className="chartPointGreen"
          />
        ))}

        <text x="30" y="48">80</text>
        <text x="30" y="98">60</text>
        <text x="30" y="148">40</text>
        <text x="30" y="198">20</text>
        <text x="35" y="250">0</text>

        <text x="45" y="285">00h</text>
        <text x="175" y="285">06h</text>
        <text x="310" y="285">12h</text>
        <text x="445" y="285">18h</text>
        <text x="705" y="285">24h</text>
      </svg>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  suffix,
  trend,
  danger,
}: {
  icon: string;
  title: string;
  value: string;
  suffix?: string;
  trend?: string;
  danger?: boolean;
}) {
  return (
    <div className="statCard">
      <div className="statIcon">{icon}</div>

      <div className="statContent">
        <span>{title}</span>

        <strong>
          {value} {suffix && <small>{suffix}</small>}
        </strong>

        {trend && (
          <em className={danger ? "danger" : ""}>
            {danger ? "↓" : "↑"} {trend}
          </em>
        )}

        <small>vs. mês anterior</small>
      </div>
    </div>
  );
}

function MiniOperationalCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="miniOperational">
      <div className="miniIcon">{icon}</div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="homePage">
      {/* =========================================================
          TOPBAR
      ========================================================= */}

      <header className="topbar">
        <div className="brandArea">
          <div className="brandLogo">
            <span>♥</span>
          </div>

          <div className="brandText">
            <strong>Café Três Corações</strong>
            <span>SEGURANÇA　·　LOGÍSTICA　·　RESULTADOS</span>
          </div>

          <div className="brandDivider" />

          <div className="systemTitle">
            <strong>SISTEMA OPERACIONAL</strong>
            <span>CONTROLE TÁTICO　·　GESTÃO　·　RESULTADOS</span>
          </div>
        </div>

        <div className="topActions">
          <div className="searchBox">
            <span>⌕</span>
            <input placeholder="Buscar no sistema..." />
          </div>

          <button className="notification">
            ♧
            <b>3</b>
          </button>

          <div className="userArea">
            <div className="userAvatar">JD</div>
            <div>
              <strong>Jefferson Dias</strong>
              <span>Administrador</span>
            </div>
          </div>

          <button className="menuButton">☷</button>

          <div className="clock">
            <span>26 SET. 2026</span>
            <strong>01:44</strong>
          </div>
        </div>
      </header>

      <div className="contentLayout">
        {/* =======================================================
            SIDEBAR
        ======================================================= */}

        <aside className="sidebar">
          <nav>
            {navItems.map((item, index) => (
              <button
                key={item.label}
                className={`navItem ${index === 0 ? "active" : ""}`}
              >
                <span className="navIcon">{item.icon}</span>
                <span>{item.label}</span>
                <b>›</b>
              </button>
            ))}
          </nav>

          <div className="coffeeCard">
            <div className="coffeeOverlay">
              <strong>
                Café
                <br />
                Três Corações
              </strong>

              <span>Mais que café,<br />movemos o Brasil.</span>
            </div>

            <div className="coffeeCup">
              ☕
            </div>
          </div>
        </aside>

        {/* =======================================================
            MAIN
        ======================================================= */}

        <main className="mainContent">
          {/* HERO */}

          <section className="hero">
            <div className="heroBackground">
              <div className="mountain" />
              <div className="sun" />
              <div className="warehouse" />
              <div className="road" />
              <div className="truck truckOne">▰</div>
              <div className="truck truckTwo">▰</div>
            </div>

            <div className="heroContent">
              <span className="eyebrow">✦ LOGÍSTICA OPERACIONAL</span>

              <h1>
                LOGÍSTICA
                <br />
                <b>ONIPRESENTE</b>
              </h1>

              <p>
                Conectando regiões, pessoas e oportunidades com segurança,
                eficiência e o sabor do Brasil em cada rota operada de norte a
                sul.
              </p>

              <div className="heroButtons">
                <button className="primaryButton">
                  <span>⌖</span>
                  LANÇAR NOVA ROTA
                  <b>›</b>
                </button>

                <button className="secondaryButton">
                  <span>▤</span>
                  VER PROTOCOLOS
                  <b>›</b>
                </button>
              </div>
            </div>

            <div className="heroRight">
              <div className="heroBrand">
                <span>♥</span>
                <strong>
                  Café
                  <br />
                  Três Corações
                </strong>
              </div>

              <div className="heroMapBox">
                <div className="heroBrazil">♧</div>
                <div className="heroNetwork">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>

              <div className="heroBenefits">
                <div>
                  <b>◈</b>
                  <span>
                    + EFICIÊNCIA
                    <small>NAS ROTAS</small>
                  </span>
                </div>

                <div>
                  <b>♢</b>
                  <span>
                    + SEGURANÇA
                    <small>NAS OPERAÇÕES</small>
                  </span>
                </div>

                <div>
                  <b>▣</b>
                  <span>
                    + RESULTADOS
                    <small>EM TODAS AS REGIÕES</small>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* LOWER AREA */}

          <section className="dashboardArea">
            {/* MAP */}

            <div className="panel mapPanel">
              <div className="panelHeader">
                <div>
                  <strong>▣　ROTAS EM TEMPO REAL</strong>
                  <span>ACOMPANHAMENTO DE TODA A OPERAÇÃO</span>
                </div>
              </div>

              <BrazilMap />
            </div>

            {/* STATS */}

            <div className="statsColumn">
              <StatCard
                icon="▣"
                title="TOTAL DE ROTAS"
                value="42"
                trend="12%"
              />

              <StatCard
                icon="◒"
                title="DISTÂNCIA PERCORRIDA"
                value="12.480"
                suffix="km"
                trend="8%"
              />

              <StatCard
                icon="◷"
                title="TEMPO MÉDIO"
                value="8h 24min"
                trend="6%"
                danger
              />

              <div className="routeStatus">
                <div>
                  <i className="greenDot" />
                  Ativa:
                  <strong>32</strong>
                </div>

                <div>
                  <i className="yellowDot" />
                  Carregada:
                  <strong>5</strong>
                </div>

                <div>
                  <i className="blueDot" />
                  Descarga:
                  <strong>3</strong>
                </div>

                <div>
                  <i className="redDot" />
                  Parada:
                  <strong>2</strong>
                </div>
              </div>
            </div>

            {/* TELEMETRY */}

            <div className="panel telemetryPanel">
              <div className="panelHeader">
                <div>
                  <strong>▣　TELEMETRIA TÁTICA</strong>
                  <span>FLUXO DE MOVIMENTAÇÃO 24H</span>
                </div>
              </div>

              <TelemetryChart />

              <div className="telemetryCards">
                <MiniOperationalCard
                  icon="▰"
                  title="VEÍCULOS EM ROTA"
                  value="32"
                />

                <MiniOperationalCard
                  icon="▤"
                  title="EM PÁTIO"
                  value="8"
                />

                <MiniOperationalCard
                  icon="▣"
                  title="CARREGANDO"
                  value="6"
                />

                <MiniOperationalCard
                  icon="⇩"
                  title="DESCARREGANDO"
                  value="4"
                />
              </div>
            </div>

            {/* RIGHT PANEL */}

            <aside className="rightDashboard">
              <div className="panel operationPanel">
                <div className="operationTitle">
                  <div>
                    <span>♥</span>
                    <strong>OPERAÇÃO GLOBAL</strong>
                  </div>

                  <b>ONLINE</b>
                </div>

                <ProgressRing
                  value={100}
                  label="COBERTURA ATIVA DE PÁTIO E FROTA"
                />

                <ProgressRing
                  value={98}
                  label="PROCESSAMENTO DA OPERAÇÃO"
                />

                <div className="allocationLine">
                  <div className="allocationIcon">♟</div>
                  <div>
                    <strong>ALOCAÇÃO DE ATIVOS</strong>
                    <span>DISTRIBUIÇÃO DA FROTA POR REGIÃO</span>
                  </div>
                  <b>⌖</b>
                </div>
              </div>

              <div className="panel allocationPanel">
                <div className="panelHeader">
                  <div>
                    <strong>♥　ALOCAÇÃO DE ATIVOS</strong>
                    <span>DISTRIBUIÇÃO DA FROTA POR REGIÃO</span>
                  </div>
                </div>

                <DonutChart />

                <button className="detailsButton">
                  VER DETALHAMENTO
                  <b>›</b>
                </button>
              </div>
            </aside>
          </section>
        </main>
      </div>

      {/* FOOTER */}

      <footer className="footer">
        <strong>Café Três Corações</strong>
        <i />
        <span>Do campo para o Brasil, com segurança.</span>
        <div>♡</div>
      </footer>
    </div>
  );
}
