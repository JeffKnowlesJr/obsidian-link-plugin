export function createWikiLink(fileName: string): string {
  return `[[${fileName}]]`
}

export function createMarkdownLink(
  fileName: string,
  displayText: string
): string {
  return `[${displayText}](${fileName}.md)`
}
