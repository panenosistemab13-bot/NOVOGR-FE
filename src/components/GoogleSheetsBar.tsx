import React from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  RefreshCw,
  Settings,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface GoogleSheetsBarProps {
  user: User | null;
  spreadsheetId: string;
  spreadsheetTitle: string | null;
  lastSyncTime: Date | null;
  isLoading: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  onOpenSettings: () => void;
}

export default function GoogleSheetsBar({
  user,
  spreadsheetId,
  spreadsheetTitle,
  lastSyncTime,
  isLoading,
  error,
  onConnect,
  onDisconnect,
  onSync,
  onOpenSettings,
}: GoogleSheetsBarProps) {
  return (
    <div className="sheets-integration-bar">
      <style>{`
        .sheets-integration-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          border: 1px solid #dce5ee;
          border-radius: 12px;
          padding: 8px 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 6px rgba(0, 35, 102, 0.04);
          font-family: inherit;
          gap: 12px;
          flex-wrap: wrap;
        }

        .sheets-bar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .sheets-icon-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: #e6f4ea;
          color: #137333;
          flex-shrink: 0;
        }

        .sheets-info {
          display: flex;
          flex-direction: column;
        }

        .sheets-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: #1a365d;
        }

        .sheets-meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          color: #64748b;
        }

        .sheets-status-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .sheets-status-tag.connected {
          background: #e6f4ea;
          color: #137333;
        }

        .sheets-status-tag.disconnected {
          background: #f1f5f9;
          color: #64748b;
        }

        .sheets-bar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sheets-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid #dce5ee;
          background: #ffffff;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sheets-action-btn:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .sheets-action-btn.primary {
          background: #0f4c81;
          color: #ffffff;
          border-color: #0f4c81;
        }

        .sheets-action-btn.primary:hover:not(:disabled) {
          background: #0b375e;
          border-color: #0b375e;
        }

        .sheets-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Botão oficial Sign In With Google conforme diretriz Google Identity */
        .gsi-material-button {
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-appearance: none;
          background-color: #ffffff;
          border: 1px solid #747775;
          border-radius: 20px;
          box-sizing: border-box;
          color: #1f1f1f;
          cursor: pointer;
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          font-size: 13px;
          height: 36px;
          letter-spacing: 0.2px;
          outline: none;
          overflow: hidden;
          padding: 0 12px;
          position: relative;
          text-align: center;
          transition: background-color .218s, border-color .218s, box-shadow .218s;
          display: inline-flex;
          align-items: center;
        }

        .gsi-material-button:hover {
          background-color: #f8fafc;
          box-shadow: 0 1px 3px rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15);
        }

        .gsi-material-button .gsi-material-button-icon {
          height: 18px;
          margin-right: 8px;
          min-width: 18px;
          width: 18px;
        }

        .gsi-material-button .gsi-material-button-content-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .gsi-material-button .gsi-material-button-contents {
          font-weight: 500;
          font-size: 13px;
          white-space: nowrap;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Lado Esquerdo: Identificação e Status */}
      <div className="sheets-bar-left">
        <div className="sheets-icon-badge">
          <FileSpreadsheet size={18} />
        </div>

        <div className="sheets-info">
          <div className="sheets-title-row">
            <span>Google Sheets</span>
            {user ? (
              <span className="sheets-status-tag connected">
                <CheckCircle2 size={10} /> Conectado
              </span>
            ) : (
              <span className="sheets-status-tag disconnected">
                Desconectado
              </span>
            )}
          </div>

          <div className="sheets-meta-row">
            {user ? (
              <>
                <span>{user.email}</span>
                {spreadsheetTitle && (
                  <>
                    <span>•</span>
                    <strong style={{ color: '#0f4c81' }}>{spreadsheetTitle}</strong>
                  </>
                )}
                {lastSyncTime && (
                  <>
                    <span>•</span>
                    <span>Sincronizado: {lastSyncTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </>
                )}
              </>
            ) : (
              <span>Conecte sua conta Google para carregar ou sincronizar dados de planilhas.</span>
            )}
          </div>
        </div>
      </div>

      {/* Lado Direito: Ações */}
      <div className="sheets-bar-right">
        {error && (
          <span style={{ fontSize: '11px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} /> {error}
          </span>
        )}

        {user ? (
          <>
            {spreadsheetId && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                target="_blank"
                rel="noreferrer"
                className="sheets-action-btn"
                title="Abrir planilha no Google Sheets"
              >
                <ExternalLink size={14} />
                <span>Abrir Planilha</span>
              </a>
            )}

            <button
              onClick={onSync}
              disabled={isLoading || !spreadsheetId}
              className="sheets-action-btn primary"
              title="Sincronizar dados agora"
            >
              <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} />
              <span>{isLoading ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="sheets-action-btn"
              title="Configurar Planilha"
            >
              <Settings size={14} />
              <span>Configurar</span>
            </button>

            <button
              onClick={onDisconnect}
              className="sheets-action-btn"
              title="Desconectar do Google"
              style={{ color: '#64748b' }}
            >
              <LogOut size={14} />
            </button>
          </>
        ) : (
          <button
            className="gsi-material-button"
            onClick={onConnect}
            disabled={isLoading}
            title="Fazer login com a conta Google para conectar Google Sheets"
          >
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
              </div>
              <span className="gsi-material-button-contents">
                {isLoading ? 'Conectando...' : 'Conectar Google Sheets'}
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
