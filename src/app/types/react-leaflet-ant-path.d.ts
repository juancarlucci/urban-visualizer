declare module "react-leaflet-ant-path" {
  import { PathOptions } from "leaflet";
  import { PolylineProps } from "react-leaflet";
  import * as React from "react";

  export interface AntPathProps extends PolylineProps {
    options?: PathOptions & {
      delay?: number;
      dashArray?: [number, number];
      weight?: number;
      color?: string;
      pulseColor?: string;
      paused?: boolean;
      reverse?: boolean;
      hardwareAccelerated?: boolean;
    };
  }

  export const AntPath: React.FC<AntPathProps>;
}