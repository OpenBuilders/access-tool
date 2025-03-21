declare module '*.json' {
  const value: any
  export default value
}

declare module '*.scss' {
  const content: Record<string, string>
  export = content
}
