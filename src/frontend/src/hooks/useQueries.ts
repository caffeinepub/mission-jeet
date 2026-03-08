import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// Types
export type Subject = {
  id: bigint;
  name: string;
  batchType: string;
  displayOrder: bigint;
};

export type Video = {
  id: bigint;
  title: string;
  description: string;
  videoUrl: string;
  subjectId: bigint;
  displayOrder: bigint;
  createdAt: bigint;
};

// ── Logo ──────────────────────────────────────────────────────────────────────

export function useLogoUrl() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["logo"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getLogoUrl();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Subjects ──────────────────────────────────────────────────────────────────

export function useSubjectsByBatch(batchType: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Subject[]>({
    queryKey: ["subjects", batchType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjectsByBatch(batchType) as Promise<Subject[]>;
    },
    enabled: !!actor && !isFetching && !!batchType,
  });
}

export function useSubjectById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Subject | null>({
    queryKey: ["subject", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      const result = await (actor.getSubjectById(
        id,
      ) as Promise<Subject | null>);
      return result ?? null;
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAllSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Subject[]>({
    queryKey: ["subjects", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubjects() as Promise<Subject[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Videos ────────────────────────────────────────────────────────────────────

export function useVideosBySubject(subjectId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos", "subject", subjectId?.toString()],
    queryFn: async () => {
      if (!actor || subjectId === null) return [];
      return actor.getVideosBySubject(subjectId) as Promise<Video[]>;
    },
    enabled: !!actor && !isFetching && subjectId !== null,
  });
}

export function useVideoById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Video | null>({
    queryKey: ["video", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      const result = await (actor.getVideoById(id) as Promise<Video | null>);
      return result ?? null;
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAllVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos() as Promise<Video[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Admin Mutations ───────────────────────────────────────────────────────────

export function useSetLogoUrl() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ token, url }: { token: string; url: string }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor.setLogoUrl(token, url) as Promise<
        { ok: null } | { err: string }
      >);
      if ("err" in result) throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logo"] });
    },
  });
}

export function useAddSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      name,
      batchType,
      displayOrder,
    }: {
      token: string;
      name: string;
      batchType: string;
      displayOrder: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor.addSubject(
        token,
        name,
        batchType,
        displayOrder,
      ) as Promise<{ ok: Subject } | { err: string }>);
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({
        queryKey: ["subjects", variables.batchType],
      });
    },
  });
}

export function useEditSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      id,
      name,
      batchType,
      displayOrder,
    }: {
      token: string;
      id: bigint;
      name: string;
      batchType: string;
      displayOrder: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor.editSubject(
        token,
        id,
        name,
        batchType,
        displayOrder,
      ) as Promise<{ ok: Subject } | { err: string }>);
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useDeleteSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ token, id }: { token: string; id: bigint }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor.deleteSubject(token, id) as Promise<
        { ok: null } | { err: string }
      >);
      if ("err" in result) throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useAddVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      title,
      description,
      videoUrl,
      subjectId,
      displayOrder,
    }: {
      token: string;
      title: string;
      description: string;
      videoUrl: string;
      subjectId: bigint;
      displayOrder: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor.addVideo(
        token,
        title,
        description,
        videoUrl,
        subjectId,
        displayOrder,
      ) as Promise<{ ok: Video } | { err: string }>);
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["videos", "subject", variables.subjectId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["videos", "all"] });
    },
  });
}

export function useEditVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      token,
      id,
      title,
      description,
      videoUrl,
      subjectId,
      displayOrder,
    }: {
      token: string;
      id: bigint;
      title: string;
      description: string;
      videoUrl: string;
      subjectId: bigint;
      displayOrder: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor.editVideo(
        token,
        id,
        title,
        description,
        videoUrl,
        subjectId,
        displayOrder,
      ) as Promise<{ ok: Video } | { err: string }>);
      if ("err" in result) throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ token, id }: { token: string; id: bigint }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor.deleteVideo(token, id) as Promise<
        { ok: null } | { err: string }
      >);
      if ("err" in result) throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

// ── Video Embed Helper ────────────────────────────────────────────────────────

export function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  if (url.includes("youtube.com/embed/")) return url;
  return null;
}
