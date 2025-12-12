/**
 * SSH Key validation utilities
 * Validates RSA keys (min 4096 bits) and EC keys (Ed25519, ECDSA)
 */

export type SSHKeyType = "rsa" | "ed25519" | "ecdsa" | "unknown";

export interface SSHKeyValidationResult {
  valid: boolean;
  keyType: SSHKeyType;
  error?: string;
}

// Valid SSH key type prefixes
const SSH_KEY_PREFIXES = {
  rsa: "ssh-rsa",
  ed25519: "ssh-ed25519",
  ecdsa256: "ecdsa-sha2-nistp256",
  ecdsa384: "ecdsa-sha2-nistp384",
  ecdsa521: "ecdsa-sha2-nistp521",
} as const;

/**
 * Detects the type of SSH key from the public key string
 */
export function detectKeyType(publicKey: string): SSHKeyType {
  const trimmed = publicKey.trim();

  if (trimmed.startsWith(SSH_KEY_PREFIXES.rsa)) {
    return "rsa";
  }
  if (trimmed.startsWith(SSH_KEY_PREFIXES.ed25519)) {
    return "ed25519";
  }
  if (
    trimmed.startsWith(SSH_KEY_PREFIXES.ecdsa256) ||
    trimmed.startsWith(SSH_KEY_PREFIXES.ecdsa384) ||
    trimmed.startsWith(SSH_KEY_PREFIXES.ecdsa521)
  ) {
    return "ecdsa";
  }

  return "unknown";
}

/**
 * Estimates RSA key size from the base64-encoded public key
 * This is an approximation based on the length of the key data
 */
function estimateRSAKeySize(base64Key: string): number {
  try {
    // Decode base64 to get raw bytes length
    const binaryString = atob(base64Key);
    const byteLength = binaryString.length;

    // RSA public key structure overhead is roughly 38 bytes for the header
    // The modulus size in bits is approximately (byteLength - 38) * 8
    // This is a simplified estimation
    const estimatedBits = (byteLength - 38) * 8;

    // Round to nearest common key size
    if (estimatedBits >= 3800 && estimatedBits < 4500) return 4096;
    if (estimatedBits >= 1800 && estimatedBits < 2500) return 2048;
    if (estimatedBits >= 900 && estimatedBits < 1300) return 1024;
    if (estimatedBits >= 7500) return 8192;

    return estimatedBits;
  } catch {
    return 0;
  }
}

/**
 * Validates an SSH public key
 * - RSA keys must be at least 4096 bits
 * - Ed25519 and ECDSA keys are accepted
 */
export function validateSSHKey(publicKey: string): SSHKeyValidationResult {
  const trimmed = publicKey.trim();

  if (!trimmed) {
    return {
      valid: false,
      keyType: "unknown",
      error: "SSH public key is required",
    };
  }

  const keyType = detectKeyType(trimmed);

  if (keyType === "unknown") {
    return {
      valid: false,
      keyType: "unknown",
      error:
        "Invalid SSH key format. Key must start with ssh-rsa, ssh-ed25519, or ecdsa-sha2-*",
    };
  }

  // Split key into parts: type, base64-data, [comment]
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) {
    return {
      valid: false,
      keyType,
      error: "Invalid SSH key format. Key must have type and data components",
    };
  }

  const base64Data = parts[1];

  // Validate base64 format
  if (!/^[A-Za-z0-9+/]+=*$/.test(base64Data)) {
    return {
      valid: false,
      keyType,
      error: "Invalid SSH key: key data is not valid base64",
    };
  }

  // For RSA keys, check minimum size
  if (keyType === "rsa") {
    const keySize = estimateRSAKeySize(base64Data);
    if (keySize < 4096) {
      return {
        valid: false,
        keyType,
        error: `RSA key must be at least 4096 bits. Detected approximately ${keySize} bits`,
      };
    }
  }

  return {
    valid: true,
    keyType,
  };
}

/**
 * Gets a human-readable description of the key type
 */
export function getKeyTypeLabel(keyType: SSHKeyType): string {
  switch (keyType) {
    case "rsa":
      return "RSA";
    case "ed25519":
      return "Ed25519";
    case "ecdsa":
      return "ECDSA";
    default:
      return "Unknown";
  }
}
