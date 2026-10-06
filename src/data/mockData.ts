export interface KpiMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  trend: 'up' | 'down' | 'neutral';
  period: string;
}

export interface RegionalPerformance {
  id: string;
  rank: number;
  region: string;
  performance: number; // percentage e.g. 47.85
  varVsAnt: string;
  status: 'Acima da meta' | 'Dentro da meta' | 'Atenção' | 'Abaixo da meta';
  color: string;
}

export interface MapNode {
  id: string;
  city: string;
  state: string;
  xPercent: number; // 0-100 on canvas/SVG map
  yPercent: number;
  status: 'optimal' | 'warning' | 'critical' | 'normal';
  value: string;
  routesCount: number;
  compliance: number;
}

export interface FinancialMetric {
  label: string;
  value: string;
  varPercent: string;
  isPositive: boolean;
}

export interface OperationalAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
}

export interface ChecklistItem {
  id: string;
  sector: string;
  title: string;
  responsible: string;
  deadline: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  status: 'Concluído' | 'Em Andamento' | 'Pendente' | 'Atrasado';
  progress: number;
}

export interface OccurrenceItem {
  id: string;
  protocol: string;
  type: string;
  vehicle: string;
  driver: string;
  region: string;
  date: string;
  priority: 'Crítica' | 'Alta' | 'Média' | 'Baixa';
  status: 'Em Análise' | 'Concluída' | 'Aguardando Documentação' | 'Investigação';
  description: string;
  value: string;
}

export interface SmRecord {
  id: string;
  smCode: string;
  carrier: string;
  origin: string;
  destination: string;
  cargoType: string;
  value: string;
  region: string;
  status: 'Em Trânsito' | 'Concluído' | 'Pendente' | 'Atrasado';
  eta: string;
}

export interface PreAlertItem {
  id: string;
  code: string;
  time: string;
  region: string;
  severity: 'Crítico' | 'Moderado' | 'Informativo';
  description: string;
  vehicle: string;
  acknowledged: boolean;
}

export interface ShiftTeam {
  id: string;
  name: string;
  shift: string;
  supervisor: string;
  activeMembers: number;
  capacity: number;
  status: 'Disponível' | 'Em Operação' | 'Intervalo' | 'Troca de Turno';
  coverageRegion: string;
}

export interface CalendarEventItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  title: string;
  type: 'Operacional' | 'Reunião' | 'Inspeção' | 'Auditoria';
  responsible: string;
  location: string;
  description: string;
}

export interface RouteItem {
  id: string;
  routeCode: string;
  origin: string;
  destination: string;
  driver: string;
  plate: string;
  pgrTech: string;
  eta: string;
  distance: string;
  status: 'Ativa' | 'Concluída' | 'Atrasada' | 'Em Atenção';
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
}

// =========================================================================
// MOCK DATA COLLECTION
// =========================================================================

export const INICIO_KPIS: KpiMetric[] = [
  { title: "Ocorrências Monitoradas", value: "1.284", change: "-4,2%", isPositive: true, trend: "down", period: "vs mês anterior" },
  { title: "Índice de Conformidade", value: "98,6%", change: "+1,1 pp", isPositive: true, trend: "up", period: "meta de 98%" },
  { title: "Regiões em Atenção", value: "2", change: "Nordeste / Norte", isPositive: false, trend: "neutral", period: "de 5 regiões" },
  { title: "Rotas Ativas no Brasil", value: "342", change: "+14 rotas", isPositive: true, trend: "up", period: "monitoradas agora" }
];

export const REGIONAL_PERFORMANCES: RegionalPerformance[] = [
  { id: "reg-1", rank: 1, region: "SUDESTE", performance: 47.85, varVsAnt: "+9,1 pp", status: "Acima da meta", color: "#A31324" },
  { id: "reg-2", rank: 2, region: "SUL", performance: 42.26, varVsAnt: "+5,3 pp", status: "Dentro da meta", color: "#4DD6D8" },
  { id: "reg-3", rank: 3, region: "CENTRO-OESTE", performance: 2.77, varVsAnt: "+0,6 pp", status: "Dentro da meta", color: "#D6A84F" },
  { id: "reg-4", rank: 4, region: "NORDESTE", performance: 2.54, varVsAnt: "-0,4 pp", status: "Atenção", color: "#E63946" },
  { id: "reg-5", rank: 5, region: "NORTE", performance: 2.14, varVsAnt: "-1,2 pp", status: "Abaixo da meta", color: "#E63946" }
];

export const BRAZIL_MAP_NODES: MapNode[] = [
  { id: "node-sp", city: "São Paulo", state: "SP", xPercent: 62, yPercent: 68, status: "optimal", value: "R$ 2.45B", routesCount: 142, compliance: 99.1 },
  { id: "node-rj", city: "Rio de Janeiro", state: "RJ", xPercent: 69, yPercent: 67, status: "optimal", value: "R$ 1.12B", routesCount: 78, compliance: 98.8 },
  { id: "node-bh", city: "Belo Horizonte", state: "MG", xPercent: 65, yPercent: 60, status: "optimal", value: "R$ 980M", routesCount: 56, compliance: 98.4 },
  { id: "node-cur", city: "Curitiba", state: "PR", xPercent: 58, yPercent: 75, status: "optimal", value: "R$ 840M", routesCount: 44, compliance: 99.0 },
  { id: "node-[#poa]", city: "Porto Alegre", state: "RS", xPercent: 55, yPercent: 86, status: "normal", value: "R$ 620M", routesCount: 32, compliance: 97.9 },
  { id: "node-bsb", city: "Brasília", state: "DF", xPercent: 56, yPercent: 51, status: "normal", value: "R$ 510M", routesCount: 28, compliance: 98.2 },
  { id: "node-ssa", city: "Salvador", state: "BA", xPercent: 78, yPercent: 44, status: "warning", value: "R$ 410M", routesCount: 22, compliance: 94.6 },
  { id: "node-rec", city: "Recife", state: "PE", xPercent: 88, yPercent: 36, status: "warning", value: "R$ 380M", routesCount: 18, compliance: 93.8 },
  { id: "node-for", city: "Fortaleza", state: "CE", xPercent: 82, yPercent: 26, status: "warning", value: "R$ 310M", routesCount: 15, compliance: 94.1 },
  { id: "node-mao", city: "Manaus", state: "AM", xPercent: 28, yPercent: 25, status: "critical", value: "R$ 220M", routesCount: 9, compliance: 91.5 },
  { id: "node-bel", city: "Belém", state: "PA", xPercent: 52, yPercent: 22, status: "critical", value: "R$ 190M", routesCount: 8, compliance: 92.0 }
];

export const FINANCIAL_SUMMARY: FinancialMetric[] = [
  { label: "Receitas", value: "R$ 7.842.954.000", varPercent: "+12,4%", isPositive: true },
  { label: "Despesas", value: "R$ 4.205.789.000", varPercent: "-3,2%", isPositive: true },
  { label: "Custos Operacionais", value: "R$ 2.381.360.000", varPercent: "-1,7%", isPositive: true },
  { label: "Lucro Operacional", value: "R$ 1.255.805.000", varPercent: "+8,6%", isPositive: true },
  { label: "Margem Operacional", value: "16,01%", varPercent: "+2,1 pp", isPositive: true }
];

export const MONTHLY_REVENUE_EVOLUTION = [
  { month: "AGO", valor: 4.10, label: "R$ 4,1B" },
  { month: "SET", valor: 4.45, label: "R$ 4,45B" },
  { month: "OUT", valor: 4.82, label: "R$ 4,82B" },
  { month: "NOV", valor: 5.10, label: "R$ 5,1B" },
  { month: "DEZ", valor: 5.38, label: "R$ 5,38B" },
  { month: "JAN", valor: 5.56, label: "R$ 5,56B" }
];

export const DAILY_PERFORMANCE_HISTORY = [
  { day: "AGO", desempenho: 58.2, resultado: 4.10 },
  { day: "SET", desempenho: 60.5, resultado: 4.45 },
  { day: "OUT", desempenho: 61.8, resultado: 4.82 },
  { day: "NOV", desempenho: 62.9, resultado: 5.10 },
  { day: "DEZ", desempenho: 63.4, resultado: 5.38 },
  { day: "JAN", desempenho: 64.81, resultado: 5.56 }
];

export const OPERATIONAL_ALERTS: OperationalAlert[] = [
  {
    id: "alt-1",
    type: "warning",
    title: "Desempenho abaixo da meta",
    description: "A região Norte está 1,2 pp abaixo do período anterior.",
    timeAgo: "Há 2h",
    read: false
  },
  {
    id: "alt-2",
    type: "info",
    title: "Atualização de dados",
    description: "Dados financeiros e operacionais sincronizados com sucesso.",
    timeAgo: "Há 4h",
    read: true
  },
  {
    id: "alt-3",
    type: "success",
    title: "Meta anual em progresso",
    description: "Você alcançou 64,81% da meta operacional anual estabelecida.",
    timeAgo: "Há 1d",
    read: true
  }
];

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: "chk-101", sector: "Conformidade PGR", title: "Inspeção de Vínculo do Motorista & CNH", responsible: "Carlos Andrade", deadline: "Hoje 17:00", priority: "Alta", status: "Concluído", progress: 100 },
  { id: "chk-102", sector: "Logística", title: "Conferência de Lacres & Carga Averbada", responsible: "Mariana Souza", deadline: "Hoje 18:30", priority: "Alta", status: "Em Andamento", progress: 75 },
  { id: "chk-103", sector: "Segurança", title: "Teste de Sinal de Isca RF & GPS Ativo", responsible: "Roberto Lima", deadline: "Amanhã 09:00", priority: "Alta", status: "Concluído", progress: 100 },
  { id: "chk-104", sector: "Manutenção", title: "Checklist Mecânico Cavalo + Carreta Dupla", responsible: "Julio Cesar", deadline: "Hoje 20:00", priority: "Média", status: "Pendente", progress: 30 },
  { id: "chk-105", sector: "Frota", title: "Validação de Equipamentos de Telemetria", responsible: "Fernanda Costa", deadline: "Amanhã 11:00", priority: "Média", status: "Em Andamento", progress: 60 },
  { id: "chk-106", sector: "Conformidade PGR", title: "Verificação de Rota Autorizada no Sistema", responsible: "Carlos Andrade", deadline: "Ontem", priority: "Alta", status: "Atrasado", progress: 10 }
];

export const OCCURRENCE_ITEMS: OccurrenceItem[] = [
  { id: "occ-201", protocol: "AVB-98124", type: "Divergência de Parada", vehicle: "QWA6A22 / DLV7307", driver: "MARISON REZENDE", region: "Sudeste", date: "2026-10-06 09:14", priority: "Crítica", status: "Em Análise", description: "Parada não programada no km 184 da BR-116 sem acionamento de botão de pânico.", value: "R$ 905.343,74" },
  { id: "occ-202", protocol: "AVB-98125", type: "Perda Temporária de Sinal", vehicle: "POD0255 / POG7735", driver: "CLEBER SILVA", region: "Nordeste", date: "2026-10-06 08:30", priority: "Alta", status: "Investigação", description: "Ausência de transmissão secundária por mais de 18 minutos no trecho Salvador-Feira de Santana.", value: "R$ 355.565,00" },
  { id: "occ-203", protocol: "AVB-98126", type: "Desvio de Rota Aprovada", vehicle: "POG7735 / POF7799", driver: "ROBSON LUIS VIEIRA", region: "Sul", date: "2026-10-05 16:45", priority: "Média", status: "Concluída", description: "Veículo utilizou via alternativa devido a obra em rodovia principal com autorização da central.", value: "R$ 1.142.319,00" },
  { id: "occ-204", protocol: "AVB-98127", type: "Violação de Sensor de Porta", vehicle: "ABC1234 / DEF5678", driver: "MARCIO ANTONIO", region: "Norte", date: "2026-10-05 14:10", priority: "Crítica", status: "Em Análise", description: "Abertura de baú fora do raio autorizado de descarga na base de Manaus.", value: "R$ 480.000,00" }
];

export const SM_RECORDS: SmRecord[] = [
  { id: "sm-501", smCode: "SM-2026-0981", carrier: "GTMINAS", origin: "SANTA LUZIA / MG", destination: "BRASÍLIA / DF", cargoType: "Produtos Industrializados", value: "R$ 905.343,74", region: "Sudeste", status: "Em Trânsito", eta: "Hoje 19:40" },
  { id: "sm-502", smCode: "SM-2026-0982", carrier: "MODELES LOG", origin: "SÃO PAULO / SP", destination: "LONDRINA / PR", cargoType: "Carga de Alto Valor", value: "R$ 1.250.000,00", region: "Sul", status: "Em Trânsito", eta: "Hoje 22:15" },
  { id: "sm-503", smCode: "SM-2026-0983", carrier: "TRANSMAGNA", origin: "CURITIBA / PR", destination: "PORTO ALEGRE / RS", cargoType: "Geral", value: "R$ 640.000,00", region: "Sul", status: "Concluído", eta: "Entregue" },
  { id: "sm-504", smCode: "SM-2026-0984", carrier: "GOBOR", origin: "RECIFE / PE", destination: "FORTALEZA / CE", cargoType: "Alimentos & Bebidas", value: "R$ 380.000,00", region: "Nordeste", status: "Atrasado", eta: "Ontem 21:00" }
];

export const PRE_ALERTS: PreAlertItem[] = [
  { id: "pa-1", code: "PAL-881", time: "10:14:08", region: "BR-116 KM 184 (Sudeste)", severity: "Crítico", description: "Perda de sinal GPS principal + ausência de checklist de saída.", vehicle: "QWA6A22 / CAVALO", acknowledged: false },
  { id: "pa-2", code: "PAL-882", time: "09:52:30", region: "BR-101 KM 320 (Nordeste)", severity: "Moderado", description: "Superação pontual do limite de velocidade em trecho urbano.", vehicle: "POD0255 / CAVALO", acknowledged: false },
  { id: "pa-3", code: "PAL-883", time: "09:12:00", region: "Base Central MG", severity: "Informativo", description: "Bateria da isca RF secundária em 15% de capacidade.", vehicle: "POG7735 / CARRETA", acknowledged: true },
  { id: "pa-4", code: "PAL-884", time: "08:40:15", region: "Anel Viário SP", severity: "Moderado", description: "Parada superior a 15 minutos em posto de combustível não homologado.", vehicle: "POF7799 / CARRETA", acknowledged: false }
];

export const SHIFT_TEAMS: ShiftTeam[] = [
  { id: "team-a", name: "Equipe ALFA", shift: "Turno A (06:00 - 18:00)", supervisor: "Cap. Fernando Ramos", activeMembers: 18, capacity: 20, status: "Em Operação", coverageRegion: "Sudeste / Sul" },
  { id: "team-b", name: "Equipe BRAVO", shift: "Turno B (18:00 - 06:00)", supervisor: "Ten. Marcos Prado", activeMembers: 16, capacity: 18, status: "Disponível", coverageRegion: "Centro-Oeste / Norte" },
  { id: "team-c", name: "Equipe CHARLIE", shift: "Turno C (12x36 Especial)", supervisor: "Dra. Luciana Veiga", activeMembers: 12, capacity: 12, status: "Em Operação", coverageRegion: "Nordeste / Apoio" },
  { id: "team-d", name: "Equipe DELTA", shift: "Turno D (Plantão Tático)", supervisor: "Eng. Paulo Lemes", activeMembers: 8, capacity: 10, status: "Intervalo", coverageRegion: "Nacional / Alertas" }
];

export const CALENDAR_EVENTS: CalendarEventItem[] = [
  { id: "evt-1", date: "2026-10-06", time: "09:00", title: "Auditoria de Conformidade PGR Q3", type: "Auditoria", responsible: "Diretoria de Risco", location: "Sala Tática 01 / Remoto", description: "Revisão dos índices de sinistralidade e compliance de rotas do trimestre." },
  { id: "evt-2", date: "2026-10-06", time: "14:30", title: "Reunião de Alinhamento com Transportadoras", type: "Reunião", responsible: "Coordenação Logística", location: "Auditório Central", description: "Apresentação dos novos parâmetros de tempo de resposta para pré-alertas." },
  { id: "evt-3", date: "2026-10-07", time: "10:00", title: "Inspeção Geral de Unidades de Telemetria", type: "Inspeção", responsible: "Engenharia de Sistemas", location: "Base São Paulo", description: "Verificação e calibração dos sensores de porta e iscas RF das carretas." },
  { id: "evt-4", date: "2026-10-08", time: "11:00", title: "Simulado de Pronto Atendimento Tático", type: "Operacional", responsible: "Central de Comando GR", location: "Rede Nacional", description: "Teste de simulação de pânico e pronta resposta em conjunto com seguradoras." }
];

export const ROUTES: RouteItem[] = [
  { id: "rot-1", routeCode: "ROT-BR-01", origin: "SANTA LUZIA / MG", destination: "BRASÍLIA / DF", driver: "MARISON REZENDE LEMOS", plate: "POD0255", pgrTech: "SIGHRA", eta: "Hoje 19:30", distance: "738 km", status: "Ativa", riskLevel: "Baixo" },
  { id: "rot-2", routeCode: "ROT-BR-02", origin: "SÃO PAULO / SP", destination: "CURITIBA / PR", driver: "CLEBER SILVA BRAGA", plate: "POG7735", pgrTech: "SASCAR", eta: "Hoje 16:45", distance: "408 km", status: "Ativa", riskLevel: "Baixo" },
  { id: "rot-3", routeCode: "ROT-BR-03", origin: "BELO HORIZONTE / MG", destination: "SALVADOR / BA", driver: "ROBSON LUIS VIEIRA", plate: "POF7799", pgrTech: "AUTOTRAC", eta: "Amanhã 12:00", distance: "1.372 km", status: "Em Atenção", riskLevel: "Médio" },
  { id: "rot-4", routeCode: "ROT-BR-04", origin: "MANAUS / AM", destination: "BOA VISTA / RR", driver: "MARCIO ANTONIO ALVES", plate: "QWA6A22", pgrTech: "ONIXSAT", eta: "Ontem 22:00", distance: "780 km", status: "Atrasada", riskLevel: "Alto" }
];
