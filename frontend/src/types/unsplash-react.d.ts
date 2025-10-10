declare module "unsplash-react" {
  import React from "react";

  export interface UnsplashReactProps {
    accessKey: string;
    applicationName: string;
    columns?: number;
    photoRatio?: number;
    highlightColor?: string;
    defaultSearch?: string;
    Uploader?: React.ComponentType<UploaderProps>;
    onFinishedUploading?: (response: unknown) => void;
    preferredSize?: { width: number; height: number };
  }

  export interface UploaderProps {
    onFinishedUploading?: (response: unknown) => void;
  }

  declare const UnsplashReact: React.FC<UnsplashReactProps>;
  export default UnsplashReact;

  export const InsertIntoApplicationUploader: React.FC<UploaderProps>;
  export function withDefaultProps<T>(
    Component: React.ComponentType<T>,
    defaultProps: Partial<T>
  ): React.ComponentType<T>;
}
