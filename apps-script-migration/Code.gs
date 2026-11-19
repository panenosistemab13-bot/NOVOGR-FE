function doGet(){return HtmlService.createTemplateFromFile('Index').evaluate().setTitle(NOVOGR_CONFIG.APP_NAME).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);}
function include(file){return HtmlService.createHtmlOutputFromFile(file).getContent();}
function getInitialData(){
  const user=requireAuthenticated();
  return {appName:NOVOGR_CONFIG.APP_NAME,user:user,pages:getPageRegistry(),counts:getPageRecordCounts()};
}
function listRecords(table){
  requireAuthenticated();
  if(!NOVOGR_CONFIG.TABLES.includes(table))throw new Error('Tabela inválida');
  const id=PropertiesService.getScriptProperties().getProperty('NOVOGR_DB_ID');
  if(!id)throw new Error('Banco não configurado. Execute setupSystem().');
  const sh=SpreadsheetApp.openById(id).getSheetByName(table);
  if(!sh||sh.getLastRow()<2)return [];
  return sh.getRange(2,1,sh.getLastRow()-1,6).getValues().map(r=>({id:r[0],created:r[1],updated:r[2],user:r[3],status:r[4],data:JSON.parse(r[5]||'{}')}));
}
function saveRecord(table,data){
  const user=requireAuthenticated();
  if(!NOVOGR_CONFIG.TABLES.includes(table))throw new Error('Tabela inválida');
  const id=PropertiesService.getScriptProperties().getProperty('NOVOGR_DB_ID');
  if(!id)throw new Error('Banco não configurado. Execute setupSystem().');
  const sh=SpreadsheetApp.openById(id).getSheetByName(table);
  if(!sh)throw new Error('Tabela não encontrada: '+table);
  const now=new Date(),uid=Utilities.getUuid();
  sh.appendRow([uid,now,now,user.email,String(data.status||'ATIVO'),JSON.stringify(data.data||data)]);
  return {id:uid,saved:true};
}
