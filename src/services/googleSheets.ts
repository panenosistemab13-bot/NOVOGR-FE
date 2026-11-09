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

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly'
];

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

import Papa from 'papaparse';

export const PUBLIC_SANTA_LUZIA_CSV_URL = 'https://docs.google.com/spreadsheets/d/1pYw7zb9YwYzOHQoKMewxRrkj4vCbziD_ZJp0rzlM5X4/export?format=csv';

export const APPS_SCRIPT_API_URL = 'https://script.google.com/macros/s/AKfycbwTZlpQzmEQ-rzHOOPd8idmgpoc_QgVLGpcobN4lXCcmTnoCGUtxdbRjjRGX8hiIVYRKA/exec';

export async function syncPostToAppsScript(items: VehicleRecord[] | any[]): Promise<any> {
  const cabecalhos = ['CAVALO', 'CARRETAS', 'STATUS', 'REALIZAÇÃO DO TESTE', 'VENCIMENTO', 'DIAS', 'DATA DA MANUTENÇÃO / OS', 'PERIFÉRICO', 'OBSERVAÇÃO', 'UNIDADE', 'RASTREADOR'];
  const todasAsLinhasAtualizadas = items.map(item => [
    item.cavalo || '',
    item.carretas || '',
    item.statusOverride || item.osStatus || 'EM DIA',
    item.dataTeste || '',
    item.dataVencimento || '',
    '',
    item.manutencaoOs || '',
    item.periferico || '',
    item.observacao || '',
    item.unidade || 'SANTA LUZIA',
    ''
  ]);

  const payload = {
    action: 'sync_all',
    rows: [cabecalhos, ...todasAsLinhasAtualizadas]
  };

  try {
    const res = await fetch(APPS_SCRIPT_API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
    const text = await res.text();
    console.log("Resposta POST Apps Script:", text);
    return text;
  } catch (err) {
    console.warn("POST para Apps Script falhou:", err);
  }
}

/**
 * Normaliza chaves de cabeçalho removendo acentos e caracteres especiais para comparação flexível.
 */
export function normalizeHeaderKey(key: string): string {
  if (!key) return '';
  return key
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export interface VehicleRecord {
  id: string;
  cavalo: string;
  carretas: string;
  dataTeste: string;
  dataVencimento: string;
  manutencaoOs: string;
  periferico: string;
  observacao: string;
  osStatus?: 'PENDENTE' | 'AGENDADO' | 'EM ANDAMENTO' | 'CONCLUÍDO' | 'CANCELADO';
  statusOverride?: 'APROVADO' | 'VENCIDO' | 'NEGATIVADO' | 'REPROVADO';
}

/**
 * Mapeia um array de objetos retornados da API do Apps Script de forma case-insensitive e com fallbacks flexíveis:
 * - Placa/Cavalo: item['CAVALO'] || item['Cavalo'] || item['SANTA LUZIA'] || ''
 * - Carreta/Rastreador: item['RASTREADOR'] || item['CARRETAS'] || item['Carretas'] || ''
 * - Status: item['STATUS'] || item['Status'] || 'OK'
 * - Data: item['DATA'] || item['Data'] || item['REALIZAÇÃO'] || ''
 * - Vencimento: item['VENCIMENTO'] || item['Vencimento'] || ''
 */
export function parseVehicleObjects(rawObjects: any[]): VehicleRecord[] {
  if (!Array.isArray(rawObjects) || rawObjects.length === 0) return [];

  const result: VehicleRecord[] = [];

  rawObjects.forEach((item, idx) => {
    if (!item || typeof item !== 'object') return;

    const getValue = (keys: string[]): string => {
      // 1. Direct match (exact)
      for (const k of keys) {
        if (item[k] !== undefined && item[k] !== null && String(item[k]).trim() !== '') {
          return String(item[k]).trim();
        }
      }
      // 2. Case-insensitive / normalized match
      const itemKeys = Object.keys(item);
      for (const targetKey of keys) {
        const normTarget = normalizeHeaderKey(targetKey);
        const matchedKey = itemKeys.find(k => normalizeHeaderKey(k) === normTarget);
        if (matchedKey && item[matchedKey] !== undefined && item[matchedKey] !== null && String(item[matchedKey]).trim() !== '') {
          return String(item[matchedKey]).trim();
        }
      }
      return '';
    };

    // Mapeamento com fallback exigido pelo usuário:
    const cavalo = getValue(['CAVALO', 'Cavalo', 'SANTA LUZIA', 'Santa Luzia', 'PLACA', 'Placa']).toUpperCase();
    if (!cavalo || cavalo.length < 5 || cavalo.includes('SANTA LUZIA CAVALO')) return;

    const carretasRaw = getValue(['CARRETAS', 'Carretas', 'CARRETA', 'Carreta']);
    const carretas = (carretasRaw && carretasRaw.toUpperCase() !== 'SASCAR') ? carretasRaw.toUpperCase() : 'SEM CARRETA';
    const statusRaw = getValue(['STATUS', 'Status', 'SITUAÇÃO', 'Situacao']);
    const osStatus = statusRaw || 'OK';
    const dataTeste = getValue(['DATA', 'Data', 'REALIZAÇÃO', 'REALIZACAO', 'Realização', 'Realizacao', 'REALIZAÇÃO DO TESTE', 'DATA TESTE', 'Data Teste']);
    const dataVencimento = getValue(['VENCIMENTO', 'Vencimento', 'DATA VENCIMENTO', 'Data Vencimento']);
    const manutencaoOs = getValue(['MANUTENÇÃO / OS', 'MANUTENCAO / OS', 'MANUTENCAO', 'OS', 'DATA DA MANUTENÇÃO / OS']);
    const periferico = getValue(['PERIFÉRICO', 'PERIFERICO', 'Periférico', 'Periferico']);
    const observacao = getValue(['OBSERVAÇÃO', 'OBSERVACAO', 'Observação', 'Observacao', 'OBS']);

    result.push({
      id: item._row ? `sheet_${item._row}` : `sheet_${idx}_${cavalo}`,
      cavalo,
      carretas,
      dataTeste: dataTeste || '',
      dataVencimento: dataVencimento || '',
      manutencaoOs,
      periferico,
      observacao,
      osStatus: osStatus as any
    });
  });

  return result;
}

/**
 * Utilitário de parsing de texto CSV usando PapaParse com autodetecção de delimitador (, ou ; ou tab)
 * e mapeamento flexível de cabeçalhos sem acentos/case-insensitive.
 */
export function parseVehicleCsvText(csvText: string): VehicleRecord[] {
  if (!csvText || typeof csvText !== 'string') return [];
  const trimmed = csvText.trim();

  // Rejeita HTML de erro ou redirecionamento do Google
  if (trimmed.startsWith('<') || trimmed.toLowerCase().includes('<!doctype html>') || trimmed.toLowerCase().includes('sorry, the file')) {
    console.warn('CSV recebido contém HTML (link privado ou página de erro).');
    return [];
  }

  // 1. Parse com PapaParse autodetectando delimitador (; ou , ou \t)
  const parsed = Papa.parse(trimmed, { skipEmptyLines: true });
  const rows = parsed.data as string[][];
  console.log('dadosBrutos:', rows);

  if (!Array.isArray(rows) || rows.length === 0) {
    return [];
  }

  // Procura a linha de cabeçalho que contenha CAVALO e CARRETAS
  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const rowStr = (rows[i] || []).join(' ').toUpperCase();
    if (rowStr.includes('CAVALO') && (rowStr.includes('CARRETAS') || rowStr.includes('STATUS'))) {
      headerRowIdx = i;
      break;
    }
  }

  const headers = headerRowIdx !== -1 ? rows[headerRowIdx].map(h => normalizeHeaderKey(h || '')) : [];

  const colIdx = {
    cavalo: headers.findIndex(h => h.includes('cavalo') || h.includes('placa')),
    carretas: headers.findIndex(h => h.includes('carreta') || h.includes('reboque')),
    status: headers.findIndex(h => h.includes('status') || h.includes('situacao')),
    dataTeste: headers.findIndex(h => h.includes('realiza') || h.includes('teste') || h.includes('datateste')),
    vencimento: headers.findIndex(h => h.includes('vencimento') || h.includes('venc')),
    dias: headers.findIndex(h => h.includes('dias')),
    manutencaoOs: headers.findIndex(h => h.includes('manutencao') || h.includes('os')),
    periferico: headers.findIndex(h => h.includes('periferico') || h.includes('perif')),
    observacao: headers.findIndex(h => h.includes('observa') || h.includes('obs')),
    unidade: headers.findIndex(h => h.includes('unidade'))
  };

  const linhasFormatadas: VehicleRecord[] = [];
  const startIdx = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;

  for (let i = startIdx; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    const firstCell = (r[0] || '').trim().toUpperCase();
    if (!firstCell || firstCell.includes('SANTA LUZIA CAVALO') || firstCell.includes('SANTA LUZIA') || firstCell.includes('CAVALO')) {
      continue;
    }

    const cavalo = (colIdx.cavalo !== -1 && r[colIdx.cavalo] ? r[colIdx.cavalo] : r[0])?.trim().toUpperCase();
    if (!cavalo || cavalo.length < 5) continue;

    const carretas = (colIdx.carretas !== -1 && r[colIdx.carretas] ? r[colIdx.carretas] : (r[1] || ''))?.trim().toUpperCase();
    const osStatus = (colIdx.status !== -1 && r[colIdx.status] ? r[colIdx.status] : (r[2] || ''))?.trim().toUpperCase();
    const dataTeste = (colIdx.dataTeste !== -1 && r[colIdx.dataTeste] ? r[colIdx.dataTeste] : (r[3] || ''))?.trim();
    const dataVencimento = (colIdx.vencimento !== -1 && r[colIdx.vencimento] ? r[colIdx.vencimento] : (r[4] || ''))?.trim();
    const manutencaoOs = (colIdx.manutencaoOs !== -1 && r[colIdx.manutencaoOs] ? r[colIdx.manutencaoOs] : (r[6] || ''))?.trim();
    const periferico = (colIdx.periferico !== -1 && r[colIdx.periferico] ? r[colIdx.periferico] : (r[7] || ''))?.trim();
    const observacao = (colIdx.observacao !== -1 && r[colIdx.observacao] ? r[colIdx.observacao] : (r[8] || ''))?.trim();

    linhasFormatadas.push({
      id: `sheet_${i}_${cavalo}`,
      cavalo,
      carretas,
      dataTeste: dataTeste || new Date().toISOString().split('T')[0],
      dataVencimento: dataVencimento || new Date().toISOString().split('T')[0],
      manutencaoOs,
      periferico,
      observacao,
      osStatus: (['PENDENTE', 'AGENDADO', 'EM ANDAMENTO', 'CONCLUÍDO', 'CANCELADO'].includes(osStatus) ? osStatus : 'PENDENTE') as any
    });
  }

  console.log('linhasFormatadas:', linhasFormatadas);
  return linhasFormatadas;
}

/**
 * Busca texto CSV da planilha pública utilizando fallback de múltiplos endpoints e anti-cache (_t=timestamp)
 */
export async function fetchSantaLuziaCsvString(url: string = PUBLIC_SANTA_LUZIA_CSV_URL): Promise<string> {
  const timestamp = Date.now();
  const urlsToTry = [
    url,
    'https://docs.google.com/spreadsheets/d/1pYw7zb9YwYzOHQoKMewxRrkj4vCbziD_ZJp0rzlM5X4/export?format=csv',
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTk96JM16EEGET9IhyTWe3LYlZKpDwhR2x9Rvl8dj9FrVkBQK9CdT4O9WNuSQkOdcVpGAG8VUVnq1KQ/pub?gid=330870322&single=true&output=csv'
  ];

  for (const targetUrl of urlsToTry) {
    const separator = targetUrl.includes('?') ? '&' : '?';
    const fetchUrl = `${targetUrl}${separator}_t=${timestamp}`;

    try {
      const res = await fetch(fetchUrl, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      if (res.ok) {
        const text = await res.text();
        if (text && !text.trim().startsWith('<') && !text.toLowerCase().includes('<!doctype html>')) {
          console.log("Dados sincronizados da planilha:", text);
          return text;
        }
      }
    } catch (e) {
      console.warn(`Direct fetch failed for ${targetUrl}:`, e);
    }

    try {
      const proxyUrl = `/api/web-app-proxy?url=${encodeURIComponent(fetchUrl)}`;
      const res = await fetch(proxyUrl, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isCsv && data.csvText) {
          if (!data.csvText.trim().startsWith('<')) {
            console.log("Dados sincronizados da planilha:", data.csvText);
            return data.csvText;
          }
        }
      }
    } catch (e) {
      console.warn(`Proxy fetch failed for ${targetUrl}:`, e);
    }
  }

  return '';
}

/**
 * Utilitário de parsing de texto CSV em formato de matriz de strings
 */
export function parseCsvText(csvText: string): string[][] {
  if (!csvText || !csvText.trim()) return [];
  const parsed = Papa.parse(csvText, { skipEmptyLines: true });
  return (parsed.data as string[][]) || [];
}

/**
 * Busca dados diretamente da planilha CSV pública de Santa Luzia sem exigir autenticação.
 */
export async function fetchSantaLuziaCsvData(url: string = PUBLIC_SANTA_LUZIA_CSV_URL): Promise<string[][]> {
  const csvText = await fetchSantaLuziaCsvString(url);
  if (csvText) {
    return parseCsvText(csvText);
  }
  return [];
}

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export interface DriveFileItem {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export async function listUserSpreadsheets(token: string): Promise<DriveFileItem[]> {
  const url = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=25`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Erro ao listar planilhas do Google Drive (${res.status})`
    );
  }

  const data = await res.json();
  return data.files || [];
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

/**
 * Código em Google Apps Script para a planilha responder requisições em tempo real via Web App (doGet / doPost).
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT - CONEXÃO EM TEMPO REAL COM O APP
 * -------------------------------------------------------------
 * 1. Na sua Planilha Google, vá no menu: Extensões > Apps Script
 * 2. Cole este código abaixo e clique no ícone de Salvar (Ctrl + S)
 * 3. Clique em "Implantar" (Deploy) > "Nova implantação"
 * 4. Tipo: "App da Web" (Web App)
 * 5. Executar como: "Eu" (Me)
 * 6. Quem pode acessar: "Qualquer pessoa" (Anyone)
 * 7. Clique em "Implantar" e conceda a permissão no Google
 * 8. Copie a URL do Web App gerada (termina em /exec) e cole no seu aplicativo!
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    var response = {
      status: "success",
      title: ss.getName(),
      sheetName: sheet.getName(),
      rows: data,
      totalRows: data.length,
      updatedAt: new Date().toISOString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    
    if (payload.rows && Array.isArray(payload.rows)) {
      sheet.clearContents();
      sheet.getRange(1, 1, payload.rows.length, payload.rows[0].length).setValues(payload.rows);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Planilha atualizada com sucesso!"
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

/**
 * Consulta a URL do Web App (Google Apps Script) através do proxy do app.
 */
export async function fetchDataFromWebAppUrl(webAppUrl: string): Promise<string[][]> {
  const proxyUrl = `/api/web-app-proxy?url=${encodeURIComponent(webAppUrl.trim())}`;
  const res = await fetch(proxyUrl);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erro HTTP ${res.status} ao consultar o Web App.`);
  }

  const data = await res.json();
  
  if (data.isCsv && data.csvText) {
    return data.csvText.split(/\r?\n/).map((line: string) => 
      line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
    );
  }

  if (data.rows && Array.isArray(data.rows)) {
    return data.rows;
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (data.data && Array.isArray(data.data)) {
    return data.data;
  }

  throw new Error('O endpoint respondeu com sucesso, mas a resposta não continha uma lista válida de linhas.');
}

