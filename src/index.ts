// entitycore-ui/src/index.ts

export { default as EntityComponent } from "./components/EntityComponent/EntityComponent";

export * from "./hooks/useFormMetadata";
export * from "./hooks/useEntityTemplate";
export * from "./hooks/useSaveEntity";
export * from "./hooks/useHierarchicalOptions";
export * from "./hooks/useAuthInfo";

// Token provider context (non-Auth0-specific)
export { TokenProvider, useToken } from "./providers/TokenProvider";

// Core REST interface
export { callManageEntity } from "./lib/api";

