const NOVOGR_PAGES = [
  {id:'menu',label:'Início',table:null,category:'Principal',description:'Painel inicial e acesso aos módulos.',visible:true},
  {id:'checklist',label:'Checklist',table:'CHECKLIST',category:'Operação',description:'Vistorias e controle de equipamentos.',visible:true},
  {id:'averbacao',label:'Averbação',table:'AVERBACAO',category:'Documentos',description:'Gestão de averbações e seguros.',visible:true},
  {id:'sm_creator',label:'monitoramento',table:'SM',category:'Monitoramento',description:'Criação e gestão de solicitações de monitoramento.',visible:true},
  {id:'lancamento',label:'Lançamento',table:'LANCAMENTO',category:'Operação',description:'Lançamentos operacionais.',visible:true},
  {id:'controle',label:'Pré alerta',table:'CONTROLE',category:'Operação',description:'Controle operacional e pré-alertas.',visible:true},
  {id:'cadastro',label:'Cadastro',table:'CADASTRO',category:'Administração',description:'Cadastro e gestão de usuários.',admin:true,visible:false},
  {id:'settings',label:'Configurações',table:'CONFIGURACOES',category:'Administração',description:'Configurações e visibilidade das páginas.',admin:true,visible:false},
  {id:'escala',label:'frota escala',table:'ESCALA',category:'Frota',description:'Escalas da frota.',visible:true},
  {id:'disponibilidade',label:'Disponibilidade',table:'DISPONIBILIDADE',category:'Frota',description:'Disponibilidade de veículos.',visible:true},
  {id:'ordem_servico',label:'Ordem de Serviço',table:'ORDEM_SERVICO',category:'Manutenção',description:'Ordens de serviço.',visible:true},
  {id:'cobrancas',label:'Cobranças',table:'COBRANCAS',category:'Financeiro',description:'Controle de cobranças.',visible:true},
  {id:'lista_emails',label:'Lista de E-mails',table:'LISTA_EMAILS',category:'Comunicação',description:'Destinatários e listas de e-mail.',visible:true},
  {id:'calendario',label:'Calendário',table:'CALENDARIO',category:'Agenda',description:'Agenda e compromissos.',visible:true},
  {id:'presence',label:'calendário',table:'PRESENCA',category:'Equipe',description:'Presença e acompanhamento da equipe.',visible:false,restricted:true},
  {id:'rotas',label:'Rotas',table:'ROTAS',category:'Logística',description:'Rotas e percursos operacionais.',visible:false,restricted:true},
  {id:'historico',label:'Histórico',table:'AUDITORIA',category:'Administração',description:'Histórico de ações administrativas.',admin:true,visible:false},
  {id:'risk',label:'Risco',table:null,category:'Interno',description:'Aba interna do aplicativo original; não aparece como item independente no menu principal.',internal:true,visible:false}
];
function getPageRegistry(){
  const user=requireAuthenticated();
  return NOVOGR_PAGES.filter(p=>{
    if(p.internal)return false;
    if(p.admin && user.role!=='Administrador' && user.role!=='admin')return false;
    if(user.allowedPages && user.allowedPages.length && !['Administrador','admin'].includes(user.role))return user.allowedPages.includes(p.id);
    return true;
  }).map(p=>({...p}));
}
function getPageRecordCounts(){
  requireAuthenticated();
  const id=PropertiesService.getScriptProperties().getProperty('NOVOGR_DB_ID');
  if(!id)return {};
  const ss=SpreadsheetApp.openById(id), out={};
  NOVOGR_PAGES.forEach(p=>{
    if(!p.table)return;
    const sh=ss.getSheetByName(p.table);
    out[p.id]=sh ? Math.max(0,sh.getLastRow()-1) : 0;
  });
  return out;
}
