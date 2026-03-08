// THIS FILE IS A DEVELOPMENT STUB
// The real backend.ts is injected by the Caffeine build pipeline.

export interface Subject {
  id: bigint;
  name: string;
  batchType: string;
  displayOrder: bigint;
}

export interface Video {
  id: bigint;
  title: string;
  description: string;
  videoUrl: string;
  subjectId: bigint;
  displayOrder: bigint;
  createdAt: bigint;
}

export interface backendInterface {
  adminLogin(
    username: string,
    password: string,
  ): Promise<{ ok: string } | { err: string }>;
  adminLogout(token: string): Promise<{ ok: null } | { err: string }>;
  verifyToken(token: string): Promise<boolean>;
  getLogoUrl(): Promise<string>;
  setLogoUrl(
    token: string,
    url: string,
  ): Promise<{ ok: null } | { err: string }>;
  getSubjectsByBatch(batchType: string): Promise<Subject[]>;
  getSubjectById(id: bigint): Promise<Subject | null>;
  addSubject(
    token: string,
    name: string,
    batchType: string,
    displayOrder: bigint,
  ): Promise<{ ok: Subject } | { err: string }>;
  editSubject(
    token: string,
    id: bigint,
    name: string,
    batchType: string,
    displayOrder: bigint,
  ): Promise<{ ok: Subject } | { err: string }>;
  deleteSubject(
    token: string,
    id: bigint,
  ): Promise<{ ok: null } | { err: string }>;
  getAllSubjects(): Promise<Subject[]>;
  getVideosBySubject(subjectId: bigint): Promise<Video[]>;
  getVideoById(id: bigint): Promise<Video | null>;
  addVideo(
    token: string,
    title: string,
    description: string,
    videoUrl: string,
    subjectId: bigint,
    displayOrder: bigint,
  ): Promise<{ ok: Video } | { err: string }>;
  editVideo(
    token: string,
    id: bigint,
    title: string,
    description: string,
    videoUrl: string,
    subjectId: bigint,
    displayOrder: bigint,
  ): Promise<{ ok: Video } | { err: string }>;
  deleteVideo(
    token: string,
    id: bigint,
  ): Promise<{ ok: null } | { err: string }>;
  getAllVideos(): Promise<Video[]>;
  _caffeineStorageBlobIsLive(hash: Uint8Array): Promise<boolean>;
  _caffeineStorageBlobsToDelete(): Promise<Uint8Array[]>;
  _caffeineStorageConfirmBlobDeletion(blobs: Uint8Array[]): Promise<void>;
  _caffeineStorageCreateCertificate(
    blobHash: string,
  ): Promise<{ blob_hash: string; method: string }>;
  _caffeineStorageRefillCashier(
    info: { proposed_top_up_amount?: bigint } | null,
  ): Promise<{ success?: boolean; topped_up_amount?: bigint }>;
  _caffeineStorageUpdateGatewayPrincipals(): Promise<void>;
}

export interface CreateActorOptions {
  agentOptions?: {
    // Using any to be compatible with the generated backend's Identity type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    identity?: any;
    host?: string;
    [key: string]: unknown;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agent?: any;
  processError?: (e: unknown) => never;
}

export class ExternalBlob {
  static fromURL(url: string): ExternalBlob {
    const instance = new ExternalBlob();
    instance._url = url;
    return instance;
  }

  private _url = "";

  async getBytes(): Promise<Uint8Array> {
    const response = await fetch(this._url);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  onProgress?: (progress: number) => void;
}

export function createActor(
  _canisterId: string,
  _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
  _downloadFile: (bytes: Uint8Array) => Promise<ExternalBlob>,
  _options?: CreateActorOptions,
): Promise<backendInterface> {
  return Promise.reject(new Error("backend stub: generated file not present"));
}
