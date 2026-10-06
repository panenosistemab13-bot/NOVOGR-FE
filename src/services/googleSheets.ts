import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

/* ================================================================
   SCOPES & CONFIGURAÇÃO OAUTH GOOGLE WORKSPACE
================================================================ */

export const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Inicializa a instância dedicada do Firebase para Google Workspace OAuth
const app = getApps().find(a => a.name === 'workspace_oauth') 
  || initializeApp(firebaseConfig, 'workspace_oauth');

export const workspaceAuth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account'
});

// Cache do token de acesso estritamente em memória
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/* ================================================================
   AUTENTICAÇÃO COM GOOGLE
================================================================ */

export const initSheetsAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(workspaceAuth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const signInWithGoogleSheets = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(workspaceAuth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Falha ao obter o token de acesso do Google Sheets.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro de autenticação Google Sheets:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getSheetsAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const signOutGoogleSheets = async (): Promise<void> => {
  await signOut(workspaceAuth);
  cachedAccessToken = null;
};

/* ================================================================
   UTILITÁRIOS PARA MANIPULAÇÃO DE PLANILHAS (SHEETS API V4)
================================================================ */

export interface SheetRowData {
  uf: string;
  name?: string;
  leader: string;
  party: string;
  valid: string;
  apurado: number;
  color: 'orange' | 'blue';
}

export interface SpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  sheets: { title: string; sheetId: number }[];
}

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export async function getSpreadsheetDetails(
  spreadsheetId: string,
  token: string
): Promise<SpreadsheetMetadata> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=spreadsheetId,properties.title,sheets.properties(sheetId,title)`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Erro ao acessar planilha (${res.status}): verifique se o ID está correto e se você tem permissão.`
    );
  }

  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Planilha sem título',
    sheets: (data.sheets || []).map((s: any) => ({
      title: s.properties?.title || 'Sheet1',
      sheetId: s.properties?.sheetId || 0,
    })),
  };
}

export async function readSpreadsheetValues(
  spreadsheetId: string,
  range: string,
  token: string
): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Erro ao ler dados da planilha (${res.status})`
    );
  }

  const data = await res.json();
  return data.values || [];
}

export interface IscaRecord {
  idIsca: string;
  destino: string;
  uf: string;
  status: 'EM ROTA(IDA)' | 'ROTA VOLTA' | 'PREPARAÇÃO' | 'NO DESTINO' | 'EXTRAVIADA' | 'DISPONIVEL';
  obs1: string;
  dataStatus: string;
  carreta: string;
  cavalo: string;
  motorista: string;
  unidade: string;
}

export const CITY_TO_UF: Record<string, string> = {
  'BRASILIA': 'DF',
  'BRASÍLIA': 'DF',
  'GOVERNADOR CR': 'SC',
  'GOVERNADOR CELSO RAMOS': 'SC',
  'GRAVATAI': 'RS',
  'GRAVATAÍ': 'RS',
  'VIANA': 'ES',
  'SUMARE': 'SP',
  'SUMARÉ': 'SP',
  'RIO DE JANEIRO': 'RJ',
  'GUARULHOS': 'SP',
  'SANTA LUZIA': 'MG',
  'SALVADOR': 'BA',
  'RECIFE': 'PE',
  'BETIM': 'MG',
  'CURITIBA': 'PR',
  'FORTALEZA': 'CE',
  'BELO HORIZONTE': 'MG',
  'SÃO PAULO': 'SP',
  'SAO PAULO': 'SP',
  'CAMPINAS': 'SP',
  'PORTO ALEGRE': 'RS',
  'GOIANIA': 'GO',
  'GOIÂNIA': 'GO',
  'CUIABA': 'MT',
  'CUIABÁ': 'MT',
  'CAMPO GRANDE': 'MS',
  'MANAUS': 'AM',
  'BELEM': 'PA',
  'BELÉM': 'PA',
  'VARGINHA': 'MG',
  'UBERLANDIA': 'MG',
  'UBERLÂNDIA': 'MG',
  'VITORIA': 'ES',
  'VITÓRIA': 'ES',
  'JOINVILLE': 'SC',
  'ITAJAI': 'SC',
  'ITAJAÍ': 'SC',
  'DUQUE DE CAXIAS': 'RJ',
  'JABOATAO': 'PE',
  'JABOATÃO': 'PE',
};

export function normalizeIscaStatus(raw: string): IscaRecord['status'] {
  const s = (raw || '').toUpperCase().trim();
  if (s.includes('IDA') || s === 'ROTA IDA' || s === 'EM ROTA(IDA)' || s === 'EM ROTA IDA') {
    return 'EM ROTA(IDA)';
  }
  if (s.includes('VOLTA') || s === 'ROTA VOLTA' || s === 'EM ROTA(VOLTA)' || s === 'EM ROTA VOLTA') {
    return 'ROTA VOLTA';
  }
  if (s.includes('PREPAR') || s.includes('CARREGADOR')) {
    return 'PREPARAÇÃO';
  }
  if (s.includes('DESTINO')) {
    return 'NO DESTINO';
  }
  if (s.includes('EXTRAV')) {
    return 'EXTRAVIADA';
  }
  if (s.includes('DISP')) {
    return 'DISPONIVEL';
  }
  return 'DISPONIVEL';
}

/**
 * Dados padrão extraídos diretamente da imagem e da operação Santa Luzia
 */
export const INITIAL_ISCAS_DATA: IscaRecord[] = [
  {
    idIsca: "R100000797",
    destino: "BRASILIA",
    uf: "DF",
    status: "NO DESTINO",
    obs1: "VANDERSON",
    dataStatus: "02.out.",
    carreta: "PNK0792",
    cavalo: "THX-8C51",
    motorista: "ANDERSON DE ALMEIDA SOARES",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100000763",
    destino: "SANTA LUZIA",
    uf: "MG",
    status: "PREPARAÇÃO",
    obs1: "NO CARREGADOR",
    dataStatus: "02.out.",
    carreta: "-",
    cavalo: "-",
    motorista: "-",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100000774",
    destino: "GOVERNADOR CR",
    uf: "SC",
    status: "EM ROTA(IDA)",
    obs1: "PRÉ ALERTA OK",
    dataStatus: "30.set.",
    carreta: "UEN7H15",
    cavalo: "SFE5F95",
    motorista: "RAMON DOS SANTOS PEREIRA",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100000558",
    destino: "GOVERNADOR CR",
    uf: "SC",
    status: "EM ROTA(IDA)",
    obs1: "PRÉ ALERTA OK",
    dataStatus: "30.set.",
    carreta: "QSY0H44",
    cavalo: "SFE5F95",
    motorista: "RAMON DOS SANTOS PEREIRA",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100000578",
    destino: "GRAVATAI",
    uf: "RS",
    status: "EM ROTA(IDA)",
    obs1: "PRÉ ALERTA OK",
    dataStatus: "01.out.",
    carreta: "----",
    cavalo: "JBV1G63",
    motorista: "RODRIGO CHRUSCIEL NAKAMURA",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100000597",
    destino: "VIANA",
    uf: "ES",
    status: "NO DESTINO",
    obs1: "DAVI",
    dataStatus: "02.out.",
    carreta: "PNE7433",
    cavalo: "TYQ-6F51",
    motorista: "ALAN HENRIQUE ALVES MACIEL DOS SANTOS",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100003154",
    destino: "SANTA LUZIA",
    uf: "MG",
    status: "DISPONIVEL",
    obs1: "DISPONÍVEL EM SANTA LUZIA",
    dataStatus: "30.set.",
    carreta: "-",
    cavalo: "-",
    motorista: "-",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100000689",
    destino: "SUMARE",
    uf: "SP",
    status: "EM ROTA(IDA)",
    obs1: "PRÉ ALERTA OK",
    dataStatus: "01.out.",
    carreta: "MFJ6292",
    cavalo: "SFG6E94",
    motorista: "MAURO CASEMIRO MOURA",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100001579",
    destino: "RIO DE JANEIRO",
    uf: "RJ",
    status: "NO DESTINO",
    obs1: "JULIO CESAR",
    dataStatus: "02.out.",
    carreta: "POF7875",
    cavalo: "SBK5B52",
    motorista: "Sidney Costa Lidorio",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100000872",
    destino: "GUARULHOS",
    uf: "SP",
    status: "EM ROTA(IDA)",
    obs1: "PRÉ ALERTA OK",
    dataStatus: "01.out.",
    carreta: "MEY7312",
    cavalo: "SFE3E65",
    motorista: "ROMULO ANDERSON DE ALMEIDA TIMOTEO",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100002046",
    destino: "RIO DE JANEIRO",
    uf: "RJ",
    status: "NO DESTINO",
    obs1: "LEANDRO",
    dataStatus: "03.out.",
    carreta: "PNC8873",
    cavalo: "POZ-4431",
    motorista: "FERNANDO COLOR ALVES CARDOSO",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100001122",
    destino: "SANTA LUZIA",
    uf: "MG",
    status: "ROTA VOLTA",
    obs1: "RETORNANDO PARA SANTA LUZIA",
    dataStatus: "03.out.",
    carreta: "OPM4521",
    cavalo: "RTY-1122",
    motorista: "CARLOS EDUARDO SILVA",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100002540",
    destino: "SALVADOR",
    uf: "BA",
    status: "NO DESTINO",
    obs1: "MARCOS VINICIUS",
    dataStatus: "02.out.",
    carreta: "PLK9901",
    cavalo: "KLP-8821",
    motorista: "ROBERTO SOUZA SANTOS",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100001880",
    destino: "RECIFE",
    uf: "PE",
    status: "EM ROTA(IDA)",
    obs1: "PRÉ ALERTA OK",
    dataStatus: "02.out.",
    carreta: "POG3321",
    cavalo: "JJM-9021",
    motorista: "ANTONIO CARLOS LIMA",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100004120",
    destino: "SANTA LUZIA",
    uf: "MG",
    status: "DISPONIVEL",
    obs1: "DISPONÍVEL EM SANTA LUZIA",
    dataStatus: "01.out.",
    carreta: "-",
    cavalo: "-",
    motorista: "-",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100000412",
    destino: "BETIM",
    uf: "MG",
    status: "EXTRAVIADA",
    obs1: "ACIONADA BUSCA / SINISTRO",
    dataStatus: "28.set.",
    carreta: "-",
    cavalo: "-",
    motorista: "-",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100003019",
    destino: "CURITIBA",
    uf: "PR",
    status: "NO DESTINO",
    obs1: "TIAGO ROCHA",
    dataStatus: "03.out.",
    carreta: "BCX1290",
    cavalo: "PPO-7621",
    motorista: "LUCAS SILVEIRA",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100002890",
    destino: "FORTALEZA",
    uf: "CE",
    status: "EM ROTA(IDA)",
    obs1: "PRÉ ALERTA OK",
    dataStatus: "02.out.",
    carreta: "OPN5512",
    cavalo: "MMB-2134",
    motorista: "JOSÉ ROBERTO ALVES",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100001430",
    destino: "SANTA LUZIA",
    uf: "MG",
    status: "PREPARAÇÃO",
    obs1: "NO CARREGADOR",
    dataStatus: "03.out.",
    carreta: "-",
    cavalo: "-",
    motorista: "-",
    unidade: "SANTA LUZIA"
  },
  {
    idIsca: "R100003310",
    destino: "SANTA LUZIA",
    uf: "MG",
    status: "DISPONIVEL",
    obs1: "DISPONÍVEL EM SANTA LUZIA",
    dataStatus: "02.out.",
    carreta: "-",
    cavalo: "-",
    motorista: "-",
    unidade: "SANTA LUZIA"
  }
];

/**
 * Converte linhas lidas da planilha em registros de Iscas
 */
export function parseSheetRowsToIscas(rows: string[][]): IscaRecord[] {
  if (!rows || rows.length < 2) return [];

  const headers = rows[0].map(h => (h || '').toString().toLowerCase().trim());

  const colIndex = {
    idIsca: headers.findIndex(h => h.includes('id isca') || h.includes('isca') || h === 'id'),
    destino: headers.findIndex(h => h.includes('destino') || h.includes('cidade')),
    status: headers.findIndex(h => h.includes('status') || h.includes('situa')),
    obs1: headers.findIndex(h => h.includes('obs 1') || h.includes('obs1') || h === 'obs' || h.includes('observação') || h.includes('resgate')),
    dataStatus: headers.findIndex(h => h.includes('data')),
    carreta: headers.findIndex(h => h.includes('carreta')),
    cavalo: headers.findIndex(h => h.includes('cavalo')),
    motorista: headers.findIndex(h => h.includes('motorista')),
    unidade: headers.findIndex(h => h.includes('unidade') || h.includes('base')),
  };

  const records: IscaRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const idIsca = (colIndex.idIsca !== -1 ? row[colIndex.idIsca] : row[0])?.toString().trim();
    if (!idIsca) continue;

    const destino = (colIndex.destino !== -1 && row[colIndex.destino] ? row[colIndex.destino] : '').toString().trim().toUpperCase();
    const statusRaw = (colIndex.status !== -1 && row[colIndex.status] ? row[colIndex.status] : '').toString().trim();
    const status = normalizeIscaStatus(statusRaw);

    const obs1 = (colIndex.obs1 !== -1 && row[colIndex.obs1] ? row[colIndex.obs1] : '').toString().trim();
    const dataStatus = (colIndex.dataStatus !== -1 && row[colIndex.dataStatus] ? row[colIndex.dataStatus] : '').toString().trim();
    const carreta = (colIndex.carreta !== -1 && row[colIndex.carreta] ? row[colIndex.carreta] : '-').toString().trim();
    const cavalo = (colIndex.cavalo !== -1 && row[colIndex.cavalo] ? row[colIndex.cavalo] : '-').toString().trim();
    const motorista = (colIndex.motorista !== -1 && row[colIndex.motorista] ? row[colIndex.motorista] : '-').toString().trim();
    const unidade = (colIndex.unidade !== -1 && row[colIndex.unidade] ? row[colIndex.unidade] : 'SANTA LUZIA').toString().trim().toUpperCase();

    // Determina a UF correspondente
    let uf = 'MG';
    if (destino && CITY_TO_UF[destino]) {
      uf = CITY_TO_UF[destino];
    } else if (destino.length === 2 && !CITY_TO_UF[destino]) {
      uf = destino;
    } else if (status === 'PREPARAÇÃO' || status === 'DISPONIVEL' || !destino) {
      uf = 'MG';
    }

    records.push({
      idIsca,
      destino: destino || 'SANTA LUZIA',
      uf,
      status,
      obs1,
      dataStatus,
      carreta,
      cavalo,
      motorista,
      unidade,
    });
  }

  return records.length > 0 ? records : INITIAL_ISCAS_DATA;
}

/**
 * Interpreta as linhas da planilha convertendo para o formato de estados da página Iscas.
 */
export function parseSheetRowsToElectionStates(rows: string[][]): SheetRowData[] {
  if (!rows || rows.length < 2) return [];

  // Se a planilha possuir formato de Iscas (com coluna ID ISCA ou STATUS), mapeia agregando por UF!
  const headers = rows[0].map(h => (h || '').toString().toLowerCase().trim());
  const hasIscaCols = headers.some(h => h.includes('id isca') || h.includes('isca') || h.includes('destino'));

  if (hasIscaCols) {
    const iscas = parseSheetRowsToIscas(rows);
    return convertIscasToStatesData(iscas);
  }

  // Mapeia colunas comuns de eleição (fallback compatibilidade)
  const colIndex = {
    uf: headers.findIndex(h => h === 'uf' || h === 'sigla' || h === 'estado (uf)'),
    name: headers.findIndex(h => h === 'nome' || h === 'estado' || h === 'nome estado'),
    leader: headers.findIndex(h => h.includes('lider') || h.includes('líder') || h.includes('candidato')),
    party: headers.findIndex(h => h.includes('partido') || h === 'sigla partido'),
    valid: headers.findIndex(h => h.includes('válid') || h.includes('valid') || h.includes('% val')),
    apurado: headers.findIndex(h => h.includes('apurad') || h.includes('% apur')),
    color: headers.findIndex(h => h.includes('cor') || h.includes('color')),
  };

  const parsed: SheetRowData[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const uf = (colIndex.uf !== -1 ? row[colIndex.uf] : row[0])?.trim().toUpperCase();
    if (!uf || uf.length > 3) continue;

    const name = colIndex.name !== -1 && row[colIndex.name] ? row[colIndex.name].trim() : undefined;
    const leader = (colIndex.leader !== -1 && row[colIndex.leader] ? row[colIndex.leader] : 'Indefinido').trim();
    const party = (colIndex.party !== -1 && row[colIndex.party] ? row[colIndex.party] : 'ND').trim().toUpperCase();

    let validStr = (colIndex.valid !== -1 && row[colIndex.valid] ? row[colIndex.valid] : '50,00%').trim();
    if (!validStr.endsWith('%')) {
      const num = parseFloat(validStr.replace(',', '.'));
      if (!isNaN(num)) {
        validStr = `${num.toFixed(2).replace('.', ',')}%`;
      }
    }

    let apuradoNum = 0;
    if (colIndex.apurado !== -1 && row[colIndex.apurado]) {
      const raw = row[colIndex.apurado].toString().replace('%', '').replace(',', '.').trim();
      const n = parseFloat(raw);
      if (!isNaN(n)) apuradoNum = n;
    } else {
      apuradoNum = 100;
    }

    let color: 'orange' | 'blue' = 'orange';
    if (colIndex.color !== -1 && row[colIndex.color]) {
      const c = row[colIndex.color].toLowerCase().trim();
      if (c.includes('azul') || c.includes('blue') || c.includes('pt') || c.includes('lula')) {
        color = 'blue';
      } else {
        color = 'orange';
      }
    } else {
      color = (party === 'PT' || leader.toLowerCase().includes('lula')) ? 'blue' : 'orange';
    }

    parsed.push({
      uf,
      name,
      leader,
      party,
      valid: validStr,
      apurado: apuradoNum,
      color,
    });
  }

  return parsed;
}

/**
 * Agrega a lista de Iscas em dados para o Mapa dos 27 Estados do Brasil
 */
export function convertIscasToStatesData(iscas: IscaRecord[]): SheetRowData[] {
  const ALL_UFS = [
    { uf: "AC", name: "Acre" },
    { uf: "AL", name: "Alagoas" },
    { uf: "AP", name: "Amapá" },
    { uf: "AM", name: "Amazonas" },
    { uf: "BA", name: "Bahia" },
    { uf: "CE", name: "Ceará" },
    { uf: "DF", name: "Distrito Federal" },
    { uf: "ES", name: "Espírito Santo" },
    { uf: "GO", name: "Goiás" },
    { uf: "MA", name: "Maranhão" },
    { uf: "MG", name: "Minas Gerais" },
    { uf: "MS", name: "Mato Grosso do Sul" },
    { uf: "MT", name: "Mato Grosso" },
    { uf: "PA", name: "Pará" },
    { uf: "PB", name: "Paraíba" },
    { uf: "PE", name: "Pernambuco" },
    { uf: "PI", name: "Piauí" },
    { uf: "PR", name: "Paraná" },
    { uf: "RJ", name: "Rio de Janeiro" },
    { uf: "RN", name: "Rio Grande do Norte" },
    { uf: "RO", name: "Rondônia" },
    { uf: "RR", name: "Roraima" },
    { uf: "RS", name: "Rio Grande do Sul" },
    { uf: "SC", name: "Santa Catarina" },
    { uf: "SE", name: "Sergipe" },
    { uf: "SP", name: "São Paulo" },
    { uf: "TO", name: "Tocantins" },
  ];

  const total = iscas.length || 1;

  return ALL_UFS.map(({ uf, name }) => {
    const iscasNoEstado = iscas.filter(i => i.uf === uf);
    const count = iscasNoEstado.length;

    // Se tem iscas, qual é o status predominante ou líder?
    let leader = "Sem Iscas";
    let party = "0";
    let color: 'orange' | 'blue' = 'blue';

    if (count > 0) {
      const emRota = iscasNoEstado.filter(i => i.status === 'EM ROTA(IDA)').length;
      const noDestino = iscasNoEstado.filter(i => i.status === 'NO DESTINO').length;
      const disponivel = iscasNoEstado.filter(i => i.status === 'DISPONIVEL' || i.status === 'PREPARAÇÃO').length;

      if (uf === 'MG') {
        leader = `${count} Iscas (Base Santa Luzia)`;
        party = "BASE";
        color = "blue";
      } else if (noDestino >= emRota) {
        leader = `${count} Iscas (No Destino)`;
        party = "DESTINO";
        color = "orange";
      } else {
        leader = `${count} Iscas (Em Rota Ida)`;
        party = "EM ROTA";
        color = "orange";
      }
    }

    const pctTotal = ((count / total) * 100).toFixed(1).replace('.', ',') + '%';
    const apuradoPct = count > 0 ? 100 : 0;

    return {
      uf,
      name,
      leader,
      party,
      valid: `${count} Iscas (${pctTotal})`,
      apurado: apuradoPct,
      color,
    };
  });
}

/**
 * Cria uma planilha modelo nova no Google Drive com as colunas oficiais de controle de Iscas
 */
export async function createIscasTemplateSpreadsheet(
  title: string,
  initialIscas: IscaRecord[],
  token: string
): Promise<{ spreadsheetId: string; url: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';

  const rows = [
    ['ID ISCA', 'DESTINO', 'STATUS', 'OBS 1', 'DATA STATUS', 'CARRETA', 'CAVALO', 'MOTORISTA', 'UNIDADE'],
    ...initialIscas.map(i => [
      i.idIsca,
      i.destino,
      i.status,
      i.obs1,
      i.dataStatus,
      i.carreta,
      i.cavalo,
      i.motorista,
      i.unidade,
    ]),
  ];

  const payload = {
    properties: {
      title: title || 'CONTROLE DE ISCAS - SANTA LUZIA 3C',
    },
    sheets: [
      {
        properties: {
          title: 'ISCAS_GERAL',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: rows.map(r => ({
              values: r.map(val => ({
                userEnteredValue: { stringValue: val },
              })),
            })),
          },
        ],
      },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Falha ao criar planilha modelo de Iscas no Google Sheets.');
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return { spreadsheetId, url: sheetUrl };
}

/**
 * Atualiza as linhas na planilha de Iscas do usuário
 */
export async function updateIscasSpreadsheetData(
  spreadsheetId: string,
  sheetName: string,
  iscas: IscaRecord[],
  token: string
): Promise<void> {
  const range = `${sheetName}!A1:I${iscas.length + 1}`;
  const values = [
    ['ID ISCA', 'DESTINO', 'STATUS', 'OBS 1', 'DATA STATUS', 'CARRETA', 'CAVALO', 'MOTORISTA', 'UNIDADE'],
    ...iscas.map(i => [
      i.idIsca,
      i.destino,
      i.status,
      i.obs1,
      i.dataStatus,
      i.carreta,
      i.cavalo,
      i.motorista,
      i.unidade,
    ]),
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Falha ao sincronizar dados de Iscas com o Google Sheets.');
  }
}

/**
 * Cria uma planilha modelo nova no Google Drive do usuário com todos os estados já pré-preenchidos.
 */
export async function createTemplateSpreadsheet(
  title: string,
  initialStates: SheetRowData[],
  token: string
): Promise<{ spreadsheetId: string; url: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';

  const rows = [
    ['UF', 'Estado', 'Líder', 'Partido', '% Válidos', '% Apurado', 'Cor (orange/blue)'],
    ...initialStates.map(s => [
      s.uf,
      s.name || s.uf,
      s.leader,
      s.party,
      s.valid,
      `${s.apurado.toFixed(2).replace('.', ',')}%`,
      s.color,
    ]),
  ];

  const payload = {
    properties: {
      title: title || 'ISCAS - Eleições 2026 (Dados ao Vivo)',
    },
    sheets: [
      {
        properties: {
          title: 'Dados_UF',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: rows.map(r => ({
              values: r.map(val => ({
                userEnteredValue: { stringValue: val },
              })),
            })),
          },
        ],
      },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Falha ao criar planilha modelo no Google Sheets.');
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return { spreadsheetId, url: sheetUrl };
}

/**
 * Atualiza os valores na planilha do usuário (Requer confirmação prévia pelo UI).
 */
export async function updateSpreadsheetData(
  spreadsheetId: string,
  sheetName: string,
  states: SheetRowData[],
  token: string
): Promise<void> {
  const range = `${sheetName}!A1:G${states.length + 1}`;
  const values = [
    ['UF', 'Estado', 'Líder', 'Partido', '% Válidos', '% Apurado', 'Cor (orange/blue)'],
    ...states.map(s => [
      s.uf,
      s.name || s.uf,
      s.leader,
      s.party,
      s.valid,
      `${s.apurado.toFixed(2).replace('.', ',')}%`,
      s.color,
    ]),
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Falha ao sincronizar dados com o Google Sheets.');
  }
}
