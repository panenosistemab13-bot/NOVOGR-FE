import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clipboard, 
  Sparkles, 
  Check, 
  Search, 
  Copy, 
  Trash2, 
  FileSpreadsheet, 
  Truck, 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Filter, 
  RefreshCw,
  Zap,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { safeCopyText, safeCopyHtmlAndText } from '../utils/clipboard';

export interface DisponibilidadeRow {
  id: string;
  itemNum: string;
  origem: string;
  dia: string;
  data: string;
  contatoWhats: string;
  horaLiberado: string;
  status: string;
  modeloCarreta: string;
  modeloCavalo: string;
  fezContato: string;
  destino: string;
  transportador: string;
  cavalo: string;
  carreta: string;
  numPallets: string;
  pbtTon: string;
  m3: string;
  categoria: string;
  tecnologia: string;
  condutor: string;
  cpf: string;
  rgSap: string;
  cnh: string;
  telefone: string;
  vigenciaCadastro: string;
  codTransportadora: string;
  idCargaLacre: string;
  estadoMotorista: string;
  estadoCavalo: string;
  estadoCarreta: string;
  tresCargo: string;
  carregou: string;
  termo: string;
  valorNf: string;
  operacao: string;
}

const SAMPLE_TSV_DATA = `1	SANTA LUZIA|MG	quarta-feira	30/09/2026	13:35:00	13:38:00	LIBERADO PARA VISTORIA EM DOCA	SIDER	TRUCADO	SIM	GRAVATAÍ	TOMASI	QJP6G00	TPP0B24	28	20		AGREGADO	SASCAR	GEOVAN DA CRUZ	018.957.500-08	6094609051 SSP RS	05194859653	5554 9 9630-4292	SEGURO PROPRIO	1000000496		RS	RS	SC	SIM	NÃO	NÃO		SEGURO PRÓPRIO
2	VIANA|ES	quinta-feira	01/10/2026	X	09:32:22	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TRUCADO	SIM	GUARULHOS	TRANSMAGNA	RXV2B08	QTL0043	28	30	105 m³	FROTA	SIGHRA	JEFTI GASPAR MARTINS DE ALBUQUERQUE	112.466.796-20	MG13146074	05226335502	5512 9 8806-0203	SEGURO PROPRIO	1000352516		MG	SC	SC	SIM	NÃO	NÃO		SEGURO PRÓPRIO
3	SANTA LUZIA|MG	quinta-feira	01/10/2026	X	16:51:26	LIBERADO PARA VISTORIA EM DOCA	SIDER	TRUCADO	SIM	LONDRINA	RNCGG	SJK8D86	QSP8G68	30	28	114 m³	FROTA	ONIXSAT	VALMIR DAMASIO DOS SANTOS	051.630.335-06	1578854458 IFP BA	05630213625	5531 9 9537-9900	SEGURO PROPRIO	1000883333		BA	BA	SP	SIM	NÃO	NÃO		SEGURO PRÓPRIO
4	MONTES CLAROS|MG	quinta-feira	01/10/2026	X	16:39:56	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	RIO DE JANEIRO	MOEDENSE	TYQ6F08	TYQ6F11	24	22		FROTA	SASCAR	RONALDO ADRIANO DA SILVA	081.061.477-46	MG10510910 SSP MG	02715478399	5531 9 9291-7017	20/10/2026	1000187281		MG	MG	MG	SIM	NÃO	SIM		MACRO
5	MONTES CLAROS|MG	quinta-feira	01/10/2026	X	16:39:56	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	RIO DE JANEIRO	MOEDENSE	TYQ6F08	TYQ6F14	24	22		FROTA	SASCAR	RONALDO ADRIANO DA SILVA	081.061.477-46	MG10510910 SSP MG	02715478399	5531 9 9291-7017	20/10/2026	1000187281		MG	MG	MG	SIM	NÃO	SIM		MACRO
6	SANTA LUZIA|MG	sexta-feira	02/10/2026	06:50:00	07:03:00	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TRUCADO	SIM	GUARULHOS	TRANSMAGNA	RLM7H73	MLU5606	30	30		FROTA	SIGHRA	SANCLER DE OLIVEIRA  GRIJO	147.283.967-62	223656406	06426933371	5521 9 9065-4514	SEGURO PROPRIO	1000352516		RJ	SC	SC	SIM	NÃO	NÃO		SEGURO PRÓPRIO
7	SANTA LUZIA|MG	sexta-feira	02/10/2026	16:00:00	16:02:00	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TRUCADO	SIM	GUARULHOS	TRANSMAGNA	TAR1F47	TQA0G70	28	30		FROTA	SIGHRA	LUIS HENRIQUE SANTOS DE OLIVEIRA	606.308.943-88	5004331 MT CE	06167518118	5567 9 9991-1758	SEGURO PROPRIO	1000352516		CE	PR	SC	SIM	NÃO	SIM		SEGURO PRÓPRIO
8	SANTA LUZIA|MG	sexta-feira	02/10/2026	17:20:00	17:27:00	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TRUCADO	SIM	GUARULHOS	TRANSMAGNA	RYB7C69	FWJ1506	28	30	116 m³	FROTA	SIGHRA	ALEXSANDRO VICENTE LOPOES	114.430.787-27	132471384 DIC RJ	03804610065	5521 9 9584-0950	SEGURO PROPRIO	1000352516		RJ	SC	SC	SIM	NÃO	NÃO		SEGURO PRÓPRIO
9	SANTA LUZIA|MG	sexta-feira	02/10/2026	14:20:00	14:35:00	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TOCO	SIM	MONTES CLAROS	REAL 94	GQZ0F58	---	12	6		AGREGADO	NÃO POSSUI	GIRLY DE SOUZA RODRIGUES	110.796.896-80	MG15986381	04839307900	5533 9964-9349	SEGURO PROPRIO	1000255385		MG	MG		SIM	NÃO	NÃO		SEGURO PRÓPRIO
10	SANTA LUZIA|MG	sábado	03/10/2026	09:00:00	09:08:00	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TRUCADO	SIM	GRAVATAÍ	TOMASI	TQV5C78	RAI2J95						WAGNER VAZ MOURA	030.414.780-05	3041478005	05681637946	5551 9 9837-1455	SEGURO PROPRIO	1000000496		RS	RS	RS	SIM	NÃO	NÃO		SEGURO PRÓPRIO
11	SANTA LUZIA|MG	segunda-feira	05/10/2026	X	15:28:07	LIBERADO PARA VISTORIA EM DOCA	RODOTREM SIDER	TRUCADO	SIM	EUSÉBIO	MOEDENSE	JAZ2I19	QIT9D01	24	22	91 m³	FROTA	SASCAR	JOSE ERIDAN DA SILVA	133.040.754-70	003672682 ITEP RN	08216831474	5584 9 9679-5646	07/07/2027	1000187281		RN	MG	MG	SIM	NÃO	NÃO		MACRO
12	SANTA LUZIA|MG	segunda-feira	05/10/2026	X	15:28:07	LIBERADO PARA VISTORIA EM DOCA	RODOTREM SIDER	TRUCADO	SIM	EUSÉBIO	MOEDENSE	JAZ2I19	QIT9C31	24	22	91 m³	FROTA	SASCAR	JOSE ERIDAN DA SILVA	133.040.754-70	003672682 ITEP RN	08216831474	5584 9 9679-5646	07/07/2027	1000187281		RN	MG	MG	SIM	NÃO	NÃO		MACRO
13	MONTES CLAROS|MG	segunda-feira	05/10/2026	x	11:40:56	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TOCO	SIM	GOV. CELSO RAMOS	TOMASI	JCS5G40	TRC2J23	28	24		FROTA	SASCAR	LUDIER OLMIRO TERRES DUARTE	019.984.870-08	1056750506	05395295971	5553 9 8134-4686	SEGURO PROPRIO	1000000496		GO	RS	SC	SIM	NÃO	NÃO		SEGURO PRÓPRIO
14	SANTA LUZIA|MG	segunda-feira	05/10/2026	X	09:17:09	LIBERADO PARA VISTORIA EM DOCA	RODOTREM SIDER	TRUCADO	SIM	GUARULHOS	MOEDENSE	AVY7C88	QHN7H87	24	22	89 m³	FROTA	SASCAR	WANDERSON LOPES PEREIRA	020.810.106-31	MG20174418 SSP MG	02597902262	5531 9 9215-9472	10/11/2026	1000187281		MG	MG	MG	SIM	NÃO	SIM		MACRO
15	SANTA LUZIA|MG	segunda-feira	05/10/2026	X	09:17:09	LIBERADO PARA VISTORIA EM DOCA	RODOTREM SIDER	TRUCADO	SIM	GUARULHOS	MOEDENSE	AVY7C88	QHO7F27	24	22	86 m³	FROTA	SASCAR	WANDERSON LOPES PEREIRA	020.810.106-31	MG20174418 SSP MG	02597902262	5531 9 9215-9472	10/11/2026	1000187281		MG	MG	MG	SIM	NÃO	SIM		MACRO
16	SANTA LUZIA|MG	segunda-feira	05/10/2026	X	13:10:40	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TRUCADO	SIM	GUARULHOS	TRANSMAGNA	SEV8G12	QIW4150	28	30	112 m³	FROTA	SIGHRA	ADENILSON RODRIGUES DA SILVA	014.844.387-79	097838593 DETRAN RJ	00350271825	5521 9 7947-1648	SEGURO PROPRIO	1000352516		RJ	PR	SC	SIM	NÃO	NÃO		SEGURO PRÓPRIO
17	SANTA LUZIA|MG	segunda-feira	05/10/2026	X	14:47:10	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TRUCADO	SIM	GUARULHOS	TRANSMAGNA	SEZ9B52	RAH0002	28	28		FROTA	SIGHRA	LEONARDO DE SOUZA RAMOS	046.039.926-88	MG11152670 SSP MG	03321962214	5531 9 9065-9002	SEGURO PROPRIO	1000352516		SP	PR	SC	SIM	NÃO	NÃO		SEGURO PRÓPRIO
18	SANTA LUZIA|MG	segunda-feira	05/10/2026	X	11:50:31	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	LONDRINA	COMBOIO	FQG6221	RFO7A90	24	24		FROTA	ONIXSAT	VANDERLEI REIS ROSA	995.594.716-00	MG6253999 SSP MG	01451147901	5535 9 9245-0382	26/03/2027	1000047299		MG	MG	MG	SIM	SIM	SIM		MACRO
19	SANTA LUZIA|MG	segunda-feira	05/10/2026	X	11:50:31	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	LONDRINA	COMBOIO	FQG6221	RFO7B24	24	24		FROTA	ONIXSAT	VANDERLEI REIS ROSA	995.594.716-00	MG6253999 SSP MG	01451147901	5535 9 9245-0382	26/03/2027	1000047299		MG	MG	MG	SIM	SIM	SIM		MACRO
20	SANTA LUZIA|MG	segunda-feira	05/10/2026	X	10:41:35	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TRUCADO	SIM	SUMARÉ	TRANSMAGNA	TAQ3C91	QJV4999	28	28	112 m³	FROTA	SIGHRA	FRANCISCO HERCULIS SOUZA BRITO	829.162.922-68	5028677 SSP PA	05725319822	5547 9 9600-8434	SEGURO PROPRIO	1000352516		PA	PR	SC	SIM	NÃO	NÃO		SEGURO PRÓPRIO
21	SANTA LUZIA|MG	segunda-feira	05/10/2026	X	14:55:35	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TRUCADO	SIM	SUMARÉ	TRANSMAGNA	RXN2C72	RYY0A24	28	28		FROTA	SIGHRA	GENILSON CARDOSO	073 002 677 - 93	102.537.479	04938103311	21 9 8862-2083	SEGURO PROPRIO	1000352516		RJ	SC	SC	SIM	NÃO	NÃO		SEGURO PRÓPRIO
22	SANTA LUZIA|MG	segunda-feira	05/10/2026	X	15:38:08	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TRUCK	SIM	SUMARÉ	TOMASI	JDA9H10	---	20	10	86 m³	FROTA	SASCAR	RONALDO RIBEIRO PORTO	471.801.535-91	38377358 SSP SP	02548128644	5511 9 8466-2350	SEGURO PROPRIO	1000000496		SP	RS		SIM	NÃO	NÃO		SEGURO PRÓPRIO
23	SANTA LUZIA|MG	terça-feira	06/10/2026	07:20:00	07:30:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	VIANA	GT MINAS	TDJ9G55	DFM6A91	24	21,5		FROTA	ONIXSAT	ROBSON FORTES TAVARES	077.032.787-77	MG24715537 PC MG	00253566430	5535 9 8423-4325	SEGURO PROPRIO	1000082115		RJ	MG	SP	SIM	NÃO	SIM		SEGURO PRÓPRIO
24	SANTA LUZIA|MG	terça-feira	06/10/2026	07:20:00	07:30:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	VIANA	GT MINAS	TDJ9G55	FQT9E04	24	21,5		FROTA	ONIXSAT	ROBSON FORTES TAVARES	077.032.787-77	MG24715537 PC MG	00253566430	5535 9 8423-4325	SEGURO PROPRIO	1000082115		RJ	MG	SP	SIM	NÃO	SIM		SEGURO PRÓPRIO
25	SANTA LUZIA|MG	terça-feira	06/10/2026	x	09:30:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	NATAL	3C	UUY-5D25	UUO-0I26	24	21		FROTA	SASCAR	HUMBERTH MARYO DE MOURA		1001200260			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	SIM	SIM	R$ 325.818,15	MACRO
26	SANTA LUZIA|MG	terça-feira	06/10/2026	x	09:30:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	NATAL	3C	UUY-5D25	UUO-0I26	24	21		FROTA	SASCAR	HUMBERTH MARYO DE MOURA		1001200260			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	SIM	SIM	R$ 765.103,49	MACRO
27	SANTA LUZIA|MG	terça-feira	06/10/2026	x	09:30:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	NATAL	3C	UUP-0G75	UVA3I05	24	22,5		FROTA	SASCAR	JOZIEL JERONIMO PEREIRA	028.845.894-06	1001219812			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	SIM	SIM		MACRO
28	SANTA LUZIA|MG	terça-feira	06/10/2026	x	09:30:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	NATAL	3C	UUP-0G75	UUZ1I15	24	22,5		FROTA	SASCAR	JOZIEL JERONIMO PEREIRA	028.845.894-06	1001219812			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	SIM	SIM		MACRO
29	SANTA LUZIA|MG	terça-feira	06/10/2026	x	11:24:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	MONTES CLAROS	3C	SAS-2D02	SBI8C02	24	17	87 m³	FROTA	SASCAR	MARISON REZENDE LEMOS	080.054.376-92	1000428527			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	NÃO	SIM		MACRO
30	SANTA LUZIA|MG	terça-feira	06/10/2026	x	11:24:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	MONTES CLAROS	3C	SAS-2D02	SBJ0A72	24	17	87 m³	FROTA	SASCAR	MARISON REZENDE LEMOS	080.054.376-92	1000428527			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	NÃO	SIM		MACRO
31	SANTA LUZIA|MG	terça-feira	06/10/2026	x	11:24:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	RIO DE JANEIRO	3C	THX-8C51	PNE4812	24	21	89 m³	FROTA	SASCAR	ANDERSON DE ALMEIDA SOARES	065.123.286-47	1000430333			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	NÃO	SIM		MACRO
32	SANTA LUZIA|MG	terça-feira	06/10/2026	x	11:24:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	RIO DE JANEIRO	3C	THX-8C51	PNK0792	24	21	91 m³	FROTA	SASCAR	ANDERSON DE ALMEIDA SOARES	065.123.286-47	1000430333			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	NÃO	SIM		MACRO
33	SANTA LUZIA|MG	terça-feira	06/10/2026	x	11:24:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	RIO DE JANEIRO	3C	PNY-2215	POF9365	24	17	91 m³	FROTA	SASCAR	SAMUEL ALVES PEREIRA DA SILVA	010.004.287-36	1000428736			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	NÃO	SIM		MACRO
34	SANTA LUZIA|MG	terça-feira	06/10/2026	x	11:24:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	RIO DE JANEIRO	3C	PNY-2215	POF9175	24	17	91 m³	FROTA	SASCAR	SAMUEL ALVES PEREIRA DA SILVA	010.004.287-36	1000428736			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	NÃO	SIM		MACRO
35	SANTA LUZIA|MG	terça-feira	06/10/2026	x	11:24:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	RIO DE JANEIRO	3C	SBK-5A52	POG2095	24	21	91 m³	FROTA	SASCAR	WEBER DALFRAN FERNANDES	036.847.996-02	1000428567			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	NÃO	SIM		MACRO
36	SANTA LUZIA|MG	terça-feira	06/10/2026	x	11:24:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	RIO DE JANEIRO	3C	SBK-5A52	POF7735	24	21	91 m³	FROTA	SASCAR	WEBER DALFRAN FERNANDES	036.847.996-02	1000428567			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	NÃO	SIM		MACRO
37	SANTA LUZIA|MG	terça-feira	06/10/2026	x	11:24:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	RIO DE JANEIRO	3C	THX-5I51	POG0685	24	21	93 m³	FROTA	SASCAR	WENDEL POLOZZI REIS MAIA	108.064.276-55	1000428656			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	NÃO	SIM		MACRO
38	SANTA LUZIA|MG	terça-feira	06/10/2026	x	11:24:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	RIO DE JANEIRO	3C	THX-5I51	POG0545	24	21	93 m³	FROTA	SASCAR	WENDEL POLOZZI REIS MAIA	108.064.276-55	1000428656			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	NÃO	SIM		MACRO
39	SANTA LUZIA|MG	terça-feira	06/10/2026	x	11:24:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	GUARULHOS	3C	SBK-4J52	SBG0B88	24	21	89 m³	FROTA	SASCAR	JONATAS SILVA MATIAS	086.851.316-42	1000428598			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	NÃO	SIM		MACRO
40	SANTA LUZIA|MG	terça-feira	06/10/2026	x	11:24:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	GUARULHOS	3C	SBK-4J52	PZX4633	24	21	89 m³	FROTA	SASCAR	JONATAS SILVA MATIAS	086.851.316-42	1000428598			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	NÃO	SIM		MACRO
41	SANTA LUZIA|MG	terça-feira	06/10/2026	x	11:24:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	GUARULHOS	3C	SBK-5C22	POG1245	24	21	89 m³	FROTA	SASCAR	LEANDRO ALVES PIRES	059.560.826-40	1000428717			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	NÃO	SIM		MACRO
42	SANTA LUZIA|MG	terça-feira	06/10/2026	x	11:24:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	GUARULHOS	3C	SBK-5C22	PNC8873	24	21	89 m³	FROTA	SASCAR	LEANDRO ALVES PIRES	059.560.826-40	1000428717			FROTA 3C	1000326356		FROTA 3C	FROTA 3C	FROTA 3C	SIM	NÃO	SIM		MACRO
43	SANTA LUZIA|MG	terça-feira	06/10/2026	11:20:00	11:34:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM SIDER	TRUCADO	SIM	RIO DE JANEIRO	MOEDENSE	QWK6A22	OLN7307	24	22	87 m³	FROTA	SASCAR	RAYSON ERBET DA COSTA	031.454.184-59	1686610 SSP RN	00930907212	5511 9 8842-8828	21/06/2027	1000187281		RN	MG	MG	SIM	NÃO	NÃO		MACRO
44	SANTA LUZIA|MG	terça-feira	06/10/2026	11:20:00	11:34:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM SIDER	TRUCADO	SIM	RIO DE JANEIRO	MOEDENSE	QWK6A22	OLN7457	24	22	87 m³	FROTA	SASCAR	RAYSON ERBET DA COSTA	031.454.184-59	1686610 SSP RN	00930907212	5511 9 8842-8828	21/06/2027	1000187281		RN	MG	MG	SIM	NÃO	NÃO		MACRO
45	SANTA LUZIA|MG	terça-feira	06/10/2026	11:30:00	11:37:00	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TRUCADO	SIM	SUMARÉ	TRANSMAGNA	SFA3C91	SXN4E85	28	30	100 m³	FROTA	SIGHRA	GLEISON FREITAS CANDIDO	147.531.847-22	18.558.174	06226218105	5527 9 9939-3770	SEGURO PROPRIO	1000352516		RJ	PR	SP	SIM	NÃO	NÃO		MACRO
46	SANTA LUZIA|MG	terça-feira	06/10/2026	11:20:00	11:40:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	GOV. CELSO RAMOS	COMBOIO	QXQ0J06	HIV9E07	24	24	84 m³	FROTA	ONIXSAT	VALQUIRES BARBOSA DOS SANTOS	044.018.496-71	M7910067 SSP MG	02669988729	5531 9 9313-4332	4/5/2027	1000047299		MG	MG	MG	SIM	NÃO	SIM		MACRO
47	SANTA LUZIA|MG	terça-feira	06/10/2026	11:20:00	11:40:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	GOV. CELSO RAMOS	COMBOIO	QXQ0J06	HIV9E12	24	24	84 m³	FROTA	ONIXSAT	VALQUIRES BARBOSA DOS SANTOS	044.018.496-71	M7910067 SSP MG	02669988729	5531 9 9313-4332	04/05/2027	1000047299		MG	MG	MG	SIM	NÃO	SIM		MACRO
48	SANTA LUZIA|MG	terça-feira	06/10/2026	11:30:00	11:43:00	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TRUCADO	SIM	GRAVATAÍ	COMBOIO	HJH0440	BTB2356	28	27	100 m³	FROTA	ONIXSAT	DENYS LIMA PIRES	018.656.477-56	092812080 SESP RJ	00279929302	5531 9 9624-2092	28/07/2027	1000047299		RJ	MG	MG	SIM	NÃO	SIM		MACRO
49	SANTA LUZIA|MG	terça-feira	06/10/2026	11:40:00	11:50:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	PINHAIS	COMBOIO	NTQ7934	QOG6131	24	24	98 m³	FROTA	ONIXSAT	EDUARDO LISBOA NETO	048.583.206-26	MG11530743 SSP MG	01831790211	5531 9 9244-9220	10/08/2027	1000047299		MG	MG	MG	SIM	NÃO	SIM		MACRO
50	SANTA LUZIA|MG	terça-feira	06/10/2026	11:40:00	11:50:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM BAÚ	TRUCADO	SIM	PINHAIS	COMBOIO	NTQ7934	QOG6134	24	24	98 m³	FROTA	ONIXSAT	EDUARDO LISBOA NETO	048.583.206-26	MG11530743 SSP MG	01831790211	5531 9 9244-9220	10/08/2027	1000047299		MG	MG	MG	SIM	NÃO	SIM		MACRO
51	MONTES CLAROS|MG	terça-feira	06/10/2026	x	14:16:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM SIDER	TRUCADO	SIM	GUARULHOS	REITER LOG	TQZ8C39	BEK9E91	24	23		FROTA	SASCAR	ALSEMAR DA SILVA	032.463.030-10	032.463.030-10	3246303010	5551 98352-2925	SEGURO PROPRIO	1000728953		RS	PR	PR	SIM	NÃO	SIM		SEGURO PRÓPRIO
52	MONTES CLAROS|MG	terça-feira	06/10/2026	x	14:16:00	LIBERADO PARA VISTORIA EM DOCA	RODOTREM SIDER	TRUCADO	SIM	GUARULHOS	REITER LOG	TQZ8C39	BEK9F93	24	23		FROTA	SASCAR	ALSEMAR DA SILVA	032.463.030-10	032.463.030-10	3246303010	5551 98352-2925	SEGURO PROPRIO	1000728953		RS	PR	PR	SIM	NÃO	SIM		SEGURO PRÓPRIO
53	MONTES CLAROS|MG	terça-feira	06/10/2026	x	14:54:00	LIBERADO PARA VISTORIA EM DOCA	BAÚ	TRUCADO	SIM	VESPASIANO	TRANSMAGNA	SFH5B19	RYF3B00	28	30	110 m³	FROTA	SIGHRA	RICARDO PEDRO CESAR	071.864.157-41	110603362 IFP RJ	00192283982	5547 9 8882-1247	SEGURO PROPRIO	1000352516		RJ	PR	SC	SIM	NÃO	SIM		SEGURO PRÓPRIO`;

export function parseDisponibilidadeTsv(text: string): DisponibilidadeRow[] {
  if (!text.trim()) return [];
  const lines = text.trim().split('\n');
  const rows: DisponibilidadeRow[] = [];

  lines.forEach((line, index) => {
    const parts = line.split('\t');
    if (parts.length >= 8) {
      rows.push({
        id: `disp_${index}_${Date.now()}`,
        itemNum: parts[0] || String(index + 1),
        origem: parts[1] || '',
        dia: parts[2] || '',
        data: parts[3] || '',
        contatoWhats: parts[4] || '',
        horaLiberado: parts[5] || '',
        status: parts[6] || '',
        modeloCarreta: parts[7] || '',
        modeloCavalo: parts[8] || '',
        fezContato: parts[9] || '',
        destino: parts[10] || '',
        transportador: parts[11] || '',
        cavalo: parts[12] || '',
        carreta: parts[13] || '',
        numPallets: parts[14] || '',
        pbtTon: parts[15] || '',
        m3: parts[16] || '',
        categoria: parts[17] || '',
        tecnologia: parts[18] || '',
        condutor: parts[19] || '',
        cpf: parts[20] || '',
        rgSap: parts[21] || '',
        cnh: parts[22] || '',
        telefone: parts[23] || '',
        vigenciaCadastro: parts[24] || '',
        codTransportadora: parts[25] || '',
        idCargaLacre: parts[26] || '',
        estadoMotorista: parts[27] || '',
        estadoCavalo: parts[28] || '',
        estadoCarreta: parts[29] || '',
        tresCargo: parts[30] || '',
        carregou: parts[31] || '',
        termo: parts[32] || '',
        valorNf: parts[33] || '',
        operacao: parts[34] || ''
      });
    }
  });

  return rows;
}

interface DisponibilidadeProps {
  onBack?: () => void;
}

export default function Disponibilidade({ onBack }: DisponibilidadeProps) {
  const [tsvInput, setTsvInput] = useState('');
  const [rows, setRows] = useState<DisponibilidadeRow[]>(() => parseDisponibilidadeTsv(SAMPLE_TSV_DATA));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigem, setSelectedOrigem] = useState<string>('ALL');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('ALL');
  const [copiedFormat, setCopiedFormat] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const previewTableRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleProcessTsv = () => {
    if (!tsvInput.trim()) {
      showToast('Por favor, cole as informações da planilha no campo antes de processar.');
      return;
    }
    const parsed = parseDisponibilidadeTsv(tsvInput);
    if (parsed.length > 0) {
      setRows(parsed);
      showToast(`Sucesso! ${parsed.length} veículos processados.`);
    } else {
      showToast('Não foi possível identificar colunas válidas. Verifique o formato copiado.');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setTsvInput(text);
        const parsed = parseDisponibilidadeTsv(text);
        if (parsed.length > 0) {
          setRows(parsed);
          showToast(`Colado e processado! ${parsed.length} veículos carregados.`);
        } else {
          showToast('Texto colado da área de transferência.');
        }
      }
    } catch (err) {
      showToast('Por favor, cole manualmente no campo de texto.');
    }
  };

  const handleClearInputAndTable = () => {
    setTsvInput('');
    setRows([]);
    showToast('Campo e tabela limpos.');
  };

  const handleLoadSample = () => {
    setTsvInput(SAMPLE_TSV_DATA);
    const parsed = parseDisponibilidadeTsv(SAMPLE_TSV_DATA);
    setRows(parsed);
    showToast(`${parsed.length} veículos de exemplo carregados!`);
  };

  // Filter rows
  const filteredRows = rows.filter(r => {
    if (selectedOrigem !== 'ALL' && !r.origem.toUpperCase().includes(selectedOrigem.toUpperCase())) {
      return false;
    }
    if (selectedCategoria !== 'ALL' && !r.categoria.toUpperCase().includes(selectedCategoria.toUpperCase())) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        r.origem.toLowerCase().includes(term) ||
        r.destino.toLowerCase().includes(term) ||
        r.transportador.toLowerCase().includes(term) ||
        r.cavalo.toLowerCase().includes(term) ||
        r.carreta.toLowerCase().includes(term) ||
        r.condutor.toLowerCase().includes(term) ||
        r.categoria.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const origensList = Array.from(new Set(rows.map(r => r.origem).filter(Boolean)));
  const totalFrota = rows.filter(r => r.categoria.toUpperCase().includes('FROTA')).length;
  const totalAgregado = rows.filter(r => r.categoria.toUpperCase().includes('AGREGADO')).length;

  const getEmailSubject = () => {
    const now = new Date();
    const weekdays = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
    const weekdayName = weekdays[now.getDay()];
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `DISPONIBILIDADE DE VEICULOS - REGIONAL SUDESTE | ${weekdayName} ${day}/${month}/${year}`;
  };

  const copySubjectText = async () => {
    const subj = getEmailSubject();
    const success = await safeCopyText(subj);
    if (success) {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2500);
      showToast('Assunto do e-mail copiado com sucesso!');
    } else {
      showToast('Erro ao copiar assunto.');
    }
  };

  // Copy Formatted Email Content
  const copyFormattedEmail = async () => {
    const rowsHtml = filteredRows.map((r, idx) => {
      const isViana = r.origem.toUpperCase().includes('VIANA');
      const isMontesClaros = r.origem.toUpperCase().includes('MONTES CLAROS');
      const origemColor = isViana ? '#9333ea' : isMontesClaros ? '#c026d3' : '#1e293b';
      const isFrota = r.categoria.toUpperCase().includes('FROTA');
      const isAgregado = r.categoria.toUpperCase().includes('AGREGADO');
      const categoriaColor = isFrota ? '#2563eb' : isAgregado ? '#dc2626' : '#1e293b';

      return `
        <tr style="background-color: #fdfbf7; font-size: 11px; font-weight: 500; text-align: center;">
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd; font-weight: bold;">${r.itemNum || idx + 1}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd; color: ${origemColor}; font-weight: bold;">${r.origem}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.dia}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.data}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.contatoWhats}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.horaLiberado}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd; white-space: nowrap;">
            <span style="background-color: #d1fae5; color: #065f46; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; white-space: nowrap;">${r.status.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()}</span>
          </td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.modeloCarreta}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.modeloCavalo}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">
            <span style="background-color: #d1fae5; color: #065f46; padding: 3px 10px; border-radius: 9999px; font-size: 10px; font-weight: bold;">✓ ${r.fezContato || 'SIM'}</span>
          </td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd; font-weight: bold;">${r.destino}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd; font-weight: bold;">${r.transportador}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd; font-family: monospace;">${r.cavalo}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd; font-family: monospace;">${r.carreta}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.numPallets}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.pbtTon}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd; color: #2563eb; font-weight: bold;">${r.m3}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd; color: ${categoriaColor}; font-weight: bold;">${r.categoria}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.tecnologia}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd; text-align: left; font-weight: bold;">${r.condutor}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.cpf}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.rgSap}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.cnh}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.telefone}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.vigenciaCadastro}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.codTransportadora}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.idCargaLacre}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.estadoMotorista}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.estadoCavalo}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.estadoCarreta}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.tresCargo}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.carregou}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd;">${r.termo}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd; color: #dc2626; font-weight: bold;">${r.valorNf}</td>
          <td style="padding: 8px 12px; border: 1px solid #e2d9cd; font-weight: bold;">${r.operacao}</td>
        </tr>
      `;
    }).join('');

    const fullHtml = `
      <div style="font-family: 'Inter', system-ui, Arial, sans-serif; color: #1e293b; font-size: 13px; line-height: 1.6; background-color: #f8fafc; padding: 20px;">
        <p style="margin: 0 0 6px 0; font-weight: 600; color: #0f172a;">Prezados, boa tarde!</p>
        <p style="margin: 0 0 6px 0; font-weight: 600; color: #0f172a;">Segue a disponibilidade de veículos.</p>
        <p style="margin: 0 0 16px 0;">
          <span style="background-color: #fef2f2; color: #991b1b; font-weight: bold; padding: 5px 12px; border-radius: 8px; display: inline-block; border: 1px solid #fecaca;">
            ⚠️ Favor ficarem atentos à origem de cada carregamento.
          </span>
        </p>

        <table style="border-collapse: collapse; width: 100%; font-family: 'JetBrains Mono', monospace; font-size: 10px; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background-color: #0f172a; color: #ffffff; font-weight: bold; text-transform: uppercase; text-align: center;">
              <th style="padding: 12px; border: 1px solid #334155;">#</th>
              <th style="padding: 12px; border: 1px solid #334155;">ORIGEM</th>
              <th style="padding: 12px; border: 1px solid #334155;">DIA</th>
              <th style="padding: 12px; border: 1px solid #334155;">DATA</th>
              <th style="padding: 12px; border: 1px solid #334155;">CONTATO WHATS</th>
              <th style="padding: 12px; border: 1px solid #334155;">HORA LIBERADO</th>
              <th style="padding: 12px; border: 1px solid #334155;">STATUS</th>
              <th style="padding: 12px; border: 1px solid #334155;">MODELO CARRETA</th>
              <th style="padding: 12px; border: 1px solid #334155;">MODELO CAVALO</th>
              <th style="padding: 12px; border: 1px solid #334155;">FEZ CONTATO?</th>
              <th style="padding: 12px; border: 1px solid #334155;">DESTINO</th>
              <th style="padding: 12px; border: 1px solid #334155;">TRANSPORTADOR</th>
              <th style="padding: 12px; border: 1px solid #334155;">CAVALO</th>
              <th style="padding: 12px; border: 1px solid #334155;">CARRETA</th>
              <th style="padding: 12px; border: 1px solid #334155;">Nº PALLETS</th>
              <th style="padding: 12px; border: 1px solid #334155;">PBT (TON)</th>
              <th style="padding: 12px; border: 1px solid #334155;">M³</th>
              <th style="padding: 12px; border: 1px solid #334155;">CATEGORIA</th>
              <th style="padding: 12px; border: 1px solid #334155;">TECNOLOGIA</th>
              <th style="padding: 12px; border: 1px solid #334155;">CONDUTOR</th>
              <th style="padding: 12px; border: 1px solid #334155;">CPF</th>
              <th style="padding: 12px; border: 1px solid #334155;">RG / SAP</th>
              <th style="padding: 12px; border: 1px solid #334155;">CNH</th>
              <th style="padding: 12px; border: 1px solid #334155;">TELEFONE</th>
              <th style="padding: 12px; border: 1px solid #334155;">VIGENCIA DO CADASTRO</th>
              <th style="padding: 12px; border: 1px solid #334155;">CODIGO DA TRANSPORTADORA</th>
              <th style="padding: 12px; border: 1px solid #334155;">ID DA CARGA / LACRE EXPORTAÇÃO</th>
              <th style="padding: 12px; border: 1px solid #334155;">ESTADO MOTORISTA</th>
              <th style="padding: 12px; border: 1px solid #334155;">ESTADO CAVALO</th>
              <th style="padding: 12px; border: 1px solid #334155;">ESTADO CARRETA</th>
              <th style="padding: 12px; border: 1px solid #334155;">3 CARGO</th>
              <th style="padding: 12px; border: 1px solid #334155;">CARREGOU ?</th>
              <th style="padding: 12px; border: 1px solid #334155;">TERMO</th>
              <th style="padding: 12px; border: 1px solid #334155;">VALOR NF</th>
              <th style="padding: 12px; border: 1px solid #334155;">OPERAÇÃO</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `.trim();

    const plainText = `Prezados, boa tarde!\n\nSegue a disponibilidade de veículos.\n\nFavor ficarem atentos à origem de cada carregamento.\n\n[Tabela de Disponibilidade com ${filteredRows.length} veículos]`;

    const success = await safeCopyHtmlAndText(fullHtml, plainText);
    if (success) {
      setCopiedFormat(true);
      setTimeout(() => setCopiedFormat(false), 2500);
      showToast('Formato empresarial copiado para a área de transferência!');
    } else {
      showToast('Cópia realizada com sucesso.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans flex flex-col justify-between p-3 sm:p-6 select-none overflow-x-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl bg-[#0f172a] text-white border border-slate-700 text-xs font-mono font-bold flex items-center gap-3 shadow-2xl backdrop-blur-md"
          >
            <Check size={18} className="text-emerald-400" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-full mx-auto space-y-6">
        
        {/* ========================================================================= */}
        {/* ENTERPRISE HEADER BANNER                                                 */}
        {/* ========================================================================= */}
        <div className="w-full bg-[#0f172a] text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-1.5 text-left relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5 bg-slate-800/80 px-3.5 py-1 rounded-full border border-slate-700">
                <Truck size={14} className="text-blue-400" />
                CENTRAL GR 3 CORAÇÕES • GESTÃO DE PÁTIO EMPRESARIAL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-heading">
              DISPONIBILIDADE <span className="text-blue-400">DE VEÍCULOS</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans">
              Painel analítico corporativo expandido de frotas e liberação de carregamentos.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap relative z-10">
            <button
              onClick={handleLoadSample}
              className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-black uppercase px-5 py-3 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2 hover:scale-[1.02]"
            >
              <Sparkles size={15} />
              <span>Carregar Dados Exemplo</span>
            </button>

            {onBack && (
              <button
                onClick={onBack}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-3 rounded-xl border border-slate-700 cursor-pointer transition-all"
                title="Voltar ao Início"
              >
                <RefreshCw size={17} />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ANALYTICS & CHARTS SUMMARY CARDS                                         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          
          {/* Card 1: Total Veículos */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Total de Veículos
              </span>
              <div className="text-2xl font-black text-[#0f172a] font-heading">
                {rows.length} <span className="text-xs font-sans font-bold text-slate-400">unidades</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp size={13} />
                <span>100% integrados no pátio</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
              <Truck size={22} />
            </div>
          </div>

          {/* Card 2: Frota vs Agregado */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Frota Própria vs Agregados
              </span>
              <div className="text-lg font-black text-[#0f172a] font-heading flex items-center gap-2">
                <span className="text-blue-600">{totalFrota} Frota</span>
                <span className="text-slate-300">•</span>
                <span className="text-red-600">{totalAgregado} Agregados</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex mt-1">
                <div 
                  className="bg-blue-600 h-full transition-all" 
                  style={{ width: `${rows.length ? (totalFrota / rows.length) * 100 : 0}%` }} 
                />
                <div 
                  className="bg-red-600 h-full transition-all" 
                  style={{ width: `${rows.length ? (totalAgregado / rows.length) * 100 : 0}%` }} 
                />
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
              <PieChart size={22} />
            </div>
          </div>

          {/* Card 3: Origens Principais */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Origens Ativas
              </span>
              <div className="text-2xl font-black text-[#0f172a] font-heading">
                {origensList.length} <span className="text-xs font-sans font-bold text-slate-400">cidades</span>
              </div>
              <div className="text-[11px] text-purple-600 font-bold flex items-center gap-1">
                <MapPin size={13} />
                <span>Santa Luzia, Viana, Montes Claros</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-inner">
              <BarChart3 size={22} />
            </div>
          </div>

          {/* Card 4: Status do Pátio */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Status Operacional
              </span>
              <div className="text-xl font-black text-emerald-700 font-heading">
                Liberado p/ Vistoria
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Doca e liberação imediata
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
              <Activity size={22} />
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MODERN PASTE FIELD FOR SPREADSHEET DATA                                  */}
        {/* ========================================================================= */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-left space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-mono font-black text-[#0f172a] uppercase tracking-wide flex items-center gap-2 font-heading">
                <Clipboard size={17} className="text-blue-600" />
                CAMPO DE ENTRADA • COLE AS INFORMAÇÕES DA PLANILHA (TSV / EXCEL)
              </h3>
              <p className="text-xs font-sans text-slate-500 mt-0.5">
                Cole abaixo as colunas copiadas do Excel ou Google Sheets para atualizar e formatar instantaneamente:
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                onClick={handlePasteFromClipboard}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Clipboard size={14} className="text-blue-600" />
                <span>Colar da Área de Transferência</span>
              </button>

              <button
                onClick={handleClearInputAndTable}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer"
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <textarea
              rows={6}
              value={tsvInput}
              onChange={(e) => {
                setTsvInput(e.target.value);
                if (e.target.value.includes('\t')) {
                  const parsed = parseDisponibilidadeTsv(e.target.value);
                  if (parsed.length > 0) {
                    setRows(parsed);
                  }
                }
              }}
              placeholder="Cole aqui os dados copiados da planilha (origem, data, hora, status, carreta, cavalo, destino, condutor, etc.)..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl p-5 font-mono text-xs text-slate-900 outline-none transition-all resize-y shadow-inner"
            />

            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <span className="text-xs font-mono text-slate-500 font-bold">
                {tsvInput.trim() ? `${tsvInput.trim().split('\n').length} linhas prontas no buffer` : 'Aguardando inserção de dados...'}
              </span>

              <button
                onClick={handleProcessTsv}
                className="px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-mono text-xs font-black uppercase transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                <Zap size={15} className="text-amber-300" />
                <span>PROCESSAR E GERAR TABELA</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EMAIL SUBJECT & PREVIEW COPY BANNER                                      */}
        {/* ========================================================================= */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-left space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <span className="text-xs font-mono font-black uppercase text-slate-700 flex items-center gap-2">
              <MailIcon className="text-blue-600" size={16} />
              ASSUNTO E PRÉ-VISUALIZAÇÃO DO E-MAIL
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={copySubjectText}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-200 rounded-xl font-mono text-xs font-black uppercase transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Copy size={13} />
                <span>{copiedSubject ? 'ASSUNTO COPIADO!' : 'COPIAR ASSUNTO'}</span>
              </button>

              <button
                onClick={copyFormattedEmail}
                className="px-6 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white rounded-xl font-mono text-xs font-black uppercase transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                <Copy size={14} className="text-blue-400" />
                <span>{copiedFormat ? 'E-MAIL COPIADO!' : 'COPIAR FORMATADO (PARA E-MAIL)'}</span>
              </button>
            </div>
          </div>

          {/* Subject Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Assunto do E-mail (Atualizado com o Dia e Data de Hoje):</span>
              <div className="text-xs sm:text-sm font-mono font-black text-blue-600">
                {getEmailSubject()}
              </div>
            </div>
          </div>

          <div className="text-xs sm:text-sm font-sans font-medium text-slate-800 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-900 mb-1">Prezados, boa tarde!</p>
            <p className="mb-2.5 text-slate-700">Segue a disponibilidade de veículos.</p>
            <p>
              <span className="bg-red-50 text-red-700 font-bold px-3 py-1.5 rounded-lg border border-red-200 inline-block text-xs">
                ⚠️ Favor ficarem atentos à origem de cada carregamento.
              </span>
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CONTROLS & SEARCH BAR                                                    */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por origem, destino, placa, condutor, transportador..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
            {/* Origem Filter Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono text-xs font-bold text-slate-800">
              <Filter size={14} className="text-blue-600" />
              <span>ORIGEM:</span>
              <select
                value={selectedOrigem}
                onChange={(e) => setSelectedOrigem(e.target.value)}
                className="bg-transparent outline-none uppercase font-black cursor-pointer text-blue-600"
              >
                <option value="ALL">TODAS ({rows.length})</option>
                {origensList.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Categoria Filter Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono text-xs font-bold text-slate-800">
              <span>CATEGORIA:</span>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="bg-transparent outline-none uppercase font-black cursor-pointer text-blue-600"
              >
                <option value="ALL">TODAS</option>
                <option value="FROTA">FROTA</option>
                <option value="AGREGADO">AGREGADO</option>
              </select>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MAIN DATA TABLE (EXPANDED / ESTICADA, EXACT 35 COLUMNS ORDER)             */}
        {/* ========================================================================= */}
        <div ref={previewTableRef} className="w-full bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[720px] rounded-2xl">
            <table className="w-full border-collapse text-xs font-mono text-left min-w-[2600px]">
              <thead className="sticky top-0 bg-[#0f172a] text-white text-[10.5px] uppercase font-bold tracking-wider z-20 shadow-md">
                <tr className="text-center">
                  <th className="p-3.5 border border-slate-800 w-12">#</th>
                  <th className="p-3.5 border border-slate-800 min-w-[160px]">ORIGEM</th>
                  <th className="p-3.5 border border-slate-800 min-w-[110px]">DIA</th>
                  <th className="p-3.5 border border-slate-800 min-w-[100px]">DATA</th>
                  <th className="p-3.5 border border-slate-800 min-w-[120px]">CONTATO WHATS</th>
                  <th className="p-3.5 border border-slate-800 min-w-[120px]">HORA LIBERADO</th>
                  <th className="p-3.5 border border-slate-800 min-w-[220px]">STATUS</th>
                  <th className="p-3.5 border border-slate-800 min-w-[140px]">MODELO CARRETA</th>
                  <th className="p-3.5 border border-slate-800 min-w-[120px]">MODELO CAVALO</th>
                  <th className="p-3.5 border border-slate-800 min-w-[110px]">FEZ CONTATO?</th>
                  <th className="p-3.5 border border-slate-800 min-w-[140px]">DESTINO</th>
                  <th className="p-3.5 border border-slate-800 min-w-[140px]">TRANSPORTADOR</th>
                  <th className="p-3.5 border border-slate-800 min-w-[110px]">CAVALO</th>
                  <th className="p-3.5 border border-slate-800 min-w-[110px]">CARRETA</th>
                  <th className="p-3.5 border border-slate-800 min-w-[90px]">Nº PALLETS</th>
                  <th className="p-3.5 border border-slate-800 min-w-[90px]">PBT (TON)</th>
                  <th className="p-3.5 border border-slate-800 min-w-[90px]">M³</th>
                  <th className="p-3.5 border border-slate-800 min-w-[110px]">CATEGORIA</th>
                  <th className="p-3.5 border border-slate-800 min-w-[110px]">TECNOLOGIA</th>
                  <th className="p-3.5 border border-slate-800 min-w-[220px]">CONDUTOR</th>
                  <th className="p-3.5 border border-slate-800 min-w-[140px]">CPF</th>
                  <th className="p-3.5 border border-slate-800 min-w-[150px]">RG / SAP</th>
                  <th className="p-3.5 border border-slate-800 min-w-[130px]">CNH</th>
                  <th className="p-3.5 border border-slate-800 min-w-[140px]">TELEFONE</th>
                  <th className="p-3.5 border border-slate-800 min-w-[150px]">VIGENCIA DO CADASTRO</th>
                  <th className="p-3.5 border border-slate-800 min-w-[160px]">CODIGO DA TRANSPORTADORA</th>
                  <th className="p-3 border border-slate-800 min-w-[190px]">ID DA CARGA / LACRE EXPORTAÇÃO</th>
                  <th className="p-3.5 border border-slate-800 min-w-[90px]">ESTADO MOTORISTA</th>
                  <th className="p-3 border border-slate-800 min-w-[90px]">ESTADO CAVALO</th>
                  <th className="p-3 border border-slate-800 min-w-[90px]">ESTADO CARRETA</th>
                  <th className="p-3.5 border border-slate-800 min-w-[100px]">3 CARGO</th>
                  <th className="p-3.5 border border-slate-800 min-w-[100px]">CARREGOU ?</th>
                  <th className="p-3.5 border border-slate-800 min-w-[90px]">TERMO</th>
                  <th className="p-3.5 border border-slate-800 min-w-[130px]">VALOR NF</th>
                  <th className="p-3.5 border border-slate-800 min-w-[150px]">OPERAÇÃO</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-[#fdfbf7]">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={35} className="p-16 text-center text-slate-400 font-sans text-sm">
                      Nenhum veículo encontrado. Cole as informações no campo acima ou clique em "Carregar Dados Exemplo".
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((r, idx) => {
                    const isViana = r.origem.toUpperCase().includes('VIANA');
                    const isMontesClaros = r.origem.toUpperCase().includes('MONTES CLAROS');
                    const isFrota = r.categoria.toUpperCase().includes('FROTA');
                    const isAgregado = r.categoria.toUpperCase().includes('AGREGADO');

                    return (
                      <tr key={r.id} className="hover:bg-slate-100/90 transition-colors text-center font-medium">
                        <td className="p-3.5 border border-slate-200 bg-slate-50/80 text-slate-900 font-bold">{r.itemNum || idx + 1}</td>
                        
                        {/* ORIGEM */}
                        <td className={cn(
                          "p-3.5 border border-slate-200 font-bold uppercase",
                          isViana ? "text-purple-700 bg-purple-50/50" : isMontesClaros ? "text-fuchsia-700 bg-fuchsia-50/50" : "text-slate-900"
                        )}>
                          {r.origem}
                        </td>

                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.dia}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.data}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-600">{r.contatoWhats}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700 font-bold">{r.horaLiberado}</td>
                        
                        {/* STATUS with pill badge */}
                        <td className="p-3.5 border border-slate-200 text-slate-800 text-[11px] uppercase">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10.5px]">
                            <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                            {r.status}
                          </span>
                        </td>

                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.modeloCarreta}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.modeloCavalo}</td>
                        
                        {/* FEZ CONTATO? */}
                        <td className="p-3.5 border border-slate-200">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10.5px]">
                            ✓ {r.fezContato || 'SIM'}
                          </span>
                        </td>

                        <td className="p-3.5 border border-slate-200 text-slate-900 uppercase font-bold">{r.destino}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-900 uppercase font-bold">{r.transportador}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-800 font-mono font-bold tracking-wider">{r.cavalo}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-800 font-mono font-bold tracking-wider">{r.carreta}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.numPallets}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.pbtTon}</td>
                        
                        {/* M3 */}
                        <td className="p-3.5 border border-slate-200 text-blue-600 font-bold">{r.m3}</td>
                        
                        {/* CATEGORIA */}
                        <td className={cn(
                          "p-3.5 border border-slate-200 font-bold uppercase",
                          isFrota ? "text-blue-600 bg-blue-50/50" : isAgregado ? "text-red-600 bg-red-50/50" : "text-slate-900"
                        )}>
                          {r.categoria}
                        </td>

                        <td className="p-3.5 border border-slate-200 text-slate-700 uppercase">{r.tecnologia}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-900 uppercase text-left font-bold">{r.condutor}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.cpf}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-600 text-[10.5px]">{r.rgSap}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-600 text-[10.5px]">{r.cnh}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.telefone}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-600 text-[10.5px]">{r.vigenciaCadastro}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.codTransportadora}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.idCargaLacre}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.estadoMotorista}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.estadoCavalo}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.estadoCarreta}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.tresCargo}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.carregou}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-700">{r.termo}</td>
                        <td className="p-3.5 border border-slate-200 text-red-600 font-bold">{r.valorNf}</td>
                        <td className="p-3.5 border border-slate-200 text-slate-900 uppercase font-bold">{r.operacao}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Summary Bar */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-600 gap-2 shadow-xs">
          <span>EXIBINDO {filteredRows.length} DE {rows.length} VEÍCULOS DISPONÍVEIS NO PÁTIO</span>
          <span className="font-bold text-blue-600">3CORAÇÕES • CENTRAL GR • GESTÃO DE FROTA & LOGÍSTICA</span>
        </div>

      </div>

    </div>
  );
}

function MailIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}
