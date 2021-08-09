import { DataFrame, Field, Vector } from '@grafana/data';

export interface PanelOptions {}

export const defaults: PanelOptions = {};

export interface Buffer extends Vector {
  buffer: number[];
}

export interface FieldBuffer extends Field<any, Vector> {
  values: Buffer;
}

export interface Frame extends DataFrame {
  fields: FieldBuffer[];
}
