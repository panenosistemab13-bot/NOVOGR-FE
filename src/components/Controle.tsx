import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  User,
  CreditCard,
  Phone,
  Info,
  Sliders,
  Send,
  Sparkles,
  FileText,
  Truck,
  Cpu,
  Image,
  MapPin,
  Search,
  Package,
  Hash,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Battery,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  Filter,
  Layers,
  ExternalLink,
  ArrowUpDown,
  DollarSign,
  Radio,
  Minimize2,
  Maximize2,
  ChevronUp,
  LayoutGrid,
  List,
  ClipboardPaste,
  Building2,
  ShieldCheck,
  Navigation,
  Compass,
  CheckSquare,
  Coins,
  Calendar,
  Barcode,
  Container,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { cn } from "../lib/utils";
import { rtdb as db } from "../firebase";
import { ref, onValue, set, update } from "firebase/database";
import heroRotas from "../assets/images/hero_cinematic_rotas_1790216246671.jpg";

// Tech Corner Component
function TechCorner({ className }: { className?: string }) {
  return (
    <div className={cn("w-3.5 h-3.5 pointer-events-none select-none z-20", className)}>
      <div className="w-full h-[2px] bg-gradient-to-r from-red-500 to-transparent" />
      <div className="w-[2px] h-full bg-gradient-to-b from-red-500 to-transparent" />
    </div>
  );
}

const TRANSPORTADORAS = [
  "apk",
  "tomasi",
  "moedense",
  "Frota 3C",
  "TRANSMAGNA",
  "RNCGG",
  "GT MINAS",
  "GOBOR",
  "SRH SARAIVA",
  "PACTUAL",
  "JETTA",
  "TECPET",
  "TRANS DANIEL",
  "UTISEG TRANSPORTES E LOCACOES LTDA",
  "COMBOIO",
  "REAL 94",
  "TORNADO",
  "FUJIOKA",
  "MERCOTRUCK",
  "UNITRADING LOG",
];

const EMBARQUE_IMAGES = [
  { value: "https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF", label: "Paletizado (Padrão)" },
  {
    value: "https://lh3.googleusercontent.com/d/1L3oKNxekiqIQ_Uy8L9a7q8qZwx772qmH",
    label: "Carga Batida (Padrão)",
  },
  { value: "https://lh3.googleusercontent.com/d/1RdjcMTVC2ofuxQVzajM0S01VSMAXLaMf", label: "AMARELIN" },
  { value: "https://lh3.googleusercontent.com/d/17dIlYwXF3McL0Xr-Hs00COyFH9A0REEh", label: "SUPERIOR BATIDO" },
  { value: "https://lh3.googleusercontent.com/d/1JGe0rvxIMqBpMMxclgFpQj47GqVl1VMX", label: "CASTANHA" },
  { value: "https://lh3.googleusercontent.com/d/1kI3l33NFrTlqnDveMgKWHfFfU5WA6OTQ", label: "IZOTONICO" },
  { value: "https://lh3.googleusercontent.com/d/1EQ5fMDDHViGvBd8-ehlwhyE4yyOc_peH", label: "ALMOFADA" },
  { value: "https://lh3.googleusercontent.com/d/1-OVNvrvxJ_t6RCj8hQpU0ZDtk3BfVWBV", label: "LADO DIREITO SUPERIOR BATIDO (PORTA)" },
  { value: "https://lh3.googleusercontent.com/d/14F4wPXwU607GmwqphSzlXk7xZ_EhOdWS", label: "LADO ESQUERDO SUPERIOR BATIDO" },
  { value: "https://lh3.googleusercontent.com/d/1J3nx_-iBh-5AiBJEB5fZrv_wW9sJNIXI", label: "LADO DIREITO SUPERIOR - BATIDO/PALETIZADO" },
  { value: "https://lh3.googleusercontent.com/d/1cw1CQiD8FUzeIBh36sBObz91h8k3bls1", label: "LADO ESQUERDO SUPERIOR - BATIDO/PALETIZADO" },
  { value: "none", label: "Nenhum Embarque" },
];

export const getLocalFallbackImg = (url: string) => {
  if (!url || url === "none") return "";
  if (url.includes("1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF")) return "/images/img_0.png";
  if (url.includes("1L3oKNxekiqIQ_Uy8L9a7q8qZwx772qmH")) return "/images/img_1.png";
  if (url.includes("1RdjcMTVC2ofuxQVzajM0S01VSMAXLaMf")) return "/images/img_2.png";
  if (url.includes("17dIlYwXF3McL0Xr-Hs00COyFH9A0REEh")) return "/images/img_3.png";
  if (url.includes("1JGe0rvxIMqBpMMxclgFpQj47GqVl1VMX")) return "/images/img_4.png";
  if (url.includes("1kI3l33NFrTlqnDveMgKWHfFfU5WA6OTQ")) return "/images/img_5.png";
  if (url.includes("1EQ5fMDDHViGvBd8-ehlwhyE4yyOc_peH")) return "/images/img_6.png";
  if (url.includes("1-OVNvrvxJ_t6RCj8hQpU0ZDtk3BfVWBV")) return "/images/img_7.png";
  if (url.includes("14F4wPXwU607GmwqphSzlXk7xZ_EhOdWS")) return "/images/img_8.png";
  if (url.includes("1J3nx_-iBh-5AiBJEB5fZrv_wW9sJNIXI") || url.includes("1t20tqT1GEkUUMcsWKcI4NAuinJmX1a8k")) return url;
  if (url.includes("1cw1CQiD8FUzeIBh36sBObz91h8k3bls1")) return url;
  if (url.startsWith("/images/")) return url;
  return url;
};

export const DESTINOS_PLANILHA_ISCAS = [
  "ARAÇARIGUAMA",
  "ARIQUEMES-RO",
  "BARBALHA",
  "BRASILIA",
  "CAMPO GRANDE",
  "CLIENTE",
  "CUIABA",
  "CURITIBA",
  "DESCARTÁVEL",
  "EUSEBIO",
  "EXPORTAÇÃO",
  "GOVERNADOR CR",
  "GRAVATAI",
  "GUARULHOS",
  "JUIZ DE FORA",
  "JOÃO PESSOA",
  "LONDRINA",
  "MACEIÓ",
  "MANAUS",
  "MOSSORO",
  "MONTES CLAROS",
  "NATAL",
  "RECIFE",
  "RIO DE JANEIRO",
  "SALVADOR",
  "SANTA LUZIA",
  "SMART",
  "SUMARE",
  "TERESINA",
  "TOTAL SERVICE",
  "VESPASIANO",
  "VIANA"
];

export const cleanDestinoForPlanilha = (raw: string): string => {
  if (!raw) return "";
  const upper = raw.toUpperCase().trim();
  
  if (DESTINOS_PLANILHA_ISCAS.includes(upper)) return upper;

  let clean = upper.replace(/^SANTA\s+LUZIA(?:\/MG)?\s*X\s*/i, "").trim();

  if (DESTINOS_PLANILHA_ISCAS.includes(clean)) return clean;

  if (clean.includes("PINHAIS")) return "CURITIBA";
  if (clean.includes("GOV") || clean.includes("CELSO RAMOS") || clean.includes("GOVERNADOR")) return "GOVERNADOR CR";
  if (clean.includes("RIO DE JANEIRO")) return "RIO DE JANEIRO";
  if (clean.includes("GUARULHOS")) return "GUARULHOS";
  if (clean.includes("BRASILIA") || clean.includes("BRASÍLIA")) return "BRASILIA";
  if (clean.includes("MONTES CLAROS")) return "MONTES CLAROS";
  if (clean.includes("LONDRINA")) return "LONDRINA";
  if (clean.includes("VIANA")) return "VIANA";
  if (clean.includes("CAMPO GRANDE")) return "CAMPO GRANDE";
  if (clean.includes("CLIENTE")) return "CLIENTE";
  if (clean.includes("CUIABA") || clean.includes("CUIABÁ")) return "CUIABA";
  if (clean.includes("EUSEBIO") || clean.includes("EUSÉBIO")) return "EUSEBIO";
  if (clean.includes("EXPORTAÇÃO") || clean.includes("EXPORTACAO")) return "EXPORTAÇÃO";
  if (clean.includes("GRAVATAI") || clean.includes("GRAVATAÍ")) return "GRAVATAI";
  if (clean.includes("JUIZ DE FORA")) return "JUIZ DE FORA";
  if (clean.includes("MANAUS")) return "MANAUS";
  if (clean.includes("MOSSORO") || clean.includes("MOSSORÓ")) return "MOSSORO";
  if (clean.includes("NATAL")) return "NATAL";
  if (clean.includes("ARIQUEMES")) return "ARIQUEMES-RO";
  if (clean.includes("RECIFE")) return "RECIFE";
  if (clean.includes("SALVADOR")) return "SALVADOR";
  if (clean.includes("SANTA LUZIA")) return "SANTA LUZIA";
  if (clean.includes("SMART")) return "SMART";
  if (clean.includes("SUMARE") || clean.includes("SUMARÉ")) return "SUMARE";
  if (clean.includes("TOTAL SERVICE")) return "TOTAL SERVICE";
  if (clean.includes("VESPASIANO")) return "VESPASIANO";
  if (clean.includes("TERESINA")) return "TERESINA";
  if (clean.includes("BARBALHA")) return "BARBALHA";
  if (clean.includes("MACEIÓ") || clean.includes("MACEIO")) return "MACEIÓ";
  if (clean.includes("JOÃO PESSOA") || clean.includes("JOAO PESSOA")) return "JOÃO PESSOA";
  if (clean.includes("ARAÇARIGUAMA") || clean.includes("ARACARIGUAMA")) return "ARAÇARIGUAMA";
  if (clean.includes("CURITIBA")) return "CURITIBA";
  if (clean.includes("DESCARTÁVEL") || clean.includes("DESCARTAVEL")) return "DESCARTÁVEL";

  const withoutUf = clean.replace(/\/[A-Z]{2}$/, "").trim();
  if (DESTINOS_PLANILHA_ISCAS.includes(withoutUf)) return withoutUf;

  return clean;
};

const DESTINOS_OPCOES = [
  "SANTA LUZIA/MG x RIO DE JANEIRO/RJ",
  "SANTA LUZIA/MG x GUARULHOS/SP",
  "SANTA LUZIA/MG x BRASÍLIA/DF",
  "SANTA LUZIA/MG x PINHAIS/PR",
  "SANTA LUZIA/MG x MONTES CLAROS/MG",
  "SANTA LUZIA/MG x LONDRINA/PR",
  "SANTA LUZIA/MG x VIANA/ES",
  "SANTA LUZIA/MG x 3 CAFFI",
  "SANTA LUZIA/MG x CAMPO GRANDE/MS",
  "SANTA LUZIA/MG x CLIENTE",
  "SANTA LUZIA/MG x CUIABÁ/MT",
  "SANTA LUZIA/MG x EUSÉBIO/CE",
  "SANTA LUZIA/MG x EXPORTAÇÃO",
  "SANTA LUZIA/MG x GOV. CELSO RAMOS/SC",
  "SANTA LUZIA/MG x GRAVATAÍ/RS",
  "SANTA LUZIA/MG x JUIZ DE FORA/MG",
  "SANTA LUZIA/MG x MANAUS/AM",
  "SANTA LUZIA/MG x MOSSORÓ/RN",
  "SANTA LUZIA/MG x NATAL/RN",
  "SANTA LUZIA/MG x ARIQUEMES/RO",
  "SANTA LUZIA/MG x RECIFE/PE",
  "SANTA LUZIA/MG x SALVADOR/BA",
  "SANTA LUZIA/MG x SANTA LUZIA/MG",
  "SANTA LUZIA/MG x SMART",
  "SANTA LUZIA/MG x SUMARÉ/SP",
  "SANTA LUZIA/MG x TOTAL SERVICE",
  "SANTA LUZIA/MG x VESPASIANO/MG",
  "SANTA LUZIA/MG x BEBEDOURO/SP",
  "SANTA LUZIA/MG x CASTRO/PR",
  "SANTA LUZIA/MG x JUNDIAÍ/SP",
  "SANTA LUZIA/MG x DMA",
  "SANTA LUZIA/MG x PATROCÍNIO PAULISTA/SP",
  "SANTA LUZIA/MG x VARGEM GRANDE DO SUL/SP",
  "SANTA LUZIA/MG x SUPERFRIO",
  "SANTA LUZIA/MG x TRIANGULO/SP",
  "SANTA LUZIA/MG x NATAL/RN x EUSÉBIO/CE",
  "SANTA LUZIA/MG x BARRA VELHA/SC",
  "SANTA LUZIA/MG x UBERLÂNDIA/MG",
  "SANTA LUZIA/MG x CONTAGEM/MG",
  "SANTA LUZIA/MG x POUSO ALEGRE/MG",
  "SANTA LUZIA/MG x CONDOR x CURITIBA/PR",
  "SANTA LUZIA/MG x MUFFATO x CAMBÉ/PR",
  "SANTA LUZIA/MG x DESTRO x CURITIBA/PR",
  "SANTA LUZIA/MG x CUIABÁ/MT x ARIQUEMES/RO",
  "SANTA LUZIA/MG x PORTO ALEGRE/RS",
  "SANTA LUZIA/MG x CECONSUD",
  "SANTA LUZIA/MG x FUJIOKA x BRASÍLIA/DF",
  "SANTA LUZIA/MG x XAXIM/SC",
  "SANTA LUZIA/MG x TERESINA/PI",
  "SANTA LUZIA/MG x BARBALHA/CE",
  "SANTA LUZIA/MG x CSD x PAIÇANDU/PR",
  "SANTA LUZIA/MG x CARIACICA/ES",
  "SANTA LUZIA/MG x CAMPO GRANDE/MS x CUIABÁ/MT",
  "SANTA LUZIA/MG x MACEIÓ/AL",
  "SANTA LUZIA/MG x EF SOLUÇÕES LOG x GUARULHOS/SP",
  "SANTA LUZIA/MG x JOÃO PESSOA/PB",
  "SANTA LUZIA/MG x BELÉM/PA",
];

const ORIGEM_OPCOES = [
  "SANTA LUZIA/MG",
  "VIANA/ES",
  "SERRA/ES",
  "CARIACICA/ES",
  "MONTES CLAROS/MG",
  "SMART/MG",
  "TOTAL SERVICE/MG",
  "CUIABÁ/MT",
  "JUIZ DE FORA/MG",
];

export interface ParsedPlacaItem {
  id: string;
  transportador: string;
  condutor: string;
  cavalo: string;
  carreta1: string;
  carreta2: string;
  destino: string;
  origem?: string;
  modeloCarreta?: string;
  modeloCavalo?: string;
  nf?: string;
  valorNf?: string;
  tecnologia?: string;
  data?: string;
  status?: string;
  cpf?: string;
  telefone?: string;
  rawRowsCount: number;
}

export function parseCurrencyNumber(val?: string | number): number {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  let cleaned = val.trim().replace(/^["']|["']$/g, "");
  if (!cleaned || cleaned === "-" || cleaned === "---") return 0;

  // Remove currency symbols (R$, RS, $, etc.) and spaces
  cleaned = cleaned.replace(/R?S?\$?\s*/gi, "").trim();

  // If both dot and comma exist (e.g. "176.627,35")
  if (cleaned.includes(".") && cleaned.includes(",")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    // Only comma exists (e.g. "176627,35" or "1000,00")
    cleaned = cleaned.replace(",", ".");
  } else if (cleaned.includes(".")) {
    // Only dot exists (e.g. "176.627" or "176627.35")
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = cleaned.replace(/\./g, "");
    } else if (parts.length === 2 && parts[1].length === 3) {
      cleaned = cleaned.replace(/\./g, "");
    }
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatValorNf(val?: string | number): string {
  if (val === undefined || val === null || val === "") return "";
  if (typeof val === "number") {
    if (isNaN(val) || val <= 0) return "";
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  const cleaned = val.trim().replace(/^["']|["']$/g, "");
  if (!cleaned || cleaned === "-" || cleaned === "---") return "";

  // Check if it already has R$, RS, or similar currency symbol
  if (/^R?S?\$?\s*/i.test(cleaned)) {
    const numPart = cleaned.replace(/^R?S?\$?\s*/i, "").trim();
    const parsedNum = parseCurrencyNumber(numPart);
    if (parsedNum > 0) {
      return parsedNum.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    if (numPart) {
      return `R$ ${numPart}`;
    }
  }

  const num = parseCurrencyNumber(cleaned);
  if (num > 0) {
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  return cleaned;
}

export const normalizePlacaTransportador = (raw?: string): string => {
  if (!raw) return "";
  const clean = raw.trim().replace(/^["']|["']$/g, "");
  const upper = clean.toUpperCase();
  if (
    upper === "3C" ||
    upper === "3 C" ||
    upper === "3-C" ||
    upper === "FROTA 3C" ||
    upper === "FROTA 3 C" ||
    upper === "FROTA3C" ||
    upper === "3C TRANSPORTES" ||
    upper === "TRANSPORTADORA 3C" ||
    upper === "TRANSP 3C"
  ) {
    return "Frota 3C";
  }
  return clean;
};

export function findBestMatchingRoute(
  destinoInput: string,
  origemInput: string
): { rota: string; destinoFinal: string } {
  if (!destinoInput || !destinoInput.trim()) {
    return { rota: "", destinoFinal: "" };
  }

  const cleanDest = destinoInput.trim().replace(/^["']|["']$/g, "").toUpperCase();
  const stripAccents = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

  const normInput = stripAccents(cleanDest);
  const inputWithoutUf = stripAccents(cleanDest.replace(/\/[A-Z]{2}$/, "").trim());

  let bestMatch: string | null = null;

  for (const opt of DESTINOS_OPCOES) {
    const parts = opt.split(/\s*x\s*/i);
    const destPart = parts[parts.length - 1]?.trim() || "";
    const normDestPart = stripAccents(destPart);
    const destPartWithoutUf = stripAccents(destPart.replace(/\/[A-Z]{2}$/, "").trim());

    // 1. Exact match with or without UF
    if (normInput === normDestPart || inputWithoutUf === destPartWithoutUf) {
      bestMatch = opt;
      break;
    }

    // 2. Contains match
    if (
      normInput.length >= 3 &&
      (normDestPart.includes(normInput) ||
        normInput.includes(normDestPart) ||
        destPartWithoutUf.includes(inputWithoutUf) ||
        inputWithoutUf.includes(destPartWithoutUf))
    ) {
      if (!bestMatch) bestMatch = opt;
    }
  }

  // Also check special known destinations (e.g. SÍTIO NOVO -> RECIFE or similar)
  if (!bestMatch && normInput.includes("SITIO NOVO")) {
    const recife = DESTINOS_OPCOES.find((o) => o.includes("RECIFE"));
    if (recife) bestMatch = recife;
  }

  if (bestMatch) {
    const formattedRoute = bestMatch.replace(/^SANTA LUZIA\/MG/i, origemInput);
    const parts = formattedRoute.split(/\s*x\s*/i);
    const lastPart = parts[parts.length - 1]?.trim() || cleanDest;
    return {
      rota: formattedRoute,
      destinoFinal: lastPart,
    };
  }

  return {
    rota: `${origemInput} x ${cleanDest}`,
    destinoFinal: cleanDest,
  };
}

export const SAMPLE_PLACAS_SHEET_DATA = `N°\tORIGEM\tDIA\tDATA\tCONTATO WHATS\tHORA LIBERADO\tSTATUS\tMODELO CARRETA\tMODELO CAVALO\tPRÉ-CHECKLIST\tDESTINO\tTRANSPORTADOR\tCAVALO\tCARRETA\tN° PALLETS\tPBT (TON)\tNF\tCATEGORIA\tTECNOLOGIA\tCONDUTOR\tCPF\tRG / SSP\tCNH\tTELEFONE\tVALOR NF
1\tMONTES CLAROS/MG\tsexta-feira\t29/08/2024\tX\t05:05:00\tLIBERADO PARA VISTORIA EM DOCA\tRODOTREM BAÚ\tTRUCADO\tSIM\tGUARULHOS\tTRANSVALADARES\tSFD3J76\tEKP0L77\t21\t23\t44271\tFROTA\tSIGHRA\tDAMIÃO GALVÃO ALVES\t602.985.092-34\t1330755 SSP/AL\t05145674570\t(87) 98129-1287\tR$ 176.627,35
2\tMONTES CLAROS/MG\tsexta-feira\t29/08/2024\tX\t05:05:00\tLIBERADO PARA VISTORIA EM DOCA\tRODOTREM BAÚ\tTRUCADO\tSIM\tGUARULHOS\tTRANSVALADARES\tSFD3J76\tSEB8F09\t21\t23\t44272\tFROTA\tSIGHRA\tDAMIÃO GALVÃO ALVES\t602.985.092-34\t1330755 SSP/AL\t05145674570\t(87) 98129-1287\tR$ 176.627,35
3\tSANTA LUZIA/MG\tsexta-feira\t29/08/2024\tX\t05:06:51\tLIBERADO PARA VISTORIA EM DOCA\tSIDER\tTRUCK\tSIM\tREC. SÍTIO NOVO\tTORNADO\tTDF8G11\tRFV0E16\t28\t30\t53512\tFROTA\tONIXSAT\tCLEUSMAR M DA SILVA\t716.870.495-87\t64188941 SSP RJ\t01256784562\t(31) 97134-9810\tR$ 145.890,20
4\tSANTA LUZIA/MG\tsexta-feira\t29/08/2024\t29.08.59\tLIBERADO PARA VISTORIA EM DOCA\tSIDER\tTRUCK\tSIM\tGRAVATAÍ\tTENNA\tUVP-9C05\t---\t28\t30\t53513\tFROTA\tSASCAR\tFRANCISCO CLAWLISON DA SILVA\t056.888.895-70\t49258921 SSP MG\t01529475185\t(31) 98931-1558\tR$ 192.410,00
5\tSANTA LUZIA/MG\tsábado\t29/08/2024\tX\t08:19:00\tLIBERADO PARA VISTORIA EM DOCA\tRODOTREM BAÚ\tTRUCADO\tSIM\tNATAL\t3C\tUVP-9C05\tUVP0B29\t21\t17\t44273\tFROTA 3C\tSASCAR\tEMMANUEL RICARDO DE LIMA\t069.652.001-11\t18951234MG1\t01648291754\t(31) 99812-4411\tR$ 177.724,27
6\tSANTA LUZIA/MG\tsábado\t29/08/2024\t09:07:00\t09:50:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tSUMARÉ\tTENNA\tRMK5E77\tSDQ5F71\t28\t30\t53514\tFROTA\tSIGHRA\tJOSE MORAIS DE SOUSA\t906.750.185-00\t092551200 SSP BA\t01644257107\t(71) 71 99219-2756\tR$ 169.627,35
7\tSANTA LUZIA/MG\tsábado\t29/08/2024\t09:55:00\t09:55:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tTFD8E27\tSDQ5F71\t28\t30\t53515\tFROTA\tSIGHRA\tALEXANDRE MACHADO COELHO\t123.056.347-09\t22104523 DET RJ\t02074369037\t(21) 21 98908-0026\tR$ 181.230,00
8\tSANTA LUZIA/MG\tsábado\t29/08/2024\t11:10:00\t12:14:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tRFM1J37\tKEM4C01\t28\t30\t53516\tFROTA\tSIGHRA\tMARCOS DE MELLO GODOY\t121.142.296-30\t11467412 SSP SP\t02089207039\t(11) 11 98319-3344\tR$ 176.627,35
9\tSANTA LUZIA/MG\tsábado\t29/08/2024\t11:06:00\t12:35:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tSBW1E02\tKEM4C01\t28\t30\t53517\tFROTA\tSIGHRA\tDIEGO CARNEIRO\t127.355.829-06\t18432651 SSP SP\t01633596188\t(11) 11 98265-7607\tR$ 176.627,35
10\tSANTA LUZIA/MG\tsábado\t29/08/2024\t12:26:00\t12:49:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tSBG7H83\tMSV1J96\t28\t30\t53518\tFROTA\tSIGHRA\tMARCOS GABRIEL OLIVEIRA\t135.097.437-84\t24531872 DET RJ\t04402638459\t(21) 21 98380-0010\tR$ 176.627,35
11\tSANTA LUZIA/MG\tsábado\t29/08/2024\t13:15:00\t14:58:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tRNF6D84\tMSV1J96\t28\t30\t53519\tFROTA\tSIGHRA\tANTONILSON CAMPANHO DE SOUZA LACERDA\t126.658.877-06\t12934812 DET RJ\t03082531065\t(21) 21 99812-0535\tR$ 177.724,27
12\tSANTA LUZIA/MG\tsábado\t29/08/2024\t14:28:00\t15:19:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tSAZ6E84\tRFE2J49\t28\t30\t53520\tFROTA\tSIGHRA\tBONIFACIO BARBOSA DA SILVA\t052.352.766-17\t08129812 SSP AL\t07002317398\t(82) 82 99600-1120\tR$ 180.500,00
13\tSANTA LUZIA/MG\tsábado\t29/08/2024\t15:05:00\t16:43:00\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tGUARULHOS\tTRANSVALADARES\tSAY2C81\tRFE2J49\t28\t30\t53521\tFROTA\tSIGHRA\tROBERTO CARLOS PORTUGAL OLIVEIRA\t082.057.457-25\t12948603 DET RJ\t00510251776\t(21) 21 99846-8007\tR$ 176.627,35
14\tSANTA LUZIA/MG\tdomingo\t29/08/2024\tX\t09:05:36\tLIBERADO PARA VISTORIA EM DOCA\tBAÚ\tTRUCADO\tSIM\tRIO DE JANEIRO\tTRANSVALADARES\tRVP9E38\tMDL9F97\t28\t30\t53522\tFROTA\tSIGHRA\tDERLEI PEREIRA DA SILVA\t082.739.561-16\t2856634 SDS PB\t01438973575\t(83) 83 99880-9008\tR$ 176.627,35`;

export function parsePlacasData(text: string): ParsedPlacaItem[] {
  if (!text || !text.trim()) return [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Check headers in first line
  const firstCols = lines[0].split("\t").map((c) => c.trim().toUpperCase());

  const findHeaderIdx = (patterns: string[]) => {
    return firstCols.findIndex((col) =>
      patterns.some((p) => col === p || col.includes(p))
    );
  };

  let transpIdx = findHeaderIdx(["TRANSPORTADOR", "TRANSPORTADORA", "TRANSP", "EMPRESA"]);
  let condutorIdx = findHeaderIdx(["CONDUTOR", "MOTORISTA", "NOME MOTORISTA", "NOME CONDUTOR"]);
  let cavaloIdx = findHeaderIdx(["CAVALO", "PLACA CAVALO", "PLACA DO CAVALO", "PLACA CAV"]);
  let carretaIdx = findHeaderIdx(["CARRETA", "PLACA CARRETA", "SEMI-REBOQUE", "PLACA CAR", "CARRETA 1"]);
  let destinoIdx = findHeaderIdx(["DESTINO", "CIDADE DESTINO", "UNIDADE DESTINO", "DEST"]);
  let origemIdx = findHeaderIdx(["ORIGEM", "CIDADE ORIGEM", "UNIDADE ORIGEM"]);
  let nfIdx = findHeaderIdx(["NF", "NOTA FISCAL", "Nº NF", "N° NF"]);
  let valorNfIdx = findHeaderIdx(["VALOR NF", "VALOR DA CARGA", "VALOR CARGA", "VALOR_NF", "VALOR", "VLR NF", "VLR CARGA"]);
  if (valorNfIdx === -1) {
    valorNfIdx = firstCols.findIndex(
      (col) => col.includes("VALOR") && !col.includes("DATA") && !col.includes("STATUS")
    );
  }
  let tecnologiaIdx = findHeaderIdx(["TECNOLOGIA", "RASTREADOR", "SISTEMA"]);
  let modeloCarretaIdx = findHeaderIdx(["MODELO CARRETA", "TIPO CARRETA"]);
  let modeloCavaloIdx = findHeaderIdx(["MODELO CAVALO", "TIPO CAVALO"]);
  let statusIdx = findHeaderIdx(["STATUS"]);
  let cpfIdx = findHeaderIdx(["CPF"]);
  let telIdx = findHeaderIdx(["TELEFONE", "TEL", "CELULAR", "CONTATO"]);

  const hasHeaders =
    cavaloIdx !== -1 ||
    condutorIdx !== -1 ||
    transpIdx !== -1 ||
    destinoIdx !== -1 ||
    carretaIdx !== -1;
  const startRow = hasHeaders ? 1 : 0;

  // Fallback positional index matching Google Sheet in image.png if no headers detected:
  // Col 1: ORIGEM, Col 10: DESTINO, Col 11: TRANSPORTADOR, Col 12: CAVALO, Col 13: CARRETA, Col 16: NF, Col 18: TECNOLOGIA, Col 19: CONDUTOR, Col 33: VALOR NF
  if (!hasHeaders) {
    origemIdx = 1;
    destinoIdx = 10;
    transpIdx = 11;
    cavaloIdx = 12;
    carretaIdx = 13;
    nfIdx = 16;
    tecnologiaIdx = 18;
    condutorIdx = 19;
    cpfIdx = 20;
    telIdx = 23;
    valorNfIdx = 33;
  }

  const cleanVal = (v?: string) => (v || "").trim().replace(/^["']|["']$/g, "");
  const cleanPlate = (v?: string) => {
    const s = cleanVal(v).toUpperCase().replace(/[^A-Z0-9-]/g, "");
    if (s === "---" || s === "-" || s === "SEM PLACA" || s === "SEM CARRETA" || s === "SEMISCA" || s === "SEM") return "";
    return s;
  };

  const rawList: {
    transportador: string;
    condutor: string;
    cavalo: string;
    carreta: string;
    destino: string;
    origem: string;
    nf: string;
    valorNf: string;
    tecnologia: string;
    modeloCarreta: string;
    modeloCavalo: string;
    status: string;
    cpf: string;
    telefone: string;
  }[] = [];

  for (let i = startRow; i < lines.length; i++) {
    const cols = lines[i].split("\t");
    if (cols.length < 2) continue;

    const cavalo = cleanPlate(cavaloIdx >= 0 ? cols[cavaloIdx] : "");
    const carreta = cleanPlate(carretaIdx >= 0 ? cols[carretaIdx] : "");
    const transp = normalizePlacaTransportador(cleanVal(transpIdx >= 0 ? cols[transpIdx] : ""));
    const condutor = cleanVal(condutorIdx >= 0 ? cols[condutorIdx] : "").toUpperCase();
    const destino = cleanVal(destinoIdx >= 0 ? cols[destinoIdx] : "").toUpperCase();
    const origem = cleanVal(origemIdx >= 0 ? cols[origemIdx] : "").toUpperCase();
    const nf = cleanVal(nfIdx >= 0 ? cols[nfIdx] : "");
    const valorNf = formatValorNf(
      valorNfIdx >= 0 ? cols[valorNfIdx] : (cols.length > 33 ? cols[33] : "")
    );
    const tecnologia = cleanVal(tecnologiaIdx >= 0 ? cols[tecnologiaIdx] : "").toUpperCase();
    const modeloCarreta = cleanVal(modeloCarretaIdx >= 0 ? cols[modeloCarretaIdx] : "").toUpperCase();
    const modeloCavalo = cleanVal(modeloCavaloIdx >= 0 ? cols[modeloCavaloIdx] : "").toUpperCase();
    const status = cleanVal(statusIdx >= 0 ? cols[statusIdx] : "").toUpperCase();
    const cpf = cleanVal(cpfIdx >= 0 ? cols[cpfIdx] : "");
    const telefone = cleanVal(telIdx >= 0 ? cols[telIdx] : "");

    if (!cavalo && !condutor && !transp && !carreta && !destino) continue;

    rawList.push({
      transportador: transp,
      condutor,
      cavalo,
      carreta,
      destino,
      origem,
      nf,
      valorNf,
      tecnologia,
      modeloCarreta,
      modeloCavalo,
      status,
      cpf,
      telefone,
    });
  }

  // Intelligent grouping by Cavalo plate or (Condutor + Destino)
  const groupedMap = new globalThis.Map<string, ParsedPlacaItem>();

  rawList.forEach((item, idx) => {
    const groupKey = item.cavalo ? item.cavalo : `${item.condutor}_${item.destino}_${idx}`;
    if (!groupedMap.has(groupKey)) {
      groupedMap.set(groupKey, {
        id: `placa_${idx}_${item.cavalo || idx}`,
        transportador: item.transportador,
        condutor: item.condutor,
        cavalo: item.cavalo,
        carreta1: item.carreta,
        carreta2: "",
        destino: item.destino,
        origem: item.origem,
        nf: item.nf,
        valorNf: item.valorNf,
        tecnologia: item.tecnologia,
        modeloCarreta: item.modeloCarreta,
        modeloCavalo: item.modeloCavalo,
        status: item.status,
        cpf: item.cpf,
        telefone: item.telefone,
        rawRowsCount: 1,
      });
    } else {
      const existing = groupedMap.get(groupKey)!;
      existing.rawRowsCount++;
      if (item.carreta && item.carreta !== existing.carreta1 && !existing.carreta2) {
        existing.carreta2 = item.carreta;
      }
      if (!existing.transportador && item.transportador) existing.transportador = item.transportador;
      if (!existing.condutor && item.condutor) existing.condutor = item.condutor;
      if (!existing.destino && item.destino) existing.destino = item.destino;
      if (!existing.origem && item.origem) existing.origem = item.origem;
      if (!existing.nf && item.nf) existing.nf = item.nf;
      else if (existing.nf && item.nf && !existing.nf.includes(item.nf)) {
        existing.nf = `${existing.nf} / ${item.nf}`;
      }
      if (!existing.valorNf && item.valorNf) {
        existing.valorNf = item.valorNf;
      } else if (existing.valorNf && item.valorNf) {
        const v1 = parseCurrencyNumber(existing.valorNf);
        const v2 = parseCurrencyNumber(item.valorNf);
        if (v1 > 0 || v2 > 0) {
          const sum = v1 + v2;
          existing.valorNf = formatValorNf(sum);
        }
      }
      if (!existing.tecnologia && item.tecnologia) existing.tecnologia = item.tecnologia;
      if (!existing.cpf && item.cpf) existing.cpf = item.cpf;
      if (!existing.telefone && item.telefone) existing.telefone = item.telefone;
    }
  });

  return Array.from(groupedMap.values());
}

export interface ParsedUnidadeItem {
  carreta: string;  // Coluna 1: Placa da carreta
  isca: string;     // Coluna 2: Número da isca
  produto: string;  // Coluna 3: Produto / Descrição / Posição
  uma: string;      // Coluna 4: U.M.A
  nf: string;       // Coluna 5: NF
  esquema: string;  // Esquema / Posição
}

export interface ParsedUnidadeInfo {
  dataEmbarque: string;
  cavalo: string;
  carretas: ParsedUnidadeItem[];
  destino: string;
  transportadora: string;
  motorista: string;
  tecnologia: string;
}

export const SAMPLE_UNIDADES_TEXT = `Data do embarque: 02/09/2026

RODO

Placa do cavalo: RFX9E81

Placa do Baú: RBV2C89 - R100001239 - 12211016 - LADO DIREITO SUPERIOR - BATIDO
NF : 305124

Placa do Baú: RBV2D09 - R100000620 - 12211016- LADO DIREITO SUPERIOR - BATIDO
NF:305128

Destino: CAMPO GRANDE - MS
Transportadora: Ledfran
Motorista: Diego Pereira`;

export function parseUnidadesText(text: string): ParsedUnidadeInfo {
  const result: ParsedUnidadeInfo = {
    dataEmbarque: "",
    cavalo: "",
    carretas: [],
    destino: "",
    transportadora: "",
    motorista: "",
    tecnologia: "",
  };

  if (!text || !text.trim()) return result;

  const lines = text.split("\n").map((l) => l.trim());

  let currentCarretaIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // 1. Data do embarque
    const dateMatch = line.match(/(?:Data(?:\s+do\s+embarque)?)\s*:\s*([^\n]+)/i);
    if (dateMatch && !result.dataEmbarque) {
      result.dataEmbarque = dateMatch[1].trim();
      continue;
    }

    // 2. Placa do cavalo
    const cavaloMatch = line.match(/(?:Placa\s+do\s+cavalo|Cavalo|Placa\s+Cavalo)\s*:\s*([A-Za-z0-9-]+)/i);
    if (cavaloMatch && !result.cavalo) {
      result.cavalo = cavaloMatch[1].trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
      continue;
    }

    // 3. Destino
    const destMatch = line.match(/Destino\s*:\s*([^\n]+)/i);
    if (destMatch && !result.destino) {
      result.destino = destMatch[1].trim().toUpperCase();
      continue;
    }

    // 4. Transportadora
    const transpMatch = line.match(/Transportadora\s*:\s*([^\n]+)/i);
    if (transpMatch && !result.transportadora) {
      result.transportadora = transpMatch[1].trim();
      continue;
    }

    // 5. Motorista / Condutor
    const motMatch = line.match(/(?:Motorista|Condutor)\s*:\s*([^\n]+)/i);
    if (motMatch && !result.motorista) {
      result.motorista = motMatch[1].trim().toUpperCase();
      continue;
    }

    // 6. Tecnologia / Rastreador
    const tecMatch = line.match(/(?:Tecnologia|Rastreador)\s*:\s*([^\n]+)/i);
    if (tecMatch && !result.tecnologia) {
      result.tecnologia = tecMatch[1].trim().toUpperCase();
      continue;
    }

    // 7. Placa do Baú / Carreta / Semi-reboque or line with hyphen/tab separated columns
    const isBauPrefix = /(?:Placa\s+do\s+Baú|Placa\s+do\s+Bau|Placa\s+da\s+Carreta|Carreta|Baú|Bau)\s*:/i.test(line);
    const partsCount = line.split(/[-\u2013\u2014;\t]/).length;
    const isMultiColumnLine = partsCount >= 2 && !/^(Data|Destino|Transportadora|Motorista|Condutor|Tecnologia|Rastreador|Placa\s+do\s+cavalo|Cavalo)/i.test(line);

    if (isBauPrefix || isMultiColumnLine) {
      const cleanLine = line.replace(/^(Placa\s+do\s+Baú|Placa\s+do\s+Bau|Placa\s+da\s+Carreta|Carreta\s*\d*|Baú\s*\d*|Bau\s*\d*)\s*:\s*/i, "").trim();
      const parts = cleanLine.split(/[-\u2013\u2014;\t]/).map((p) => p.trim()).filter(Boolean);

      if (parts.length > 0) {
        // Coluna 1: Placa da Carreta
        const carretaPlate = parts[0].toUpperCase().replace(/[^A-Z0-9-]/g, "");

        let iscaVal = "";
        let produtoVal = "";
        let umaVal = "";
        let nfVal = "";

        // Iterate through remaining parts following standard 5-column semantics
        parts.slice(1).forEach((part) => {
          const pUpper = part.toUpperCase().trim();
          const pClean = pUpper.replace(/[^A-Z0-9]/g, "");

          if (!nfVal && (/^NF\s*:?/i.test(pUpper) || pUpper.startsWith("NF"))) {
            // Coluna 5: NF
            nfVal = pUpper.replace(/^NF\s*:?\s*/i, "");
          } else if (!iscaVal && (/^R\d+/i.test(pClean) || /^30D/i.test(pClean) || pUpper.includes("ISCA"))) {
            // Coluna 2: Número da Isca
            iscaVal = pClean;
          } else if (!produtoVal) {
            // Coluna 3: Produto (ex: 12211016)
            produtoVal = part.trim();
          } else {
            // Coluna 4: U.M.A / Descrição / Posição (ex: LADO DIREITO SUPERIOR - BATIDO)
            if (umaVal) umaVal += " - " + part.trim();
            else umaVal = part.trim();
          }
        });

        // Se sobrou a NF sem prefixo "NF" no final das partes quando há 5 ou mais colunas
        if (!nfVal && parts.length >= 5 && umaVal && produtoVal) {
          const lastPart = parts[parts.length - 1].trim();
          const lastClean = lastPart.replace(/\D/g, "");
          if (/^\d{4,8}$/.test(lastClean)) {
            nfVal = lastClean;
            if (umaVal.endsWith(" - " + lastPart)) {
              umaVal = umaVal.substring(0, umaVal.length - (" - " + lastPart).length);
            } else if (umaVal === lastPart) {
              umaVal = "";
            }
          }
        }

        result.carretas.push({
          carreta: carretaPlate,
          isca: iscaVal,
          produto: produtoVal,
          uma: umaVal,
          nf: nfVal,
          esquema: umaVal || produtoVal,
        });
        currentCarretaIdx = result.carretas.length - 1;
        continue;
      }
    }

    // 8. NF on a standalone line (e.g. "NF : 305124")
    const nfMatch = line.match(/^NF\s*:\s*([0-9\/\s-]+)/i);
    if (nfMatch) {
      const nfVal = nfMatch[1].trim().replace(/\D/g, "");
      if (currentCarretaIdx >= 0 && result.carretas[currentCarretaIdx]) {
        result.carretas[currentCarretaIdx].nf = nfVal;
      }
      continue;
    }
  }

  return result;
}

interface ControleProps {
  onBack?: () => void;
}

export default function Controle({ onBack }: ControleProps) {
  // Navigation Tabs: 'gerador', 'unidades' or 'placas'
  const [activeTab, setActiveTab] = useState<"gerador" | "placas" | "unidades">("gerador");

  // PRE ALERTA GR Column View Mode: 'normal' (padrão), 'minimized' (recolhido), 'maximized' (largura total)
  const [preAlertaMode, setPreAlertaMode] = useState<"normal" | "minimized" | "maximized">("normal");
  const [carreta1Minimized, setCarreta1Minimized] = useState<boolean>(true);
  const [carreta2Minimized, setCarreta2Minimized] = useState<boolean>(true);
  // Zoom state for Formulário de Controle and Veículo & Carga when preAlertaMode === 'minimized'
  const [colunasZoom, setColunasZoom] = useState<number>(0.9);

  // --- UNIDADES TAB STATE ---
  const [unidadesPastedText, setUnidadesPastedText] = useState("");
  const parsedUnidades = useMemo(() => {
    return parseUnidadesText(unidadesPastedText);
  }, [unidadesPastedText]);

  // --- PLACAS (SANTA LUZIA) TAB STATE ---
  const [placasPastedData, setPlacasPastedData] = useState("");
  const [placasFilter, setPlacasFilter] = useState("");
  const [placasViewMode, setPlacasViewMode] = useState<"cards" | "table">("cards");
  const [placasSelectedTransp, setPlacasSelectedTransp] = useState<string>("TODAS");
  const [importSuccessBanner, setImportSuccessBanner] = useState<{
    cavalo: string;
    motorista: string;
    destino: string;
    transp: string;
  } | null>(null);

  const parsedPlacas = useMemo(() => {
    return parsePlacasData(placasPastedData);
  }, [placasPastedData]);

  const santaLuziaStats = useMemo(() => {
    const total = parsedPlacas.length;
    const transps = Array.from(new Set(parsedPlacas.map((p) => p.transportador).filter(Boolean)));
    const destinos = Array.from(new Set(parsedPlacas.map((p) => p.destino).filter(Boolean)));
    const comValor = parsedPlacas.filter((p) => !!p.valorNf).length;
    const biTrems = parsedPlacas.filter((p) => !!p.carreta2).length;
    return { total, transps, destinos, comValor, biTrems };
  }, [parsedPlacas]);

  const filteredPlacas = useMemo(() => {
    let list = parsedPlacas;
    if (placasSelectedTransp && placasSelectedTransp !== "TODAS") {
      list = list.filter((p) => p.transportador.toLowerCase() === placasSelectedTransp.toLowerCase());
    }
    if (!placasFilter.trim()) return list;
    const q = placasFilter.toLowerCase();
    return list.filter(
      (p) =>
        p.cavalo.toLowerCase().includes(q) ||
        p.carreta1.toLowerCase().includes(q) ||
        p.carreta2.toLowerCase().includes(q) ||
        p.condutor.toLowerCase().includes(q) ||
        p.transportador.toLowerCase().includes(q) ||
        p.destino.toLowerCase().includes(q) ||
        (p.nf && p.nf.toLowerCase().includes(q)) ||
        (p.origem && p.origem.toLowerCase().includes(q))
    );
  }, [parsedPlacas, placasFilter, placasSelectedTransp]);

  const handlePasteClipboardPlacas = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setPlacasPastedData(text);
    } catch (err) {
      console.warn("Clipboard access denied or unavailable", err);
    }
  };

  const handlePasteClipboardUnidades = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUnidadesPastedText(text);
    } catch (err) {
      console.warn("Clipboard access denied or unavailable", err);
    }
  };

  const [copiedIscaKey, setCopiedIscaKey] = useState<string | null>(null);
  const handleCopySingleIsca = (key: string, isca: string) => {
    if (!isca) return;
    navigator.clipboard.writeText(isca);
    setCopiedIscaKey(key);
    setTimeout(() => setCopiedIscaKey(null), 2000);
  };
  // -------------------------

  const FRASE_RESGATE_PADRAO = "FAVOR SE ATENTAR AO RESGATE!";
  const FRASE_RESGATE_DESCARTAVEL =
    "Informamos que este pré-alerta tem finalidade exclusiva de acompanhamento e controle. Por se tratar de uma isca descartável, fica dispensada a sua devolução.";

  const isPrefix30D1 = (prefix: string, fullNumber: string) => {
    const p = (prefix || "").trim().toUpperCase();
    const f = (fullNumber || "").trim().toUpperCase();
    return p === "30D10000" || p.startsWith("30D10000") || f.startsWith("30D10000");
  };

  const isDispositivoDescartavel = (
    p1: string,
    p2: string,
    f1: string,
    f2: string,
    totalCarretas: number
  ) => {
    const d1 = isPrefix30D1(p1, f1);
    if (totalCarretas === 1) return d1;
    const d2 = f2 !== "SEM ISCA" && isPrefix30D1(p2, f2);
    return d1 || d2;
  };

  // State for all form fields
  const [numCarretas, setNumCarretas] = useState<1 | 2>(2);

  // Column reordering and resizing state for Table 1 and Table 2
  const [table1ColumnOrder, setTable1ColumnOrder] = useState<string[]>([
    "motorista",
    "cavalo",
    "carretas",
    "isca",
    "produto",
    "uma",
    "destino",
    "data"
  ]);

  const [table1ColumnWidths, setTable1ColumnWidths] = useState<Record<string, number>>({
    motorista: 22,
    cavalo: 11,
    carretas: 11,
    isca: 13,
    produto: 14,
    uma: 15,
    destino: 11,
    data: 11
  });

  const [table2ColumnOrder, setTable2ColumnOrder] = useState<string[]>([
    "isca",
    "endereco",
    "data",
    "bateria"
  ]);

  const [table2ColumnWidths, setTable2ColumnWidths] = useState<Record<string, number>>({
    isca: 25,
    endereco: 45,
    data: 18,
    bateria: 12
  });

  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);

  const moveColumnTable1 = (index: number, direction: 'left' | 'right') => {
    const newOrder = [...table1ColumnOrder];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setTable1ColumnOrder(newOrder);
  };

  const resizeColumnTable1 = (colId: string, delta: number) => {
    setTable1ColumnWidths(prev => {
      const current = prev[colId] || 15;
      const updated = Math.max(5, current + delta);
      return { ...prev, [colId]: updated };
    });
  };

  const moveColumnTable2 = (index: number, direction: 'left' | 'right') => {
    const newOrder = [...table2ColumnOrder];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setTable2ColumnOrder(newOrder);
  };

  const resizeColumnTable2 = (colId: string, delta: number) => {
    setTable2ColumnWidths(prev => {
      const current = prev[colId] || 25;
      const updated = Math.max(5, current + delta);
      return { ...prev, [colId]: updated };
    });
  };

  const TABLE1_COLS: Record<string, { label: string; shortLabel: string; icon: React.ReactNode; defaultWidth: number }> = {
    motorista: { label: "MOTORISTA", shortLabel: "MOTORI...", icon: <User size={13} className="text-slate-700" />, defaultWidth: 20 },
    cavalo: { label: "CAVALO", shortLabel: "CAVALO", icon: <Truck size={13} className="text-slate-700" />, defaultWidth: 12 },
    carretas: { label: "CARRETAS", shortLabel: "CARRETAS", icon: <Container size={13} className="text-slate-700" />, defaultWidth: 12 },
    isca: { label: "N° ISCA", shortLabel: "N° ISCA", icon: <Barcode size={13} className="text-slate-700" />, defaultWidth: 12 },
    produto: { label: "PRODUTO EMBARCADO", shortLabel: "PRODUT...", icon: <Package size={13} className="text-slate-700" />, defaultWidth: 14 },
    uma: { label: "CÓDIGO U.M.A.", shortLabel: "CÓDIGO...", icon: <FileText size={13} className="text-slate-700" />, defaultWidth: 14 },
    destino: { label: "DESTINO", shortLabel: "DESTINO", icon: <MapPin size={13} className="text-slate-700" />, defaultWidth: 8 },
    data: { label: "DATA PARTIDA", shortLabel: "DATA PARTIDA", icon: <Calendar size={13} className="text-slate-700" />, defaultWidth: 8 }
  };

  const TABLE2_COLS: Record<string, { label: string; icon: React.ReactNode; defaultWidth: number }> = {
    isca: { label: "PLACA / CÓDIGO DE VENDA II", icon: <FileText size={13} className="text-slate-700" />, defaultWidth: 25 },
    endereco: { label: "ENDEREÇO APROXIMADO DA ...", icon: <Radio size={13} className="text-slate-700" />, defaultWidth: 45 },
    data: { label: "DATA POSIÇÃO II", icon: <MapPin size={13} className="text-slate-700" />, defaultWidth: 18 },
    bateria: { label: "BATERIA ISCA _ RF II", icon: <Battery size={13} className="text-slate-700" />, defaultWidth: 12 }
  };

  const [placasColumnOrder, setPlacasColumnOrder] = useState<string[]>([
    "index",
    "cavalo",
    "carretas",
    "condutor",
    "transportadora",
    "destino",
    "valorNf",
    "acao"
  ]);

  const [placasColumnWidths, setPlacasColumnWidths] = useState<Record<string, number>>({
    index: 6,
    cavalo: 12,
    carretas: 14,
    condutor: 18,
    transportadora: 18,
    destino: 14,
    valorNf: 10,
    acao: 8
  });

  const [isPlacasColumnConfigOpen, setIsPlacasColumnConfigOpen] = useState(false);

  const PLACAS_COLS: Record<string, { label: string; defaultWidth: number }> = {
    index: { label: "#", defaultWidth: 6 },
    cavalo: { label: "Cavalo", defaultWidth: 12 },
    carretas: { label: "Carretas", defaultWidth: 14 },
    condutor: { label: "Condutor", defaultWidth: 18 },
    transportadora: { label: "Transportadora", defaultWidth: 18 },
    destino: { label: "Destino", defaultWidth: 14 },
    valorNf: { label: "Valor NF", defaultWidth: 10 },
    acao: { label: "Ação", defaultWidth: 8 }
  };

  const moveColumnPlacas = (index: number, direction: 'left' | 'right') => {
    const newOrder = [...placasColumnOrder];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setPlacasColumnOrder(newOrder);
  };

  const resizeColumnPlacas = (colId: string, delta: number) => {
    setPlacasColumnWidths(prev => {
      const current = prev[colId] || 12;
      const updated = Math.max(5, current + delta);
      return { ...prev, [colId]: updated };
    });
  };


  const [alertaResgate, setAlertaResgate] = useState(
    FRASE_RESGATE_PADRAO,
  );
  const [infoAbaixo, setInfoAbaixo] = useState(
    "Atentar às informações abaixo:",
  );

  // Routes & Warning lines
  const [origem, setOrigem] = useState("SANTA LUZIA/MG");
  const isCuiabaOrigem = useMemo(() => {
    if (!origem) return false;
    const normalized = origem.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalized.includes("cuiaba");
  }, [origem]);
  const isGreenOrigem = useMemo(() => {
    if (!origem) return false;
    const normalized = origem.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return (
      normalized.includes("viana") ||
      normalized.includes("serra") ||
      normalized.includes("cariacica")
    );
  }, [origem]);
  const isVianaOrigem = isGreenOrigem;
  const isPurpleOrigem = useMemo(() => {
    if (!origem) return false;
    const normalized = origem.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return (
      normalized.includes("montes claros") ||
      normalized.includes("montesclaros")
    );
  }, [origem]);
  const [rota1, setRota1] = useState("");
  const [instrucao1, setInstrucao1] = useState("Favor, acusar o recebimento do pré-alerta;");

  // Table information (CCC.PNG layout)
  const [nfInicio, setNfInicio] = useState("");
  const [nfFim, setNfFim] = useState("");
  const [transportadora, setTransportadora] = useState("");
  const [valorCarga, setValorCarga] = useState("");
  const [motorista, setMotorista] = useState("");
  const [cavalo, setCavalo] = useState("");

  // Row 1 lists (Carreta 1, Isca 1, Produto 1, UMA 1)
  const [carreta1, setCarreta1] = useState("");
  const [carreta2, setCarreta2] = useState("");
  const [isca1, setIsca1] = useState("");
  const [isca2, setIsca2] = useState("");
  const [produto1, setProduto1] = useState("");
  const [produto2, setProduto2] = useState("");
  const [uma1, setUma1] = useState("");
  const [uma2, setUma2] = useState("");

  const [destino, setDestino] = useState("");
  const getFormattedDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const months = [
      "jan.",
      "fev.",
      "mar.",
      "abr.",
      "mai.",
      "jun.",
      "jul.",
      "ago.",
      "set.",
      "out.",
      "nov.",
      "dez.",
    ];
    return `${day}-${months[now.getMonth()]}`;
  };

  const formatUMA = (value: string) => {
    if (!value) return "";

    // Se contiver letras, permite escrita alfanumérica livre (convertendo para maiúsculas)
    if (/[a-zA-Z]/.test(value)) {
      return value.toUpperCase();
    }

    // Remove todos os caracteres não numéricos se for estritamente numérico
    let digits = value.replace(/\D/g, "");

    if (!digits) return value.toUpperCase();

    // Se o primeiro dígito for '9' ou '6', não adiciona '0' nem pontos, e permite até 14 dígitos
    if (digits.length > 0 && (digits[0] === "9" || digits[0] === "6")) {
      return digits.substring(0, 14);
    }

    // Apenas adiciona '0' automaticamente se houver 11 dígitos e não começar com '0'
    if (digits.length === 11 && digits[0] !== "0") {
      digits = "0" + digits;
    }

    // Limita a 12 dígitos (padrão 0XXX.XXX.XXX.XXX)
    digits = digits.substring(0, 12);

    // Aplica pontos a cada 3 caracteres se for numérico
    let formatted = "";
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 3 === 0) {
        formatted += ".";
      }
      formatted += digits[i];
    }
    return formatted;
  };

  const getInitialGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia,";
    if (hour < 18) return "Boa tarde,";
    return "Boa noite,";
  };

  const [dataEnviada, setDataEnviada] = useState(getFormattedDate());
  const [saudacao, setSaudacao] = useState(getInitialGreeting());

  useEffect(() => {
    setDataEnviada(getFormattedDate());
    setSaudacao(getInitialGreeting());
  }, []);

  // Parametrização and Esquema de Embarque
  const [parametrizacao, setParametrizacao] = useState(
    "Parametrização das Iscas",
  );
  const [esquemaEmbarque, setEsquemaEmbarque] = useState(
    "CAVALO: ISCA NO PAINEL / CARRETA 1: ISCA NO MEIO DA CARGA / CARRETA 2: ISCA NO FUNDO DA CARGA",
  );

  const getThemeStyles = () => {
    return {
      headerBg: 'linear-gradient(135deg, #181A1D 0%, #22262B 50%, #181A1D 100%)',
      subHeaderBg: '#F5EDDA',
      border: '#C5A059',
      borderSoft: '#E5D5B5',
      table1Header: 'linear-gradient(180deg, #22262B 0%, #181A1D 100%)',
      table2Header: 'linear-gradient(180deg, #181A1D 0%, #252A30 100%)',
    };
  };
  const themeStyles = getThemeStyles();

  // Isca positions (addresses, times and battery level) matching the image exactly
  const [isca1Endereco, setIsca1Endereco] = useState("");
  const [isca2Endereco, setIsca2Endereco] = useState("");
  const [isca1Data, setIsca1Data] = useState("");
  const [isca2Data, setIsca2Data] = useState("");
  const [isca1Bateria, setIsca1Bateria] = useState("");
  const [isca2Bateria, setIsca2Bateria] = useState("");

  // Interactive ladders for Esquema de Embarque
  const [ladder1, setLadder1] = useState<string[][]>(() => {
    const grid = Array(12)
      .fill(null)
      .map(() => Array(2).fill(""));
    grid[0][0] = "P";
    return grid;
  });
  const [ladder2, setLadder2] = useState<string[][]>(() => {
    const grid = Array(12)
      .fill(null)
      .map(() => Array(2).fill(""));
    grid[0][0] = "P";
    return grid;
  });

  // Sidebar specific inputs (COLUNA.PNG layout)
  const [sidebarTransportadora, setSidebarTransportadora] =
    useState("");
  const [sidebarTecnologia, setSidebarTecnologia] = useState("");
  const [sidebarMotorista, setSidebarMotorista] = useState("");
  const [sidebarEmbarque1, setSidebarEmbarque1] = useState("none");
  const [sidebarEmbarque2, setSidebarEmbarque2] = useState("none");
  const [searchRota, setSearchRota] = useState("");
  const [pastePlanilha, setPastePlanilha] = useState("");

  // Prefixes and Suffixes for N° ISCAS (individual prefixes)
  const [iscaPrefix1, setIscaPrefix1] = useState("R10000");
  const [iscaPrefix2, setIscaPrefix2] = useState("R10000");
  const [iscaSuffix1, setIscaSuffix1] = useState("");
  const [iscaSuffix2, setIscaSuffix2] = useState("");

  // Código mostrado na parametrização: prioriza o valor digitado e, se estiver vazio,
  // monta o código a partir do prefixo/sufixo configurados no próprio formulário.
  const getIscaDisplayCode = (raw: string, prefix: string, suffix: string) => {
    const entered = (raw || "").trim();
    if (entered.toUpperCase() === "SEM ISCA" || entered === "---") return "";
    return entered || `${prefix || ""}${suffix || ""}`.trim();
  };
  const isca1DisplayCode = getIscaDisplayCode(isca1, iscaPrefix1, iscaSuffix1);
  const isca2DisplayCode = isca2 === "SEM ISCA" ? "" : getIscaDisplayCode(isca2, iscaPrefix2, iscaSuffix2);

  const isDescartavel = useMemo(() => {
    return isDispositivoDescartavel(
      iscaPrefix1,
      iscaPrefix2,
      isca1,
      isca2,
      numCarretas
    );
  }, [iscaPrefix1, iscaPrefix2, isca1, isca2, numCarretas]);

  const [copied, setCopied] = useState(false);
  const [copiedAssunto, setCopiedAssunto] = useState(false);
  const [ocultarNotas, setOcultarNotas] = useState(false);
  const [customTransportadoras, setCustomTransportadoras] = useState<string[]>([]);
  const [newTranspName, setNewTranspName] = useState("");
  const [isAddingTransp, setIsAddingTransp] = useState(false);

  // Google Sheets Export States for Iscas (matching attached user format)
  const getIscaDataStatusDefault = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    return `${day}.${months[now.getMonth()]}`; // e.g. "28.jul."
  };

  const [statusIsca1, setStatusIsca1] = useState("EM ROTA(IDA)");
  const [statusIsca2, setStatusIsca2] = useState("EM ROTA(IDA)");
  const [obs1Isca1, setObs1Isca1] = useState("PRÉ ALERTA OK");
  const [obs1Isca2, setObs1Isca2] = useState("PRÉ ALERTA OK");
  const [dataStatusIsca1, setDataStatusIsca1] = useState(getIscaDataStatusDefault());
  const [dataStatusIsca2, setDataStatusIsca2] = useState(getIscaDataStatusDefault());

  const [copiedIscaRow1, setCopiedIscaRow1] = useState(false);
  const [copiedIscaRow2, setCopiedIscaRow2] = useState(false);
  const [copiedIscaAll, setCopiedIscaAll] = useState(false);
  const [copiedIscaDataOnly, setCopiedIscaDataOnly] = useState(false);
  const [copiedIscasSpace, setCopiedIscasSpace] = useState(false);
  const [copiedFraseEmbarque, setCopiedFraseEmbarque] = useState(false);

  const getDayMonthFromDate = (dateStr: string) => {
    if (!dateStr) {
      const now = new Date();
      return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}`;
    }
    const clean = dateStr.trim().toLowerCase();
    // match DD/MM or DD/MM/YYYY
    const slashMatch = clean.match(/^(\d{1,2})\/(\d{1,2})/);
    if (slashMatch) {
      return `${slashMatch[1].padStart(2, "0")}/${slashMatch[2].padStart(2, "0")}`;
    }
    // match YYYY-MM-DD
    const isoMatch = clean.match(/^\d{4}-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return `${isoMatch[2]}/${isoMatch[1]}`;
    }
    // match DD-mon or DD.mon (e.g. 15-set. or 15.set or 15-setembro)
    const monthMap: Record<string, string> = {
      jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06",
      jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12"
    };
    const monMatch = clean.match(/^(\d{1,2})[-. ]+([a-z]{3})/);
    if (monMatch) {
      const day = monMatch[1].padStart(2, "0");
      const monStr = monMatch[2];
      const monthNum = monthMap[monStr] || String(new Date().getMonth() + 1).padStart(2, "0");
      return `${day}/${monthNum}`;
    }
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  const getFraseEmbarqueIsca = () => {
    const dayMonth = getDayMonthFromDate(dataEnviada);
    const destClean = cleanDestinoForPlanilha(destino) || (destino ? destino.toUpperCase().replace(/\/[A-Z]{2}$/, '').trim() : "GUARULHOS");
    return `${dayMonth} ISCA EMBARCADA PARA ${destClean}`;
  };

  const handleCopyFraseEmbarque = async () => {
    const frase = getFraseEmbarqueIsca();
    try {
      await navigator.clipboard.writeText(frase);
      setCopiedFraseEmbarque(true);
      setTimeout(() => setCopiedFraseEmbarque(false), 3000);
    } catch (err) {
      console.error("Erro ao copiar frase de embarque:", err);
    }
  };

  const getIscasSpaceSeparated = () => {
    const iscasList: string[] = [];

    const getCleanIsca = (iscaVal: string, prefix: string, suffix: string) => {
      let val = (iscaVal || "").trim();
      if (!val && (prefix || suffix)) {
        val = (prefix + suffix).trim();
      }
      if (!val || val.toUpperCase() === "SEM ISCA" || val === "---") {
        return "";
      }
      return val;
    };

    const isca1Clean = getCleanIsca(isca1, iscaPrefix1, iscaSuffix1);
    if (isca1Clean) iscasList.push(isca1Clean);

    if (numCarretas === 2) {
      const isca2Clean = getCleanIsca(isca2, iscaPrefix2, iscaSuffix2);
      if (isca2Clean) iscasList.push(isca2Clean);
    }

    return iscasList.join(" ");
  };

  const handleCopyIscasWithSpace = async () => {
    const text = getIscasSpaceSeparated();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIscasSpace(true);
      setTimeout(() => setCopiedIscasSpace(false), 2500);
    } catch (err) {
      console.error("Erro ao copiar iscas:", err);
    }
  };

  const getIscaRows = () => {
    const rows = [];
    const formattedDest = cleanDestinoForPlanilha(destino) || destino || "";
    
    // Row 1 (Isca 1)
    const row1 = {
      id: '1',
      idIsca: isca1 || "",
      destino: formattedDest,
      status: statusIsca1 || "EM ROTA(IDA)",
      obs1: obs1Isca1 || "PRÉ ALERTA OK",
      dataStatus: dataStatusIsca1 || getIscaDataStatusDefault(),
      carreta: carreta1 || "",
      cavalo: cavalo || "",
      motorista: motorista || sidebarMotorista || ""
    };
    rows.push(row1);

    // Row 2 (Isca 2, if 2 carretas and isca2 is set and not "SEM ISCA")
    if (numCarretas === 2 && isca2 && isca2 !== "SEM ISCA") {
      const row2 = {
        id: '2',
        idIsca: isca2 || "",
        destino: formattedDest,
        status: statusIsca2 || "EM ROTA(IDA)",
        obs1: obs1Isca2 || "PRÉ ALERTA OK",
        dataStatus: dataStatusIsca2 || getIscaDataStatusDefault(),
        carreta: carreta2 || "",
        cavalo: cavalo || "",
        motorista: motorista || sidebarMotorista || ""
      };
      rows.push(row2);
    }

    return rows;
  };

  const copyIscaRowToClipboard = (row: ReturnType<typeof getIscaRows>[0], withHeaders = false, isRow2 = false) => {
    const headers = ["ID ISCA", "DESTINO", "STATUS", "OBS 1", "DATA STATUS", "CARRETA", "CAVALO", "MOTORISTA"].join("\t");
    const rowTsv = [
      row.idIsca,
      row.destino,
      row.status,
      row.obs1,
      row.dataStatus,
      row.carreta,
      row.cavalo,
      row.motorista
    ].join("\t");

    const textToCopy = withHeaders ? `${headers}\n${rowTsv}` : rowTsv;

    navigator.clipboard.writeText(textToCopy).then(() => {
      if (isRow2) {
        setCopiedIscaRow2(true);
        setTimeout(() => setCopiedIscaRow2(false), 3000);
      } else {
        setCopiedIscaRow1(true);
        setTimeout(() => setCopiedIscaRow1(false), 3000);
      }
    });
  };

  const copyAllIscaRowsToClipboard = (withHeaders = true) => {
    const rows = getIscaRows();
    if (rows.length === 0) return;

    const headers = ["ID ISCA", "DESTINO", "STATUS", "OBS 1", "DATA STATUS", "CARRETA", "CAVALO", "MOTORISTA"].join("\t");
    const rowsTsv = rows.map(row => [
      row.idIsca,
      row.destino,
      row.status,
      row.obs1,
      row.dataStatus,
      row.carreta,
      row.cavalo,
      row.motorista
    ].join("\t")).join("\n");

    const textToCopy = withHeaders ? `${headers}\n${rowsTsv}` : rowsTsv;

    navigator.clipboard.writeText(textToCopy).then(() => {
      if (withHeaders) {
        setCopiedIscaAll(true);
        setTimeout(() => setCopiedIscaAll(false), 3000);
      } else {
        setCopiedIscaDataOnly(true);
        setTimeout(() => setCopiedIscaDataOnly(false), 3000);
      }
    });
  };

  const allTransportadoras = [...TRANSPORTADORAS, ...customTransportadoras];

  // Sync transportadora and motorista states when either updates, keeping both sections intuitive
  const handleSidebarTranspChange = (val: string) => {
    setSidebarTransportadora(val);
    setTransportadora(val);
  };

  const handleSidebarMotoristaChange = (val: string) => {
    setSidebarMotorista(val);
    setMotorista(val);
  };

  const handleTableTranspChange = (val: string) => {
    setTransportadora(val);
    setSidebarTransportadora(val);
  };

  const handleTableMotoristaChange = (val: string) => {
    setMotorista(val);
    setSidebarMotorista(val);
  };

  const handleAddCustomTransp = () => {
    const trimmed = newTranspName.trim();
    if (!trimmed) return;
    
    const exists = allTransportadoras.some(
      (t) => t.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      alert("Esta transportadora já está cadastrada!");
      return;
    }

    const updated = [...customTransportadoras, trimmed];
    setCustomTransportadoras(updated);
    setSidebarTransportadora(trimmed);
    setTransportadora(trimmed);
    setNewTranspName("");
    setIsAddingTransp(false);
  };

  const handleIsca1Change = (val: string) => {
    setIsca1(val);
    if (val.startsWith(iscaPrefix1)) {
      setIscaSuffix1(val.substring(iscaPrefix1.length));
    } else {
      const prefixes = ["R100000", "R10000", "30D10000"];
      const matched = prefixes.find((p) => val.startsWith(p));
      if (matched) {
        setIscaPrefix1(matched);
        setIscaSuffix1(val.substring(matched.length));
      } else {
        setIscaSuffix1(val);
      }
    }
  };

  const handleIsca2Change = (val: string) => {
    setIsca2(val);
    if (val.startsWith(iscaPrefix2)) {
      setIscaSuffix2(val.substring(iscaPrefix2.length));
    } else {
      const prefixes = ["R100000", "R10000", "30D10000"];
      const matched = prefixes.find((p) => val.startsWith(p));
      if (matched) {
        setIscaPrefix2(matched);
        setIscaSuffix2(val.substring(matched.length));
      } else {
        setIscaSuffix2(val);
      }
    }
  };

  const handlePastePlanilhaChange = (text: string) => {
    setPastePlanilha(text);
    if (!text.trim()) {
      setIsca1Endereco("");
      setIsca2Endereco("");
      setIsca1Data("");
      setIsca2Data("");
      return;
    }

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    interface ParsedIsca {
      id: string;
      endereco: string;
      data: string;
      bateria: string;
    }
    const parsedItems: ParsedIsca[] = [];

    lines.forEach((line) => {
      const matchIsca = line.match(/^(\S+)/);
      if (!matchIsca) return;
      const iscaId = matchIsca[1];

      // Match DD/MM/YYYY HH:MM:SS or HH:MM
      const dateRegex =
        /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})|(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/;
      const matchDate = line.match(dateRegex);

      let address = "";
      let dateVal = "";
      let batteryVal = "100%";

      if (matchDate && matchDate.index !== undefined) {
        dateVal = matchDate[0];
        const dateIndex = matchDate.index;

        address = line.substring(iscaId.length, dateIndex).trim();

        const remaining = line.substring(dateIndex + dateVal.length).trim();
        const matchBattery = remaining.match(/(\d+%)/);
        if (matchBattery) {
          batteryVal = matchBattery[1];
        }
      } else {
        const parts = line.split(/\s+/);
        if (parts.length > 1) {
          address = parts.slice(1).join(" ");
        }
      }

      parsedItems.push({
        id: iscaId,
        endereco: address,
        data: dateVal,
        bateria: batteryVal,
      });
    });

    let matchedIsca1 = false;
    let matchedIsca2 = false;
    const matchedItemIndices = new Set<number>();

    // Pass 1: Try to match by current suffix/ID to preserve assignment if already entered
    parsedItems.forEach((item, index) => {
      const cleanId = item.id.toUpperCase();
      const cleanIsca1 = isca1.toUpperCase();
      const cleanIscaSuffix1 = iscaSuffix1.toUpperCase();
      const cleanIsca2 = isca2.toUpperCase();
      const cleanIscaSuffix2 = iscaSuffix2.toUpperCase();

      const isMatch1 =
        cleanIscaSuffix1.length >= 3 &&
        (cleanId.includes(cleanIscaSuffix1) || cleanIsca1.includes(cleanId));
      const isMatch2 =
        cleanIscaSuffix2.length >= 3 &&
        (cleanId.includes(cleanIscaSuffix2) || cleanIsca2.includes(cleanId));

      if (isMatch1 && !matchedIsca1) {
        setIsca1(item.id);
        setIsca1Endereco(item.endereco);
        setIsca1Data(item.data);
        setIsca1Bateria(item.bateria);
        handleIsca1Change(item.id);
        matchedIsca1 = true;
        matchedItemIndices.add(index);
      } else if (isMatch2 && !matchedIsca2) {
        setIsca2(item.id);
        setIsca2Endereco(item.endereco);
        setIsca2Data(item.data);
        setIsca2Bateria(item.bateria);
        handleIsca2Change(item.id);
        matchedIsca2 = true;
        matchedItemIndices.add(index);
      }
    });

    // Pass 2: Assign unmatched items to remaining unmatched slots in order (isca1 first, then isca2)
    parsedItems.forEach((item, index) => {
      if (matchedItemIndices.has(index)) return;

      if (!matchedIsca1) {
        setIsca1(item.id);
        setIsca1Endereco(item.endereco);
        setIsca1Data(item.data);
        setIsca1Bateria(item.bateria);
        handleIsca1Change(item.id);
        matchedIsca1 = true;
        matchedItemIndices.add(index);
      } else if (!matchedIsca2) {
        setIsca2(item.id);
        setIsca2Endereco(item.endereco);
        setIsca2Data(item.data);
        setIsca2Bateria(item.bateria);
        handleIsca2Change(item.id);
        matchedIsca2 = true;
        matchedItemIndices.add(index);
      }
    });

    if (parsedItems.length === 1) {
      if (carreta2 && carreta2.trim() !== "") {
        // Carreta 2 está preenchida: mantém 2 carretas e seleciona a opção "- Sem Isca" para a Carreta 2
        setNumCarretas(2);
        setIsca2("SEM ISCA");
        setIsca2Endereco("");
        setIsca2Data("");
        setIsca2Bateria("");
        setIscaSuffix2("");
        setNfFim("");
        setSidebarEmbarque2("none");
        if (!produto2 || produto2 === "") setProduto2("---");
        if (!uma2 || uma2 === "") setUma2("---");
      } else {
        setNumCarretas(1);
      }
    } else if (parsedItems.length >= 2) {
      setNumCarretas(2);
      if (produto2 === "---") setProduto2("");
      if (uma2 === "---") setUma2("");
    }
  };

  // Handlers for swapping Carretas and copying/swapping Produtos (Veículo & Carga)
  const handleSwapCarretas = () => {
    const temp1 = carreta1;
    const temp2 = carreta2;
    setCarreta1(temp2);
    setCarreta2(temp1);
    if (temp1 && numCarretas === 1) {
      setNumCarretas(2);
    }
  };

  const handleCopyProduto1To2 = () => {
    setProduto2(produto1);
    if (produto1 && numCarretas === 1) {
      setNumCarretas(2);
    }
  };

  const handleCopyProduto2To1 = () => {
    setProduto1(produto2);
  };

  const handleSwapProdutos = () => {
    const temp1 = produto1;
    const temp2 = produto2;
    setProduto1(temp2);
    setProduto2(temp1);
  };

  const STORAGE_KEY = "controle_pgr_data";

  // Sync initial values and load from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.numCarretas !== undefined) setNumCarretas(data.numCarretas);
        if (data.alertaResgate !== undefined) setAlertaResgate(data.alertaResgate);
        if (data.infoAbaixo !== undefined) setInfoAbaixo(data.infoAbaixo);
        if (data.origem !== undefined) setOrigem(data.origem);
        if (data.rota1 !== undefined) setRota1(data.rota1);
        if (data.instrucao1 !== undefined) {
          if (data.instrucao1 === "* Favor, acusar o recebimento do pré-alerta;") {
            setInstrucao1("Favor, acusar o recebimento do pré-alerta;");
          } else {
            setInstrucao1(data.instrucao1);
          }
        }
        if (data.nfInicio !== undefined) setNfInicio(data.nfInicio);
        if (data.nfFim !== undefined) setNfFim(data.nfFim);
        if (data.transportadora !== undefined) setTransportadora(data.transportadora);
        if (data.valorCarga !== undefined) setValorCarga(data.valorCarga);
        if (data.motorista !== undefined) setMotorista(data.motorista);
        if (data.cavalo !== undefined) setCavalo(data.cavalo);
        if (data.carreta1 !== undefined) setCarreta1(data.carreta1);
        if (data.carreta2 !== undefined) setCarreta2(data.carreta2);
        if (data.isca1 !== undefined) setIsca1(data.isca1);
        if (data.isca2 !== undefined) setIsca2(data.isca2);
        if (data.produto1 !== undefined) setProduto1(data.produto1);
        if (data.produto2 !== undefined) setProduto2(data.produto2);
        if (data.uma1 !== undefined) setUma1(data.uma1);
        if (data.uma2 !== undefined) setUma2(data.uma2);
        if (data.destino !== undefined) setDestino(data.destino);
        if (data.parametrizacao !== undefined) setParametrizacao(data.parametrizacao);
        if (data.esquemaEmbarque !== undefined) setEsquemaEmbarque(data.esquemaEmbarque);
        if (data.isca1Endereco !== undefined) setIsca1Endereco(data.isca1Endereco);
        if (data.isca2Endereco !== undefined) setIsca2Endereco(data.isca2Endereco);
        if (data.isca1Data !== undefined) setIsca1Data(data.isca1Data);
        if (data.isca2Data !== undefined) setIsca2Data(data.isca2Data);
        if (data.isca1Bateria !== undefined) setIsca1Bateria(data.isca1Bateria);
        if (data.isca2Bateria !== undefined) setIsca2Bateria(data.isca2Bateria);
        if (data.ladder1 !== undefined) setLadder1(data.ladder1);
        if (data.ladder2 !== undefined) setLadder2(data.ladder2);
        if (data.sidebarTransportadora !== undefined) setSidebarTransportadora(data.sidebarTransportadora);
        if (data.sidebarTecnologia !== undefined) setSidebarTecnologia(data.sidebarTecnologia);
        if (data.sidebarMotorista !== undefined) setSidebarMotorista(data.sidebarMotorista);
        if (data.sidebarEmbarque1 !== undefined) setSidebarEmbarque1(data.sidebarEmbarque1);
        if (data.sidebarEmbarque2 !== undefined) setSidebarEmbarque2(data.sidebarEmbarque2);
        if (data.iscaPrefix1 !== undefined) setIscaPrefix1(data.iscaPrefix1);
        if (data.iscaPrefix2 !== undefined) setIscaPrefix2(data.iscaPrefix2);
        if (data.iscaSuffix1 !== undefined) setIscaSuffix1(data.iscaSuffix1);
        if (data.iscaSuffix2 !== undefined) setIscaSuffix2(data.iscaSuffix2);
        if (data.customTransportadoras !== undefined) setCustomTransportadoras(data.customTransportadoras);
      } catch (e) {
        console.error("Erro ao carregar dados do localStorage", e);
      }
    } else {
      setSidebarTransportadora(transportadora);
      setSidebarMotorista(motorista);
    }
  }, []);

  // Save to localStorage whenever a state changes
  useEffect(() => {
    const dataToSave = {
      numCarretas,
      alertaResgate,
      infoAbaixo,
      origem,
      rota1,
      instrucao1,
      nfInicio,
      nfFim,
      transportadora,
      valorCarga,
      motorista,
      cavalo,
      carreta1,
      carreta2,
      isca1,
      isca2,
      produto1,
      produto2,
      uma1,
      uma2,
      destino,
      parametrizacao,
      esquemaEmbarque,
      isca1Endereco,
      isca2Endereco,
      isca1Data,
      isca2Data,
      isca1Bateria,
      isca2Bateria,
      ladder1,
      ladder2,
      sidebarTransportadora,
      sidebarTecnologia,
      sidebarMotorista,
      sidebarEmbarque1,
      sidebarEmbarque2,
      iscaPrefix1,
      iscaPrefix2,
      iscaSuffix1,
      iscaSuffix2,
      customTransportadoras,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [
    numCarretas,
    alertaResgate,
    infoAbaixo,
    origem,
    rota1,
    instrucao1,
    nfInicio,
    nfFim,
    transportadora,
    valorCarga,
    motorista,
    cavalo,
    carreta1,
    carreta2,
    isca1,
    isca2,
    produto1,
    produto2,
    uma1,
    uma2,
    destino,
    parametrizacao,
    esquemaEmbarque,
    isca1Endereco,
    isca2Endereco,
    isca1Data,
    isca2Data,
    isca1Bateria,
    isca2Bateria,
    ladder1,
    ladder2,
    sidebarTransportadora,
    sidebarTecnologia,
    sidebarMotorista,
    sidebarEmbarque1,
    sidebarEmbarque2,
    iscaPrefix1,
    iscaPrefix2,
    iscaSuffix1,
    iscaSuffix2,
    customTransportadoras,
  ]);

  // Monitora e atualiza alertaResgate automaticamente para iscas descartáveis (prefixo 30D10000)
  useEffect(() => {
    const descartavel = isDispositivoDescartavel(
      iscaPrefix1,
      iscaPrefix2,
      isca1,
      isca2,
      numCarretas
    );
    if (descartavel) {
      if (alertaResgate !== FRASE_RESGATE_DESCARTAVEL) {
        setAlertaResgate(FRASE_RESGATE_DESCARTAVEL);
      }
    } else {
      if (alertaResgate === FRASE_RESGATE_DESCARTAVEL) {
        setAlertaResgate(FRASE_RESGATE_PADRAO);
      }
    }
  }, [iscaPrefix1, iscaPrefix2, isca1, isca2, numCarretas, alertaResgate]);

  const handleClearVeiculo = () => {
    setCavalo("");
    setCarreta1("");
    setCarreta2("");
    setIsca1("");
    setIsca2("");
    setProduto1("");
    setProduto2("");
    setUma1("");
    setUma2("");
    setValorCarga("");
  };

  const handleClear = () => {
    if (
      window.confirm(
        "Deseja realmente limpar todas as informações do controle?",
      )
    ) {
      setNumCarretas(2);
      setSaudacao(getInitialGreeting());
      setAlertaResgate(FRASE_RESGATE_PADRAO);
      setInfoAbaixo("Atentar às informações abaixo:");
      setOrigem("SANTA LUZIA/MG");
      setRota1("");
      setInstrucao1("Favor, acusar o recebimento do pré-alerta;");
      setNfInicio("");
      setNfFim("");
      setTransportadora("");
      setValorCarga("");
      setMotorista("");
      setCavalo("");
      setCarreta1("");
      setCarreta2("");
      setIsca1("");
      setIsca2("");
      setProduto1("");
      setProduto2("");
      setUma1("");
      setUma2("");
      setDestino("");
      setDataEnviada(getFormattedDate());
      setParametrizacao("Parametrização das iscas");
      setEsquemaEmbarque(
        "CAVALO: ISCA NO PAINEL / CARRETA 1: ISCA NO MEIO DA CARGA / CARRETA 2: ISCA NO FUNDO DA CARGA",
      );

      setIsca1Endereco("");
      setIsca2Endereco("");
      setIsca1Data("");
      setIsca2Data("");
      setIsca1Bateria("");
      setIsca2Bateria("");

      setLadder1(() => {
        const grid = Array(12)
          .fill(null)
          .map(() => Array(2).fill(""));
        grid[0][0] = "P";
        return grid;
      });
      setLadder2(() => {
        const grid = Array(12)
          .fill(null)
          .map(() => Array(2).fill(""));
        grid[0][0] = "P";
        return grid;
      });

      setSidebarTransportadora("");
      setSidebarTecnologia("");
      setSidebarMotorista("");
      setSidebarEmbarque1("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
      setSidebarEmbarque2("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
      setPastePlanilha("");

      setIscaPrefix1("R10000");
      setIscaPrefix2("R10000");
      setIscaSuffix1("");
      setIscaSuffix2("");
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleImportPlacaItem = (item: ParsedPlacaItem) => {
    // 1. Veículo & Carga
    if (item.cavalo) setCavalo(item.cavalo);
    if (item.carreta1) setCarreta1(item.carreta1);
    if (item.carreta2) {
      setCarreta2(item.carreta2);
      setNumCarretas(2);
      if (produto2 === "---") setProduto2("");
      if (uma2 === "---") setUma2("");
    } else {
      setCarreta2("");
      if (
        item.modeloCarreta?.includes("RODOTREM") ||
        item.modeloCarreta?.includes("BITREM")
      ) {
        setNumCarretas(2);
      } else {
        setNumCarretas(1);
      }
    }

    // 2. Formulário de Controle & Dados Gerais
    if (item.transportador) {
      const normTransp = normalizePlacaTransportador(item.transportador);
      const match = allTransportadoras.find(
        (t) => t.toLowerCase() === normTransp.toLowerCase()
      );
      const finalTransp = match || normTransp;

      setTransportadora(finalTransp);
      setSidebarTransportadora(finalTransp);
      if (!match) {
        setCustomTransportadoras((prev) => [...prev, finalTransp]);
      }
    }

    if (item.condutor) {
      setMotorista(item.condutor);
      setSidebarMotorista(item.condutor);
    }

    // Origem & Destino -> Formulário de Controle (SELECIONE A ROTA)
    let finalOrigem = origem || "SANTA LUZIA/MG";
    if (item.origem) {
      const normOrig = item.origem.toUpperCase().trim();
      const matchedOrig = ORIGEM_OPCOES.find(
        (o) =>
          o.toUpperCase() === normOrig ||
          o.toUpperCase().includes(normOrig) ||
          normOrig.includes(o.replace(/\/[A-Z]{2}$/, "").toUpperCase())
      );
      if (matchedOrig) {
        finalOrigem = matchedOrig;
      } else {
        finalOrigem = item.origem.toUpperCase();
      }
      setOrigem(finalOrigem);
    }

    if (item.destino) {
      const { rota, destinoFinal } = findBestMatchingRoute(item.destino, finalOrigem);
      setDestino(destinoFinal);
      setRota1(rota);
    }

    if (item.tecnologia) {
      setSidebarTecnologia(item.tecnologia);
    }

    // As colunas NF INÍCIO e NF FIM precisam ficar vazias ao importar da aba Placas
    setNfInicio("");
    setNfFim("");

    // Somente quando a informação for importada da aba Santa Luzia, importa o VALOR NF para o valor da carga
    if (item.valorNf) {
      setValorCarga(item.valorNf);
    } else {
      setValorCarga("");
    }

    // Interactive confirmation banner
    setImportSuccessBanner({
      cavalo: item.cavalo || "S/ Placa",
      motorista: item.condutor || "Motorista",
      destino: item.destino || "Destino",
      transp: item.transportador || "Transportadora",
    });

    // Automatically switch to Gerador PGR
    setActiveTab("gerador");
  };

  const handleImportUnidadeData = (info: ParsedUnidadeInfo) => {
    // Origem originada da aba Unidades é sempre CUIABÁ/MT
    const unidadeOrigem = "CUIABÁ/MT";
    setOrigem(unidadeOrigem);

    if (info.cavalo) setCavalo(info.cavalo);

    if (info.carretas.length > 0) {
      // Carreta 1
      const c1 = info.carretas[0];
      if (c1.carreta) setCarreta1(c1.carreta);
      if (c1.isca) {
        setIsca1(c1.isca);
        handleIsca1Change(c1.isca);
      }
      if (c1.produto) setProduto1(c1.produto);
      if (c1.uma) setUma1(formatUMA(c1.uma));
      if (c1.nf) setNfInicio(c1.nf.trim().replace(/[\s.]/g, ""));

      if (c1.esquema) {
        const upperE = c1.esquema.toUpperCase();
        if (upperE.includes("LADO DIREITO") && (upperE.includes("PALETIZADO") || upperE.includes("BATIDO/PALETIZADO"))) {
          setSidebarEmbarque1("https://lh3.googleusercontent.com/d/1J3nx_-iBh-5AiBJEB5fZrv_wW9sJNIXI");
        } else if (upperE.includes("LADO ESQUERDO") && (upperE.includes("PALETIZADO") || upperE.includes("BATIDO/PALETIZADO"))) {
          setSidebarEmbarque1("https://lh3.googleusercontent.com/d/1cw1CQiD8FUzeIBh36sBObz91h8k3bls1");
        } else if (upperE.includes("LADO DIREITO")) {
          setSidebarEmbarque1("https://lh3.googleusercontent.com/d/1-OVNvrvxJ_t6RCj8hQpU0ZDtk3BfVWBV");
        } else if (upperE.includes("LADO ESQUERDO")) {
          setSidebarEmbarque1("https://lh3.googleusercontent.com/d/14F4wPXwU607GmwqphSzlXk7xZ_EhOdWS");
        } else if (upperE.includes("SUPERIOR") || upperE.includes("BATIDO")) {
          setSidebarEmbarque1("https://lh3.googleusercontent.com/d/17dIlYwXF3McL0Xr-Hs00COyFH9A0REEh");
        } else if (upperE.includes("PALETIZADO")) {
          setSidebarEmbarque1("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
        }
      }

      if (info.carretas.length > 1) {
        const c2 = info.carretas[1];
        setNumCarretas(2);
        if (c2.carreta) setCarreta2(c2.carreta);
        if (c2.isca) {
          setIsca2(c2.isca);
          handleIsca2Change(c2.isca);
        }
        if (c2.produto) setProduto2(c2.produto);
        if (c2.uma) setUma2(formatUMA(c2.uma));
        if (c2.nf) setNfFim(c2.nf.trim().replace(/[\s.]/g, ""));

        if (c2.esquema) {
          const upperE = c2.esquema.toUpperCase();
          if (upperE.includes("LADO DIREITO") && (upperE.includes("PALETIZADO") || upperE.includes("BATIDO/PALETIZADO"))) {
            setSidebarEmbarque2("https://lh3.googleusercontent.com/d/1J3nx_-iBh-5AiBJEB5fZrv_wW9sJNIXI");
          } else if (upperE.includes("LADO ESQUERDO") && (upperE.includes("PALETIZADO") || upperE.includes("BATIDO/PALETIZADO"))) {
            setSidebarEmbarque2("https://lh3.googleusercontent.com/d/1cw1CQiD8FUzeIBh36sBObz91h8k3bls1");
          } else if (upperE.includes("LADO DIREITO")) {
            setSidebarEmbarque2("https://lh3.googleusercontent.com/d/1-OVNvrvxJ_t6RCj8hQpU0ZDtk3BfVWBV");
          } else if (upperE.includes("LADO ESQUERDO")) {
            setSidebarEmbarque2("https://lh3.googleusercontent.com/d/14F4wPXwU607GmwqphSzlXk7xZ_EhOdWS");
          } else if (upperE.includes("SUPERIOR") || upperE.includes("BATIDO")) {
            setSidebarEmbarque2("https://lh3.googleusercontent.com/d/17dIlYwXF3McL0Xr-Hs00COyFH9A0REEh");
          } else if (upperE.includes("PALETIZADO")) {
            setSidebarEmbarque2("https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF");
          }
        }
      } else {
        setNumCarretas(1);
      }
    }

    if (info.transportadora) {
      const normTransp = normalizePlacaTransportador(info.transportadora);
      const match = allTransportadoras.find(
        (t) => t.toLowerCase() === normTransp.toLowerCase()
      );
      const finalTransp = match || normTransp;
      setTransportadora(finalTransp);
      setSidebarTransportadora(finalTransp);
      if (!match) {
        setCustomTransportadoras((prev) => [...prev, finalTransp]);
      }
    }

    if (info.motorista) {
      setMotorista(info.motorista);
      setSidebarMotorista(info.motorista);
    }

    if (info.destino) {
      const { rota, destinoFinal } = findBestMatchingRoute(info.destino, unidadeOrigem);
      setDestino(destinoFinal);
      setRota1(rota);
    } else {
      setRota1(`· ${unidadeOrigem} x DESTINO;`);
    }

    if (info.tecnologia) {
      setSidebarTecnologia(info.tecnologia);
    }

    // Valor da carga fica vazio na importação da aba Unidades (exclusivo para Santa Luzia)
    setValorCarga("");

    // Interactive confirmation banner
    setImportSuccessBanner({
      cavalo: info.cavalo || "S/ Placa",
      motorista: info.motorista || "Motorista",
      destino: info.destino || "Destino",
      transp: info.transportadora || "Transportadora",
    });

    // Automatically switch to Gerador PGR
    setActiveTab("gerador");
  };

  // Function to build and copy HTML template for Email pasting
  const handleCopyToEmail = async () => {
    const isPaletizado1 =
      sidebarEmbarque1 === "https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF" ||
      sidebarEmbarque1 === "/images/paletizado_lado_direito.png" ||
      sidebarEmbarque1 === "/images/img_0.png";
    const isPaletizado2 =
      sidebarEmbarque2 === "https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF" ||
      sidebarEmbarque2 === "/images/paletizado_lado_direito.png" ||
      sidebarEmbarque2 === "/images/img_0.png";

    const getEmbarqueImgSrc = (imgUrl: string) => {
      if (!imgUrl || imgUrl === "none") return "";
      if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://") || imgUrl.startsWith("data:")) {
        return imgUrl;
      }
      if (typeof window !== "undefined" && window.location?.origin) {
        return `${window.location.origin}${imgUrl}`;
      }
      return imgUrl;
    };

    const alertBg = isGreenOrigem
      ? "#059669"
      : isPurpleOrigem
        ? "#7E22CE"
        : isCuiabaOrigem
          ? "#EAB308"
          : "#DC2626";
    const alertTextColor = isGreenOrigem
      ? "#FFFFFF"
      : isPurpleOrigem
        ? "#FFFFFF"
        : isCuiabaOrigem
          ? "#0F172A"
          : "#FFFFFF";
    const iscaHighlightColor = isGreenOrigem
      ? "#059669"
      : isPurpleOrigem
        ? "#7E22CE"
        : isCuiabaOrigem
          ? "#D97706"
          : "#DC2626";
    const ladderCellBg = isGreenOrigem
      ? "#059669"
      : isPurpleOrigem
        ? "#7E22CE"
        : isCuiabaOrigem
          ? "#EAB308"
          : "#DC2626";
    const ladderCellColor = isGreenOrigem
      ? "#FFFFFF"
      : isPurpleOrigem
        ? "#FFFFFF"
        : isCuiabaOrigem
          ? "#0F172A"
          : "#FFFFFF";

    // Helper to render ladder visual grid inside email HTML matching modern executive style
    const renderLadderHtml = (
      grid: string[][],
      label: string,
      plate: string,
      extraStyle: string = "",
    ) => {
      return `
        <td style="vertical-align: top; width: 50%; text-align: center; ${extraStyle}">
          
          <table cellpadding="0" cellspacing="0" style="width: 75px; margin: 0 auto; border-collapse: collapse;">
            <tr>
              <td colspan="2" style="background-color: #002366; color: #FFFFFF; font-size: 9px; font-weight: 800; padding: 5px 0; border: 1px solid #0039a6; text-transform: uppercase; text-align: center; letter-spacing: 0.5px;">${label}</td>
            </tr>
            ${grid
              .map((row) => {
                return `
                <tr>
                  ${row
                    .map((cell) => {
                      const bg = cell === "P" ? ladderCellBg : "#FFFFFF";
                      const color = cell === "P" ? ladderCellColor : "#0F172A";
                      return `<td style="border: 1px solid #CBD5E1; background-color: ${bg}; color: ${color}; font-size: 10px; font-weight: bold; width: 50%; height: 18px; text-align: center; vertical-align: middle;">${cell === "P" ? "P" : ""}</td>`;
                    })
                    .join("")}
                </tr>`;
              })
              .join("")}
          </table>
          
          <p style="font-size: 11px; font-weight: 800; color: #0F172A; margin-top: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${plate}</p>
        </td>
      `;
    };

    const headerTruckImgUrl =
      typeof window !== "undefined" && window.location?.origin
        ? `${window.location.origin}/images/panoramic_truck_sunset.jpg`
        : "/images/panoramic_truck_sunset.jpg";

    const htmlEmail = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #FAF7F0; padding: 18px 20px; color: #1A1D20; width: 100%; max-width: 100%; box-sizing: border-box; margin: 0; border-radius: 12px; border: 1px solid #C5A059; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        
        <!-- BANNER DE CABEÇALHO PANORÂMICO CORPORATIVO (3 CORAÇÕES) COM FOTOGRAFIA DE CAMINHÃO E RODOVIA -->
        <table cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; background-color: #14171A; background: linear-gradient(90deg, #121417 0%, #1A1D22 35%, #24272D 60%, #181A1E 100%); border-radius: 10px; overflow: hidden; margin-bottom: 20px; border: 1.5px solid #C5A059; box-shadow: 0 4px 15px rgba(0,0,0,0.25);">
          <tr>
            <!-- Coluna Esquerda: Marca e Títulos Institucionais -->
            <td style="padding: 14px 18px; vertical-align: middle; width: 44%; background-color: #14171A;">
              <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 14px;">
                    <div style="width: 48px; height: 48px; background: radial-gradient(circle, #D92332 0%, #9B1526 100%); border: 2px solid #D4AF37; border-radius: 50%; text-align: center; line-height: 46px; color: #FFFFFF; font-weight: 900; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.4); text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
                      3♥C
                    </div>
                  </td>
                  <td style="vertical-align: middle;">
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; font-weight: 900; font-size: 20px; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.8px; margin: 0; line-height: 1.1;">
                      SANTA LUZIA <span style="color: #D4AF37;">GR</span>
                    </div>
                    <div style="font-size: 10px; font-weight: 800; color: #C5A059; text-transform: uppercase; letter-spacing: 2px; margin-top: 2px;">
                      CENTRAL DE CONTROLE
                    </div>
                    <div style="font-size: 8px; font-weight: 600; color: #C4C9D0; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 4px;">
                      MONITORAMENTO INTELIGENTE · MAIS SEGURANÇA · SUA CARGA SEMPRE EM FOCO
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            
            <!-- Coluna Centro: Fotografia Panorâmica de Rodovia, Montanhas e Caminhão -->
            <td style="width: 38%; vertical-align: middle; padding: 0; text-align: center; background-color: #181A1E; overflow: hidden;">
              <img src="${headerTruckImgUrl}" alt="Caminhão em rodovia ao pôr do sol" width="340" height="118" style="width: 100%; height: 118px; max-height: 118px; object-fit: cover; display: block; border: 0;" />
            </td>

            <!-- Coluna Direita: Frase 'Juntos fazemos mais!' com detalhes dourados -->
            <td style="padding: 14px 18px; text-align: right; vertical-align: middle; width: 18%; background-color: #14171A; border-left: 1px solid #332E22;">
              <div style="color: #D4AF37; font-weight: bold; font-style: italic; font-size: 15px; font-family: 'Georgia', serif; letter-spacing: 0.3px; text-shadow: 0 1px 3px rgba(0,0,0,0.5); line-height: 1.2;">
                Juntos fazemos mais!
              </div>
            </td>
          </tr>
        </table>

        <!-- Saudação -->
        <p style="font-family: 'Segoe UI', Arial, sans-serif; font-weight: 800; color: #1A1D20; font-size: 14px; margin: 0 0 12px; padding: 0;">${saudacao || "Boa tarde,"}</p>

        <!-- FAIXA ÚNICA DE ALERTA + ORIENTAÇÕES: VERMELHO À ESQUERDA, INFORMAÇÕES À DIREITA -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;border-spacing:0;margin:0 0 18px;border:1px solid #C5A059;border-radius:12px;overflow:hidden;background:#FFF9ED;font-family:'Segoe UI',Arial,sans-serif;">
          <tr>
            <td width="38%" valign="middle" style="width:38%;padding:16px 18px;background-color:${alertBg};background-image:linear-gradient(135deg,${alertBg},#74101A);color:${alertTextColor};border-right:2px solid #D4AF37;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td width="34" valign="middle" style="width:34px;padding-right:10px;font-size:26px;line-height:1;">⚠</td>
                  <td valign="middle" style="font-size:15px;line-height:1.25;font-weight:900;text-transform:uppercase;letter-spacing:.3px;">
                    ${(alertaResgate || "FAVOR SE ATENTAR AO RESGATE!").replace(/\n/g, "<br>")}
                  </td>
                </tr>
              </table>
            </td>
            <td width="62%" valign="middle" style="width:62%;padding:13px 18px;background-color:#FFF9ED;color:#211C19;">
              <div style="font-size:12px;line-height:1.3;font-weight:900;text-transform:uppercase;margin:0 0 7px;color:#211C19;">${infoAbaixo || "Atentar às informações abaixo:"}</div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;font-size:11px;line-height:1.45;">
                <tr><td valign="top" style="width:16px;padding:2px 7px 2px 0;color:#C91F2D;font-weight:900;">•</td><td style="padding:2px 0;color:#211C19;">${rota1 || ""}</td></tr>
                <tr><td valign="top" style="width:16px;padding:2px 7px 2px 0;color:#C91F2D;font-weight:900;">•</td><td style="padding:2px 0;color:#211C19;">${instrucao1 || ""}</td></tr>
                ${!pastePlanilha.trim() ? `<tr><td valign="top" style="width:16px;padding:2px 7px 2px 0;color:#C91F2D;font-weight:900;">•</td><td style="padding:3px 7px;color:#C91F2D;font-weight:800;background:#FFF0EF;border:1px solid #FFD0CC;">O site das iscas está temporariamente fora do ar.</td></tr>` : ""}
              </table>
            </td>
          </tr>
        </table>

        <!-- RESUMO DA CARGA: 3 GRUPOS HORIZONTAIS GRAFITE E DOURADO -->
        <table style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #181A1D 0%, #202429 50%, #181A1D 100%); border: 1px solid #C5A059; border-radius: 8px; overflow: hidden; margin-bottom: 20px; font-family: 'Segoe UI', Arial, sans-serif; box-shadow: 0 3px 10px rgba(0,0,0,0.15);">
          <tr>
            <!-- Grupo 1: Número da NF -->
            <td style="padding: 12px 14px; border-right: 1px solid #3F3B32; text-align: center; width: 34%; vertical-align: middle;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #2D3238 0%, #1A1D20 100%); border: 1.5px solid #D4AF37; text-align: center; line-height: 29px; color: #D4AF37; font-size: 14px;">
                      📄
                    </div>
                  </td>
                  <td style="vertical-align: middle; text-align: left;">
                    <div style="font-size: 9px; font-weight: 800; color: #C5A059; text-transform: uppercase; letter-spacing: 0.8px;">NÚMERO DA NF:</div>
                    <div style="font-size: 14px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.5px; margin-top: 2px;">
                      ${nfInicio.replace(/-/g, '') || '---'} ${numCarretas === 2 && isca2 !== "SEM ISCA" && nfFim ? `/ ${nfFim.replace(/-/g, '')}` : ''}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            <!-- Grupo 2: Transportadora -->
            <td style="padding: 12px 14px; border-right: 1px solid #3F3B32; text-align: center; width: 33%; vertical-align: middle;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #2D3238 0%, #1A1D20 100%); border: 1.5px solid #D4AF37; text-align: center; line-height: 29px; color: #D4AF37; font-size: 14px;">
                      🚚
                    </div>
                  </td>
                  <td style="vertical-align: middle; text-align: left;">
                    <div style="font-size: 9px; font-weight: 800; color: #C5A059; text-transform: uppercase; letter-spacing: 0.8px;">TRANSPORTADORA:</div>
                    <div style="font-size: 14px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.5px; margin-top: 2px; text-transform: uppercase;">
                      ${transportadora || '---'}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
            <!-- Grupo 3: Valor da Carga -->
            <td style="padding: 12px 14px; text-align: center; width: 33%; vertical-align: middle;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #2D3238 0%, #1A1D20 100%); border: 1.5px solid #D4AF37; text-align: center; line-height: 29px; color: #D4AF37; font-size: 14px;">
                      💰
                    </div>
                  </td>
                  <td style="vertical-align: middle; text-align: left;">
                    <div style="font-size: 9px; font-weight: 800; color: #C5A059; text-transform: uppercase; letter-spacing: 0.8px;">VALOR DA CARGA:</div>
                    <div style="font-size: 14px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.5px; margin-top: 2px;">
                      ${valorCarga || '---'}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- TABELA 1: DADOS DA OPERAÇÃO (CABEÇALHOS GRAFITE, BORDAS DOURADAS, LINHAS MARFIM) -->
        <table style="width: 100%; border-collapse: collapse; background-color: #FDFBF7; font-size: 10px; text-align: center; color: #1A1D20; margin-bottom: 20px; border: 1px solid #C5A059; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <tr style="background: linear-gradient(180deg, #22262B 0%, #181A1D 100%); color: #FFFFFF; font-weight: 800; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.5px;">
            <td style="padding: 10px 6px; border: 1px solid #C5A059; border-top: none;">MOTORISTA</td>
            <td style="padding: 10px 6px; border: 1px solid #C5A059; border-top: none;">CAVALO</td>
            <td style="padding: 10px 6px; border: 1px solid #C5A059; border-top: none;">CARRETAS</td>
            <td style="padding: 10px 6px; border: 1px solid #C5A059; border-top: none;">N° ISCA</td>
            <td style="padding: 10px 6px; border: 1px solid #C5A059; border-top: none;">PROD. EMBARCADO</td>
            <td style="padding: 10px 6px; border: 1px solid #C5A059; border-top: none;">CÓD. U.M.A.</td>
            <td style="padding: 10px 6px; border: 1px solid #C5A059; border-top: none;">DESTINO</td>
            <td style="padding: 10px 6px; border: 1px solid #C5A059; border-top: none;">DATA PARTIDA</td>
          </tr>
          <tr style="background-color: #FFFFFF; border-bottom: 1px solid #E5D5B5;">
            <td rowspan="${numCarretas}" style="padding: 8px 6px; border: 1px solid #E5D5B5; font-weight: 800; color: #1A1D20;">${motorista}</td>
            <td rowspan="${numCarretas}" style="padding: 8px 6px; border: 1px solid #E5D5B5; font-weight: 800; color: #1A1D20;">${cavalo}</td>
            <td style="padding: 8px 6px; border: 1px solid #E5D5B5; font-weight: 800; color: #1A1D20;">${carreta1}</td>
            <td style="padding: 8px 6px; border: 1px solid #E5D5B5; text-align: center; font-weight: 800; color: #C91F2D;">
              ${isca1 || 'ISCA 1'}
            </td>
            <!-- PRODUTO EMBARCADO: TEXTO LIMPO EM NEGRITO -->
            <td style="padding: 8px 6px; border: 1px solid #E5D5B5; text-align: center; font-weight: 800; color: #1A1D20;">
              ${produto1 || "PROD 1"}
            </td>
            <!-- CÓDIGO U.M.A.: TEXTO LIMPO EM NEGRITO -->
            <td style="padding: 8px 6px; border: 1px solid #E5D5B5; text-align: center; font-weight: 800; color: #1A1D20;">
              ${uma1 || "CÓDIGO U.M.A."}
            </td>
            <td rowspan="${numCarretas}" style="padding: 8px 6px; border: 1px solid #E5D5B5; font-weight: 800; color: #1A1D20;">${destino}</td>
            <td rowspan="${numCarretas}" style="padding: 8px 6px; border: 1px solid #E5D5B5; font-weight: 800; color: #1A1D20;">${dataEnviada}</td>
          </tr>
          ${
            numCarretas === 2
              ? `
          <tr style="background-color: #FBF8F1; border-bottom: 1px solid #E5D5B5;">
            <td style="padding: 8px 6px; border: 1px solid #E5D5B5; font-weight: 800; color: #1A1D20;">${carreta2}</td>
            <td style="padding: 8px 6px; border: 1px solid #E5D5B5; text-align: center; font-weight: 800; color: #C91F2D;">
              ${isca2 || 'ISCA 2'}
            </td>
            <!-- PROD 2: TEXTO LIMPO EM NEGRITO -->
            <td style="padding: 8px 6px; border: 1px solid #E5D5B5; text-align: center; font-weight: 800; color: #1A1D20;">
              ${produto2 || "PROD 2"}
            </td>
            <!-- UMA 2: TEXTO LIMPO EM NEGRITO -->
            <td style="padding: 8px 6px; border: 1px solid #E5D5B5; text-align: center; font-weight: 800; color: #1A1D20;">
              ${uma2 || "CÓDIGO U.M.A."}
            </td>
          </tr>
          `
              : ""
          }
        </table>

        <!-- TABELA 2: PARAMETRIZAÇÃO DAS ISCAS CORPORATIVA DOURADA & GRAFITE -->
        <table style="width: 100%; border-collapse: collapse; background-color: #FFFFFF; font-size: 10px; text-align: center; color: #1A1D20; margin-bottom: 22px; border: 1px solid #C5A059; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <tr style="background: linear-gradient(180deg, #1A1D20 0%, #252A30 100%); color: #FFFFFF; font-size: 11px;">
            <td colspan="4" style="padding: 10px 14px; border-bottom: 1px solid #C5A059; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">
              <table cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                <tr>
                  <td style="width: 28px; vertical-align: middle;">
                    <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #F59E0B 0%, #B8860B 100%); border: 1px solid #D4AF37; border-radius: 50%; text-align: center; line-height: 22px; color: #111111; font-weight: 900; font-size: 11px; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">⚙</div>
                  </td>
                  <td style="vertical-align: middle; color: #FFFFFF; font-weight: 900; font-size: 11px; letter-spacing: 1.2px; text-align: center;">
                    PARAMETRIZAÇÃO DAS ISCAS
                  </td>
                  <td style="width: 28px; text-align: right;"></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr style="background-color: #F5EDDA; color: #1A1D20; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; border-bottom: 1px solid #C5A059;">
            <td style="padding: 8px 6px; border-right: 1px solid #C5A059; width: 25%;">
              PLACA / CÓDIGO DE VENDA ⇅
            </td>
            <td style="padding: 8px 6px; border-right: 1px solid #C5A059; width: 45%;">ENDEREÇO APROXIMADO DA POSIÇÃO ⇅</td>
            <td style="padding: 8px 6px; border-right: 1px solid #C5A059; width: 18%;">DATA POSIÇÃO ⇅</td>
            <td style="padding: 8px 6px; width: 12%;">BATERIA ISCA _ RF ⇅</td>
          </tr>
          ${
            numCarretas === 2 && !!isca2DisplayCode
              ? `
          <tr style="background-color: #FFFFFF; border-bottom: 1px solid #E5D5B5;">
            <td style="padding: 8px 6px; border-right: 1px solid #E5D5B5; text-transform: uppercase; font-weight: 800; color: #C91F2D; text-align: center;">${isca2DisplayCode}</td>
            <td style="padding: 8px 6px; border-right: 1px solid #E5D5B5; text-align: left; padding-left: 12px; font-weight: 800; color: ${!pastePlanilha.trim() && !isca2Endereco ? "#C91F2D" : "#1A1D20"};">${isca2Endereco || (!pastePlanilha.trim() ? "O site das iscas está temporariamente fora do ar." : "")}</td>
            <td style="padding: 8px 6px; border-right: 1px solid #E5D5B5; font-weight: 800; color: #1A1D20;">${isca2Data}</td>
            <td style="padding: 8px 6px;">
              ${
                ((isca2Endereco || (!pastePlanilha.trim() ? "O site das iscas está temporariamente fora do ar." : "")).includes("temporariamente fora do ar"))
                  ? ""
                  : `
              <div style="display: flex; align-items: center; justify-content: center;">
                <span style="margin-right: 6px; font-weight: 800; color: #16A34A;">${isca2Bateria || "100%"}</span>
                <div style="width: 20px; height: 10px; border: 1px solid #16A34A; border-radius: 2px; padding: 1px; display: inline-block; position: relative; vertical-align: middle;">
                  <div style="width: ${Math.min(100, parseInt(isca2Bateria) || 100)}%; height: 100%; background-color: #16A34A; border-radius: 1px;"></div>
                  <div style="position: absolute; right: -3px; top: 2px; width: 2px; height: 4px; background-color: #16A34A; border-radius: 0 1px 1px 0;"></div>
                </div>
              </div>
              `
              }
            </td>
          </tr>
          `
              : ""
          }
          <tr style="background-color: #FFFFFF;">
            <td style="padding: 8px 6px; border-right: 1px solid #E5D5B5; text-transform: uppercase; font-weight: 800; color: #C91F2D; text-align: center;">${isca1DisplayCode}</td>
            <td style="padding: 8px 6px; border-right: 1px solid #E5D5B5; text-align: left; padding-left: 12px; font-weight: 800; color: ${!pastePlanilha.trim() && !isca1Endereco ? "#C91F2D" : "#1A1D20"};">${isca1Endereco || (!pastePlanilha.trim() ? "O site das iscas está temporariamente fora do ar." : "")}</td>
            <td style="padding: 8px 6px; border-right: 1px solid #E5D5B5; font-weight: 800; color: #1A1D20;">${isca1Data}</td>
            <td style="padding: 8px 6px;">
              ${
                ((isca1Endereco || (!pastePlanilha.trim() ? "O site das iscas está temporariamente fora do ar." : "")).includes("temporariamente fora do ar"))
                  ? ""
                  : `
              <div style="display: flex; align-items: center; justify-content: center;">
                <span style="margin-right: 6px; font-weight: 800; color: #16A34A;">${isca1Bateria || "100%"}</span>
                <div style="width: 20px; height: 10px; border: 1px solid #16A34A; border-radius: 2px; padding: 1px; display: inline-block; position: relative; vertical-align: middle;">
                  <div style="width: ${Math.min(100, parseInt(isca1Bateria) || 100)}%; height: 100%; background-color: #16A34A; border-radius: 1px;"></div>
                  <div style="position: absolute; right: -3px; top: 2px; width: 2px; height: 4px; background-color: #16A34A; border-radius: 0 1px 1px 0;"></div>
                </div>
              </div>
              `
              }
            </td>
          </tr>
        </table>



        <!-- SEÇÃO: ESQUEMA DE EMBARQUE -->
        ${
          ocultarNotas
            ? ""
            : `
        <div style="margin-top: 25px;">
          <p style="font-weight: 900; font-size: 13px; margin-bottom: 20px; color: #0F172A; text-transform: uppercase; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px; letter-spacing: 0.5px;">
            ESQUEMA DE EMBARQUE DAS ISCAS:
          </p>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; max-width: 720px; margin: 0 auto; gap: ${(!sidebarEmbarque1 && !sidebarEmbarque2) ? '10px' : '30px'};">
            <!-- Carreta 1 Section -->
            ${
              sidebarEmbarque1 === "none"
                ? ""
                : sidebarEmbarque1
                ? `
                <div style="text-align: center; width: ${isPaletizado1 ? '150px' : '320px'};">
                  <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: ${isPaletizado1 ? '6px' : '12px'}; margin-bottom: ${isPaletizado1 ? '8px' : '15px'}; width: ${isPaletizado1 ? '150px' : '320px'}; height: ${isPaletizado1 ? '200px' : '420px'}; display: flex; align-items: center; justify-content: center; box-sizing: border-box; border-radius: 6px; shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <img src="${getEmbarqueImgSrc(sidebarEmbarque1)}" alt="Esquema" style="max-width: 95%; max-height: 95%; width: auto; height: auto; object-fit: contain; display: block; margin: auto;">
                  </div>
                  <p style="font-size: ${isPaletizado1 ? '9px' : '11px'}; font-weight: 800; color: #0F172A; margin-top: ${isPaletizado1 ? '6px' : '12px'}; text-transform: uppercase;">CARRETA 1: ${carreta1}</p>
                </div>
              `
                : `<div style="text-align: center; width: 100px;">
                    ${renderLadderHtml(ladder1, "ESCALA 01", carreta1, "").replace('padding-right: 15px; padding-top: 15px;', '')}
                  </div>`
            }

            <!-- Carreta 2 Section -->
            ${
              numCarretas === 2
                ? (sidebarEmbarque2 === "none"
                  ? ""
                  : sidebarEmbarque2
                  ? `
                <div style="text-align: center; width: ${isPaletizado2 ? '150px' : '320px'};">
                  <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; padding: ${isPaletizado2 ? '6px' : '12px'}; margin-bottom: ${isPaletizado2 ? '8px' : '15px'}; width: ${isPaletizado2 ? '150px' : '320px'}; height: ${isPaletizado2 ? '200px' : '420px'}; display: flex; align-items: center; justify-content: center; box-sizing: border-box; border-radius: 6px; shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <img src="${getEmbarqueImgSrc(sidebarEmbarque2)}" alt="Esquema" style="max-width: 95%; max-height: 95%; width: auto; height: auto; object-fit: contain; display: block; margin: auto;">
                  </div>
                  <p style="font-size: ${isPaletizado2 ? '9px' : '11px'}; font-weight: 800; color: #0F172A; margin-top: ${isPaletizado2 ? '6px' : '12px'}; text-transform: uppercase;">CARRETA 2: ${carreta2}</p>
                </div>
                `
                  : `<div style="text-align: center; width: 100px;">
                      ${renderLadderHtml(ladder2, "ESCALA 02", carreta2, "").replace('padding-top: 15px;', '')}
                    </div>`)
                : ""
            }
          </div>
        </div>
        `
        }

        ${
          isDescartavel
            ? ""
            : `
        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 25px 0; clear: both;">

        <!-- Rodapé Corporativo -->
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 6px;">
          <p style="font-size: 11px; font-weight: 900; color: #0F172A; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">GERENCIAMENTO DE RISCO</p>
          <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0; font-weight: 500; line-height: 1.5;">• Ressalto a importância de encaminhar todas as iscas resgatadas para suas respectivas unidades de origem.</p>
          <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0; font-weight: 500; line-height: 1.5;">Agradeço antecipadamente pelo compromisso em assegurar que esses envios sejam efetuados via veículos dedicados ou postagem de maneira a evitar qualquer inconveniente em nossa operação.</p>
          <p style="font-size: 11px; color: #334155; margin: 0 0 6px 0; font-weight: 500; line-height: 1.5;">A devolução dos rastreadores móveis é essencial, porém, muitos ainda não foram devolvidos prejudicando nossos processos. Por gentileza, devolvam as iscas o quanto antes para mantermos nossa excelência operacional.</p>
          <p style="font-size: 11px; color: #334155; margin: 0; font-weight: 500; line-height: 1.5;">Desde já agradeço e ficamos no aguardo do retorno sobre as devoluções.</p>
        </div>
        `
        }

      </div>
    `;

    const plainText = `
${saudacao}

${alertaResgate}

${infoAbaixo}

· ${rota1};
· ${instrucao1}${!pastePlanilha.trim() ? "\n· O site das iscas está temporariamente fora do ar." : ""}

-----------------------------------------------------------------------------------------------------------------
NÚMERO DA NF: ${[nfInicio, (numCarretas === 2 && isca2 !== "SEM ISCA" ? nfFim : "")].filter(Boolean).map(v => v.replace(/-/g, '')).join(' ')} | TRANSPORTADORA: ${transportadora}${valorCarga ? ` | VALOR CARGA: ${valorCarga}` : ""}
-----------------------------------------------------------------------------------------------------------------
MOTORISTA: ${motorista}
CAVALO: ${cavalo.replace(/-/g, '')}
DESTINO: ${destino}
DATA ENVIADA: ${dataEnviada}
-----------------------------------------------------------------------------------------------------------------
DETALHES DE CARGA & ISCAS:
1. Carreta: ${carreta1} | N° Isca: ${isca1} | Produto: ${produto1} | Cód U.M.A.: ${uma1}
${numCarretas === 2 ? `2. Carreta: ${carreta2} | N° Isca: ${isca2} | Produto: ${produto2} | Cód U.M.A.: ${uma2}` : ""}
-----------------------------------------------------------------------------------------------------------------
${parametrizacao.toUpperCase()}
${
  ocultarNotas
    ? ""
    : `
ESQUEMA DE EMBARQUE DAS ISCAS:
${
  numCarretas === 1
    ? `1. CARRETA: ${carreta1} - ${sidebarEmbarque1 ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque1)?.label : "Paletizado (Padrão)"}`
    : `
1. CARRETA: ${carreta1} - ${sidebarEmbarque1 ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque1)?.label : "Paletizado (Padrão)"}
2. CARRETA: ${carreta2} - ${sidebarEmbarque2 ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque2)?.label : "Paletizado (Padrão)"}
`.trim()
}
`
}
-----------------------------------------------------------------------------------------------------------------
Informações de Apoio:
Tecnologia: ${sidebarTecnologia}
Embarque: ${
  sidebarEmbarque1 || sidebarEmbarque2
    ? [
        sidebarEmbarque1
          ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque1)
              ?.label || "Carreta 1"
          : null,
        sidebarEmbarque2 && numCarretas === 2
          ? EMBARQUE_IMAGES.find((img) => img.value === sidebarEmbarque2)
              ?.label || "Carreta 2"
          : null,
      ]
        .filter(Boolean)
        .join(" / ")
    : "PALETIZADO (PADRÃO)"
}
${
  isDescartavel
    ? ""
    : `
-----------------------------------------------------------------------------------------------------------------
GERENCIAMENTO DE RISCO:
• Ressalto a importância de encaminhar todas as iscas resgatadas para suas respectivas unidades de origem.
Agradeço antecipadamente pelo compromisso em assegurar que esses envios sejam efetuados via veículos dedicados ou postagem de maneira a evitar qualquer inconveniente em nossa operação.
A devolução dos rastreadores móveis é essencial, porém, muitos ainda não foram devolvidos prejudicando nossos processos. Por gentileza, devolvam as iscas o quanto antes para mantermos nossa excelência operacional.
Desde já agradeço e ficamos no aguardo do retorno sobre as devoluções.
`
}
    `;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlEmail], { type: "text/html" });
        const textBlob = new Blob([plainText], { type: "text/plain" });
        const item = new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob,
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Erro ao copiar:", err);
      // Fallback
      try {
        await navigator.clipboard.writeText(plainText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (fallbackErr) {
        alert(
          "Falha ao copiar conteúdo. Por favor, selecione e copie manualmente.",
        );
      }
    }
  };

  const handleCopySubject = async () => {
    const isDefaultOrigem = origem === "SANTA LUZIA/MG";
    const subjectPrefix = isDefaultOrigem ? "" : `${origem.toUpperCase()} X `;
    const subject = `PRÉ-ALERTA DE ISCA - ${subjectPrefix}${(destino || "GUARULHOS/SP").toUpperCase()} - ${(cavalo.replace(/-/g, "") || "TYQ6F51").toUpperCase()}`;
    try {
      await navigator.clipboard.writeText(subject);
      setCopiedAssunto(true);
      setTimeout(() => setCopiedAssunto(false), 2500);
    } catch (err) {
      console.error("Erro ao copiar assunto:", err);
    }
  };

  return (
    <div className="w-full relative z-10 max-w-full mx-auto flex flex-col font-sans space-y-5 text-[#292820] min-h-screen bg-[#F5F0E6] p-4 sm:p-6 rounded-3xl border border-[#EDE2CE] shadow-sm">
      
      {/* CINEMATIC HERO BANNER */}
      <div 
        className="relative w-full rounded-2xl sm:rounded-3xl p-6 sm:p-8 overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 border border-[#E6D2A3] shadow-md"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255, 252, 246, 0.94) 0%, rgba(245, 240, 230, 0.95) 50%, rgba(237, 226, 206, 0.96) 100%), url(${heroRotas})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E6D2A3] via-[#C49A45] to-[#B08632] flex items-center justify-center text-[#292820] shadow-md border border-[#E6D2A3] shrink-0">
            <Radio size={30} className="stroke-[2.5]" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE2CE] border border-[#E6D2A3] text-[#292820] text-[10px] font-mono font-black uppercase tracking-wider mb-2">
              <span>// OPERAÇÃO 3C</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#292820] font-sans drop-shadow-xs">
              CENTRAL DE CONTROLE PGR
            </h1>
            <p className="text-xs text-[#77736B] font-sans mt-1 max-w-xl leading-relaxed">
              Gerador inteligente de controle, pré-alerta, monitoramento e gestão de frota integrada.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-[#FFFCF6] p-1.5 rounded-2xl border border-[#EDE2CE] shadow-xs gap-2 flex-wrap sm:flex-nowrap relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab("gerador")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer",
              activeTab === "gerador"
                ? "bg-gradient-to-r from-[#E6D2A3] via-[#C49A45] to-[#B08632] text-[#292820] shadow-xs border border-[#C49A45]/40"
                : "text-[#77736B] hover:text-[#292820] hover:bg-[#EDE2CE]/50"
            )}
          >
            <Sliders size={15} />
            <span>PRE ALERTA GR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("placas")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer relative",
              activeTab === "placas"
                ? "bg-gradient-to-r from-[#E6D2A3] via-[#C49A45] to-[#B08632] text-[#292820] shadow-xs border border-[#C49A45]/40"
                : "text-[#77736B] hover:text-[#292820] hover:bg-[#EDE2CE]/50"
            )}
          >
            <Truck size={15} />
            <span>SANTA LUZIA / MG</span>
            {parsedPlacas.length > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black font-mono shadow-xs",
                activeTab === "placas" ? "bg-[#292820] text-[#E6D2A3]" : "bg-[#EDE2CE] text-[#292820]"
              )}>
                {parsedPlacas.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("unidades")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer relative",
              activeTab === "unidades"
                ? "bg-gradient-to-r from-[#E6D2A3] via-[#C49A45] to-[#B08632] text-[#292820] shadow-xs border border-[#C49A45]/40"
                : "text-[#77736B] hover:text-[#292820] hover:bg-[#EDE2CE]/50"
            )}
          >
            <Compass size={15} />
            <span>CUIABÁ / MT</span>
            {parsedUnidades.carretas.length > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black font-mono shadow-xs",
                activeTab === "unidades" ? "bg-[#292820] text-[#E6D2A3]" : "bg-[#EDE2CE] text-[#292820]"
              )}>
                {parsedUnidades.carretas.length}
              </span>
            )}
          </button>
        </div>
      </div>



      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden pt-1 bg-transparent">
        {/* TAB CONTENT: Placas (SANTA LUZIA / MG) */}
        {activeTab === "placas" && (
          <div className="flex flex-col gap-6 max-w-full mx-auto w-full animate-fade-in">
            {/* Main Station Cockpit */}
            <div className="bg-[#FFFCF6] rounded-3xl border border-[#E6D2A3] shadow-sm p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden text-[#292820]">
              {/* Station Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDE2CE]">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E6D2A3] via-[#C49A45] to-[#B08632] text-[#292820] p-3 shadow-md flex items-center justify-center shrink-0 border border-[#E6D2A3]">
                    <Truck size={24} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EDE2CE] text-[#292820] border border-[#E6D2A3]">
                        Hub Logístico
                      </span>
                      <span className="text-xs font-mono font-bold text-[#77736B]">
                        SANTA LUZIA / MG
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-sans font-black text-[#292820] uppercase tracking-tight mt-1 flex items-center gap-2">
                      Gestão & Importação de Viagens
                    </h2>
                  </div>
                </div>
              </div>

              {/* Data Ingestion Deck */}
              <div className="bg-[#F5F0E6] border border-[#EDE2CE] rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
                {placasPastedData && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setPlacasPastedData("");
                        setPlacasFilter("");
                      }}
                      className="px-3 py-1 bg-[#FFFCF6] hover:bg-[#EDE2CE] text-[#D92332] border border-[#EDE2CE] rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
                    >
                      <Trash2 size={13} />
                      <span>Limpar</span>
                    </button>
                  </div>
                )}

                <textarea
                  value={placasPastedData}
                  onChange={(e) => setPlacasPastedData(e.target.value)}
                  placeholder={`Cole aqui as linhas da planilha de Santa Luzia...\nExemplo de colunas suportadas:\nTRANSPORTADOR | CONDUTOR | CAVALO | CARRETA | CARRETA 2 | ORIGEM | DESTINO | VALOR NF | TECNOLOGIA`}
                  className="w-full h-32 bg-white border border-[#EDE2CE] focus:border-[#C49A45] rounded-xl p-3.5 text-xs font-mono text-[#292820] outline-none transition-all placeholder:text-[#77736B] shadow-inner resize-y leading-relaxed font-bold"
                />
              </div>

              {/* Parsed Results Section */}
              {parsedPlacas.length > 0 ? (
                <div className="flex flex-col gap-4 pt-2">
                  {/* Control Toolbar: Search, Filters, and View Switcher */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#292820] text-[#E6D2A3] p-4 rounded-2xl shadow-md border border-[#C49A45]/40">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-stone-300">
                          Veículos Identificados:
                        </span>
                        <span className="bg-[#9b1526] text-white text-xs font-mono font-black px-2.5 py-0.5 rounded-full shadow-xs">
                          {filteredPlacas.length} de {parsedPlacas.length}
                        </span>
                      </div>

                      {/* Quick Transporter Filter */}
                      {santaLuziaStats.transps.length > 1 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-stone-400 uppercase">
                            Transportadora:
                          </span>
                          <select
                            value={placasSelectedTransp}
                            onChange={(e) => setPlacasSelectedTransp(e.target.value)}
                            className="bg-[#2d241e] border border-stone-700 text-white rounded-lg text-xs font-bold px-2.5 py-1 outline-none cursor-pointer"
                          >
                            <option value="TODAS">Todas ({santaLuziaStats.transps.length})</option>
                            {santaLuziaStats.transps.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Search Bar */}
                      <div className="relative w-full sm:w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="text"
                          value={placasFilter}
                          onChange={(e) => setPlacasFilter(e.target.value)}
                          placeholder="Buscar placa, condutor, destino..."
                          className="w-full pl-9 pr-3 py-1.5 bg-[#2d241e] border border-stone-700 rounded-xl text-xs font-semibold text-white placeholder:text-stone-400 outline-none focus:border-red-500 transition-colors"
                        />
                      </div>

                      {/* View Switcher: Cards vs Table */}
                      <div className="flex items-center bg-[#2d241e] p-1 rounded-xl border border-stone-700">
                        <button
                          type="button"
                          onClick={() => setPlacasViewMode("cards")}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
                            placasViewMode === "cards"
                              ? "bg-white text-stone-900 shadow-sm"
                              : "text-stone-400 hover:text-white"
                          )}
                          title="Visualização em Cards Bento"
                        >
                          <LayoutGrid size={13} />
                          <span>Cards</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlacasViewMode("table")}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer",
                            placasViewMode === "table"
                              ? "bg-white text-stone-900 shadow-sm"
                              : "text-stone-400 hover:text-white"
                          )}
                          title="Visualização em Planilha Corporativa"
                        >
                          <List size={13} />
                          <span>Tabela</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* VIEW 1: BENTO CARDS */}
                  {placasViewMode === "cards" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredPlacas.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border-2 border-stone-200 hover:border-[#B32025] rounded-3xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                        >
                          {/* Top Accent Header */}
                          <div className="flex flex-col gap-2.5">
                            <div className="flex items-start justify-between gap-2">
                              {/* Mercosul Placa Style */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="border border-stone-400 rounded-lg overflow-hidden shadow-xs">
                                  <div className="bg-[#003399] text-white text-[7px] font-black uppercase px-2 py-0.2 tracking-widest text-center">
                                    BRASIL
                                  </div>
                                  <div className="bg-white text-stone-900 font-mono font-black text-xs px-2 py-0.5 tracking-wider flex items-center gap-1">
                                    <Truck size={12} className="text-[#9b1526]" />
                                    {item.cavalo || "S/ CAVALO"}
                                  </div>
                                </div>

                                {item.carreta1 && (
                                  <span className="bg-stone-100 text-stone-800 border border-stone-300 text-[10px] font-black font-mono uppercase px-2 py-1 rounded-lg">
                                    CR 1: {item.carreta1}
                                  </span>
                                )}
                                {item.carreta2 && (
                                  <span className="bg-stone-100 text-stone-800 border border-stone-300 text-[10px] font-black font-mono uppercase px-2 py-1 rounded-lg">
                                    CR 2: {item.carreta2}
                                  </span>
                                )}
                              </div>

                              {item.rawRowsCount > 1 && (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                                  {item.rawRowsCount} Linhas
                                </span>
                              )}
                            </div>

                            {/* Destination Route Banner */}
                            <div className="bg-gradient-to-r from-red-50 to-stone-50 border border-red-200/80 p-2.5 rounded-xl flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#9b1526] flex items-center gap-1">
                                <MapPin size={12} className="shrink-0" /> Destino:
                              </span>
                              <span className="text-xs font-black text-stone-900 uppercase truncate text-right">
                                {item.destino || "NÃO INFORMADO"}
                              </span>
                            </div>

                            {/* Vehicle Details */}
                            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-col gap-1.5 text-xs text-stone-700">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[10px] font-black uppercase text-stone-400 shrink-0 w-24 flex items-center gap-1">
                                  <User size={11} /> Condutor:
                                </span>
                                <span className="font-bold text-stone-900 text-right truncate">
                                  {item.condutor || "NÃO INFORMADO"}
                                </span>
                              </div>

                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[10px] font-black uppercase text-stone-400 shrink-0 w-24 flex items-center gap-1">
                                  <Building2 size={11} /> Empresa:
                                </span>
                                <span className="font-bold text-stone-900 text-right truncate">
                                  {item.transportador || "NÃO INFORMADO"}
                                </span>
                              </div>

                              {item.origem && (
                                <div className="flex items-start justify-between gap-2 pt-1 border-t border-stone-200">
                                  <span className="text-[10px] font-black uppercase text-stone-400 shrink-0 w-24">
                                    Origem:
                                  </span>
                                  <span className="font-semibold text-stone-600 text-right truncate">
                                    {item.origem}
                                  </span>
                                </div>
                              )}

                              {item.tecnologia && (
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-[10px] font-black uppercase text-stone-400 shrink-0 w-24 flex items-center gap-1">
                                    <Cpu size={11} /> Tecnologia:
                                  </span>
                                  <span className="font-semibold text-stone-700 text-right truncate">
                                    {item.tecnologia}
                                  </span>
                                </div>
                              )}

                              {item.valorNf && (
                                <div className="flex items-start justify-between gap-2 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mt-1">
                                  <span className="text-[10px] font-black uppercase text-emerald-800 shrink-0 w-24 flex items-center gap-1">
                                    <DollarSign size={11} /> VALOR NF:
                                  </span>
                                  <span className="font-mono font-black text-emerald-700 text-right truncate text-xs">
                                    {item.valorNf}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            type="button"
                            onClick={() => handleImportPlacaItem(item)}
                            className="w-full py-3 bg-[#1E293B] hover:bg-[#9b1526] text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98"
                          >
                            <span>Importar para Gerador PGR</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* VIEW 2: CORPORATE TABLE VIEW WITH COLUMN REORDER & RESIZE */
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2 bg-stone-100 p-2.5 rounded-2xl border border-stone-200">
                        <span className="text-xs font-black uppercase tracking-wider text-stone-700">Tabela de Controle de Placas</span>
                        <button
                          type="button"
                          onClick={() => setIsPlacasColumnConfigOpen(true)}
                          className="flex items-center gap-1.5 bg-[#9b1526] hover:bg-red-700 text-white font-extrabold uppercase text-[9px] tracking-wider px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                          title="Organizar colunas e tamanhos"
                        >
                          <Sliders size={12} />
                          <span>⚙️ Organizar Colunas & Tamanhos</span>
                        </button>
                      </div>

                      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-stone-700 table-fixed">
                            <thead className="bg-stone-100 border-b border-stone-200 text-[10px] font-black uppercase tracking-wider text-stone-600">
                              <tr>
                                {placasColumnOrder.map((colKey, idx) => {
                                  const col = PLACAS_COLS[colKey];
                                  const widthVal = placasColumnWidths[colKey] || col.defaultWidth;
                                  return (
                                    <th
                                      key={colKey}
                                      className={cn(
                                        "px-3 py-3 border-r border-stone-200 relative group/pl",
                                        idx === placasColumnOrder.length - 1 && "border-r-0"
                                      )}
                                      style={{ width: `${widthVal}%` }}
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <button
                                          type="button"
                                          onClick={() => moveColumnPlacas(idx, 'left')}
                                          disabled={idx === 0}
                                          className="opacity-0 group-hover/pl:opacity-100 transition-opacity bg-stone-200 hover:bg-stone-300 text-stone-800 rounded p-0.5 text-[8px] cursor-pointer disabled:opacity-0"
                                          title="Mover Esquerda"
                                        >
                                          ◀
                                        </button>
                                        <span className="truncate flex-1 text-center font-black">{col.label}</span>
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover/pl:opacity-100 transition-opacity">
                                          <button
                                            type="button"
                                            onClick={() => resizeColumnPlacas(colKey, -2)}
                                            className="bg-stone-200 hover:bg-red-200 text-stone-800 rounded px-1 text-[9px] font-bold cursor-pointer"
                                            title="Diminuir"
                                          >
                                            -
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => resizeColumnPlacas(colKey, 2)}
                                            className="bg-stone-200 hover:bg-emerald-200 text-stone-800 rounded px-1 text-[9px] font-bold cursor-pointer"
                                            title="Aumentar"
                                          >
                                            +
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => moveColumnPlacas(idx, 'right')}
                                            disabled={idx === placasColumnOrder.length - 1}
                                            className="bg-stone-200 hover:bg-stone-300 text-stone-800 rounded p-0.5 text-[8px] cursor-pointer disabled:opacity-0"
                                            title="Mover Direita"
                                          >
                                            ▶
                                          </button>
                                        </div>
                                      </div>
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200">
                              {filteredPlacas.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-red-50/50 transition-colors">
                                  {placasColumnOrder.map((colKey) => {
                                    switch (colKey) {
                                      case 'index':
                                        return (
                                          <td key={colKey} className="px-3 py-3 font-mono font-bold text-stone-400 truncate">
                                            {idx + 1}
                                          </td>
                                        );
                                      case 'cavalo':
                                        return (
                                          <td key={colKey} className="px-3 py-3 truncate">
                                            <span className="font-mono font-black text-stone-900 bg-stone-100 border border-stone-300 px-2 py-0.5 rounded uppercase">
                                              {item.cavalo || "S/ PLACA"}
                                            </span>
                                          </td>
                                        );
                                      case 'carretas':
                                        return (
                                          <td key={colKey} className="px-3 py-3 font-mono font-bold text-stone-700 truncate">
                                            {item.carreta1 || "---"}
                                            {item.carreta2 && ` / ${item.carreta2}`}
                                          </td>
                                        );
                                      case 'condutor':
                                        return (
                                          <td key={colKey} className="px-3 py-3 font-bold text-stone-900 truncate">
                                            {item.condutor || "NÃO INFORMADO"}
                                          </td>
                                        );
                                      case 'transportadora':
                                        return (
                                          <td key={colKey} className="px-3 py-3 font-medium text-stone-700 truncate">
                                            {item.transportador || "NÃO INFORMADO"}
                                          </td>
                                        );
                                      case 'destino':
                                        return (
                                          <td key={colKey} className="px-3 py-3 font-bold text-[#9b1526] truncate">
                                            {item.destino || "NÃO INFORMADO"}
                                          </td>
                                        );
                                      case 'valorNf':
                                        return (
                                          <td key={colKey} className="px-3 py-3 font-mono font-black text-emerald-700 truncate">
                                            {item.valorNf || "---"}
                                          </td>
                                        );
                                      case 'acao':
                                        return (
                                          <td key={colKey} className="px-3 py-3 text-right truncate">
                                            <button
                                              type="button"
                                              onClick={() => handleImportPlacaItem(item)}
                                              className="px-3 py-1.5 bg-[#9b1526] hover:bg-red-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                                            >
                                              <span>Importar</span>
                                              <ArrowRight size={12} />
                                            </button>
                                          </td>
                                        );
                                      default:
                                        return null;
                                    }
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Placas Column Config Modal */}
                      {isPlacasColumnConfigOpen && (
                        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 flex flex-col gap-6 relative">
                            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                              <div>
                                <h3 className="text-xl font-black uppercase text-stone-900 flex items-center gap-2">
                                  <Sliders className="text-[#9b1526]" size={22} />
                                  Organizar Colunas de Placas
                                </h3>
                                <p className="text-xs text-stone-500 mt-0.5">
                                  Mude a ordem das colunas e ajuste a largura manualmente.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsPlacasColumnConfigOpen(false)}
                                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-all"
                              >
                                ✕
                              </button>
                            </div>

                            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
                              {placasColumnOrder.map((colKey, idx) => {
                                const col = PLACAS_COLS[colKey];
                                const width = placasColumnWidths[colKey] || col.defaultWidth;
                                return (
                                  <div key={colKey} className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                                    <div className="flex items-center gap-2.5">
                                      <span className="w-6 h-6 rounded-lg bg-stone-200 text-stone-700 text-xs font-mono font-bold flex items-center justify-center">
                                        {idx + 1}
                                      </span>
                                      <span className="text-xs font-bold uppercase text-stone-900">{col.label}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg px-2 py-1 shadow-2xs">
                                        <span className="text-[10px] font-mono text-stone-500 font-bold">Largura: {width}%</span>
                                        <button
                                          type="button"
                                          onClick={() => resizeColumnPlacas(colKey, -2)}
                                          className="w-5 h-5 bg-stone-100 hover:bg-red-100 text-stone-800 hover:text-red-700 rounded text-xs font-black cursor-pointer flex items-center justify-center"
                                        >
                                          -
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => resizeColumnPlacas(colKey, 2)}
                                          className="w-5 h-5 bg-stone-100 hover:bg-emerald-100 text-stone-800 hover:text-emerald-700 rounded text-xs font-black cursor-pointer flex items-center justify-center"
                                        >
                                          +
                                        </button>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => moveColumnPlacas(idx, 'left')}
                                          disabled={idx === 0}
                                          className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 disabled:opacity-30 text-stone-800 rounded-lg text-xs font-bold cursor-pointer"
                                        >
                                          ◀ Mover
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => moveColumnPlacas(idx, 'right')}
                                          disabled={idx === placasColumnOrder.length - 1}
                                          className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 disabled:opacity-30 text-stone-800 rounded-lg text-xs font-bold cursor-pointer"
                                        >
                                          Mover ▶
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Empty State */
                <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 text-[#9b1526] flex items-center justify-center shadow-md">
                    <Truck size={32} />
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-base font-black uppercase text-stone-900 tracking-wider">
                      Nenhuma viagem carregada no momento
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Copie as linhas da sua planilha Google Sheets ou Excel com as colunas de frotas e cole no campo acima, ou clique abaixo para testar com uma carga real.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPlacasPastedData(SAMPLE_PLACAS_SHEET_DATA)}
                    className="px-4 py-2.5 bg-[#9b1526] hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <Sparkles size={14} />
                    <span>Carregar Carga de Exemplo de Santa Luzia</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: Unidades (CUIABÁ / MT) */}
        {activeTab === "unidades" && (
          <div className="flex flex-col gap-6 max-w-full mx-auto w-full animate-fade-in">
            {/* Main Station Cockpit */}
            <div className="bg-[#FFFCF6] rounded-3xl border border-[#E6D2A3] shadow-sm p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden text-[#292820]">
              {/* Station Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#EDE2CE]">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E6D2A3] via-[#C49A45] to-[#B08632] text-[#292820] p-3.5 shadow-md flex items-center justify-center shrink-0 border border-[#E6D2A3]">
                    <Compass size={28} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EDE2CE] text-[#292820] border border-[#E6D2A3]">
                        Terminal de Embarques
                      </span>
                      <span className="text-xs font-mono font-bold text-[#77736B]">
                        CUIABÁ / MT
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-sans font-black text-[#292820] uppercase tracking-tight mt-1 flex items-center gap-2">
                      Processador de Embarques & Iscas
                    </h2>
                    <p className="text-xs text-[#77736B] font-medium mt-0.5 max-w-2xl">
                      Recepção de mensagens operacionais da Unidade Cuiabá com extração automatizada das 5 colunas de iscas e despacho direto ao Pré-Alerta PGR.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUnidadesPastedText(SAMPLE_UNIDADES_TEXT)}
                    className="px-4 py-2 bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border border-[#C49A45]/40 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Carrega a mensagem exemplo recebida da unidade Cuiabá"
                  >
                    <Sparkles size={14} className="text-[#C49A45]" />
                    <span>Carregar Ficha Real Cuiabá</span>
                  </button>
                  {unidadesPastedText && (
                    <button
                      type="button"
                      onClick={() => setUnidadesPastedText("")}
                      className="px-3.5 py-2 bg-[#FFFCF6] hover:bg-[#EDE2CE] text-[#D92332] border border-[#EDE2CE] rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Trash2 size={14} />
                      <span>Limpar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Dual-Pane Split Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT PANE: Input Console (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="bg-stone-50 border-2 border-stone-200 rounded-3xl p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                        <FileText size={16} className="text-red-600" />
                        Mensagem da Unidade Cuiabá:
                      </label>
                      <button
                        type="button"
                        onClick={handlePasteClipboardUnidades}
                        className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <ClipboardPaste size={12} className="text-red-600" />
                        <span>Colar WhatsApp</span>
                      </button>
                    </div>

                    <textarea
                      value={unidadesPastedText}
                      onChange={(e) => setUnidadesPastedText(e.target.value)}
                      placeholder={`Cole a mensagem enviada pelo time de Cuiabá...\n\nExemplo estruturado das 5 colunas:\nRBV2C89 - R100001239 - LADO DIREITO SUPERIOR BATIDO - 12211016 - 305124\n\nOu dados completos:\nData do embarque: 02/09/2026\nPlaca do cavalo: RFX9E81\nPlaca do Baú: RBV2C89 - R100001239 - 12211016 - LADO DIREITO SUPERIOR\nNF : 305124\nDestino: CAMPO GRANDE - MS\nMotorista: Diego Pereira\nTransportadora: Ledfran`}
                      className="w-full h-72 bg-white border-2 border-stone-300 focus:border-red-600 rounded-2xl p-4 text-xs font-mono text-stone-900 outline-none transition-all placeholder:text-stone-400 shadow-inner resize-y leading-relaxed"
                    />

                    {/* Live Parser Diagnostic Checklist */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-3.5 flex flex-col gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center justify-between">
                        <span>Diagnóstico do Parser em Tempo Real:</span>
                        <span className="text-red-600 font-bold">Auto-Sync</span>
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className={parsedUnidades.cavalo ? "text-emerald-600 font-bold" : "text-stone-400"}>
                            {parsedUnidades.cavalo ? "✓" : "○"}
                          </span>
                          <span className="text-stone-600 truncate">
                            Cavalo: <strong className="text-stone-900 font-mono">{parsedUnidades.cavalo || "Pendente"}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={parsedUnidades.motorista ? "text-emerald-600 font-bold" : "text-stone-400"}>
                            {parsedUnidades.motorista ? "✓" : "○"}
                          </span>
                          <span className="text-stone-600 truncate">
                            Condutor: <strong className="text-stone-900">{parsedUnidades.motorista || "Pendente"}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={parsedUnidades.destino ? "text-emerald-600 font-bold" : "text-stone-400"}>
                            {parsedUnidades.destino ? "✓" : "○"}
                          </span>
                          <span className="text-stone-600 truncate">
                            Destino: <strong className="text-stone-900">{parsedUnidades.destino || "Pendente"}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={parsedUnidades.carretas.length > 0 ? "text-emerald-600 font-bold" : "text-stone-400"}>
                            {parsedUnidades.carretas.length > 0 ? "✓" : "○"}
                          </span>
                          <span className="text-stone-600 truncate">
                            Carretas: <strong className="text-red-700 font-mono">{parsedUnidades.carretas.length} Baú(s)</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT PANE: Dispatch Cockpit & Live Preview (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  {parsedUnidades.cavalo || parsedUnidades.carretas.length > 0 || parsedUnidades.destino || parsedUnidades.motorista ? (
                    <div className="bg-red-50/40 border-2 border-red-200 rounded-3xl p-5 sm:p-6 flex flex-col gap-5 animate-fade-in">
                      {/* Cockpit Header */}
                      <div className="flex items-center justify-between border-b border-red-200 pb-3.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-red-950">
                            Dados Reconhecidos & Prontos para o PGR
                          </h3>
                        </div>
                        <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs">
                          Origem: CUIABÁ / MT
                        </span>
                      </div>

                      {/* General Vehicle & Driver HUD */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white border border-red-200 p-3 rounded-2xl flex flex-col gap-0.5 shadow-xs">
                          <span className="text-[10px] font-extrabold text-stone-400 uppercase">
                            Placa Cavalo
                          </span>
                          <span className="font-mono font-black text-sm text-stone-900">
                            {parsedUnidades.cavalo || "S/ Placa"}
                          </span>
                        </div>

                        <div className="bg-white border border-red-200 p-3 rounded-2xl flex flex-col gap-0.5 shadow-xs">
                          <span className="text-[10px] font-extrabold text-stone-400 uppercase">
                            Motorista
                          </span>
                          <span className="font-bold text-xs text-stone-900 truncate">
                            {parsedUnidades.motorista || "Não especificado"}
                          </span>
                        </div>

                        <div className="bg-white border border-red-200 p-3 rounded-2xl flex flex-col gap-0.5 shadow-xs">
                          <span className="text-[10px] font-extrabold text-stone-400 uppercase">
                            Transportadora
                          </span>
                          <span className="font-bold text-xs text-stone-900 truncate">
                            {parsedUnidades.transportadora || "Não especificada"}
                          </span>
                        </div>

                        <div className="bg-white border border-red-200 p-3 rounded-2xl flex flex-col gap-0.5 shadow-xs">
                          <span className="text-[10px] font-extrabold text-stone-400 uppercase">
                            Destino Final
                          </span>
                          <span className="font-bold text-xs text-[#9b1526] truncate">
                            {parsedUnidades.destino || "Não especificado"}
                          </span>
                        </div>
                      </div>

                      {/* 5-Columns Trailer Cards */}
                      {parsedUnidades.carretas.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                              <Truck size={14} className="text-red-600" />
                              Carretas & Mapeamento de Iscas ({parsedUnidades.carretas.length}):
                            </span>
                            <span className="text-[10px] font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                              5 Colunas Validadas
                            </span>
                          </div>

                          <div className="flex flex-col gap-3">
                            {parsedUnidades.carretas.map((cr, idx) => (
                              <div
                                key={idx}
                                className="bg-white border-2 border-red-200/90 rounded-2xl p-4 flex flex-col gap-3 shadow-xs hover:border-red-500 transition-colors"
                              >
                                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-[#1f1915] text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg uppercase flex items-center gap-1.5 shadow-xs">
                                      <Truck size={13} className="text-red-400" />
                                      Carreta {idx + 1}: {cr.carreta || "S/ Placa"}
                                    </span>
                                    {cr.esquema && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-50 text-amber-900 border border-amber-300">
                                        {cr.esquema}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-black text-stone-700 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg">
                                      NF: <span className="font-mono text-red-700">{cr.nf || "---"}</span>
                                    </span>
                                  </div>
                                </div>

                                {/* 4 Quadrants Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                  {/* Col 1: Placa */}
                                  <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl">
                                    <span className="text-[9px] font-extrabold uppercase text-stone-400 block">
                                      1. Placa
                                    </span>
                                    <span className="font-mono font-black text-stone-900 text-xs mt-0.5 block">
                                      {cr.carreta || "---"}
                                    </span>
                                  </div>

                                  {/* Col 2: Isca */}
                                  <div className="bg-red-50/70 border border-red-200 p-2.5 rounded-xl relative group">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[9px] font-extrabold uppercase text-red-700 block">
                                        2. Isca PGR
                                      </span>
                                      {cr.isca && (
                                        <button
                                          type="button"
                                          onClick={() => handleCopySingleIsca(`cr-${idx}`, cr.isca)}
                                          className="text-[9px] text-red-700 hover:text-red-900 cursor-pointer font-bold"
                                          title="Copiar isca"
                                        >
                                          {copiedIscaKey === `cr-${idx}` ? "✓" : <Copy size={11} />}
                                        </button>
                                      )}
                                    </div>
                                    <span className="font-mono font-black text-red-700 text-xs mt-0.5 block truncate">
                                      {cr.isca || "---"}
                                    </span>
                                  </div>

                                  {/* Col 3: Produto */}
                                  <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl">
                                    <span className="text-[9px] font-extrabold uppercase text-stone-400 block">
                                      3. Produto
                                    </span>
                                    <span className="font-bold text-stone-900 text-xs mt-0.5 block truncate" title={cr.produto}>
                                      {cr.produto || "---"}
                                    </span>
                                  </div>

                                  {/* Col 4: UMA */}
                                  <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-xl">
                                    <span className="text-[9px] font-extrabold uppercase text-stone-400 block">
                                      4. U.M.A
                                    </span>
                                    <span className="font-mono font-black text-red-900 text-xs mt-0.5 block truncate">
                                      {cr.uma || "---"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Primary Dispatch Action */}
                      <button
                        type="button"
                        onClick={() => handleImportUnidadeData(parsedUnidades)}
                        className="w-full py-4 bg-gradient-to-r from-red-700 to-indigo-800 hover:from-red-800 hover:to-indigo-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-red-900/20 cursor-pointer active:scale-98 mt-2"
                      >
                        <Send size={16} />
                        <span>ENVIAR DADOS PARA O GERADOR PGR & GERAR PRÉ-ALERTA COMPLETO</span>
                      </button>
                    </div>
                  ) : (
                    /* Empty state for Cuiabá */
                    <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-4 h-full min-h-[360px]">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-red-200 text-red-600 flex items-center justify-center shadow-md">
                        <Compass size={32} />
                      </div>
                      <div className="max-w-md">
                        <h3 className="text-base font-black uppercase text-stone-900 tracking-wider">
                          Aguardando mensagem da Unidade Cuiabá
                        </h3>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                          Cole as informações do embarque recebidas da unidade na caixa à esquerda ou clique abaixo para carregar um exemplo real já formatado com as 5 colunas.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUnidadesPastedText(SAMPLE_UNIDADES_TEXT)}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
                      >
                        <Sparkles size={14} />
                        <span>Testar com Ficha Real de Cuiabá</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: Gerador PGR Workspace */}
        {activeTab === "gerador" && (
          <div className="flex flex-col gap-4 max-w-full mx-auto w-full animate-fade-in">
            <div className={cn(
              "grid gap-4 items-start w-full",
              preAlertaMode === "minimized"
                ? "grid-cols-1 xl:grid-cols-2"
                : preAlertaMode === "maximized"
                  ? "grid-cols-1 xl:grid-cols-2"
                  : "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px_280px] xl:grid-cols-[minmax(0,1fr)_290px_290px] 2xl:grid-cols-[minmax(0,1fr)_305px_305px]"
            )}>
        {/* LEFT AREA: Template Generator */}
        <div className={cn(
          "flex flex-col min-w-0",
          preAlertaMode === "minimized" || preAlertaMode === "maximized"
            ? "col-span-1 xl:col-span-2"
            : "col-span-1 xl:col-span-1"
        )}>
          <div className="flex-1 rounded-3xl bg-[#FFFCF6] border border-[#EDE2CE] shadow-sm relative overflow-hidden flex flex-col p-4 sm:p-6 text-[#292820]">

          {/* Module Title */}
          <div className={cn(
            "flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EDE2CE] pb-5 gap-4",
            preAlertaMode === "minimized" ? "mb-0" : "mb-6"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-3 rounded-2xl shadow-xs border transition-colors",
                isVianaOrigem
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : isCuiabaOrigem
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "bg-[#F5F0E6] border-[#E6D2A3] text-[#C49A45]"
              )}>
                <Sliders size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#292820] uppercase tracking-tight font-sans">
                    PRÉ-ALERTA GR
                  </h2>
                  {preAlertaMode === "minimized" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                      Minimizado
                    </span>
                  )}
                  {preAlertaMode === "maximized" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                      100% Largura
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#77736B] font-mono uppercase tracking-widest mt-0.5">
                  Gerador corporativo de pré-alerta e iscas
                </p>
              </div>
            </div>

            {/* A Opção de Minimizar e Maximizar (Tudo numa única opção) */}
            <div className="flex items-center gap-3">
              {preAlertaMode === "minimized" && (
                <div className="hidden lg:flex items-center gap-2 bg-[#F5F0E6] border border-[#EDE2CE] px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold text-[#292820] shadow-xs">
                  <span className="text-[9px] uppercase text-[#77736B] font-sans font-bold">Assunto:</span>
                  <span className="text-[11px] text-[#292820] font-black max-w-[280px] truncate">
                    PRÉ-ALERTA DE ISCA - {destino || "BRASÍLIA"} - {cavalo.replace(/-/g, "") || "TYQ6F51"}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySubject}
                    title="Copiar Assunto do E-mail"
                    className="p-1 hover:bg-[#D92332] hover:text-white rounded-lg text-[#D92332] transition-colors cursor-pointer"
                  >
                    {copiedAssunto ? <Check size={13} className="text-emerald-600 stroke-[3]" /> : <Copy size={13} />}
                  </button>
                </div>
              )}

              {/* Segmented Option Group */}
              <div className="flex items-center bg-[#F5F0E6] p-1 rounded-2xl border border-[#EDE2CE] shadow-xs">
                <button
                  type="button"
                  onClick={() => setPreAlertaMode(preAlertaMode === "minimized" ? "normal" : "minimized")}
                  title={preAlertaMode === "minimized" ? "Restaurar coluna" : "Minimizar coluna PRE ALERTA GR"}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer select-none active:scale-95",
                    preAlertaMode === "minimized"
                      ? "bg-[#292820] text-[#E6D2A3] border border-[#C49A45]/40 shadow-xs"
                      : "text-[#77736B] hover:text-[#292820] hover:bg-[#EDE2CE]"
                  )}
                >
                  <Minimize2 size={14} className="stroke-[2.5]" />
                  <span>{preAlertaMode === "minimized" ? "Minimizado" : "Minimizar"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreAlertaMode(preAlertaMode === "maximized" ? "normal" : "maximized")}
                  title={preAlertaMode === "maximized" ? "Restaurar tamanho normal" : "Maximizar coluna (100% largura)"}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer select-none active:scale-95",
                    preAlertaMode === "maximized"
                      ? "bg-[#292820] text-[#E6D2A3] border border-[#C49A45]/40 shadow-xs"
                      : "text-[#77736B] hover:text-[#292820] hover:bg-[#EDE2CE]"
                  )}
                >
                  <Maximize2 size={14} className="stroke-[2.5]" />
                  <span>{preAlertaMode === "maximized" ? "Restaurar" : "Maximizar"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Informational Callout when Minimized */}
          {preAlertaMode === "minimized" && (
            <div className="mt-4 pt-4 border-t border-[#EDE2CE] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-[#F5F0E6] p-4 rounded-2xl border border-[#EDE2CE]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C49A45]/15 text-[#C49A45] border border-[#C49A45]/30 flex items-center justify-center shrink-0">
                  <Info size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[#292820] uppercase">
                      Coluna PRE ALERTA GR Minimizada
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Zoom Ativo: {Math.round(colunasZoom * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#77736B] mt-0.5 font-sans">
                    O <strong>Gerador corporativo de pré-alerta e iscas</strong> está recolhido e o <strong>Zoom das colunas</strong> foi aumentado.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
                {/* Zoom presets */}
                <div className="flex items-center gap-1 bg-[#FFFCF6] border border-[#EDE2CE] px-2 py-1 rounded-xl text-[10px] font-bold shadow-xs">
                  <span className="text-[#77736B] uppercase text-[9px] mr-0.5">Zoom:</span>
                  {[1.05, 1.10, 1.15, 1.20, 1.25].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setColunasZoom(level)}
                      className={cn(
                        "px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-95",
                        colunasZoom === level
                          ? "bg-[#292820] text-[#E6D2A3] shadow-2xs"
                          : "text-[#77736B] hover:text-[#292820] hover:bg-[#EDE2CE]"
                      )}
                    >
                      {Math.round(level * 100)}%
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCopySubject}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all border",
                    copiedAssunto
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border-[#C49A45]/40"
                  )}
                >
                  {copiedAssunto ? <Check size={13} className="text-white stroke-[3]" /> : <Copy size={13} className="text-[#C49A45] stroke-[2.5]" />}
                  <span>Copiar Assunto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreAlertaMode("normal")}
                  className="px-3.5 py-1.5 bg-[#FFFCF6] hover:bg-[#EDE2CE] text-[#292820] rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 border border-[#EDE2CE]"
                >
                  <Maximize2 size={13} className="text-[#C49A45]" />
                  <span>Maximizar Coluna</span>
                </button>
              </div>
            </div>
          )}

          {/* Generator Workspace Form */}
          {preAlertaMode !== "minimized" && (
            <div className="flex flex-col gap-6">
            {/* GREETING SELECTION (Menu Suspenso para Saudação) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#FFFCF6] border border-[#EDE2CE] rounded-2xl p-4 shadow-xs">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D92332] shrink-0">
                Saudação:
              </label>
              <div className="relative flex-1 max-w-[200px]">
                <select
                  value={saudacao}
                  onChange={(e) => setSaudacao(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#EDE2CE] focus:border-[#C49A45] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#292820] outline-none transition-all cursor-pointer shadow-xs"
                >
                  <option value="Boa tarde,">Boa tarde,</option>
                  <option value="Bom dia,">Bom dia,</option>
                  <option value="Boa noite,">Boa noite,</option>
                </select>
              </div>
              <p className="text-[10px] font-mono text-[#77736B] uppercase tracking-wider">
                Define a saudação inicial do pré-alerta
              </p>
            </div>

            {/* EMAIL SUBJECT HEADER BLOCK - WARM IVORY/GOLD */}
            <div className="bg-[#FFFCF6] border border-[#EDE2CE] rounded-2xl p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs mb-3">
              <div className="flex-1 text-left">
                <span className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider text-[#D92332] block mb-1">
                  ASSUNTO DO E-MAIL (COPIAR SEPARADAMENTE)
                </span>
                <h1 className="text-base sm:text-[18px] md:text-[20px] font-sans font-black text-[#292820] uppercase tracking-tight m-0 select-all leading-tight">
                  PRÉ-ALERTA DE ISCA - {destino || "BRASÍLIA"} - {cavalo.replace(/-/g, "") || "TYQ6F51"}
                </h1>
              </div>
              <button
                type="button"
                onClick={handleCopySubject}
                className={cn(
                  "flex items-center gap-2 font-black uppercase text-[11px] tracking-wider px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer select-none active:scale-95 shrink-0 border",
                  copiedAssunto
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/10"
                    : "bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border-[#C49A45]/40"
                )}
              >
                {copiedAssunto ? (
                  <>
                    <Check size={14} className="stroke-[3] text-white" /> COPIADO!
                  </>
                ) : (
                  <>
                    <Copy size={14} className="stroke-[2.5] text-[#C49A45]" /> COPIAR ASSUNTO
                  </>
                )}
              </button>
            </div>

            {/* PREVIEW CONTAINER - CORPORATE WARM IVORY/GOLD DOCUMENT */}
            <div className="w-full bg-[#FAF7F0] border border-[#C5A059] rounded-3xl p-5 sm:p-7 shadow-[0_10px_35px_rgba(20,22,25,0.06)] overflow-x-auto relative text-[#1A1D20] box-border">
              <div className="flex items-center justify-between pb-3 mb-5 border-b border-[#E5D5B5]">
                <span className="text-[10.5px] font-black uppercase tracking-widest text-[#B8860B] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
                  Visualização do Pré-Alerta (Template do E-mail)
                </span>
                <span className="text-[10px] font-bold text-[#8C6D2B] uppercase tracking-wider">
                  Padrão Corporativo 3 Corações
                </span>
              </div>

              <div className="w-full min-w-full font-sans text-xs text-[#1A1D20] box-border">
                {/* BANNER PANORÂMICO INTEGRADO — FOTO OCUPA A FAIXA COMPLETA */}
                <div
                  style={{ borderColor: "#C5A059" }}
                  className="relative isolate w-full min-h-[118px] sm:min-h-[132px] rounded-2xl overflow-hidden mb-5 border shadow-[0_12px_28px_rgba(20,18,14,0.24)] bg-[#121417] flex items-center justify-between gap-3 px-4 py-4 sm:px-5"
                >
                  <img
                    src="/images/panoramic_truck_sunset.jpg"
                    alt="Caminhão integrado à rodovia panorâmica ao pôr do sol"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-center -z-20"
                  />
                  <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(12,13,14,0.98)_0%,rgba(18,20,23,0.95)_31%,rgba(18,20,23,0.42)_60%,rgba(12,13,14,0.82)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-[#8C6D2B] via-[#F5D27B] to-[#8C6D2B]" />

                  <div className="relative z-10 flex min-w-0 items-center gap-3 sm:gap-4 max-w-[76%]">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#E92D3C] to-[#8C0E1B] border-2 border-[#D4AF37] flex items-center justify-center shrink-0 shadow-[0_0_0_3px_rgba(212,175,55,0.14)]">
                      <span className="font-black text-xs sm:text-sm text-white tracking-tight">3♥C</span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white m-0 leading-tight">
                        SANTA LUZIA <span className="text-[#E3BB57]">GR</span>
                      </h2>
                      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[1.5px] text-[#E3BB57] mt-1 mb-0">
                        CENTRAL DE CONTROLE
                      </p>
                      <p className="text-[7px] sm:text-[9px] font-semibold uppercase tracking-wide text-[#FFF7DF] mt-1 mb-0 leading-snug">
                        MONITORAMENTO INTELIGENTE · MAIS SEGURANÇA · SUA CARGA SEMPRE EM FOCO
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 ml-auto self-center text-right max-w-[25%] sm:max-w-[21%] shrink-0">
                    <span className="text-[#F4D16E] font-bold italic text-[10px] sm:text-[16px] leading-snug font-serif drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      Juntos fazemos mais!
                    </span>
                  </div>
                </div>

                {/* 1. Greeting Output */}
                <div className="mb-4 font-sans font-black text-sm text-[#1A1D20] ml-0 pl-0">
                  {saudacao}
                </div>

                {/* 2. FAIXA INTEGRADA: ALERTA VERMELHO + ORIENTAÇÕES EM UMA ÚNICA PEÇA */}
                <div className="mb-5 w-full overflow-hidden rounded-2xl border border-[#C5A059] shadow-[0_7px_20px_rgba(45,32,20,0.10)] grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] bg-[#FFF9ED]">
                  <div className={cn(
                    "min-h-[96px] px-4 py-4 sm:px-5 flex items-center border-b md:border-b-0 md:border-r-2 border-[#D4AF37]",
                    isGreenOrigem
                      ? "bg-gradient-to-br from-emerald-700 to-emerald-900 text-white"
                      : isPurpleOrigem
                        ? "bg-gradient-to-br from-purple-700 to-purple-950 text-white"
                        : isCuiabaOrigem
                          ? "bg-gradient-to-br from-amber-400 to-amber-600 text-[#211C19]"
                          : "bg-gradient-to-br from-[#C91F2D] via-[#A81824] to-[#74101A] text-white"
                  )}>
                    <div className="flex items-center gap-3 w-full">
                      <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-white/35 bg-black/10 flex items-center justify-center text-2xl font-black shadow-inner">
                        ⚠
                      </div>
                      <div className="min-w-0 flex-1">
                        {alertaResgate.includes("\n") ? (
                          <textarea
                            rows={2}
                            value={alertaResgate}
                            onChange={(e) => setAlertaResgate(e.target.value)}
                            className="w-full resize-none bg-transparent border-none outline-none font-black text-[13px] sm:text-[15px] leading-snug uppercase tracking-wide text-inherit placeholder:text-white/70"
                            placeholder="FAVOR SE ATENTAR AO RESGATE!"
                          />
                        ) : (
                          <input
                            type="text"
                            value={alertaResgate}
                            onChange={(e) => setAlertaResgate(e.target.value)}
                            className="w-full min-w-0 bg-transparent border-none outline-none font-black text-[13px] sm:text-[15px] leading-snug uppercase tracking-wide text-inherit placeholder:text-white/70"
                            placeholder="FAVOR SE ATENTAR AO RESGATE!"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 sm:px-5 sm:py-4 bg-gradient-to-br from-[#FFFDF7] to-[#F5EAD1] flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={17} className="text-[#B8860B] shrink-0" />
                      <input
                        type="text"
                        value={infoAbaixo}
                        onChange={(e) => setInfoAbaixo(e.target.value)}
                        className="w-full min-w-0 bg-transparent border-none outline-none font-black text-[11px] sm:text-[12px] uppercase tracking-wide text-[#211C19]"
                        placeholder="ATENTAR ÀS INFORMAÇÕES ABAIXO:"
                      />
                    </div>
                    <div className="flex items-start gap-2 text-[11px] sm:text-[12px] leading-relaxed py-0.5">
                      <span className="text-[#C91F2D] font-black shrink-0">•</span>
                      <input
                        type="text"
                        value={rota1}
                        onChange={(e) => setRota1(e.target.value)}
                        className="w-full min-w-0 bg-transparent border-none outline-none font-semibold text-[#55483A] rounded px-1 hover:bg-white/70 focus:bg-white"
                        placeholder="SANTA LUZIA/MG x GUARULHOS/SP;"
                      />
                    </div>
                    <div className="flex items-start gap-2 text-[11px] sm:text-[12px] leading-relaxed py-0.5">
                      <span className="text-[#C91F2D] font-black shrink-0">•</span>
                      <input
                        type="text"
                        value={instrucao1}
                        onChange={(e) => setInstrucao1(e.target.value)}
                        className="w-full min-w-0 bg-transparent border-none outline-none font-semibold text-[#211C19] rounded px-1 hover:bg-white/70 focus:bg-white"
                        placeholder="Favor, acusar o recebimento do pré-alerta;"
                      />
                    </div>
                    {!pastePlanilha.trim() && (
                      <div className="flex items-start gap-2 mt-1.5 px-2 py-1 rounded-md bg-[#FFF0EF] border border-[#F6C6C3] text-[#C91F2D] font-black text-[10px] sm:text-[11px] leading-snug">
                        <span className="shrink-0">•</span>
                        <span>O SITE DAS ISCAS ESTÁ TEMPORARIAMENTE FORA DO AR.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. BIG INTERACTIVE SPREADSHEET TABLE 1 */}
                <div className="flex items-center justify-between gap-2 mb-3 bg-[#F5EDDA] p-2.5 rounded-2xl border border-[#C5A059] shadow-xs flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsColumnConfigOpen(true)}
                    className="flex items-center gap-2 bg-[#FAF7F0] hover:bg-white text-[#1A1D20] font-black uppercase text-[9.5px] tracking-wider px-3.5 py-1.5 rounded-xl shadow-xs border border-[#C5A059] transition-all cursor-pointer select-none active:scale-95"
                    title="Mover colunas e ajustar tamanhos manualmente"
                  >
                    <Sliders size={13} className="text-[#B8860B]" />
                    <span>⚙️ Organizar Colunas & Tamanhos</span>
                  </button>
                  <div className="flex items-center gap-2">
                    {numCarretas === 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setNumCarretas(2);
                          if (isca2 === "SEM ISCA") {
                            setIsca2("");
                            setProduto2("");
                            setUma2("");
                          }
                        }}
                        className="flex items-center gap-1.5 font-black uppercase text-[9.5px] tracking-wider px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer select-none active:scale-95 bg-[#FAF7F0] hover:bg-white text-[#1A1D20] border border-[#C5A059]"
                      >
                        <Plus size={12} className="stroke-[3] text-emerald-700" /> Adicionar Segunda Carreta
                      </button>
                    ) : (
                      <>
                        {isca2 === "SEM ISCA" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsca2("");
                              setProduto2("");
                              setUma2("");
                            }}
                            className="flex items-center gap-1.5 font-black uppercase text-[9.5px] tracking-wider px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer select-none active:scale-95 bg-[#FAF7F0] hover:bg-white text-[#1A1D20] border border-[#C5A059]"
                          >
                            <Plus size={12} className="stroke-[3] text-emerald-700" /> Adicionar Isca
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsca2("SEM ISCA");
                              setProduto2("---");
                              setUma2("---");
                              setNfFim("");
                              if (!carreta2 && carreta1) {
                                setCarreta2(carreta1);
                              }
                              setSidebarEmbarque2("none");
                            }}
                            className="flex items-center gap-1.5 font-black uppercase text-[9.5px] tracking-wider px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer select-none active:scale-95 bg-[#FAF7F0] hover:bg-white text-[#C91F2D] border border-[#C5A059]"
                          >
                            <Minus size={12} className="stroke-[3] text-[#C91F2D]" /> Sem Isca
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setNumCarretas(1);
                            setNfFim("");
                            setSidebarEmbarque2("none");
                          }}
                          className="flex items-center gap-1.5 font-black uppercase text-[9.5px] tracking-wider px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer select-none active:scale-95 bg-[#FAF7F0] hover:bg-white text-[#77736B] border border-[#C5A059]"
                        >
                          <Minus size={12} className="stroke-[3]" /> Remover Segunda Carreta
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* PAINEL CORPORATIVO GRAFITE & DOURADO PRINCIPAL */}
                <div className="w-full rounded-2xl overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.4)] mb-3 bg-[#121417] border border-[#C5A059]">
                  {/* BLOCO SUPERIOR GRAFITE & DOURADO: NF, TRANSPORTADORA, VALOR DA CARGA */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-b border-[#C5A059]" style={{ background: 'linear-gradient(135deg, #181A1D 0%, #202429 50%, #181A1D 100%)' }}>
                    {/* MODULE 1: NÚMERO DA NF */}
                    <div className="md:col-span-5 p-2.5 sm:p-3 border-b md:border-b-0 md:border-r border-[#3F3B32] flex items-center justify-between gap-3 relative">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#F59E0B] via-[#C5A059] to-[#8C6D2B] p-[1.5px] shadow-sm flex items-center justify-center shrink-0">
                          <div className="w-full h-full rounded-full bg-[#181A1D] flex items-center justify-center">
                            <FileText size={16} className="text-[#D4AF37]" />
                          </div>
                        </div>
                        <span className="font-extrabold text-[#C5A059] text-[11px] uppercase tracking-wider select-none font-sans">
                          NÚMERO DA NF:
                        </span>
                      </div>
                      <div className="bg-[#121417] rounded-xl px-3 py-1.5 border border-[#C5A059] shadow-inner flex flex-col items-center justify-center min-w-[130px] sm:min-w-[150px]">
                        <input
                          type="text"
                          value={nfInicio}
                          onChange={(e) => setNfInicio(e.target.value.replace(/-/g, ""))}
                          className="w-full text-center font-black bg-transparent border-none outline-none text-xs text-[#FAF7F0] tracking-wide"
                          placeholder="3004567"
                          title="NF Início"
                        />
                        {numCarretas === 2 && isca2 !== "SEM ISCA" && (
                          <input
                            type="text"
                            value={nfFim}
                            onChange={(e) => setNfFim(e.target.value.replace(/-/g, ""))}
                            className="w-full text-center font-black bg-transparent border-none outline-none text-xs text-[#FAF7F0] tracking-wide mt-0.5 border-t border-[#C5A059]"
                            placeholder="3004566"
                            title="NF Fim"
                          />
                        )}
                      </div>
                    </div>

                    {/* MODULE 2: TRANSPORTADORA */}
                    <div className="md:col-span-4 p-2.5 sm:p-3 border-b md:border-b-0 md:border-r border-[#3F3B32] flex items-center justify-between gap-3 relative">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#F59E0B] via-[#C5A059] to-[#8C6D2B] p-[1.5px] shadow-sm flex items-center justify-center shrink-0">
                          <div className="w-full h-full rounded-full bg-[#181A1D] flex items-center justify-center">
                            <Truck size={16} className="text-[#D4AF37]" />
                          </div>
                        </div>
                        <span className="font-extrabold text-[#C5A059] text-[11px] uppercase tracking-wider select-none font-sans">
                          TRANSPORTADORA:
                        </span>
                      </div>
                      <div className="bg-[#121417] rounded-xl px-2.5 py-1.5 border border-[#C5A059] shadow-inner flex items-center justify-between flex-1 max-w-[170px] relative">
                        <select
                          value={transportadora}
                          onChange={(e) => handleTableTranspChange(e.target.value)}
                          className="w-full text-center font-black uppercase bg-transparent border-none outline-none text-xs cursor-pointer text-[#FAF7F0] tracking-wide pr-4 appearance-none"
                        >
                          <option value="">GTMINAS</option>
                          {allTransportadoras.map((t) => (
                            <option key={t} value={t} className="text-[#1A1D20] uppercase text-xs font-bold">
                              {t}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="text-[#C5A059] absolute right-2 pointer-events-none" />
                      </div>
                    </div>

                    {/* MODULE 3: VALOR DA CARGA */}
                    <div className="md:col-span-3 p-2.5 sm:p-3 flex items-center justify-between gap-3 relative bg-[linear-gradient(135deg,#1F2328_0%,#181A1D_100%)]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#F59E0B] via-[#C5A059] to-[#8C6D2B] p-[1.5px] shadow-sm flex items-center justify-center shrink-0">
                          <div className="w-full h-full rounded-full bg-[#181A1D] flex items-center justify-center">
                            <Coins size={16} className="text-[#D4AF37]" />
                          </div>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-extrabold text-[#C5A059] text-[10px] uppercase tracking-wider leading-none">
                            VALOR DA CARGA
                          </span>
                        </div>
                      </div>
                      <div className="bg-[#121417] rounded-xl px-3 py-1.5 border border-[#C5A059] shadow-inner flex items-center justify-center">
                        <input
                          type="text"
                          value={valorCarga}
                          onChange={(e) => setValorCarga(e.target.value)}
                          className="w-24 sm:w-28 text-right font-black uppercase text-[#FAF7F0] bg-transparent border-none outline-none text-[13.5px] tracking-tight hover:bg-black/40 focus:bg-black rounded px-1 transition-all"
                          placeholder="355565"
                          title="Valor da Carga"
                        />
                      </div>
                    </div>
                  </div>

                  {/* TABELA 1 CORPO PRINCIPAL */}
                  <table className="w-full border-collapse text-xs font-sans text-[#1A1D20] table-fixed">
                    <thead>
                      {/* Row: Corporate Graphite Column Headings */}
                      <tr className="border-b text-[#FAF7F0] text-center font-extrabold uppercase text-[10.5px] tracking-wide h-[42px] shadow-xs" style={{ background: 'linear-gradient(180deg, #22262B 0%, #181A1D 100%)', borderColor: '#C5A059' }}>
                        {table1ColumnOrder.map((colKey, idx) => {
                          const col = TABLE1_COLS[colKey];
                          const widthVal = table1ColumnWidths[colKey] || col.defaultWidth;
                          return (
                            <th
                              key={colKey}
                              className={cn(
                                "border-r border-[#C5A059]/60 p-1 align-middle text-center uppercase relative group/col select-none",
                                idx === table1ColumnOrder.length - 1 && "border-r-0"
                              )}
                              style={{ width: `${widthVal}%` }}
                            >
                              <div className="flex items-center justify-between px-1">
                                <button
                                  type="button"
                                  onClick={() => moveColumnTable1(idx, 'left')}
                                  disabled={idx === 0}
                                  className="opacity-0 group-hover/col:opacity-100 hover:opacity-100 transition-opacity bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40 text-[#5B4009] rounded p-0.5 text-[8px] cursor-pointer disabled:opacity-0"
                                  title="Mover Coluna para Esquerda"
                                >
                                  ◀
                                </button>
                                <span className="truncate flex-1 text-center flex items-center justify-center gap-1 font-bold text-[#211C19]">
                                  {colKey === 'motorista' && <User size={11} className="text-[#8C6D2B] shrink-0 inline-block" />}
                                  {colKey === 'cavalo' && <Truck size={11} className="text-[#8C6D2B] shrink-0 inline-block" />}
                                  {colKey === 'carretas' && <Container size={11} className="text-[#8C6D2B] shrink-0 inline-block" />}
                                  {colKey === 'isca' && <Barcode size={11} className="text-[#8C6D2B] shrink-0 inline-block" />}
                                  {colKey === 'produto' && <Package size={11} className="text-[#8C6D2B] shrink-0 inline-block" />}
                                  {colKey === 'uma' && <FileText size={11} className="text-[#8C6D2B] shrink-0 inline-block" />}
                                  {colKey === 'destino' && <MapPin size={11} className="text-[#8C6D2B] shrink-0 inline-block" />}
                                  {colKey === 'data' && <Calendar size={11} className="text-[#8C6D2B] shrink-0 inline-block" />}
                                  <span>{col.label}</span>
                                </span>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover/col:opacity-100 hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => resizeColumnTable1(colKey, -2)}
                                    className="bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40 text-[#5B4009] rounded px-1 text-[8px] font-bold cursor-pointer"
                                    title="Diminuir Largura (-)"
                                  >
                                    -
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => resizeColumnTable1(colKey, 2)}
                                    className="bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40 text-[#5B4009] rounded px-1 text-[8px] font-bold cursor-pointer"
                                    title="Aumentar Largura (+)"
                                  >
                                    +
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveColumnTable1(idx, 'right')}
                                    disabled={idx === table1ColumnOrder.length - 1}
                                    className="bg-[#D4AF37]/20 hover:bg-[#D4AF37]/40 text-[#5B4009] rounded p-0.5 text-[8px] cursor-pointer disabled:opacity-0"
                                    title="Mover Coluna para Direita"
                                  >
                                    ▶
                                  </button>
                                </div>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Rows of data with reordered columns */}
                      <tr className="border-b border-[#E5D5B5] text-center text-xs h-[36px] bg-white">
                        {table1ColumnOrder.map((colKey) => {
                          switch (colKey) {
                            case 'motorista':
                              return (
                                <td key={colKey} rowSpan={numCarretas} className="border-r border-[#E5D5B5] p-1 font-bold uppercase text-[10.5px] align-middle">
                                  <textarea
                                    value={motorista}
                                    onChange={(e) => handleTableMotoristaChange(e.target.value)}
                                    className="w-full h-full min-h-[40px] text-center font-bold uppercase bg-transparent border-none outline-none hover:bg-[#FAF7F0] focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded resize-none p-1 text-[11px] leading-snug text-[#1A1D20] transition-all duration-150"
                                    placeholder="NOME MOTORISTA"
                                  />
                                </td>
                              );
                            case 'cavalo':
                              return (
                                <td key={colKey} rowSpan={numCarretas} className="border-r border-[#E5D5B5] p-1 font-black uppercase text-[11.5px] align-middle">
                                  <input
                                    type="text"
                                    value={cavalo}
                                    onChange={(e) => setCavalo(e.target.value.replace(/-/g, ""))}
                                    className="w-full text-center font-black uppercase bg-transparent border-none outline-none hover:bg-[#FAF7F0] focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1 py-0.5 text-[12.5px] text-[#1A1D20] tracking-wider transition-all duration-150"
                                    placeholder="PLACA"
                                    title="Placa"
                                  />
                                </td>
                              );
                            case 'carretas':
                              return (
                                <td key={colKey} className="border-r border-[#E5D5B5] p-1 align-middle">
                                  <input
                                    type="text"
                                    value={carreta1}
                                    onChange={(e) => setCarreta1(e.target.value)}
                                    className="w-full text-center bg-transparent border-none outline-none hover:bg-[#FAF7F0] focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1 py-0.5 uppercase font-bold text-[11px] text-[#1A1D20] transition-all duration-150"
                                    placeholder="CARRETA 1"
                                  />
                                </td>
                              );
                            case 'isca':
                              return (
                                <td key={colKey} className="border-r border-[#E5D5B5] p-1 font-black uppercase text-[10.5px] align-middle">
                                  <input
                                    type="text"
                                    value={isca1}
                                    onChange={(e) => setIsca1(e.target.value)}
                                    className="w-full text-center font-black uppercase bg-transparent border-none outline-none hover:bg-[#FAF7F0] focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1 py-0.5 text-[11px] text-[#C91F2D] transition-all duration-150"
                                    placeholder="ISCA 1"
                                  />
                                </td>
                              );
                            case 'produto':
                              return (
                                <td key={colKey} className="border-r border-[#E5D5B5] p-1 font-bold uppercase text-[10.5px] align-middle">
                                  <input
                                    type="text"
                                    value={produto1}
                                    onChange={(e) => setProduto1(e.target.value)}
                                    className="w-full text-center font-bold uppercase bg-transparent border-none outline-none hover:bg-[#FAF7F0] focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1 py-0.5 text-[11px] text-[#1A1D20] transition-all duration-150"
                                    placeholder="PROD 1"
                                  />
                                </td>
                              );
                            case 'uma':
                              return (
                                <td key={colKey} className="border-r border-[#E5D5B5] p-1 font-bold uppercase text-[10.5px] align-middle">
                                  <input
                                    type="text"
                                    value={uma1}
                                    onChange={(e) => setUma1(formatUMA(e.target.value))}
                                    className="w-full text-center font-bold uppercase bg-transparent border-none outline-none hover:bg-[#FAF7F0] focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1 py-0.5 text-[11px] text-[#1A1D20] transition-all duration-150"
                                    placeholder="CÓDIGO 1"
                                  />
                                </td>
                              );
                            case 'destino':
                              return (
                                <td key={colKey} rowSpan={numCarretas} className="border-r border-[#E5D5B5] p-1 font-bold uppercase text-[10.5px] align-middle">
                                  <input
                                    type="text"
                                    value={destino}
                                    onChange={(e) => setDestino(e.target.value)}
                                    className="w-full text-center font-bold uppercase bg-transparent border-none outline-none hover:bg-[#FAF7F0] focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1 py-0.5 text-[11px] text-[#1A1D20] transition-all duration-150"
                                    placeholder="DESTINO"
                                  />
                                </td>
                              );
                            case 'data':
                              return (
                                <td key={colKey} rowSpan={numCarretas} className="p-1 font-bold text-[#1A1D20] text-[11px] align-middle">
                                  <input
                                    type="text"
                                    value={dataEnviada}
                                    onChange={(e) => setDataEnviada(e.target.value)}
                                    className="w-full text-center font-bold bg-transparent border-none outline-none hover:bg-[#FAF7F0] focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1 py-0.5 text-[11px] text-[#1A1D20] transition-all duration-150"
                                    placeholder="DATA"
                                  />
                                </td>
                              );
                            default:
                              return null;
                          }
                        })}
                      </tr>

                      {/* Second row of sub-items (Carreta 2, Isca 2, Prod 2, UMA 2) */}
                      {numCarretas === 2 && (
                        <tr className="border-b border-[#E5D5B5] text-center text-xs h-[42px] bg-[#FBF8F1]">
                          {table1ColumnOrder.map((colKey) => {
                            switch (colKey) {
                              case 'carretas':
                                return (
                                  <td key={colKey} className="border-r border-[#E5D5B5] p-1 align-middle">
                                    <input
                                      type="text"
                                      value={carreta2}
                                      onChange={(e) => setCarreta2(e.target.value)}
                                      className="w-full text-center bg-transparent border-none outline-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1 py-0.5 uppercase font-bold text-[11px] text-[#1A1D20] transition-all duration-150"
                                      placeholder="CARRETA 2"
                                    />
                                  </td>
                                );
                              case 'isca':
                                return (
                                  <td key={colKey} className="border-r border-[#E5D5B5] p-1 font-black uppercase text-[10.5px] align-middle">
                                    <input
                                      type="text"
                                      value={isca2}
                                      onChange={(e) => setIsca2(e.target.value)}
                                      className="w-full text-center font-black uppercase bg-transparent border-none outline-none hover:bg-[#FAF7F0] focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1 py-0.5 text-[11px] text-[#C91F2D] transition-all duration-150"
                                      placeholder="ISCA 2"
                                    />
                                  </td>
                                );
                              case 'produto':
                                return (
                                  <td key={colKey} className="border-r border-[#E5D5B5] p-1 font-bold uppercase text-[10.5px] align-middle">
                                    <input
                                      type="text"
                                      value={produto2}
                                      onChange={(e) => setProduto2(e.target.value)}
                                      className="w-full text-center font-bold uppercase bg-transparent border-none outline-none hover:bg-[#FAF7F0] focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1 py-0.5 text-[11px] text-[#1A1D20] transition-all duration-150"
                                      placeholder="PROD 2"
                                    />
                                  </td>
                                );
                              case 'uma':
                                return (
                                  <td key={colKey} className="border-r border-[#E5D5B5] p-1 font-bold uppercase text-[10.5px] align-middle">
                                    <input
                                      type="text"
                                      value={uma2}
                                      onChange={(e) => setUma2(formatUMA(e.target.value))}
                                      className="w-full text-center font-bold uppercase bg-transparent border-none outline-none hover:bg-[#FAF7F0] focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1 py-0.5 text-[11px] text-[#1A1D20] transition-all duration-150"
                                      placeholder="CÓDIGO 2"
                                    />
                                  </td>
                                );
                              default:
                                return null;
                            }
                          })}
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* TABLE 2: PARAMETRIZAÇÃO DAS ISCAS CORPORATIVA DOURADA & GRAFITE */}
                  <table className="w-full border-collapse text-xs font-sans text-[#1A1D20] table-fixed mt-0">
                    <tbody>
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center font-black text-white p-3 uppercase text-[11px] tracking-widest border-t border-b border-[#C5A059] relative shadow-md"
                          style={{ background: 'linear-gradient(180deg, #181A1D 0%, #252A30 100%)' }}
                        >
                          <div className="flex items-center justify-between px-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F59E0B] via-[#D4AF37] to-[#8C6D2B] flex items-center justify-center text-[#111111] font-black text-xs shadow-sm">
                              ⚙
                            </div>
                            <span className="select-none tracking-widest text-white font-black text-xs">
                              PARAMETRIZAÇÃO DAS ISCAS
                            </span>
                            <div className="w-6"></div>
                          </div>
                        </td>
                      </tr>
                      {/* Subheaders Row */}
                      <tr className="text-[#1A1D20] text-center font-extrabold text-[9.5px] tracking-wider h-[32px] border-b border-[#C5A059]" style={{ background: '#F5EDDA' }}>
                        {table2ColumnOrder.map((colKey, idx) => {
                          const col = TABLE2_COLS[colKey];
                          const widthVal = table2ColumnWidths[colKey] || col.defaultWidth;
                          return (
                            <td
                              key={colKey}
                              className={cn(
                                "border-r border-[#C5A059]/60 p-1 uppercase tracking-wide text-[9.5px] align-middle relative group/col2 select-none",
                                idx === table2ColumnOrder.length - 1 && "border-r-0"
                              )}
                              style={{ width: `${widthVal}%` }}
                            >
                              <div className="flex items-center justify-between px-1">
                                <button
                                  type="button"
                                  onClick={() => moveColumnTable2(idx, 'left')}
                                  disabled={idx === 0}
                                  className="opacity-0 group-hover/col2:opacity-100 hover:opacity-100 transition-opacity bg-[#2D333B] hover:bg-[#3E4651] text-[#E6C575] rounded p-0.5 text-[8px] cursor-pointer disabled:opacity-0"
                                  title="Mover Coluna para Esquerda"
                                >
                                  ◀
                                </button>
                                <span className="truncate flex-1 text-center flex items-center justify-center gap-1 font-bold text-[#1A1D20]">
                                  {colKey === 'isca' && (
                                    <>
                                      <Barcode size={11} className="text-[#8C6D2B] shrink-0 inline-block" />
                                      <span>PLACA / CÓDIGO DE VENDA ⇅</span>
                                    </>
                                  )}
                                  {colKey === 'endereco' && (
                                    <>
                                      <MapPin size={11} className="text-[#8C6D2B] shrink-0 inline-block" />
                                      <span>ENDEREÇO APROXIMADO DA POSIÇÃO ⇅</span>
                                    </>
                                  )}
                                  {colKey === 'data' && (
                                    <>
                                      <Calendar size={11} className="text-[#8C6D2B] shrink-0 inline-block" />
                                      <span>DATA POSIÇÃO ⇅</span>
                                    </>
                                  )}
                                  {colKey === 'bateria' && (
                                    <>
                                      <Battery size={11} className="text-[#8C6D2B] shrink-0 inline-block" />
                                      <span>BATERIA ISCA _ RF ⇅</span>
                                    </>
                                  )}
                                </span>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover/col2:opacity-100 hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => resizeColumnTable2(colKey, -2)}
                                    className="bg-[#2D333B] hover:bg-[#3E4651] text-[#E6C575] rounded px-1 text-[8px] font-bold cursor-pointer"
                                    title="Diminuir Largura (-)"
                                  >
                                    -
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => resizeColumnTable2(colKey, 2)}
                                    className="bg-[#2D333B] hover:bg-[#3E4651] text-[#E6C575] rounded px-1 text-[8px] font-bold cursor-pointer"
                                    title="Aumentar Largura (+)"
                                  >
                                    +
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveColumnTable2(idx, 'right')}
                                    disabled={idx === table2ColumnOrder.length - 1}
                                    className="bg-[#2D333B] hover:bg-[#3E4651] text-[#E6C575] rounded p-0.5 text-[8px] cursor-pointer disabled:opacity-0"
                                    title="Mover Coluna para Direita"
                                  >
                                    ▶
                                  </button>
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                      {/* Row 1 (Isca 2) - Only rendered if numCarretas === 2 and isca2 is NOT 'SEM ISCA' */}
                      {numCarretas === 2 && isca2 !== "SEM ISCA" && (
                        <tr className="bg-[#FBF8F1] text-center font-medium text-[#1A1D20] h-[36px] border-b border-[#E5D5B5]">
                          {table2ColumnOrder.map((colKey) => {
                            switch (colKey) {
                              case 'isca':
                                return (
                                  <td key={colKey} className={cn(
                                    "border-r border-[#E5D5B5] p-1 font-black uppercase text-[11.5px] text-center align-middle",
                                    "text-[#C91F2D]"
                                  )}>
                                    {isca2DisplayCode ? <span className="font-black text-[11px] text-[#C91F2D] uppercase tracking-wide">{isca2DisplayCode}</span> : ""}
                                  </td>
                                );
                              case 'endereco':
                                return (
                                  <td key={colKey} className="border-r border-[#E5D5B5] p-1 text-left font-medium text-[11px] align-middle">
                                    <textarea
                                      value={isca2 === "SEM ISCA" ? "" : (isca2Endereco || (!pastePlanilha.trim() ? "O site das iscas está temporariamente fora do ar." : ""))}
                                      onChange={(e) => setIsca2Endereco(e.target.value)}
                                      disabled={isca2 === "SEM ISCA"}
                                      rows={1}
                                      className={cn(
                                        "w-full bg-transparent border-none outline-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1.5 py-0.5 text-[11px] resize-y leading-tight font-medium transition-all duration-150 disabled:opacity-50",
                                        !pastePlanilha.trim() && !isca2Endereco ? "text-[#C91F2D] font-black uppercase" : "text-[#1A1D20]"
                                      )}
                                      placeholder={isca2 === "SEM ISCA" ? "" : "Endereço da Isca 2..."}
                                    />
                                  </td>
                                );
                              case 'data':
                                return (
                                  <td key={colKey} className="border-r border-[#E5D5B5] p-1 text-center font-medium text-[11px] align-middle">
                                    <input
                                      type="text"
                                      value={isca2 === "SEM ISCA" ? "" : isca2Data}
                                      onChange={(e) => setIsca2Data(e.target.value)}
                                      disabled={isca2 === "SEM ISCA"}
                                      className="w-full bg-transparent border-none outline-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1.5 py-0.5 text-[11px] text-center text-[#1A1D20] font-medium transition-all duration-150 disabled:opacity-50"
                                      placeholder={isca2 === "SEM ISCA" ? "" : "Data/Hora..."}
                                    />
                                  </td>
                                );
                              case 'bateria':
                                const text2 = isca2Endereco || (!pastePlanilha.trim() ? "O site das iscas está temporariamente fora do ar." : "");
                                const isOffline2 = text2.includes("temporariamente fora do ar");
                                return (
                                  <td key={colKey} className="p-1 text-center font-medium text-[11px] align-middle">
                                    {isOffline2 ? null : (
                                      <div className="flex items-center justify-center gap-1 mx-auto w-fit">
                                        <input
                                          type="text"
                                          value={isca2 === "SEM ISCA" ? "" : isca2Bateria}
                                          onChange={(e) => setIsca2Bateria(e.target.value)}
                                          disabled={isca2 === "SEM ISCA"}
                                          className="w-10 bg-transparent border-none outline-none hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1 py-0.5 text-[11px] text-center text-[#1A1D20] font-bold transition-all duration-150 disabled:opacity-50"
                                          placeholder={isca2 === "SEM ISCA" ? "" : "100%"}
                                        />
                                        <div className="relative flex items-center shrink-0">
                                          <Battery className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                                          <div 
                                            className="absolute left-[2px] top-[5.5px] h-[5px] bg-emerald-500 rounded-[1px]"
                                            style={{ width: `${(isca2 === "SEM ISCA" ? 0 : Math.min(100, parseInt(isca2Bateria) || 100)) * 0.09}px` }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                );
                              default:
                                return null;
                            }
                          })}
                        </tr>
                      )}
                      {/* Row 2 (Isca 1) */}
                      <tr className="bg-white text-center font-medium text-[#1A1D20] h-[36px] border-b border-[#E5D5B5]">
                        {table2ColumnOrder.map((colKey) => {
                          switch (colKey) {
                            case 'isca':
                              return (
                                <td key={colKey} className={cn(
                                  "border-r border-[#E5D5B5] p-1 font-black uppercase text-[11.5px] text-center bg-white align-middle",
                                  isGreenOrigem ? "text-emerald-600" : isPurpleOrigem ? "text-purple-700" : isCuiabaOrigem ? "text-amber-600" : "text-[#C91F2D]"
                                )}>
                                  {isca1DisplayCode ? <span className="font-black text-[11px] text-[#C91F2D] uppercase tracking-wide">{isca1DisplayCode}</span> : ""}
                                </td>
                              );
                            case 'endereco':
                              return (
                                <td key={colKey} className="border-r border-[#E5D5B5] p-1 text-left font-medium text-[11px] bg-white align-middle">
                                  <textarea
                                    value={isca1Endereco || (!pastePlanilha.trim() ? "O site das iscas está temporariamente fora do ar." : "")}
                                    onChange={(e) => setIsca1Endereco(e.target.value)}
                                    rows={1}
                                    className={cn(
                                      "w-full bg-transparent border-none outline-none hover:bg-[#FAF7F0] focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1.5 py-0.5 text-[11px] resize-y leading-tight font-medium transition-all duration-150",
                                      !pastePlanilha.trim() && !isca1Endereco ? "text-[#C91F2D] font-black uppercase" : "text-[#1A1D20]"
                                    )}
                                    placeholder="Endereço da Isca 1..."
                                  />
                                </td>
                              );
                            case 'data':
                              return (
                                <td key={colKey} className="border-r border-[#E5D5B5] p-1 text-center font-medium text-[11px] bg-white align-middle">
                                  <input
                                    type="text"
                                    value={isca1Data}
                                    onChange={(e) => setIsca1Data(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none hover:bg-[#FAF7F0] focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1.5 py-0.5 text-[11px] text-center text-[#1A1D20] font-medium transition-all duration-150"
                                    placeholder="Data/Hora..."
                                  />
                                </td>
                              );
                            case 'bateria':
                              const text1 = isca1Endereco || (!pastePlanilha.trim() ? "O site das iscas está temporariamente fora do ar." : "");
                              const isOffline1 = text1.includes("temporariamente fora do ar");
                              return (
                                <td key={colKey} className="p-1 text-center font-medium text-[11px] bg-white align-middle">
                                  {isOffline1 ? null : (
                                    <div className="flex items-center justify-center gap-1 mx-auto w-fit">
                                      <input
                                        type="text"
                                        value={isca1Bateria}
                                        onChange={(e) => setIsca1Bateria(e.target.value)}
                                        className="w-10 bg-transparent border-none outline-none hover:bg-[#FAF7F0] focus:bg-white focus:ring-1 focus:ring-[#C5A059] rounded px-1 py-0.5 text-[11px] text-center text-[#1A1D20] font-bold transition-all duration-150"
                                        placeholder="100%"
                                      />
                                      <div className="relative flex items-center shrink-0">
                                        <Battery className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                                        <div 
                                          className="absolute left-[2px] top-[5.5px] h-[5px] bg-emerald-500 rounded-[1px]"
                                          style={{ width: `${Math.min(100, parseInt(isca1Bateria) || 100) * 0.09}px` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </td>
                              );
                            default:
                              return null;
                          }
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Column Configuration Modal */}
                {isColumnConfigOpen && (
                  <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 flex flex-col gap-6 relative">
                      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                        <div>
                          <h3 className="text-xl font-black uppercase text-stone-900 flex items-center gap-2">
                            <Sliders className="text-[#9b1526]" size={22} />
                            Gerenciar Colunas & Tamanhos
                          </h3>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Mude a ordem das colunas e ajuste a largura manualmente (aumentar/diminuir).
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsColumnConfigOpen(false)}
                          className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-all"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto pr-1">
                        {/* Tabela Principal */}
                        <div className="flex flex-col gap-3">
                          <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 bg-stone-100 px-3 py-2 rounded-xl">
                            Tabela Principal de Veículos & Embarques
                          </h4>
                          <div className="flex flex-col gap-2">
                            {table1ColumnOrder.map((colKey, idx) => {
                              const col = TABLE1_COLS[colKey];
                              const width = table1ColumnWidths[colKey] || col.defaultWidth;
                              return (
                                <div key={colKey} className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-lg bg-stone-200 text-stone-700 text-xs font-mono font-bold flex items-center justify-center">
                                      {idx + 1}
                                    </span>
                                    <span className="text-xs font-bold uppercase text-stone-900">{col.label}</span>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg px-2 py-1 shadow-2xs">
                                      <span className="text-[10px] font-mono text-stone-500 font-bold">Largura: {width}%</span>
                                      <button
                                        type="button"
                                        onClick={() => resizeColumnTable1(colKey, -2)}
                                        className="w-5 h-5 bg-stone-100 hover:bg-red-100 text-stone-800 hover:text-red-700 rounded text-xs font-black cursor-pointer flex items-center justify-center"
                                        title="Diminuir"
                                      >
                                        -
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => resizeColumnTable1(colKey, 2)}
                                        className="w-5 h-5 bg-stone-100 hover:bg-emerald-100 text-stone-800 hover:text-emerald-700 rounded text-xs font-black cursor-pointer flex items-center justify-center"
                                        title="Aumentar"
                                      >
                                        +
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => moveColumnTable1(idx, 'left')}
                                        disabled={idx === 0}
                                        className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 disabled:opacity-30 text-stone-800 rounded-lg text-xs font-bold cursor-pointer transition-all"
                                      >
                                        ◀ Mover
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => moveColumnTable1(idx, 'right')}
                                        disabled={idx === table1ColumnOrder.length - 1}
                                        className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 disabled:opacity-30 text-stone-800 rounded-lg text-xs font-bold cursor-pointer transition-all"
                                      >
                                        Mover ▶
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Tabela Parametrização Iscas */}
                        <div className="flex flex-col gap-3">
                          <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 bg-stone-100 px-3 py-2 rounded-xl">
                            Tabela Parametrização das Iscas
                          </h4>
                          <div className="flex flex-col gap-2">
                            {table2ColumnOrder.map((colKey, idx) => {
                              const col = TABLE2_COLS[colKey];
                              const width = table2ColumnWidths[colKey] || col.defaultWidth;
                              return (
                                <div key={colKey} className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-lg bg-stone-200 text-stone-700 text-xs font-mono font-bold flex items-center justify-center">
                                      {idx + 1}
                                    </span>
                                    <span className="text-xs font-bold uppercase text-stone-900">{col.label}</span>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg px-2 py-1 shadow-2xs">
                                      <span className="text-[10px] font-mono text-stone-500 font-bold">Largura: {width}%</span>
                                      <button
                                        type="button"
                                        onClick={() => resizeColumnTable2(colKey, -2)}
                                        className="w-5 h-5 bg-stone-100 hover:bg-red-100 text-stone-800 hover:text-red-700 rounded text-xs font-black cursor-pointer flex items-center justify-center"
                                        title="Diminuir"
                                      >
                                        -
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => resizeColumnTable2(colKey, 2)}
                                        className="w-5 h-5 bg-stone-100 hover:bg-emerald-100 text-stone-800 hover:text-emerald-700 rounded text-xs font-black cursor-pointer flex items-center justify-center"
                                        title="Aumentar"
                                      >
                                        +
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => moveColumnTable2(idx, 'left')}
                                        disabled={idx === 0}
                                        className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 disabled:opacity-30 text-stone-800 rounded-lg text-xs font-bold cursor-pointer transition-all"
                                      >
                                        ◀ Mover
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => moveColumnTable2(idx, 'right')}
                                        disabled={idx === table2ColumnOrder.length - 1}
                                        className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 disabled:opacity-30 text-stone-800 rounded-lg text-xs font-bold cursor-pointer transition-all"
                                      >
                                        Mover ▶
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-4 border-t border-stone-200">
                        <button
                          type="button"
                          onClick={() => setIsColumnConfigOpen(false)}
                          className="px-6 py-2.5 bg-[#9b1526] hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-95"
                        >
                          Concluído
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. INTERACTIVE ESQUEMA DE EMBARQUE (LADDERS) */}
                {!ocultarNotas && (
                  <div className="mt-6 border-t border-[#EDE2CE] pt-5">
                    <span className="text-[13px] font-black uppercase block mt-[20px] mb-[15px] text-[#D92332] font-sans border-b border-[#EDE2CE] pb-2">
                      ESQUEMA DE EMBARQUE DAS ISCAS:
                    </span>
                    <p className="text-[10px] text-[#77736B] font-extrabold uppercase tracking-wider mb-4">
                      {sidebarEmbarque1 || sidebarEmbarque2
                        ? "Imagem do esquema de embarque selecionada! Ela será incluída no e-mail."
                        : 'Clique nas células para marcar/desmarcar a isca ("P"). Esse esquema será copiado visualmente para o e-mail!'}
                    </p>

                    <div className={cn(
                      "flex flex-wrap justify-center items-start max-w-[720px] mx-auto transition-all duration-300",
                      (!sidebarEmbarque1 && !sidebarEmbarque2) ? "gap-[10px]" : "gap-[30px]"
                    )}>
                      {/* Carreta 1 Section */}
                      {sidebarEmbarque1 !== "none" && (
                        <div className={cn(
                          "flex flex-col items-center transition-all duration-300",
                          sidebarEmbarque1 ? "w-[320px]" : "w-[100px]"
                        )}>
                          {sidebarEmbarque1 ? (
                            <div className="w-full flex flex-col">
                              <div className="bg-[#F5F0E6] border border-[#EDE2CE] p-3 text-center shadow-xs w-[320px] h-[420px] flex items-center justify-center box-border rounded-2xl">
                                <img
                                  src={sidebarEmbarque1}
                                  alt="Esquema"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    const fallback = getLocalFallbackImg(sidebarEmbarque1);
                                    if (fallback && e.currentTarget.src !== fallback) {
                                      e.currentTarget.src = fallback;
                                    }
                                  }}
                                  className="max-w-[95%] max-h-[95%] w-auto h-auto object-contain bg-white rounded-xl mx-auto block border border-[#EDE2CE] p-2"
                                />
                              </div>
                              <div className="text-center mt-[15px]">
                                <span className="text-[11px] font-black text-[#292820] uppercase tracking-wider">
                                  CARRETA 1: {carreta1 || "S/ PLACA"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center w-full">
                              <div className="h-[350px] flex flex-col items-center justify-start pt-[15px]">
                                <div className="bg-[#292820] text-[#E6D2A3] font-extrabold text-[8px] uppercase w-[50px] py-[3px] text-center border border-[#C49A45]/40 tracking-normal rounded-t">
                                  ESCALA 01
                                </div>
                                <div className="grid grid-cols-2 gap-0 border border-[#EDE2CE] bg-[#F5F0E6] w-[50px]">
                                  {ladder1.map((row, rIndex) =>
                                    row.map((cell, cIndex) => (
                                      <button
                                        key={`ladder1-${rIndex}-${cIndex}`}
                                        onClick={() => {
                                          const copy = [
                                            ...ladder1.map((r) => [...r]),
                                          ];
                                          copy[rIndex][cIndex] =
                                            copy[rIndex][cIndex] === "P" ? "" : "P";
                                          setLadder1(copy);
                                        }}
                                        className={cn(
                                          "w-full h-[12px] border-[0.5px] border-[#EDE2CE] font-black text-[8px] flex items-center justify-center transition-all cursor-pointer select-none",
                                          cell === "P"
                                            ? isGreenOrigem
                                              ? "bg-emerald-600 text-white"
                                              : isPurpleOrigem
                                                ? "bg-purple-700 text-white font-black"
                                                : isCuiabaOrigem
                                                  ? "bg-amber-500 text-stone-950 font-black"
                                                  : "bg-[#D92332] text-white"
                                            : "bg-[#FFFFFF] hover:bg-[#EDE2CE] text-[#292820]",
                                        )}
                                      >
                                        {cell}
                                      </button>
                                    )),
                                  )}
                                </div>
                              </div>
                              <div className="text-center mt-[10px]">
                                <span className="text-[11px] font-black text-[#292820] uppercase tracking-wider">
                                  CARRETA 1: {carreta1 || "S/ PLACA"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Carreta 2 Section */}
                      {numCarretas === 2 && sidebarEmbarque2 !== "none" && (
                        <div className={cn(
                          "flex flex-col items-center transition-all duration-300",
                          sidebarEmbarque2 ? "w-[320px]" : "w-[100px]"
                        )}>
                          {sidebarEmbarque2 ? (
                            <div className="w-full flex flex-col">
                              <div className="bg-[#F5F0E6] border border-[#EDE2CE] p-3 text-center shadow-xs w-[320px] h-[420px] flex items-center justify-center box-border rounded-2xl">
                                <img
                                  src={sidebarEmbarque2}
                                  alt="Esquema"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    const fallback = getLocalFallbackImg(sidebarEmbarque2);
                                    if (fallback && e.currentTarget.src !== fallback) {
                                      e.currentTarget.src = fallback;
                                    }
                                  }}
                                  className="max-w-[95%] max-h-[95%] w-auto h-auto object-contain bg-white rounded-xl mx-auto block border border-[#EDE2CE] p-2"
                                />
                              </div>
                              <div className="text-center mt-[15px]">
                                <span className="text-[11px] font-black text-[#292820] uppercase tracking-wider">
                                  CARRETA 2: {carreta2 || "S/ PLACA"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center w-full">
                              <div className="h-[350px] flex flex-col items-center justify-start pt-[15px]">
                                <div className="bg-[#292820] text-[#E6D2A3] font-extrabold text-[9px] uppercase w-[75px] py-[5px] text-center border border-[#C49A45]/40 tracking-normal rounded-t">
                                  ESCALA 02
                                </div>
                                <div className="grid grid-cols-2 gap-0 border border-[#EDE2CE] bg-[#F5F0E6] w-[75px]">
                                  {ladder2.map((row, rIndex) =>
                                    row.map((cell, cIndex) => (
                                      <button
                                        key={`ladder2-${rIndex}-${cIndex}`}
                                        onClick={() => {
                                          const copy = [
                                            ...ladder2.map((r) => [...r]),
                                          ];
                                          copy[rIndex][cIndex] =
                                            copy[rIndex][cIndex] === "P" ? "" : "P";
                                          setLadder2(copy);
                                        }}
                                        className={cn(
                                          "w-full h-[12px] border-[0.5px] border-[#EDE2CE] font-black text-[8px] flex items-center justify-center transition-all cursor-pointer select-none",
                                          cell === "P"
                                            ? isGreenOrigem
                                              ? "bg-emerald-600 text-white"
                                              : isPurpleOrigem
                                                ? "bg-purple-700 text-white font-black"
                                                : isCuiabaOrigem
                                                  ? "bg-amber-500 text-stone-950 font-black"
                                                  : "bg-[#D92332] text-white"
                                            : "bg-[#FFFFFF] hover:bg-[#EDE2CE] text-[#292820]",
                                        )}
                                      >
                                        {cell}
                                      </button>
                                    )),
                                  )}
                                </div>
                              </div>
                              <div className="text-center mt-[15px]">
                                <span className="text-[11px] font-black text-[#292820] uppercase tracking-wider">
                                  CARRETA 2: {carreta2 || "S/ PLACA"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes additional line (HIDDEN PER USER REQUEST) */}
                <div className="hidden mt-5 max-w-xl mx-auto border border-[#EDE2CE] rounded-2xl p-4 bg-[#FFFCF6] shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase text-[#C49A45] tracking-wider block">
                      Notas adicionais de embarque:
                    </span>
                    <button
                      type="button"
                      onClick={() => setOcultarNotas(!ocultarNotas)}
                      className={cn(
                        "flex items-center gap-1.5 font-black uppercase text-[9px] tracking-wider px-2.5 py-1 rounded-lg border transition-all cursor-pointer select-none active:scale-95",
                        ocultarNotas
                          ? "bg-[#D92332] hover:bg-[#B31D2A] text-white border-transparent"
                          : "bg-[#F5F0E6] hover:bg-[#EDE2CE] text-[#292820] border-[#EDE2CE]",
                      )}
                    >
                      {ocultarNotas ? (
                        <>
                          <EyeOff size={11} className="stroke-[3]" /> OCULTO NO
                          E-MAIL
                        </>
                      ) : (
                        <>
                          <Eye size={11} className="stroke-[2.5]" /> OCULTAR NO
                          E-MAIL
                        </>
                      )}
                    </button>
                  </div>

                  {!ocultarNotas ? (
                    <input
                      type="text"
                      value={esquemaEmbarque}
                      onChange={(e) => setEsquemaEmbarque(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-[#EDE2CE] focus:border-[#C49A45] py-1 text-xs outline-none uppercase font-mono font-bold text-[#292820]"
                      placeholder="EX: CAVALO: ISCA NO PAINEL / CARRETA 1: ISCA NO MEIO..."
                    />
                  ) : (
                    <p className="text-[10px] text-[#77736B] font-semibold italic">
                      O esquema e as notas de embarque estão ocultos e não serão
                      incluídos no e-mail copiado.
                    </p>
                  )}
                </div>

                {/* 7. GERENCIAMENTO DE RISCO (OCULTO AUTOMATICAMENTE QUANDO PREFIXO FOR 30D10000) */}
                {!isDescartavel && (
                  <div className="mt-6 bg-[#F5F0E6] border border-[#EDE2CE] p-4 rounded-2xl text-left shadow-xs">
                    <p className="text-[11px] font-black text-[#D92332] mb-2 uppercase tracking-wide">
                      GERENCIAMENTO DE RISCO
                    </p>
                    <p className="text-[11px] text-[#292820] mb-1.5 font-medium leading-relaxed">
                      • Ressalto a importância de encaminhar todas as iscas resgatadas para suas respectivas unidades de origem.
                    </p>
                    <p className="text-[11px] text-[#292820] mb-1.5 font-medium leading-relaxed">
                      Agradeço antecipadamente pelo compromisso em assegurar que esses envios sejam efetuados via veículos dedicados ou postagem de maneira a evitar qualquer inconveniente em nossa operação.
                    </p>
                    <p className="text-[11px] text-[#292820] mb-1.5 font-medium leading-relaxed">
                      A devolução dos rastreadores móveis é essencial, porém, muitos ainda não foram devolvidos prejudicando nossos processos. Por gentileza, devolvam as iscas o quanto antes para mantermos nossa excelência operacional.
                    </p>
                    <p className="text-[11px] text-[#292820] font-medium leading-relaxed">
                      Desde já agradeço e ficamos no aguardo do retorno sobre as devoluções.
                    </p>
                  </div>
                )}
              </div>
            </div>


          </div>
          )}
        </div>
      </div>

      {/* MIDDLE SIDEBAR: Fast Fill Column (fixed width) */}
      <div
        className={cn(
          "col-span-1 xl:col-span-1 flex flex-col transition-all duration-300",
          preAlertaMode === "minimized" && "origin-top"
        )}
        style={preAlertaMode === "minimized" ? { zoom: colunasZoom } : undefined}
      >
        <div className={cn(
          "rounded-3xl bg-[#FFFCF6] border border-[#EDE2CE] shadow-sm relative overflow-hidden flex flex-col p-4 sm:p-5 transition-all text-[#292820]",
          preAlertaMode === "minimized" && "border-[#C49A45]/50 shadow-md ring-1 ring-[#C49A45]/20"
        )}>
          {/* Form Header */}
          <div className="border-b border-[#EDE2CE] pb-4 mb-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D92332] block">
                Painel Lateral
              </span>
              {preAlertaMode === "minimized" && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                  Zoom {Math.round(colunasZoom * 100)}%
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-base font-sans font-black text-[#292820] uppercase tracking-tight flex items-center gap-2">
                <Sliders size={18} className="text-[#C49A45]" /> Formulário de Controle
              </h3>
              <div className="flex items-center gap-1.5">
                {preAlertaMode === "minimized" && (
                  <div className="flex items-center bg-[#F5F0E6] border border-[#EDE2CE] rounded-lg p-0.5 text-[10px] font-black shadow-xs">
                    <button
                      type="button"
                      onClick={() => setColunasZoom((z) => Math.max(0.8, parseFloat((z - 0.05).toFixed(2))))}
                      title="Diminuir Zoom"
                      className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#EDE2CE] text-[#292820] active:scale-95 transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-1.5 font-mono text-[#292820]">{Math.round(colunasZoom * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setColunasZoom((z) => Math.min(1.35, parseFloat((z + 0.05).toFixed(2))))}
                      title="Aumentar Zoom"
                      className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#EDE2CE] text-[#292820] active:scale-95 transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 text-[#77736B] hover:text-[#D92332] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Limpar formulário"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Form inputs */}
          <div className="flex flex-col gap-4">
            {/* ORIGEM (MENU SUSPENSO) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                <MapPin size={12} className="text-[#C49A45]" /> ORIGEM
              </label>
              <select
                value={origem}
                onChange={(e) => {
                  const newOrigem = e.target.value;
                  setOrigem(newOrigem);
                  if (rota1) {
                    if (rota1.includes(" x ")) {
                      const parts = rota1.split(/\s*x\s*/i);
                      const firstPart = parts[0];
                      const prefixMatch = firstPart.match(/^(\s*·?\s*)/);
                      const prefix = prefixMatch ? prefixMatch[1] : "";
                      const restOfRoute = parts.slice(1).join(" x ");
                      setRota1(`${prefix}${newOrigem} x ${restOfRoute}`);
                    }
                  }
                }}
                className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-xl px-3.5 py-2.5 text-xs font-black uppercase text-[#292820] focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 hover:border-[#E6D2A3] outline-none transition-all shadow-xs cursor-pointer"
              >
                {ORIGEM_OPCOES.map((opt) => (
                  <option
                    key={opt}
                    value={opt}
                    className="bg-[#FFFFFF] text-[#292820] uppercase text-xs font-bold"
                  >
                    {opt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* SELECIONAR ROTA (MENU SUSPENSO) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                <MapPin size={12} className="text-[#C49A45]" /> SELECIONAR ROTA (DESTINO)
              </label>

              {/* Search input for filtering */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={12} className="text-[#77736B]" />
                </span>
                <input
                  type="text"
                  value={searchRota}
                  onChange={(e) => setSearchRota(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-xl pl-8 pr-3 py-2 text-xs font-black uppercase text-[#292820] focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 hover:border-[#E6D2A3] outline-none transition-all shadow-xs placeholder:text-[#77736B]"
                  placeholder="PESQUISAR ROTA..."
                />
                {searchRota && (
                  <button
                    type="button"
                    onClick={() => setSearchRota("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[10px] font-black text-[#D92332] hover:text-red-700 uppercase cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <select
                value={rota1}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setRota1(val);
                    const parts = val.split(/\s*x\s*/i);
                    const lastPart = parts[parts.length - 1]?.trim();
                    if (lastPart) {
                      setDestino(lastPart);
                    }
                  } else {
                    setRota1("");
                    setDestino("");
                  }
                }}
                className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-xl px-3.5 py-2.5 text-xs font-black uppercase text-[#292820] focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 hover:border-[#E6D2A3] outline-none transition-all shadow-xs cursor-pointer"
              >
                <option value="" className="bg-[#FFFFFF] text-[#77736B]">
                  {searchRota
                    ? "RESULTADOS DA BUSCA..."
                    : "SELECIONE A ROTA..."}
                </option>
                {rota1 &&
                  !DESTINOS_OPCOES.some(
                    (dest) =>
                      dest.replace(/^SANTA LUZIA\/MG/i, origem).toUpperCase() ===
                      rota1.toUpperCase()
                  ) && (
                    <option
                      value={rota1}
                      className="bg-[#FFFFFF] text-[#292820] uppercase text-xs font-bold"
                    >
                      {rota1.toUpperCase()}
                    </option>
                  )}
                {DESTINOS_OPCOES.filter((dest) =>
                  dest.toLowerCase().includes(searchRota.toLowerCase()),
                ).map((dest) => {
                  const displayDest = dest.replace(/^SANTA LUZIA\/MG/i, origem);
                  return (
                    <option
                      key={dest}
                      value={displayDest}
                      className="bg-[#FFFFFF] text-[#292820] uppercase text-xs font-bold"
                    >
                      {displayDest.toUpperCase()}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* TRANSPORTADORA input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                <Truck size={12} className="text-[#C49A45]" /> TRANSPORTADORA
              </label>
              <select
                value={sidebarTransportadora}
                onChange={(e) => handleSidebarTranspChange(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-xl px-3.5 py-2.5 text-xs font-black uppercase text-[#292820] focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/30 hover:border-[#E6D2A3] outline-none transition-all shadow-xs cursor-pointer"
              >
                <option value="" className="bg-[#FFFFFF] text-[#77736B]">SELECIONE...</option>
                {allTransportadoras.map((t) => (
                  <option
                    key={t}
                    value={t}
                    className="bg-[#FFFFFF] text-[#292820] uppercase text-xs font-bold"
                  >
                    {t}
                  </option>
                ))}
              </select>

              {!isAddingTransp ? (
                <button
                  type="button"
                  onClick={() => setIsAddingTransp(true)}
                  className="self-start text-[10px] font-black text-red-500 hover:text-red-400 flex items-center gap-1 mt-0.5 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  <Plus size={12} /> Adicionar Transportadora
                </button>
              ) : (
                <div className="flex flex-col gap-1.5 p-2 bg-[#FFFCF6] rounded-xl border border-[#EDE2CE] mt-0.5 shadow-xs">
                  <input
                    type="text"
                    placeholder="NOME DA TRANSPORTADORA"
                    value={newTranspName}
                    onChange={(e) => setNewTranspName(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold uppercase text-[#292820] focus:border-[#C49A45] focus:ring-1 focus:ring-[#C49A45]/20 outline-none transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomTransp();
                      }
                    }}
                  />
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingTransp(false);
                        setNewTranspName("");
                      }}
                      className="px-2 py-0.5 text-[10px] font-extrabold text-[#77736B] hover:bg-[#EDE2CE]/50 rounded uppercase transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomTransp}
                      className="px-2.5 py-0.5 text-[10px] font-extrabold text-white bg-[#D92332] hover:bg-red-700 rounded uppercase shadow-2xs transition-colors cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* COLAR DA PLANILHA (PARAMETRIZAÇÃO) textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                <FileText size={12} className="text-[#C49A45]" /> COLAR DA PLANILHA (PARAMETRIZAÇÃO)
              </label>
              <textarea
                value={pastePlanilha}
                onChange={(e) => handlePastePlanilhaChange(e.target.value)}
                rows={3}
                className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-xl px-3 py-2 text-xs font-bold text-[#292820] focus:border-[#C49A45] focus:ring-2 focus:ring-[#C49A45]/20 hover:border-[#E6D2A3] outline-none transition-all shadow-xs resize-none placeholder:text-[#77736B]"
                placeholder="Cole as linhas da planilha de iscas aqui..."
              />
            </div>

            {/* NOME MOTORISTA input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                <User size={12} className="text-[#C49A45]" /> NOME MOTORISTA
              </label>
              <input
                type="text"
                value={sidebarMotorista}
                onChange={(e) => handleSidebarMotoristaChange(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-xl px-3.5 py-2.5 text-xs font-black uppercase text-[#292820] focus:border-[#C49A45] focus:ring-2 focus:ring-[#C49A45]/20 hover:border-[#E6D2A3] outline-none transition-all shadow-xs placeholder:text-[#77736B]"
                placeholder="NOME COMPLETO"
              />
            </div>

            {/* PREFIXOS & BATERIA ISCAS */}
            <div className="flex flex-col gap-3 bg-[#FFFCF6] border border-[#EDE2CE] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                  <Sliders size={12} className="text-[#C49A45]" /> N° ISCAS (PREFIXOS & BATERIA)
                </label>
                <button
                  type="button"
                  onClick={handleCopyIscasWithSpace}
                  title="Copiar números das iscas com espaço (ex: R100002466 R100000876)"
                  className={cn(
                    "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer select-none shadow-xs",
                    copiedIscasSpace
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-[#292820] hover:bg-[#38372d] active:bg-[#1a1917] text-[#E6D2A3] border border-[#C49A45]/40 hover:shadow-xs active:scale-95"
                  )}
                >
                  {copiedIscasSpace ? (
                    <>
                      <Check size={11} className="stroke-[3]" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} className="text-[#C49A45]" />
                      <span>Copiar Iscas</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {/* ISCA 1 SECTION */}
                <div className="border-b border-[#EDE2CE] pb-2.5">
                  <span className="text-[9px] font-extrabold uppercase text-[#D92332] block mb-1">
                    DISPOSITIVO ISCA 1:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[8px] font-extrabold uppercase text-[#77736B] block mb-0.5">
                        PREFIXO:
                      </span>
                      <select
                        value={iscaPrefix1}
                        onChange={(e) => {
                          const newPrefix = e.target.value;
                          setIscaPrefix1(newPrefix);
                          const newIsca1 = newPrefix + iscaSuffix1;
                          setIsca1(newIsca1);
                          if (isPrefix30D1(newPrefix, newIsca1)) {
                            setAlertaResgate(FRASE_RESGATE_DESCARTAVEL);
                          } else if (!isDispositivoDescartavel(newPrefix, iscaPrefix2, newIsca1, isca2, numCarretas)) {
                            setAlertaResgate(FRASE_RESGATE_PADRAO);
                          }
                        }}
                        className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-lg px-2 py-1.5 text-[10px] font-black text-[#292820] focus:border-[#C49A45] outline-none cursor-pointer transition-all"
                      >
                        <option value="R100000" className="bg-[#FFFFFF] text-[#292820]">R100000</option>
                        <option value="R10000" className="bg-[#FFFFFF] text-[#292820]">R10000</option>
                        <option value="30D10000" className="bg-[#FFFFFF] text-[#292820]">30D10000</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[8px] font-extrabold uppercase text-[#77736B] block mb-0.5">
                        RESTO:
                      </span>
                      <input
                        type="text"
                        value={iscaSuffix1}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          let newPrefix = iscaPrefix1;
                          if (!iscaPrefix1.toLowerCase().startsWith("30d1")) {
                            if (val.length === 3) newPrefix = "R100000";
                            else if (val.length === 4) newPrefix = "R10000";
                          }
                          
                          setIscaSuffix1(val);
                          setIscaPrefix1(newPrefix);
                          const newIsca1 = newPrefix + val;
                          setIsca1(newIsca1);
                          if (isPrefix30D1(newPrefix, newIsca1)) {
                            setAlertaResgate(FRASE_RESGATE_DESCARTAVEL);
                          } else if (!isDispositivoDescartavel(newPrefix, iscaPrefix2, newIsca1, isca2, numCarretas)) {
                            setAlertaResgate(FRASE_RESGATE_PADRAO);
                          }
                        }}
                        className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-lg px-2 py-1.5 text-[10px] font-black text-[#292820] uppercase focus:border-[#C49A45] outline-none transition-all placeholder:text-[#77736B]"
                        placeholder="RESTO..."
                      />
                    </div>
                  </div>
                </div>

                {/* ISCA 2 SECTION */}
                {numCarretas === 2 && (
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-[#D92332] block mb-1">
                      DISPOSITIVO ISCA 2:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[8px] font-extrabold uppercase text-[#77736B] block mb-0.5">
                          PREFIXO:
                        </span>
                        <select
                          value={iscaPrefix2}
                          onChange={(e) => {
                            const newPrefix = e.target.value;
                            setIscaPrefix2(newPrefix);
                            const newIsca2 = newPrefix + iscaSuffix2;
                            setIsca2(newIsca2);
                            if (isPrefix30D1(newPrefix, newIsca2)) {
                              setAlertaResgate(FRASE_RESGATE_DESCARTAVEL);
                            } else if (!isDispositivoDescartavel(iscaPrefix1, newPrefix, isca1, newIsca2, numCarretas)) {
                              setAlertaResgate(FRASE_RESGATE_PADRAO);
                            }
                          }}
                          className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-lg px-2 py-1.5 text-[10px] font-black text-[#292820] focus:border-[#C49A45] outline-none cursor-pointer transition-all"
                        >
                          <option value="R100000" className="bg-[#FFFFFF] text-[#292820]">R100000</option>
                          <option value="R10000" className="bg-[#FFFFFF] text-[#292820]">R10000</option>
                          <option value="30D10000" className="bg-[#FFFFFF] text-[#292820]">30D10000</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[8px] font-extrabold uppercase text-[#77736B] block mb-0.5">
                          RESTO:
                        </span>
                        <input
                          type="text"
                          value={iscaSuffix2}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            let newPrefix = iscaPrefix2;
                            if (!iscaPrefix2.toLowerCase().startsWith("30d1")) {
                              if (val.length === 3) newPrefix = "R100000";
                              else if (val.length === 4) newPrefix = "R10000";
                            }
                            
                            setIscaSuffix2(val);
                            setIscaPrefix2(newPrefix);
                            const newIsca2 = newPrefix + val;
                            setIsca2(newIsca2);
                            if (isPrefix30D1(newPrefix, newIsca2)) {
                              setAlertaResgate(FRASE_RESGATE_DESCARTAVEL);
                            } else if (!isDispositivoDescartavel(iscaPrefix1, newPrefix, isca1, newIsca2, numCarretas)) {
                              setAlertaResgate(FRASE_RESGATE_PADRAO);
                            }
                          }}
                          className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-lg px-2 py-1.5 text-[10px] font-black text-[#292820] uppercase focus:border-[#C49A45] outline-none transition-all placeholder:text-[#77736B]"
                          placeholder="RESTO..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* VISUAL PREVIEW & QUICK COPY BAR */}
                {getIscasSpaceSeparated() ? (
                  <div
                    onClick={handleCopyIscasWithSpace}
                    title="Clique para copiar com espaço"
                    className="flex items-center justify-between bg-[#F5F0E6] border border-[#EDE2CE] hover:border-[#C49A45] rounded-xl px-3 py-2 cursor-pointer transition-all group shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="text-[8px] font-extrabold uppercase text-[#77736B] shrink-0">ISCAS:</span>
                      <span className="text-[11px] font-mono font-black text-[#292820] group-hover:text-[#D92332] tracking-wider truncate">
                        {getIscasSpaceSeparated()}
                      </span>
                    </div>
                    <div className="shrink-0 ml-1.5 flex items-center gap-1 text-[8px] font-black uppercase text-[#77736B] group-hover:text-[#D92332] transition-colors">
                      {copiedIscasSpace ? (
                        <span className="text-emerald-700 font-black flex items-center gap-0.5">
                          <Check size={11} className="stroke-[3]" /> Copiado
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[#292820]">
                          <Copy size={11} className="text-[#C49A45]" /> Copiar
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>



            {/* EMBARQUE (CARRETA 1) */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#EDE2CE]">
              <div 
                onClick={() => setCarreta1Minimized(prev => !prev)}
                className="flex items-center justify-between cursor-pointer select-none group"
              >
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1.5 cursor-pointer">
                  <span>Embarque (carreta 1)</span>
                  {carreta1 && <span className="text-[9px] font-mono text-[#292820] font-black">({carreta1})</span>}
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCarreta1Minimized(prev => !prev);
                  }}
                  className="p-1 text-[#C49A45] hover:text-[#292820] rounded transition-colors cursor-pointer"
                  title={carreta1Minimized ? "Maximizar Carreta 1" : "Minimizar Carreta 1"}
                >
                  {carreta1Minimized ? <ChevronDown size={14} className="stroke-[3]" /> : <ChevronUp size={14} className="stroke-[3]" />}
                </button>
              </div>

              {!carreta1Minimized && (
                <>
                  <div className="grid grid-cols-2 gap-1.5">
                    {EMBARQUE_IMAGES.map((img) => {
                      const isSelected = sidebarEmbarque1 === img.value;
                      let displayLabel = img.label.toUpperCase();
                      if (img.value === "https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF") {
                        displayLabel = "EMBARQUE (PALETIZADO)";
                      } else if (img.value === "none") {
                        displayLabel = "SEM ISCA";
                      }

                      return (
                        <button
                          key={img.value}
                          type="button"
                          onClick={() => setSidebarEmbarque1(img.value)}
                          className={cn(
                            "px-2 py-2 rounded-xl text-[9px] font-black uppercase text-center transition-all cursor-pointer border leading-tight flex items-center justify-center min-h-[38px]",
                            isSelected
                              ? "bg-[#292820] text-[#E6D2A3] border-[#C49A45]/40 shadow-xs"
                              : "bg-[#FFFFFF] text-[#292820] border-[#EDE2CE] hover:bg-[#EDE2CE]/50"
                          )}
                        >
                          {displayLabel}
                        </button>
                      );
                    })}
                  </div>

                  {/* Preview Box Carreta 1 */}
                  <div className="mt-1 bg-[#F5F0E6] border border-[#EDE2CE] rounded-xl p-2.5 flex flex-col items-center justify-center min-h-[95px]">
                    {sidebarEmbarque1 && sidebarEmbarque1 !== "none" ? (
                      <div className="flex flex-col items-center w-full">
                        <img
                          src={sidebarEmbarque1}
                          alt="Esquema Carreta 1"
                          className="max-h-[80px] max-w-full object-contain rounded"
                          onError={(e) => {
                            const fallback = getLocalFallbackImg(sidebarEmbarque1);
                            if (fallback && e.currentTarget.src !== fallback) {
                              e.currentTarget.src = fallback;
                            }
                          }}
                        />
                        <span className="text-[9px] font-black text-[#292820] uppercase mt-1.5 text-center">
                          CARRETA 1: {carreta1 || "S/ PLACA"}
                        </span>
                      </div>
                    ) : sidebarEmbarque1 === "" ? (
                      <div className="text-center">
                        <span className="text-[10px] font-extrabold text-[#292820] uppercase block">Grade Interativa Ativa</span>
                        <span className="text-[9px] text-[#77736B]">Clique nas células no gerador.</span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-extrabold text-[#77736B] uppercase">SEM ISCA NA CARRETA 1</span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* EMBARQUE (CARRETA 2) */}
            {numCarretas === 2 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#EDE2CE]">
                <div 
                  onClick={() => setCarreta2Minimized(prev => !prev)}
                  className="flex items-center justify-between cursor-pointer select-none group"
                >
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1.5 cursor-pointer">
                    <span>Embarque (carreta 2)</span>
                    {carreta2 && <span className="text-[9px] font-mono text-[#292820] font-black">({carreta2})</span>}
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCarreta2Minimized(prev => !prev);
                    }}
                    className="p-1 text-[#C49A45] hover:text-[#292820] rounded transition-colors cursor-pointer"
                    title={carreta2Minimized ? "Maximizar Carreta 2" : "Minimizar Carreta 2"}
                  >
                    {carreta2Minimized ? <ChevronDown size={14} className="stroke-[3]" /> : <ChevronUp size={14} className="stroke-[3]" />}
                  </button>
                </div>

                {!carreta2Minimized && (
                  <>
                    <div className="grid grid-cols-2 gap-1.5">
                      {EMBARQUE_IMAGES.map((img) => {
                        const isSelected = sidebarEmbarque2 === img.value;
                        let displayLabel = img.label.toUpperCase();
                        if (img.value === "https://lh3.googleusercontent.com/d/1Ra4uncQihpKaqQi18fu0pKPt1NkzDNyF") {
                          displayLabel = "EMBARQUE (PALETIZADO)";
                        } else if (img.value === "none") {
                          displayLabel = "SEM ISCA";
                        }

                        return (
                          <button
                            key={img.value}
                            type="button"
                            onClick={() => setSidebarEmbarque2(img.value)}
                            className={cn(
                              "px-2 py-2 rounded-xl text-[9px] font-black uppercase text-center transition-all cursor-pointer border leading-tight flex items-center justify-center min-h-[38px]",
                              isSelected
                                ? "bg-[#292820] text-[#E6D2A3] border-[#C49A45]/40 shadow-xs"
                                : "bg-[#FFFFFF] text-[#292820] border-[#EDE2CE] hover:bg-[#EDE2CE]/50"
                            )}
                          >
                            {displayLabel}
                          </button>
                        );
                      })}
                    </div>

                    {/* Preview Box Carreta 2 */}
                    <div className="mt-1 bg-[#F5F0E6] border border-[#EDE2CE] rounded-xl p-2.5 flex flex-col items-center justify-center min-h-[95px]">
                      {sidebarEmbarque2 && sidebarEmbarque2 !== "none" ? (
                        <div className="flex flex-col items-center w-full">
                          <img
                            src={sidebarEmbarque2}
                            alt="Esquema Carreta 2"
                            className="max-h-[80px] max-w-full object-contain rounded"
                            onError={(e) => {
                              const fallback = getLocalFallbackImg(sidebarEmbarque2);
                              if (fallback && e.currentTarget.src !== fallback) {
                                e.currentTarget.src = fallback;
                              }
                            }}
                          />
                          <span className="text-[9px] font-black text-[#292820] uppercase mt-1.5 text-center">
                            CARRETA 2: {carreta2 || "S/ PLACA"}
                          </span>
                        </div>
                      ) : sidebarEmbarque2 === "" ? (
                        <div className="text-center">
                          <span className="text-[10px] font-extrabold text-[#292820] uppercase block">Grade Interativa Ativa</span>
                          <span className="text-[9px] text-[#77736B]">Clique nas células no gerador.</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-extrabold text-[#77736B] uppercase">SEM ISCA NA CARRETA 2</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Buttons area */}
            <div className="flex flex-col gap-3 mt-2">
              {/* COPIAR PARA EMAIL BUTTON */}
              <button
                onClick={handleCopyToEmail}
                className={cn(
                  "w-full text-[11px] font-extrabold uppercase tracking-widest py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer border",
                  copied
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-900/10"
                    : "bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border-[#C49A45]/40"
                )}
              >
                {copied ? (
                  <>
                    <Check size={14} className="stroke-[3] text-white" /> COPIADO COM SUCESSO!
                  </>
                ) : (
                  <>
                    <Mail size={14} className="stroke-[2.5] text-[#C49A45]" /> COPIAR PARA EMAIL
                  </>
                )}
              </button>

              {/* LIMPAR INFORMAÇÕES BUTTON */}
              <button
                onClick={handleClear}
                className="w-full bg-[#FFFCF6] hover:bg-[#EDE2CE]/50 text-[#77736B] hover:text-[#292820] text-[11px] font-extrabold uppercase tracking-widest py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-[#EDE2CE] transition-all active:scale-98 cursor-pointer"
              >
                <Trash2 size={14} className="stroke-[2.5]" /> LIMPAR INFORMAÇÕES
              </button>
            </div>


          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: Vehicle & Cargo Column (fixed width) */}
      <div
        className={cn(
          "col-span-1 xl:col-span-1 flex flex-col transition-all duration-300",
          preAlertaMode === "minimized" && "origin-top"
        )}
        style={preAlertaMode === "minimized" ? { zoom: colunasZoom } : undefined}
      >
        <div className={cn(
          "rounded-3xl bg-[#FFFCF6] border border-[#E6D2A3] shadow-sm relative overflow-hidden flex flex-col p-4 sm:p-5 transition-all text-[#292820]",
          preAlertaMode === "minimized" && "border-[#C49A45] shadow-md ring-1 ring-[#C49A45]/30"
        )}>
          {/* Form Header */}
          <div className="border-b border-[#EDE2CE] pb-4 mb-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D92332] block">
                  Painel de Viagem
                </span>
                {preAlertaMode === "minimized" && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                    Zoom {Math.round(colunasZoom * 100)}%
                  </span>
                )}
              </div>
              <h3 className="text-base font-sans font-black text-[#292820] uppercase tracking-tight mt-0.5 flex items-center gap-2">
                <Truck size={18} className="text-[#C49A45]" /> Veículo & Carga
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              {preAlertaMode === "minimized" && (
                <div className="flex items-center bg-[#F5F0E6] border border-[#EDE2CE] rounded-lg p-0.5 text-[10px] font-black shadow-xs">
                  <button
                    type="button"
                    onClick={() => setColunasZoom((z) => Math.max(0.8, parseFloat((z - 0.05).toFixed(2))))}
                    title="Diminuir Zoom"
                    className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#EDE2CE] text-[#292820] active:scale-95 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-1.5 font-mono text-[#292820]">{Math.round(colunasZoom * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setColunasZoom((z) => Math.min(1.35, parseFloat((z + 0.05).toFixed(2))))}
                    title="Aumentar Zoom"
                    className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#EDE2CE] text-[#292820] active:scale-95 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={handleClearVeiculo}
                className="p-2 text-[#77736B] hover:text-[#D92332] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Limpar formulário de Veículo & Carga"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Form inputs */}
          <div className="flex flex-col gap-4">
            {/* CAVALO / PLACA */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                <Truck size={12} className="text-[#C49A45]" /> Placa
              </label>
              <input
                type="text"
                value={cavalo}
                onChange={(e) => setCavalo(e.target.value.replace(/-/g, "").toUpperCase())}
                className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-xl px-3.5 py-2.5 text-xs font-black uppercase text-[#292820] focus:border-[#C49A45] focus:ring-2 focus:ring-[#C49A45]/20 hover:border-[#E6D2A3] outline-none transition-all shadow-xs placeholder:text-[#77736B]"
                placeholder="PLACA"
              />
            </div>

            {/* CARRETA 1 GROUP */}
            <div className="flex flex-col gap-3 p-3 bg-[#F5F0E6] rounded-2xl border border-[#EDE2CE] shadow-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                    <Truck size={10} className="text-[#C49A45]" /> Carreta 1
                  </label>
                  <input
                    type="text"
                    value={carreta1}
                    onChange={(e) => setCarreta1(e.target.value.toUpperCase())}
                    className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#292820] focus:border-[#C49A45] outline-none transition-all shadow-2xs placeholder:text-[#77736B]"
                    placeholder="CARRETA 1"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                    <Package size={10} className="text-[#C49A45]" /> Produto 1
                  </label>
                  <input
                    type="text"
                    value={produto1}
                    onChange={(e) => setProduto1(e.target.value.toUpperCase())}
                    className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#292820] focus:border-[#C49A45] outline-none transition-all shadow-2xs placeholder:text-[#77736B]"
                    placeholder="PRODUTO 1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                    <Hash size={10} className="text-[#C49A45]" /> U.M.A. 1
                  </label>
                  <input
                    type="text"
                    value={uma1}
                    onChange={(e) => setUma1(formatUMA(e.target.value))}
                    className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#292820] focus:border-[#C49A45] outline-none transition-all shadow-2xs placeholder:text-[#77736B]"
                    placeholder="0XX.XXX.XXX.XXX"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                    <FileText size={10} className="text-[#C49A45]" /> NF Início
                  </label>
                  <input
                    type="text"
                    value={nfInicio}
                    onChange={(e) => setNfInicio(e.target.value.replace(/-/g, "").toUpperCase())}
                    className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#292820] focus:border-[#C49A45] outline-none transition-all shadow-2xs placeholder:text-[#77736B]"
                    placeholder="INÍCIO"
                  />
                </div>
              </div>
            </div>

            {/* CARRETA 2 GROUP */}
            {numCarretas === 2 && (
              <div className="flex flex-col gap-3 p-3 bg-[#F5F0E6] rounded-2xl border border-[#EDE2CE] shadow-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                      <Truck size={10} className="text-[#C49A45]" /> Carreta 2
                    </label>
                    <input
                      type="text"
                      value={carreta2}
                      onChange={(e) => setCarreta2(e.target.value.toUpperCase())}
                      className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#292820] focus:border-[#C49A45] outline-none transition-all shadow-2xs placeholder:text-[#77736B]"
                      placeholder="CARRETA 2"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                      <Package size={10} className="text-[#C49A45]" /> Produto 2
                    </label>
                    <input
                      type="text"
                      value={produto2}
                      onChange={(e) => setProduto2(e.target.value.toUpperCase())}
                      className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#292820] focus:border-[#C49A45] outline-none transition-all shadow-2xs placeholder:text-[#77736B]"
                      placeholder="PRODUTO 2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className={isca2 === "SEM ISCA" ? "col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"}>
                    <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                      <Hash size={10} className="text-[#C49A45]" /> U.M.A. 2
                    </label>
                    <input
                      type="text"
                      value={uma2}
                      onChange={(e) => setUma2(formatUMA(e.target.value))}
                      className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#292820] focus:border-[#C49A45] outline-none transition-all shadow-2xs placeholder:text-[#77736B]"
                      placeholder="0XX.XXX.XXX.XXX"
                    />
                  </div>
                  {isca2 !== "SEM ISCA" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                        <FileText size={10} className="text-[#C49A45]" /> NF Fim
                      </label>
                      <input
                        type="text"
                        value={nfFim}
                        onChange={(e) => setNfFim(e.target.value.replace(/-/g, "").toUpperCase())}
                        className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-lg px-2.5 py-2 text-[11px] font-black uppercase text-[#292820] focus:border-[#C49A45] outline-none transition-all shadow-2xs placeholder:text-[#77736B]"
                        placeholder="FIM"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QUICK ACTIONS BAR (SWAP CARRETAS) */}
            <div className="bg-[#F5F0E6] border border-[#EDE2CE] rounded-2xl p-3 flex flex-col gap-2 shadow-xs">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#D92332] flex items-center gap-1">
                <Sliders size={11} className="text-[#C49A45]" /> Trocar Placas:
              </span>
              <button
                type="button"
                onClick={handleSwapCarretas}
                title="Inverter as placas das colunas Carreta 1 e Carreta 2"
                className="w-full flex items-center justify-center gap-1.5 bg-[#FFFCF6] hover:bg-[#EDE2CE]/50 text-[#292820] border border-[#EDE2CE] font-black uppercase text-[10px] py-2 px-3 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <ArrowUpDown size={12} className="text-[#C49A45] stroke-[2.5]" />
                <span>Carreta 1 ⇄ 2</span>
              </button>
            </div>

            {/* VALOR DA CARGA (SANTA LUZIA) */}
            <div className="flex flex-col gap-1.5 p-3 bg-[#F5F0E6] rounded-2xl border border-[#EDE2CE] shadow-xs">
              <label className="text-[9px] font-extrabold uppercase tracking-wider text-[#D92332] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <DollarSign size={10} className="text-[#C49A45]" /> Valor da Carga (NF)
                </span>
                {valorCarga && (
                  <span className="text-[8px] bg-[#EDE2CE] text-[#292820] px-1.5 py-0.5 rounded font-black border border-[#E6D2A3]">
                    SANTA LUZIA
                  </span>
                )}
              </label>
              <input
                type="text"
                value={valorCarga}
                onChange={(e) => setValorCarga(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#EDE2CE] rounded-xl px-3 py-2 text-xs font-black uppercase text-[#292820] focus:border-[#C49A45] outline-none transition-all shadow-2xs placeholder:text-[#77736B]"
                placeholder="R$ 0,00"
                title="Importado da coluna VALOR NF na aba SANTA LUZIA"
              />
            </div>


          </div>
        </div>
      </div>
      </div>

      {/* SEÇÃO DE CÓPIA PARA PLANILHA GOOGLE (LINHAS DE ISCA) */}
      <div className="w-full mt-8 bg-[#FFFCF6] border border-[#E6D2A3] rounded-3xl shadow-sm overflow-hidden flex flex-col p-5 sm:p-7 text-[#25231F]">
        {/* Header banner */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-[#EDE2CE]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#EDE2CE] text-[#292820] border border-[#E6D2A3] rounded-2xl shadow-xs shrink-0">
              <FileSpreadsheet size={24} className="text-[#C49A45]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#292820] bg-[#EDE2CE] px-2.5 py-0.5 rounded-md border border-[#E6D2A3]">
                  Planilha Google / Excel
                </span>
              </div>
              <h3 className="text-base font-sans font-black text-[#292820] uppercase tracking-tight mt-1 flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[#C49A45]" /> Copiar Linhas de Iscas para Planilha Google
              </h3>
              <p className="text-xs text-[#77736B] font-semibold mt-0.5">
                Copie a frase de embarque das iscas, linhas individuais ou a tabela completa para colar no Google Sheets (Ctrl+V)
              </p>
            </div>
          </div>

          {/* Batch Copy Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={handleCopyFraseEmbarque}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-xs border flex items-center gap-2 transition-all cursor-pointer active:scale-95",
                copiedFraseEmbarque
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-[#292820] hover:bg-[#38372d] text-[#E6D2A3] border border-[#C49A45]/40"
              )}
              title="Copiar frase de embarque com dia/mês e destino do pré-alerta"
            >
              {copiedFraseEmbarque ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} className="text-[#C49A45]" />}
              <span>{copiedFraseEmbarque ? "Frase Copiada!" : "Copiar Frase"}</span>
            </button>

            <button
              type="button"
              onClick={() => copyAllIscaRowsToClipboard(false)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-xs border flex items-center gap-2 transition-all cursor-pointer active:scale-95",
                copiedIscaDataOnly
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-[#FFFCF6] hover:bg-[#EDE2CE]/50 text-[#292820] border border-[#EDE2CE]"
              )}
              title="Copiar todas as linhas de iscas da tabela (Ctrl+V)"
            >
              {copiedIscaDataOnly ? <Check size={14} className="stroke-[3]" /> : <Copy size={14} className="text-[#C49A45]" />}
              <span>{copiedIscaDataOnly ? "Linhas Copiadas!" : "Copiar Todas as Linhas"}</span>
            </button>
          </div>
        </div>

        {/* Spreadsheet Mock Preview Table */}
        <div className="mt-5 w-full rounded-2xl border border-[#EDE2CE] overflow-x-auto shadow-xs bg-[#FFFCF6]">
          <div className="min-w-[1000px]">
            {/* Column Letters Bar A-H */}
            <div className="grid grid-cols-[130px_160px_140px_140px_110px_110px_110px_1fr_120px] bg-[#F5F0E6] border-b border-[#EDE2CE] text-[10px] font-black text-[#77736B] text-center py-1 divide-x divide-[#EDE2CE]">
              <div>A</div>
              <div>B</div>
              <div>C</div>
              <div>D</div>
              <div>E</div>
              <div>F</div>
              <div>G</div>
              <div>H</div>
              <div>AÇÃO</div>
            </div>

            {/* Header Row */}
            <div className="grid grid-cols-[130px_160px_140px_140px_110px_110px_110px_1fr_120px] bg-[#292820] text-[#E6D2A3] text-[11px] font-black uppercase py-2.5 divide-x divide-[#38372d] border-b border-[#38372d] items-center">
              <div className="px-2 text-center">ID ISCA</div>
              <div className="px-2 text-center">DESTINO</div>
              <div className="px-2 text-center">STATUS</div>
              <div className="px-2 text-center">OBS 1</div>
              <div className="px-2 text-center">DATA STATUS</div>
              <div className="px-2 text-center">CARRETA</div>
              <div className="px-2 text-center">CAVALO</div>
              <div className="px-2 text-center">MOTORISTA</div>
              <div className="px-2 text-center">AÇÃO</div>
            </div>

            {/* Data Rows */}
            <div className="divide-y divide-[#CBD5E1] bg-white text-[#1E293B] font-sans">
              {/* Row 1 (Isca 1) */}
              <div className="grid grid-cols-[130px_160px_140px_140px_110px_110px_110px_1fr_120px] divide-x divide-[#CBD5E1] items-center hover:bg-[#F4F8FA] transition-colors">
                {/* ID ISCA */}
                <div className="p-2 font-black text-xs text-stone-900 text-center">
                  <input
                    type="text"
                    value={isca1}
                    onChange={(e) => handleIsca1Change(e.target.value)}
                    className="w-full text-center bg-transparent font-black text-xs text-stone-900 outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                    placeholder="R100000..."
                  />
                </div>

                {/* DESTINO */}
                <div className="p-2 font-black text-xs text-stone-900 text-center uppercase relative flex items-center justify-center">
                  <select
                    value={cleanDestinoForPlanilha(destino)}
                    onChange={(e) => setDestino(e.target.value)}
                    className="w-full text-center bg-transparent font-black text-xs text-stone-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-2 py-0.5 border border-transparent focus:border-emerald-500 cursor-pointer appearance-none pr-4"
                  >
                    <option value="" disabled className="text-stone-400 font-bold">SELECIONE</option>
                    {cleanDestinoForPlanilha(destino) && !DESTINOS_PLANILHA_ISCAS.includes(cleanDestinoForPlanilha(destino)) && (
                      <option value={cleanDestinoForPlanilha(destino)} className="text-stone-900 font-black">{cleanDestinoForPlanilha(destino)}</option>
                    )}
                    {DESTINOS_PLANILHA_ISCAS.map((dest) => (
                      <option key={dest} value={dest} className="text-stone-900 font-black">
                        {dest}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-600 text-[9px]">▼</span>
                </div>

                {/* STATUS */}
                <div className="p-2 text-center font-black text-xs uppercase">
                  <input
                    type="text"
                    value={statusIsca1}
                    onChange={(e) => setStatusIsca1(e.target.value)}
                    className="w-full text-center bg-transparent font-black text-xs text-stone-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                    placeholder="EM ROTA(IDA)"
                  />
                </div>

                {/* OBS 1 */}
                <div className="p-2 text-center font-black text-xs uppercase">
                  <input
                    type="text"
                    value={obs1Isca1}
                    onChange={(e) => setObs1Isca1(e.target.value)}
                    className="w-full text-center bg-transparent font-black text-xs text-stone-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                    placeholder="PRÉ ALERTA OK"
                  />
                </div>

                {/* DATA STATUS */}
                <div className="p-2 text-center font-bold text-xs text-stone-900">
                  <input
                    type="text"
                    value={dataStatusIsca1}
                    onChange={(e) => setDataStatusIsca1(e.target.value)}
                    className="w-full text-center bg-transparent font-bold text-xs text-stone-900 outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                    placeholder="28.jul."
                  />
                </div>

                {/* CARRETA */}
                <div className="p-2 text-center font-black text-xs text-stone-900 uppercase">
                  <input
                    type="text"
                    value={carreta1}
                    onChange={(e) => setCarreta1(e.target.value.toUpperCase())}
                    className="w-full text-center bg-transparent font-black text-xs text-stone-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                    placeholder="CARRETA 1"
                  />
                </div>

                {/* CAVALO */}
                <div className="p-2 text-center font-black text-xs text-stone-900 uppercase">
                  <input
                    type="text"
                    value={cavalo}
                    onChange={(e) => setCavalo(e.target.value.toUpperCase())}
                    className="w-full text-center bg-transparent font-black text-xs text-stone-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                    placeholder="CAVALO"
                  />
                </div>

                {/* MOTORISTA */}
                <div className="p-2 font-black text-xs text-stone-900 uppercase">
                  <input
                    type="text"
                    value={motorista || sidebarMotorista}
                    onChange={(e) => handleTableMotoristaChange(e.target.value)}
                    className="w-full bg-transparent font-black text-xs text-stone-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                    placeholder="NOME MOTORISTA"
                  />
                </div>

                {/* AÇÃO (COPIAR LINHA 1) */}
                <div className="p-1.5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => copyIscaRowToClipboard(getIscaRows()[0], false, false)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm border flex items-center gap-1 transition-all cursor-pointer active:scale-95",
                      copiedIscaRow1
                        ? "bg-[#7F1D1D] text-white border-[#7F1D1D]"
                        : "bg-[#B91C1C] border-[#B91C1C] hover:bg-[#991B1B] hover:border-[#991B1B] text-white"
                    )}
                    title="Copiar esta linha para colar no Google Sheets (Ctrl+V)"
                  >
                    {copiedIscaRow1 ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedIscaRow1 ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
              </div>

              {/* Row 2 (Isca 2, if 2 carretas and isca2 is set and not "SEM ISCA") */}
              {numCarretas === 2 && isca2 && isca2 !== "SEM ISCA" && (
                <div className="grid grid-cols-[130px_160px_140px_140px_110px_110px_110px_1fr_120px] divide-x divide-stone-300 items-center hover:bg-emerald-50 transition-colors">
                  {/* ID ISCA */}
                  <div className="p-2 font-black text-xs text-stone-900 text-center">
                    <input
                      type="text"
                      value={isca2}
                      onChange={(e) => handleIsca2Change(e.target.value)}
                      className="w-full text-center bg-transparent font-black text-xs text-stone-900 outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                      placeholder="R100000..."
                    />
                  </div>

                  {/* DESTINO */}
                  <div className="p-2 font-black text-xs text-stone-900 text-center uppercase relative flex items-center justify-center">
                    <select
                      value={cleanDestinoForPlanilha(destino)}
                      onChange={(e) => setDestino(e.target.value)}
                      className="w-full text-center bg-transparent font-black text-xs text-stone-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-2 py-0.5 border border-transparent focus:border-emerald-500 cursor-pointer appearance-none pr-4"
                    >
                      <option value="" disabled className="text-stone-400 font-bold">SELECIONE</option>
                      {cleanDestinoForPlanilha(destino) && !DESTINOS_PLANILHA_ISCAS.includes(cleanDestinoForPlanilha(destino)) && (
                        <option value={cleanDestinoForPlanilha(destino)} className="text-stone-900 font-black">{cleanDestinoForPlanilha(destino)}</option>
                      )}
                      {DESTINOS_PLANILHA_ISCAS.map((dest) => (
                        <option key={dest} value={dest} className="text-stone-900 font-black">
                          {dest}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-600 text-[9px]">▼</span>
                  </div>

                  {/* STATUS */}
                  <div className="p-2 text-center font-black text-xs uppercase">
                    <input
                      type="text"
                      value={statusIsca2}
                      onChange={(e) => setStatusIsca2(e.target.value)}
                      className="w-full text-center bg-transparent font-black text-xs text-stone-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                      placeholder="EM ROTA(IDA)"
                    />
                  </div>

                  {/* OBS 1 */}
                  <div className="p-2 text-center font-black text-xs uppercase">
                    <input
                      type="text"
                      value={obs1Isca2}
                      onChange={(e) => setObs1Isca2(e.target.value)}
                      className="w-full text-center bg-transparent font-black text-xs text-stone-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                      placeholder="PRÉ ALERTA OK"
                    />
                  </div>

                  {/* DATA STATUS */}
                  <div className="p-2 text-center font-bold text-xs text-stone-900">
                    <input
                      type="text"
                      value={dataStatusIsca2}
                      onChange={(e) => setDataStatusIsca2(e.target.value)}
                      className="w-full text-center bg-transparent font-bold text-xs text-stone-900 outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                      placeholder="28.jul."
                    />
                  </div>

                  {/* CARRETA */}
                  <div className="p-2 text-center font-black text-xs text-stone-900 uppercase">
                    <input
                      type="text"
                      value={carreta2}
                      onChange={(e) => setCarreta2(e.target.value.toUpperCase())}
                      className="w-full text-center bg-transparent font-black text-xs text-stone-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                      placeholder="CARRETA 2"
                    />
                  </div>

                  {/* CAVALO */}
                  <div className="p-2 text-center font-black text-xs text-stone-900 uppercase">
                    <input
                      type="text"
                      value={cavalo}
                      onChange={(e) => setCavalo(e.target.value.toUpperCase())}
                      className="w-full text-center bg-transparent font-black text-xs text-stone-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                      placeholder="CAVALO"
                    />
                  </div>

                  {/* MOTORISTA */}
                  <div className="p-2 font-black text-xs text-stone-900 uppercase">
                    <input
                      type="text"
                      value={motorista || sidebarMotorista}
                      onChange={(e) => handleTableMotoristaChange(e.target.value)}
                      className="w-full bg-transparent font-black text-xs text-stone-900 uppercase outline-none hover:bg-white/80 focus:bg-white rounded px-1 py-0.5 border border-transparent focus:border-emerald-500"
                      placeholder="NOME MOTORISTA"
                    />
                  </div>

                  {/* AÇÃO (COPIAR LINHA 2) */}
                  <div className="p-1.5 flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const rows = getIscaRows();
                        if (rows.length > 1) {
                          copyIscaRowToClipboard(rows[1], false, true);
                        }
                      }}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm border flex items-center gap-1 transition-all cursor-pointer active:scale-95",
                        copiedIscaRow2
                          ? "bg-[#7F1D1D] text-white border-[#7F1D1D]"
                          : "bg-[#B91C1C] border-[#B91C1C] hover:bg-[#991B1B] hover:border-[#991B1B] text-white"
                      )}
                      title="Copiar esta linha para colar no Google Sheets (Ctrl+V)"
                    >
                      {copiedIscaRow2 ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedIscaRow2 ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Dedicado com a Frase de Embarque das Iscas (POR ÚLTIMO NA PÁGINA) */}
        <div className="mt-5 bg-gradient-to-r from-red-50/80 via-white to-red-50/50 border-2 border-red-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-red-600 text-white shadow-xs flex items-center justify-center shrink-0">
              <Radio size={22} className="animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-800 bg-red-100/90 px-2.5 py-0.5 rounded-md border border-red-200">
                  Frase de Embarque das Iscas
                </span>
                <span className="text-[10px] text-stone-500 font-bold">
                  (Dia/Mês da Criação do Pré-Alerta + Destino)
                </span>
              </div>
              <div 
                onClick={handleCopyFraseEmbarque}
                title="Clique para copiar a frase"
                className="text-xs sm:text-sm md:text-base font-mono font-black text-stone-950 tracking-tight select-all bg-white border border-red-200 hover:border-red-400 rounded-xl px-3.5 py-2 inline-flex items-center gap-2 cursor-pointer shadow-xs transition-all hover:bg-red-50/40 max-w-full"
              >
                <span className="text-red-600 font-extrabold text-[11px] uppercase tracking-wider shrink-0 font-sans">FRASE:</span>
                <span className="truncate">"{getFraseEmbarqueIsca()}"</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyFraseEmbarque}
            className={cn(
              "w-full md:w-auto px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm border flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0 select-none",
              copiedFraseEmbarque
                ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500"
                : "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:shadow-md"
            )}
            title="Copiar texto da frase de embarque"
          >
            {copiedFraseEmbarque ? (
              <>
                <Check size={16} className="stroke-[3]" /> COPIADO!
              </>
            ) : (
              <>
                <Copy size={16} className="stroke-[2.5]" /> COPIAR FRASE
              </>
            )}
          </button>
        </div>
      </div>
      </div>
      )}
      </div>
      </div>
  );
}
