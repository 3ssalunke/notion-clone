"use client";

import { createContext, useContext, useReducer, Dispatch } from "react";
import { File, Folder, Workspace } from "../supabase/supabase.types";

export type appFolderType = Folder & { files: File[] | [] };
export type appWorkspaceType = Workspace & {
  folders: appFolderType[] | [];
};

interface AppState {
  workspaces: appWorkspaceType[] | [];
}

type Action =
  | { type: "ADD_WORKSPACE"; payload: appWorkspaceType }
  | { type: "DELETE_WORKSPACE"; payload: string }
  | {
      type: "UPDATE_WORKSPACE";
      payload: { workspace: Partial<appWorkspaceType>; workspaceId: string };
    }
  | {
      type: "SET_WORKSPACES";
      payload: { workspaces: appWorkspaceType[] | [] };
    }
  | {
      type: "SET_FOLDERS";
      payload: { workspaceId: string; folders: [] | appFolderType[] };
    }
  | {
      type: "ADD_FOLDER";
      payload: { workspaceId: string; folder: appFolderType };
    }
  | {
      type: "ADD_FILE";
      payload: { workspaceId: string; file: File; folderId: string };
    }
  | {
      type: "DELETE_FILE";
      payload: { workspaceId: string; folderId: string; fileId: string };
    }
  | {
      type: "DELETE_FOLDER";
      payload: { workspaceId: string; folderId: string };
    }
  | {
      type: "SET_FILES";
      payload: { workspaceId: string; folderId: string; files: File[] };
    }
  | {
      type: "UPDATE_FOLDER";
      payload: {
        workspaceId: string;
        folderId: string;
        folder: Partial<appFolderType>;
      };
    }
  | {
      type: "UPDATE_FILE";
      payload: {
        workspaceId: string;
        folderId: string;
        fileId: string;
        file: Partial<File>;
      };
    };

const initialState: AppState = { workspaces: [] };
const appReducer = (
  state: AppState = initialState,
  action: Action
): AppState => {
  switch (action.type) {
    case "ADD_WORKSPACE":
      return {
        ...state,
        workspaces: [...state.workspaces, action.payload],
      };
    case "DELETE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.filter((w) => w.id !== action.payload),
      };
    case "UPDATE_WORKSPACE":
      return {
        ...state,
        workspaces: state.workspaces.map((w) => {
          if (w.id === action.payload.workspaceId) {
            return {
              ...w,
              ...action.payload.workspace,
            };
          }
          return w;
        }),
      };
    case "SET_WORKSPACES":
      return {
        ...state,
        workspaces: action.payload.workspaces,
      };
    case "SET_FOLDERS":
      return {
        ...state,
        workspaces: state.workspaces.map((w) => {
          if (w.id === action.payload.workspaceId) {
            return {
              ...w,
              folders: action.payload.folders.sort(
                (a, b) =>
                  new Date(a.createdAt!).getTime() -
                  new Date(b.createdAt!).getTime()
              ),
            };
          }
          return w;
        }),
      };
    case "ADD_FOLDER":
      return {
        ...state,
        workspaces: state.workspaces.map((w) => {
          if (w.id === action.payload.workspaceId) {
            return {
              ...w,
              folders: [...w.folders, action.payload.folder].sort(
                (a, b) =>
                  new Date(a.createdAt!).getTime() -
                  new Date(b.createdAt!).getTime()
              ),
            };
          }
          return w;
        }),
      };
    case "UPDATE_FOLDER":
      return {
        ...state,
        workspaces: state.workspaces.map((w) => {
          if (w.id === action.payload.workspaceId) {
            return {
              ...w,
              folders: w.folders.map((f) => {
                if (f.id === action.payload.folderId) {
                  return {
                    ...f,
                    ...action.payload.folder,
                  };
                }
                return f;
              }),
            };
          }
          return w;
        }),
      };
    case "DELETE_FOLDER":
      return {
        ...state,
        workspaces: state.workspaces.map((w) => {
          if (w.id === action.payload.workspaceId) {
            return {
              ...w,
              folders: w.folders.filter(
                (f) => f.id !== action.payload.folderId
              ),
            };
          }
          return w;
        }),
      };
    case "SET_FILES":
      return {
        ...state,
        workspaces: state.workspaces.map((w) => {
          if (w.id === action.payload.workspaceId) {
            return {
              ...w,
              folders: w.folders.map((f) => {
                if (f.id === action.payload.folderId) {
                  return {
                    ...f,
                    files: action.payload.files,
                  };
                }
                return f;
              }),
            };
          }
          return w;
        }),
      };
    case "ADD_FILE":
      return {
        ...state,
        workspaces: state.workspaces.map((w) => {
          if (w.id === action.payload.workspaceId) {
            return {
              ...w,
              folders: w.folders.map((f) => {
                if (f.id === action.payload.folderId) {
                  return {
                    ...f,
                    files: [...f.files, action.payload.file].sort(
                      (a, b) =>
                        new Date(a.createdAt!).getTime() -
                        new Date(b.createdAt!).getTime()
                    ),
                  };
                }
                return f;
              }),
            };
          }
          return w;
        }),
      };
    case "DELETE_FILE":
      return {
        ...state,
        workspaces: state.workspaces.map((w) => {
          if (w.id === action.payload.workspaceId) {
            return {
              ...w,
              folders: w.folders.map((f) => {
                if (f.id === action.payload.folderId) {
                  return {
                    ...f,
                    files: f.files.filter(
                      (fi) => fi.id !== action.payload.fileId
                    ),
                  };
                }
                return f;
              }),
            };
          }
          return w;
        }),
      };
    case "UPDATE_FILE":
      return {
        ...state,
        workspaces: state.workspaces.map((w) => {
          if (w.id === action.payload.workspaceId) {
            return {
              ...w,
              folders: w.folders.map((f) => {
                if (f.id === action.payload.folderId) {
                  return {
                    ...f,
                    files: f.files.map((fi) => {
                      if (fi.id === action.payload.fileId) {
                        return {
                          ...fi,
                          ...action.payload.file,
                        };
                      }
                      return fi;
                    }),
                  };
                }
                return f;
              }),
            };
          }
          return w;
        }),
      };
    default:
      return state;
  }
};

const AppStateContext = createContext<
  | {
      state: AppState;
      dispatch: Dispatch<Action>;
      workspaceId: string | undefined;
      folderId: string | undefined;
      fileId: string | undefined;
    }
  | undefined
>(undefined);

const AppStateProvider = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppStateContext.Provider
      value={{ state, dispatch }}
    ></AppStateContext.Provider>
  );
};

export default AppStateProvider;

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
