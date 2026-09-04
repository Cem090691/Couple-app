// Adaptateur de stockage pour la session Supabase sur mobile.
//
// `expo-secure-store` (Keychain / Keystore) limite chaque valeur à 2 Ko,
// ce qu'une session Supabase sérialisée (access token + refresh token +
// objet utilisateur) peut dépasser. Pattern recommandé par Supabase pour
// Expo : une clé AES aléatoire, courte, vit dans SecureStore ; la valeur
// réelle est chiffrée avec cette clé et stockée dans AsyncStorage, qui
// n'a pas de limite de taille pratique.
//
// Le chiffrement local (compteur AES-CTR fixe) sert à protéger la
// session au repos sur l'appareil si AsyncStorage est lu hors du
// bac à sable de l'app ; il ne s'agit pas de chiffrement pour la
// transmission réseau.

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import aesjs from 'aes-js';

const ENCRYPTION_KEY_NAME = 'reconnect-session-encryption-key';

async function getEncryptionKey(): Promise<Uint8Array> {
  const existing = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
  if (existing) {
    return aesjs.utils.hex.toBytes(existing);
  }
  const key = await Crypto.getRandomBytesAsync(32);
  await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, aesjs.utils.hex.fromBytes(key));
  return key;
}

export const LargeSecureStore = {
  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    const encryptionKey = await getEncryptionKey();
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    return aesjs.utils.utf8.fromBytes(cipher.decrypt(aesjs.utils.hex.toBytes(encrypted)));
  },
  async setItem(key: string, value: string): Promise<void> {
    const encryptionKey = await getEncryptionKey();
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await AsyncStorage.setItem(key, aesjs.utils.hex.fromBytes(encrypted));
  },
  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};
