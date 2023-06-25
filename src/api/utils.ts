export const logInfo = (s: string, extra?: any) => {
  console.log(`[APP] ${s}`, extra || '')
}
