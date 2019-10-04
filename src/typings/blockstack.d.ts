export namespace BlockstackCore {
  interface SearchResult {
    fullyQualifiedName: string
    profile: any
    username?: string
  }

  interface SearchResponse {
    results: SearchResult[]
  }
}
