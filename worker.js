export default {
    async fetch(request, env, ctx) {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
  
      const payload = await request.json();
  
      const subject = payload.Subject || "Untitled";
      const body = payload.TextBody || "";
      const date = new Date(payload.Date || Date.now()).toISOString();
  
      const slug = slugify(subject);
      const filename = `content/posts/${date.slice(0, 10)}-${slug}.md`;
  
      const markdown = `+++
title = "${subject}"
date = "${date}"
+++

${body}`;
  
      const githubRes = await pushToGitHub(filename, markdown, env.GITHUB_TOKEN);
  
      return new Response("OK", { status: githubRes.ok ? 200 : 500 });
    }
  };
  
  function slugify(text) {
    return text.toLowerCase().replace(/[^\w]+/g, "-").slice(0, 50);
  }
  
  async function pushToGitHub(path, content, token) {
    const url = `https://api.github.com/repos/ABC/XYZ/contents/${path}`;
    const body = {
      message: `Add post: ${path}`,
      content: btoa(unescape(encodeURIComponent(content))),
      committer: {
        name: "Arpit Gupta",
        email: "gigaarpit@gmail.com"
      }
    };
    return fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "cloudflare-worker"
      },
      body: JSON.stringify(body)
    });
  }

  // change your name and email in fetch function
  // Modify the `url` in line # 34 to your own repo URL, like https://api.github.com/repos/gigaArpit/postmark-test/contents/${path}`
  // ABC - Your GitHub Username
  // XYZ - Your GitHub Repo Name
