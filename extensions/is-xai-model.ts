export function isXaiModel(
  model: { provider?: string; id?: string } | undefined,
): model is { provider: "xai"; id: string } {
  return model?.provider === "xai";
}
