////////////////////////////////////////////////////////////////////////////////
////////////////////////////   ECDH KEY EXCHANGE   /////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/* Generates a key pair, public and private, using the Elliptic-curve Diffie–Hellman protocol */
export const generateECDHKeyPair = async () => {
  return await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey']
  );
}

/* Export the public key to a JSON Web Key so it can be send through a socket */
export const exportPublicKey = async (publicKey) => {
  return await crypto.subtle.exportKey('jwk', publicKey);
}

/* Import from a JSON Web Key to a CryptoKey object */
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

/* Derive the shared key used for AES-GCM encryption */
export const deriveSharedKey = async (privateKey, otherPublicKey) => {
  return await crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: otherPublicKey,
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////   AES-GCM ENCRYPTION   ////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/* Encrypt the given plaintext message with the shared AES key */
export const encryptMessage = async (key, message) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  /* Initialisation vector */
  const iv = crypto.getRandomValues(new Uint8Array(12));

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

/* Decrypt the given ciphertext message with the shared AES key and the initialisation vector */
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

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////   CAESAR CIPHER   //////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/* Generate a random number between 1 and 25 (inclusive) */
export const getRandomShift = () => Math.floor(Math.random() * 25) + 1;

/* Performs a Caesar cipher on a string with the given shift */
export const caesarCipher = (message, shift) => {
  shift %= 26;
  let newMessage = '';
  for (let i = 0; i < message.length; i++) {
    let code = message[i].charCodeAt(0);
    if (code >= 65 && code <= 90) {
      newMessage += String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);      
    } else if (code >= 97 && code <= 122) {
      newMessage += String.fromCharCode(((code - 97 + shift + 26) % 26) + 97);
    } else {
      newMessage += message[i];
    }
  }
  return newMessage;
};
