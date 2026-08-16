/**
 * Helper utility for cross-platform and mobile-friendly printing
 * Handles mobile browsers, iframe restrictions, and native Save-as-PDF workflows.
 */

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isInsideIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

export function triggerPrint(): void {
  try {
    // Focus window first (required by iOS Safari and Android Chrome)
    window.focus();
    
    // Check if we are in an iframe
    if (isInsideIframe()) {
      // Try printing directly
      window.print();
    } else {
      window.print();
    }
  } catch (err) {
    console.error('Direct print failed, attempting fallback:', err);
    try {
      window.print();
    } catch (e) {
      alert('Mobile print error: Please open this page in a new browser tab to print or save as PDF.');
    }
  }
}
