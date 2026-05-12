export function redactText(text: string, env: Record<string, string> = {}, markers: string[] = []): string {
  let redacted = text;
  const values = Object.entries(env)
    .filter(([key, value]) => value && markers.some((marker) => key.toUpperCase().includes(marker.toUpperCase())))
    .map(([, value]) => value);

  for (const value of values) {
    redacted = redacted.split(value).join('[REDACTED]');
  }

  redacted = redacted.replace(/([A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|API_KEY)[A-Z0-9_]*=)[^\s]+/gi, '$1[REDACTED]');
  return redacted;
}
