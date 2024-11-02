////////////////////////////////////////////////////////////////////////////////
////////////////////////////   ECDH KEY EXCHANGE   /////////////////////////////
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////   AES ENCRYPTION   //////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export const generateKey = async () => {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 }, /* AES-GCM for encryption, 256-bit key */
    true, /* Extractable to share the key */
    ["encrypt", "decrypt"] /* Key can be used for encryption and decryption */
  );
};

export const encryptMessage = async (key, message) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    data
  );

  return { iv, encrypted };
}

export const decryptMessage = async (key, iv, encrypted) => {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encrypted
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
