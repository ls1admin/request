import type { StoredSSHKey } from "@/types/vm-request";

import { api } from "./api";

export interface SSHKeyCreateRequest {
  name: string;
  publicKey: string;
}

export const sshKeysService = {
  /**
   * Fetches all SSH keys for the authenticated user
   */
  list: async (): Promise<StoredSSHKey[]> => {
    return api.get<StoredSSHKey[]>("/ssh-keys");
  },

  /**
   * Creates a new SSH key
   */
  create: async (data: SSHKeyCreateRequest): Promise<StoredSSHKey> => {
    return api.post<StoredSSHKey>("/ssh-keys", data);
  },

  /**
   * Deletes an SSH key
   */
  delete: async (id: string): Promise<void> => {
    return api.delete(`/ssh-keys/${id}`);
  },
};
