import React from 'react';

import {
  Home,
  ClipboardCheck,
  FileText,
  Settings2,
  BarChart3,
  CalendarDays,
  Users,
  MapPinned,
  Search,
  Bell,
  ChevronRight,
  Clock3,
} from 'lucide-react';

interface AppShellProps {
  activeTab: string;
  onNavigate: (tabId: string) => void;
  children: React.ReactNode;
}

const navigation = [
  {
    id: 'inicio',
    label: 'Início',
    icon: Home,
  },
  {
    id: 'checklist',
    label: 'Checklist',
    icon: ClipboardCheck,
  },
  {
    id: 'averbacao',
    label: 'Averbação',
    icon: FileText,
  },
  {
    id: 'sm',
    label: 'SM',
    icon: Settings2,
  },
  {
    id: 'controle',
    label: 'Controle',
    icon: BarChart3,
  },
  {
    id: 'escala',
    label: 'Escala',
    icon: CalendarDays,
  },
  {
    id: 'lista-presenca',
    label: 'Lista de Presença',
    icon: Users,
  },
  {
    id: 'rotas',
    label: 'Rotas',
    icon: MapPinned,
  },
];

export default function AppShell({
  activeTab,
  onNavigate,
  children,
}: AppShellProps) {
  const currentDate = new Date();

  const time = currentDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const date = currentDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#e8e2d8] text-[#302b29]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className="
          h-[82px]
          w-full
          flex
          items-center
          gap-6
          px-7
          border-b
          border-[#5d493d]/10
          bg-[#f3eee5]/95
          backdrop-blur-xl
          shadow-[0_8px_30px_rgba(65,48,40,.07)]
          relative
          z-50
        "
      >

        {/* MARCA */}

        <div className="w-[285px] shrink-0 flex items-center gap-3">

          <div
            className="
              w-12
              h-12
              rounded-2xl
              wine-gradient
              flex
              items-center
              justify-center
              shadow-[0_8px_22px_rgba(117,29,43,.25)]
            "
          >
            <span className="text-white text-xl font-bold">
              3C
            </span>
          </div>

          <div className="leading-none">

            <div className="text-[15px] font-bold tracking-[0.16em] text-[#332c29]">
              SISTEMA OPERACIONAL
            </div>

            <div className="mt-1 text-[9px] tracking-[0.20em] text-[#8a7e76]">
              CONTROLE • GESTÃO • RESULTADOS
            </div>

          </div>

        </div>

        {/* BUSCA */}

        <div className="flex-1 max-w-[700px]">

          <div
            className="
              h-[46px]
              w-full
              rounded-2xl
              bg-white/75
              border
              border-[#5d493d]/10
              shadow-inner
              flex
              items-center
              px-4
              gap-3
            "
          >

            <Search
              size={18}
              className="text-[#8a7d74]"
            />

            <input
              className="
                bg-transparent
                outline-none
                border-none
                w-full
                text-sm
                text-[#3d3632]
                placeholder:text-[#a49a91]
              "
              placeholder="Buscar no sistema..."
            />

          </div>

        </div>

        {/* AÇÕES */}

        <div className="ml-auto flex items-center gap-5">

          <button
            className="
              relative
              w-11
              h-11
              rounded-xl
              flex
              items-center
              justify-center
              bg-white/65
              border
              border-[#5d493d]/10
            "
          >

            <Bell
              size={19}
              className="text-[#655b55]"
            />

            <span
              className="
                absolute
                right-1
                top-1
                min-w-[17px]
                h-[17px]
                px-1
                rounded-full
                bg-[#751d2b]
                text-white
                text-[9px]
                font-bold
                flex
                items-center
                justify-center
              "
            >
              3
            </span>

          </button>

          {/* PERFIL */}

          <div className="flex items-center gap-3">

            <div
              className="
                w-11
                h-11
                rounded-full
                bg-[#751d2b]
                flex
                items-center
                justify-center
                text-white
                font-bold
                shadow-md
              "
            >
              JD
            </div>

            <div className="leading-tight">

              <div className="text-sm font-semibold">
                Jefferson Dias
              </div>

              <div className="text-[11px] text-[#887d75]">
                Administrador
              </div>

            </div>

          </div>

          {/* RELÓGIO */}

          <div
            className="
              pl-5
              border-l
              border-[#5d493d]/10
              flex
              items-center
              gap-3
            "
          >

            <Clock3
              size={18}
              className="text-[#751d2b]"
            />

            <div className="leading-tight text-right">

              <div className="text-lg font-semibold tracking-tight">
                {time}
              </div>

              <div className="text-[10px] uppercase tracking-wider text-[#8d8178]">
                {date}
              </div>

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          CORPO
          ===================================================== */}

      <div className="flex h-[calc(100vh-82px)] w-full">

        {/* ===================================================
            SIDEBAR
            =================================================== */}

        <aside
          className="
            w-[245px]
            shrink-0
            h-full
            px-4
            py-5
            bg-[#eee8de]
            border-r
            border-[#5d493d]/10
            flex
            flex-col
          "
        >

          {/* MENU */}

          <nav className="flex flex-col gap-1.5">

            {navigation.map((item) => {

              const Icon = item.icon;

              const active =
                activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    group
                    w-full
                    h-[49px]
                    rounded-2xl
                    flex
                    items-center
                    gap-3
                    px-4
                    transition-all
                    duration-200
                    text-left
                    ${
                      active
                        ? `
                          wine-gradient
                          text-white
                          shadow-[0_9px_25px_rgba(117,29,43,.22)]
                        `
                        : `
                          text-[#5f5650]
                          hover:bg-white/70
                          hover:text-[#751d2b]
                        `
                    }
                  `}
                >

                  <Icon
                    size={19}
                    strokeWidth={active ? 2.3 : 1.8}
                  />

                  <span className="flex-1 text-[13px] font-medium">
                    {item.label}
                  </span>

                  <ChevronRight
                    size={15}
                    className={`
                      transition-transform
                      ${
                        active
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0'
                      }
                    `}
                  />

                </button>
              );

            })}

          </nav>

          {/* =================================================
              CARD INFERIOR
              ================================================= */}

          <div className="mt-auto">

            <div
              className="
                relative
                overflow-hidden
                h-[205px]
                rounded-[24px]
                bg-[#5a1723]
                shadow-[0_18px_40px_rgba(67,40,35,.20)]
              "
            >

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#3f0e17]
                  via-[#641722]/70
                  to-transparent
                "
              />

              <div className="absolute inset-0 p-5 flex flex-col justify-end">

                <div className="text-[10px] uppercase tracking-[0.22em] text-white/65">
                  OPERAÇÃO
                </div>

                <div className="mt-1 text-[25px] font-semibold leading-none text-white">
                  Integrada.
                </div>

                <div className="mt-1 text-[13px] text-white/75">
                  Resultados reais.
                </div>

                <div className="mt-4 flex items-center gap-2 text-[10px] text-white/60">
                  <span className="w-6 h-px bg-white/40" />
                  CAFÉ TRÊS CORAÇÕES
                </div>

              </div>

            </div>

          </div>

        </aside>

        {/* ===================================================
            CONTEÚDO
            =================================================== */}

        <main
          className="
            flex-1
            min-w-0
            min-h-0
            overflow-hidden
            p-5
            bg-[#e8e2d8]
          "
        >

          <div className="h-full w-full">
            {children}
          </div>

        </main>

      </div>

    </div>
  );
}
