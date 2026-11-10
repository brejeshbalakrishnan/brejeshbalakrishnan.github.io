export function demoLabel(href: string) {
  const url = new URL(href, "https://brejeshbalakrishnan.github.io")
  if (url.hostname === "huggingface.co" && url.pathname.startsWith("/datasets/")) return "Dataset"
  if (url.hostname.endsWith(".streamlit.app")) return "Streamlit app"
  return "Live"
}
