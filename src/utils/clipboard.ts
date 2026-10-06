/**
 * Safe clipboard helper utility with multi-tier fallback support.
 * Prevents "Document is not focused" DOMExceptions in iframes and dev environments.
 */

export function fallbackCopyText(text: string): boolean {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    
    // Attempt focus & select
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.warn('[Clipboard] Fallback execCommand failed:', err);
    return false;
  }
}

export async function safeCopyText(text: string): Promise<boolean> {
  // Try bringing focus to current window
  try {
    window.focus();
  } catch (_) {}

  // Attempt modern clipboard API if document has focus
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('[Clipboard] navigator.clipboard.writeText failed, using fallback:', err);
    }
  }

  // Fallback to execCommand
  return fallbackCopyText(text);
}

export async function safeCopyHtmlAndText(
  htmlContent: string, 
  plainText: string, 
  imageBlob?: Blob | null
): Promise<boolean> {
  try {
    window.focus();
  } catch (_) {}

  if (navigator.clipboard && window.ClipboardItem && typeof navigator.clipboard.write === 'function') {
    try {
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });

      if (imageBlob) {
        try {
          const itemMulti = new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob,
            'image/png': imageBlob
          });
          await navigator.clipboard.write([itemMulti]);
          return true;
        } catch (err) {
          console.warn('[Clipboard] Multi-mime clipboard item failed, falling back to html/text:', err);
        }
      }

      const itemHtml = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      });
      await navigator.clipboard.write([itemHtml]);
      return true;
    } catch (err) {
      console.warn('[Clipboard] navigator.clipboard.write failed, trying text fallback:', err);
    }
  }

  return safeCopyText(plainText);
}

export async function safeCopyImage(blob: Blob, fallbackFileName: string = 'imagem.png'): Promise<{ copied: boolean; downloaded: boolean }> {
  try {
    window.focus();
  } catch (_) {}

  if (navigator.clipboard && window.ClipboardItem && typeof navigator.clipboard.write === 'function') {
    try {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return { copied: true, downloaded: false };
    } catch (err) {
      console.warn('[Clipboard] Image clipboard write failed (e.g. document not focused), triggering download:', err);
    }
  }

  // Graceful fallback: download image file directly
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fallbackFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { copied: false, downloaded: true };
  } catch (downloadErr) {
    console.error('[Clipboard] Failed to download image fallback:', downloadErr);
    return { copied: false, downloaded: false };
  }
}
