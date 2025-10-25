
async function fetchWebpageContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // We can't just pull the text out, we need to use a proper parser to extract the main content.
    // For now, we'll just return the text and the model is smart enough to summarize it.
    return await response.text();
  } catch (e: any) {
    console.error(`Failed to fetch webpage content for "${url}"`, e);
    throw new Error(`Failed to fetch webpage content for "${url}": ${e.message}`);
  }
}

export { fetchWebpageContent };
