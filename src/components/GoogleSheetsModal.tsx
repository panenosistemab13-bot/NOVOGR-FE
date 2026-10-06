import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  PlusCircle,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import {
  extractSpreadsheetId,
  getSpreadsheetDetails,
  SpreadsheetMetadata,
  SheetRowData
} from '../services/googleSheets';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  spreadsheetId: string;
  sheetName: string;
  onSaveConfig: (id: string, name: string) => void;
  token: string | null;
  onLoadData: (id: string, name: string) => Promise<void>;
  onCreateTemplate: () => Promise<string>;
  onExportToSheet: (id: string, name: string) => Promise<void>;
  currentStatesCount: number;
  webAppUrl?: string;
  onSaveWebAppUrl?: (url: string) => void;
}

export default function GoogleSheetsModal({
  isOpen,
  onClose,
  spreadsheetId: initialSpreadsheetId,
  sheetName: initialSheetName,
  onSaveConfig,
  token,
  onLoadData,
  onCreateTemplate,
  onExportToSheet,
  currentStatesCount,
  webAppUrl,
  onSaveWebAppUrl,
}: GoogleSheetsModalProps) {
  const [inputUrlOrId, setInputUrlOrId] = useState(initialSpreadsheetId || '');
  const [selectedSheet, setSelectedSheet] = useState(initialSheetName || 'Dados_UF');
  const [inputWebAppUrl, setInputWebAppUrl] = useState(webAppUrl || '');
  const [availableSheets, setAvailableSheets] = useState<{ title: string; sheetId: number }[]>([]);
  const [sheetMetadata, setSheetMetadata] = useState<SpreadsheetMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Estado para o diálogo de confirmação obrigatório para operações que modificam a planilha
  const [showConfirmExport, setShowConfirmExport] = useState(false);

  useEffect(() => {
    setInputUrlOrId(initialSpreadsheetId || '');
    setSelectedSheet(initialSheetName || 'Dados_UF');
    setInputWebAppUrl(webAppUrl || '');
    setFeedback(null);
  }, [initialSpreadsheetId, initialSheetName, webAppUrl, isOpen]);

  if (!isOpen) return null;

  const handleFetchMetadata = async () => {
    const rawId = extractSpreadsheetId(inputUrlOrId);
    if (!rawId) {
      setFeedback({ type: 'error', message: 'Informe a URL ou ID da planilha.' });
      return;
    }
    if (!token) {
      setFeedback({ type: 'error', message: 'Você precisa estar conectado à sua conta Google.' });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const details = await getSpreadsheetDetails(rawId, token);
      setSheetMetadata(details);
      setAvailableSheets(details.sheets);
      if (details.sheets.length > 0) {
        // Se a aba selecionada atual não existir nas abas da planilha, seleciona a primeira
        if (!details.sheets.some(s => s.title === selectedSheet)) {
          setSelectedSheet(details.sheets[0].title);
        }
      }
      setFeedback({
        type: 'success',
        message: `Planilha "${details.title}" conectada com sucesso! (${details.sheets.length} abas encontradas)`
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao carregar metadados da planilha.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAndLoad = async () => {
    const rawId = extractSpreadsheetId(inputUrlOrId);
    if (!rawId) {
      setFeedback({ type: 'error', message: 'Informe a URL ou ID da planilha.' });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      onSaveConfig(rawId, selectedSheet || 'Dados_UF');
      await onLoadData(rawId, selectedSheet || 'Dados_UF');
      setFeedback({ type: 'success', message: 'Dados da planilha carregados no dashboard com sucesso!' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao carregar dados da planilha.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyWebApp = async () => {
    if (!inputWebAppUrl.trim()) {
      setFeedback({ type: 'error', message: 'Informe a URL do Web App.' });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      if (onSaveWebAppUrl) {
        onSaveWebAppUrl(inputWebAppUrl.trim());
      }
      setFeedback({
        type: 'success',
        message: 'URL do Web App conectada com sucesso! Atualização contínua a cada 60s ativada.'
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao carregar dados do Web App.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplateClick = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const createdId = await onCreateTemplate();
      setInputUrlOrId(createdId);
      setSelectedSheet('Dados_UF');
      setFeedback({
        type: 'success',
        message: 'Planilha modelo criada no seu Google Drive com todos os 27 estados!'
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Falha ao criar planilha modelo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmExport = async () => {
    setShowConfirmExport(false);
    const rawId = extractSpreadsheetId(inputUrlOrId);
    if (!rawId) {
      setFeedback({ type: 'error', message: 'Informe a planilha de destino.' });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      await onExportToSheet(rawId, selectedSheet || 'Dados_UF');
      setFeedback({
        type: 'success',
        message: `Dados atuais de ${currentStatesCount} estados gravados na aba "${selectedSheet || 'Dados_UF'}" com sucesso!`
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao gravar dados na planilha.' });
    } finally {
      setLoading(false);
    }
  };

  const currentId = extractSpreadsheetId(inputUrlOrId);

  return (
    <div className="sheets-modal-overlay">
      <style>{`
        .sheets-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .sheets-modal-content {
          background: #ffffff;
          width: 100%;
          max-width: 580px;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .sheets-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #edf2f7;
          background: #f8fafc;
        }

        .sheets-modal-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }

        .sheets-modal-close {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: background 0.15s;
        }

        .sheets-modal-close:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .sheets-modal-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .field-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 13px;
          color: #1e293b;
          outline: none;
          transition: border-color 0.15s;
        }

        .field-input:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
        }

        .field-select {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 13px;
          color: #1e293b;
          background: #ffffff;
          outline: none;
        }

        .template-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 12px 14px;
          gap: 12px;
        }

        .template-text {
          font-size: 12px;
          color: #166534;
        }

        .template-text strong {
          display: block;
          margin-bottom: 2px;
        }

        .btn-template {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #15803d;
          color: #ffffff;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s;
        }

        .btn-template:hover:not(:disabled) {
          background: #166534;
        }

        .column-format-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 11px;
          color: #475569;
        }

        .column-format-box code {
          background: #e2e8f0;
          padding: 2px 4px;
          border-radius: 4px;
          color: #0f172a;
          font-family: monospace;
        }

        .feedback-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
        }

        .feedback-banner.success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #15803d;
        }

        .feedback-banner.error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        .sheets-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-top: 1px solid #edf2f7;
          background: #f8fafc;
          gap: 10px;
          flex-wrap: wrap;
        }

        .footer-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-secondary {
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          background: #0284c7;
          color: #ffffff;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0369a1;
        }

        /* Modal de Confirmação Obrigatório */
        .confirm-dialog-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .confirm-dialog-card {
          background: #ffffff;
          max-width: 440px;
          width: 100%;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid #e2e8f0;
        }
      `}</style>

      <div className="sheets-modal-content">
        {/* Cabeçalho */}
        <div className="sheets-modal-header">
          <div className="sheets-modal-title">
            <FileSpreadsheet size={20} color="#15803d" />
            <span>Configuração do Google Sheets — Página Iscas</span>
          </div>
          <button className="sheets-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div className="sheets-modal-body">
          {feedback && (
            <div className={`feedback-banner ${feedback.type}`}>
              {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Seção Conexão Web App Google Apps Script (doGet) */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
              <strong style={{ fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚡ URL do Web App (Google Apps Script)
              </strong>
              {inputWebAppUrl && (
                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                  ● Atualização a cada 60s
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
              Cole a URL do Web App gerada no Passo 1 (Google Apps Script). O dashboard fará a requisição automática e atualizará a cada 60 segundos.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="field-input"
                placeholder="Ex: https://script.google.com/macros/s/AKfycb.../exec"
                value={inputWebAppUrl}
                onChange={(e) => setInputWebAppUrl(e.target.value)}
                style={{ flex: '1 1 220px' }}
              />
              <button
                className="btn-primary"
                onClick={handleApplyWebApp}
                disabled={loading || !inputWebAppUrl.trim()}
                style={{ whiteSpace: 'nowrap' }}
              >
                Conectar Web App
              </button>
              {inputWebAppUrl && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setInputWebAppUrl('');
                    if (onSaveWebAppUrl) onSaveWebAppUrl('');
                    setFeedback({ type: 'success', message: 'URL do Web App removida.' });
                  }}
                  style={{ whiteSpace: 'nowrap', color: '#b91c1c', borderColor: '#fca5a5' }}
                >
                  Limpar URL
                </button>
              )}
            </div>
          </div>

          {/* Atalho para Criar Modelo */}
          <div className="template-card">
            <div className="template-text">
              <strong>Não tem uma planilha pronta?</strong>
              Crie uma planilha oficial no seu Google Drive com os 27 estados já formatados.
            </div>
            <button
              className="btn-template"
              onClick={handleCreateTemplateClick}
              disabled={loading || !token}
              title="Criar planilha modelo diretamente no Google Drive"
            >
              <PlusCircle size={14} />
              <span>Criar Modelo</span>
            </button>
          </div>

          {/* Campo URL ou ID da Planilha */}
          <div className="field-group">
            <label className="field-label">
              <span>URL ou ID da Planilha Google</span>
              {currentId && (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${currentId}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                >
                  <ExternalLink size={12} /> Abrir no Google Sheets
                </a>
              )}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="field-input"
                placeholder="Ex: https://docs.google.com/spreadsheets/d/1BxiMVs0X... ou ID"
                value={inputUrlOrId}
                onChange={(e) => setInputUrlOrId(e.target.value)}
              />
              <button
                className="btn-secondary"
                onClick={handleFetchMetadata}
                disabled={loading || !inputUrlOrId.trim()}
                title="Verificar planilha e listar abas"
                style={{ whiteSpace: 'nowrap' }}
              >
                {loading ? <RefreshCw size={14} className="spin-icon" /> : 'Verificar'}
              </button>
            </div>
          </div>

          {/* Seleção de Aba / Sheet */}
          <div className="field-group">
            <label className="field-label">Aba / Página da Planilha</label>
            {availableSheets.length > 0 ? (
              <select
                className="field-select"
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
              >
                {availableSheets.map((s) => (
                  <option key={s.sheetId} value={s.title}>
                    {s.title}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="field-input"
                placeholder="Nome da aba (ex: Dados_UF, Sheet1)"
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
              />
            )}
          </div>

          {/* Guia de Colunas */}
          <div className="column-format-box">
            <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HelpCircle size={13} />
              <span>Colunas esperadas na planilha:</span>
            </div>
            <div>
              <code>UF</code> • <code>Estado</code> • <code>Líder</code> • <code>Partido</code> • <code>% Válidos</code> • <code>% Apurado</code> • <code>Cor (orange/blue)</code>
            </div>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="sheets-modal-footer">
          <div>
            <button
              className="btn-secondary"
              onClick={() => setShowConfirmExport(true)}
              disabled={loading || !currentId}
              title="Gravar o estado atual do mapa na planilha Google"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Upload size={14} />
              <span>Exportar para a Planilha</span>
            </button>
          </div>

          <div className="footer-actions">
            <button className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={handleApplyAndLoad}
              disabled={loading || !currentId}
            >
              <Download size={14} />
              <span>{loading ? 'Carregando...' : 'Carregar no Dashboard'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Diálogo Obrigatório de Confirmação para Atualização/Sobrescrita da Planilha */}
      {showConfirmExport && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b45309', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
              <strong style={{ fontSize: '15px', color: '#0f172a' }}>Confirmar gravação na Planilha Google</strong>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
              Você tem certeza que deseja atualizar os dados da planilha na aba <strong>"{selectedSheet || 'Dados_UF'}"</strong>?
              <br /><br />
              Esta ação irá preencher as células com os dados atuais de <strong>{currentStatesCount} estados</strong> do dashboard da página Iscas.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowConfirmExport(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                style={{ background: '#b45309' }}
                onClick={handleConfirmExport}
              >
                Confirmar e Gravar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
