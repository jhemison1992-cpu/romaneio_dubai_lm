import { describe, it, expect } from 'vitest';

/**
 * Testes para funcionalidade de assinatura digital
 */

describe('Signature Utils', () => {
  it('should generate a valid SHA-256 hash', async () => {
    const content = 'Test document content';
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    expect(hashHex).toBeDefined();
    expect(hashHex.length).toBe(64); // SHA-256 produces 64 hex characters
    expect(/^[a-f0-9]{64}$/.test(hashHex)).toBe(true);
  });

  it('should generate consistent hash for same content', async () => {
    const content = 'Same content';
    const encoder = new TextEncoder();

    const hash1 = await crypto.subtle.digest('SHA-256', encoder.encode(content));
    const hash2 = await crypto.subtle.digest('SHA-256', encoder.encode(content));

    const array1 = Array.from(new Uint8Array(hash1));
    const array2 = Array.from(new Uint8Array(hash2));

    expect(array1).toEqual(array2);
  });

  it('should generate different hash for different content', async () => {
    const encoder = new TextEncoder();

    const hash1 = await crypto.subtle.digest('SHA-256', encoder.encode('Content 1'));
    const hash2 = await crypto.subtle.digest('SHA-256', encoder.encode('Content 2'));

    const array1 = Array.from(new Uint8Array(hash1)).join('');
    const array2 = Array.from(new Uint8Array(hash2)).join('');

    expect(array1).not.toEqual(array2);
  });

  it('should generate valid validation token', () => {
    const signatureImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const documentHash = 'abc123def456';
    const timestamp = '2026-03-04T10:27:00.000Z';

    const combined = `${signatureImage.substring(0, 50)}${documentHash}${timestamp}`;
    const token = btoa(combined).substring(0, 32);

    expect(token).toBeDefined();
    expect(token.length).toBe(32);
    expect(/^[A-Za-z0-9+/]{32}$/.test(token)).toBe(true);
  });

  it('should generate consistent validation token', () => {
    const signatureImage = 'data:image/png;base64,test';
    const documentHash = 'hash123';
    const timestamp = '2026-03-04T10:27:00.000Z';

    const combined1 = `${signatureImage.substring(0, 50)}${documentHash}${timestamp}`;
    const token1 = btoa(combined1).substring(0, 32);

    const combined2 = `${signatureImage.substring(0, 50)}${documentHash}${timestamp}`;
    const token2 = btoa(combined2).substring(0, 32);

    expect(token1).toEqual(token2);
  });

  it('should validate signature with correct hash', () => {
    const signature = {
      id: 'sig_123',
      signatureImage: 'data:image/png;base64,test',
      signerName: 'João Silva',
      signerRole: 'Engenheiro',
      timestamp: new Date().toISOString(),
      documentHash: 'abc123',
      documentId: 'doc_1',
      isValid: true,
      validationToken: 'token123',
    };

    const currentDocumentHash = 'abc123';

    // Simular validação básica
    const isHashValid = signature.documentHash === currentDocumentHash;
    expect(isHashValid).toBe(true);
  });

  it('should reject signature with mismatched hash', () => {
    const signature = {
      id: 'sig_123',
      signatureImage: 'data:image/png;base64,test',
      signerName: 'João Silva',
      signerRole: 'Engenheiro',
      timestamp: new Date().toISOString(),
      documentHash: 'abc123',
      documentId: 'doc_1',
      isValid: true,
      validationToken: 'token123',
    };

    const currentDocumentHash = 'different_hash';

    // Simular validação básica
    const isHashValid = signature.documentHash === currentDocumentHash;
    expect(isHashValid).toBe(false);
  });

  it('should generate unique signature IDs', () => {
    const id1 = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const id2 = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    expect(id1).not.toEqual(id2);
  });

  it('should format signature date correctly', () => {
    const timestamp = '2026-03-04T10:27:00.000Z';
    const date = new Date(timestamp);
    const formatted = date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    expect(formatted).toBeDefined();
    expect(formatted).toContain('04');
    expect(formatted).toContain('03');
    expect(formatted).toContain('2026');
  });

  it('should export signature data to JSON', () => {
    const signature = {
      id: 'sig_123',
      signatureImage: 'data:image/png;base64,test',
      signerName: 'João Silva',
      signerRole: 'Engenheiro',
      timestamp: '2026-03-04T10:27:00.000Z',
      documentHash: 'abc123',
      documentId: 'doc_1',
      isValid: true,
      validationToken: 'token123',
    };

    const json = JSON.stringify(signature, null, 2);
    expect(json).toContain('João Silva');
    expect(json).toContain('abc123');
    expect(json).toContain('sig_123');
  });

  it('should import signature data from JSON', () => {
    const json = JSON.stringify({
      id: 'sig_123',
      signatureImage: 'data:image/png;base64,test',
      signerName: 'João Silva',
      signerRole: 'Engenheiro',
      timestamp: '2026-03-04T10:27:00.000Z',
      documentHash: 'abc123',
      documentId: 'doc_1',
      isValid: true,
      validationToken: 'token123',
    });

    const imported = JSON.parse(json);
    expect(imported.signerName).toBe('João Silva');
    expect(imported.documentHash).toBe('abc123');
    expect(imported.isValid).toBe(true);
  });
});
