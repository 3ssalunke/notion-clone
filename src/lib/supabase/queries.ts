"use server";
import { validate } from "uuid";
import { files, users, workspaces } from "../../../migrations/schema";
import db from "./db";
import { File, Folder, Subscription, User, Workspace } from "./supabase.types";
import { and, eq, ilike, notExists } from "drizzle-orm";
import { collaborators, folders } from "./schema";

export const getUserSubscriptionStatus = async (userId: string) => {
  try {
    const data = await db.query.subscriptions.findFirst({
      where: (s, { eq }) => eq(s.userId, userId),
    });
    if (data) return { data: data as Subscription, error: null };
    else return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: `Error` };
  }
};

export const createWorkspace = async (workspace: Workspace) => {
  try {
    await db.insert(workspaces).values(workspace);
    return { data: null, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: "Error" };
  }
};

export const getFiles = async (folderId: string) => {
  const isValid = validate(folderId);
  if (!isValid) return { data: null, error: "error" };
  try {
    const results = (await db
      .select()
      .from(files)
      .orderBy(files.createdAt)
      .where(eq(files.folderId, folderId))) as File[] | [];
    return { data: results, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error };
  }
};

export const getPrivateWorkspaces = async (userId: string) => {
  if (!userId) return [];
  const privateWorkspaces = (await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
      bannerUrl: workspaces.bannerUrl,
    })
    .from(workspaces)
    .where(
      and(
        notExists(
          db
            .select()
            .from(collaborators)
            .where(eq(collaborators.workspaceId, workspaces.id))
        ),
        eq(workspaces.workspaceOwner, userId)
      )
    )) as Workspace[];
  return privateWorkspaces;
};

export const getCollaboratingWorkspaces = async (userId: string) => {
  if (!userId) return [];
  const collaboratingWorkspaces = (await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
      bannerUrl: workspaces.bannerUrl,
    })
    .from(users)
    .innerJoin(collaborators, eq(users.id, collaborators.userId))
    .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id))
    .where(eq(users.id, userId))) as Workspace[];
  return collaboratingWorkspaces;
};

export const getSharedWorkspaces = async (userId: string) => {
  if (!userId) return [];
  const sharedWorkspaces = (await db
    .select({
      id: workspaces.id,
      createdAt: workspaces.createdAt,
      workspaceOwner: workspaces.workspaceOwner,
      title: workspaces.title,
      iconId: workspaces.iconId,
      data: workspaces.data,
      inTrash: workspaces.inTrash,
      logo: workspaces.logo,
      bannerUrl: workspaces.bannerUrl,
    })
    .from(workspaces)
    .orderBy(workspaces.createdAt)
    .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
    .where(eq(workspaces.workspaceOwner, userId))) as Workspace[];
  return sharedWorkspaces;
};

export const getUsersFromSearch = async (email: string) => {
  if (!email) return [];
  const accounts = await db
    .select()
    .from(users)
    .where(ilike(users.email, `${email}%`));
  return accounts;
};

export const addCollaborators = async (users: User[], workspaceId: string) => {
  users.forEach(async (user: User) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) =>
        and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
    });
    if (!userExists) {
      await db.insert(collaborators).values({ workspaceId, userId: user.id });
    }
  });
};

export const getFolders = async (workspaceId: string) => {
  const isValid = validate(workspaceId);
  if (!isValid)
    return {
      data: null,
      error: "invalid workspace id",
    };

  try {
    const results: Folder[] | [] = await db
      .select()
      .from(folders)
      .orderBy(folders.createdAt)
      .where(eq(folders.workspaceId, workspaceId));
    return { data: results, error: null };
  } catch (error) {
    return { data: null, error: "Error" };
  }
};

export const updateWorkspace = async (
  workspace: Partial<Workspace>,
  workspaceId: string
) => {
  if (!workspaceId) return;
  try {
    await db
      .update(workspaces)
      .set(workspace)
      .where(eq(workspaces.id, workspaceId));
    return { data: null, error: null };
  } catch (error) {
    console.error(`error while updating workspace ${workspaceId}`, error);
    return { data: null, error: null };
  }
};

export const removeCollaborators = async (
  users: User[],
  workspaceId: string
) => {
  users.forEach(async (user) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) =>
        and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
    });

    if (userExists) {
      await db
        .delete(collaborators)
        .where(
          and(
            eq(collaborators.workspaceId, workspaceId),
            eq(collaborators.userId, user.id)
          )
        );
    }
  });
};

export const deleteWorkspace = async (workspaceId: string) => {
  if (!workspaces) return;
  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
};

export const getActiveProductsWithPrice = async () => {
  try {
    const res = await db.query.products.findMany({
      where: (pro, { eq }) => eq(pro.active, true),
      with: {
        prices: {
          where: (pri: any, { eq }: any) => eq(pri.active, true),
        },
      },
    });

    if (res.length) return { data: res, error: null };
    return { data: [], error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error };
  }
};
