////////////////////////////////////////////////////////////////////////////////
////////////////////////////   ECDH KEY EXCHANGE   /////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export const generateECDHKeyPair = async () => {
  return await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true, /* Extractable to share the public key */
    ['deriveKey']
  );
}

export const exportPublicKey = async (publicKey) => {
  return await crypto.subtle.exportKey('jwk', publicKey); // Export in JWK format
}

export const importPublicKey = async (jwkKey) => {
  return await crypto.subtle.importKey(
    'jwk',
    jwkKey,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );
}

export const deriveSharedKey = async (privateKey, otherPublicKey) => {
  return await crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: otherPublicKey,
    },
    privateKey,
    {
      name: 'AES-GCM', // Define AES-GCM as the algorithm for encryption
      length: 256,
    },
    true, // Extractable to use for encryption/decryption
    ['encrypt', 'decrypt']
  );
}

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////   AES ENCRYPTION   //////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// export const generateKey = async () => {
//   return crypto.subtle.generateKey(
//     { name: 'AES-GCM', length: 256 }, /* AES-GCM for encryption, 256-bit key */
//     true, /* Extractable to share the key */
//     ['encrypt', 'decrypt'] /* Key can be used for encryption and decryption */
//   );
// };

export const encryptMessage = async (key, message) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM

  const encryptedMessage = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );

  return { iv, encryptedMessage };
}

export const decryptMessage = async (key, encryptedMessage, iv) => {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encryptedMessage
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
