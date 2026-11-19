/** Shown instead of articles until the blog is connected to VOX. Tells the site owner exactly what to do. */
export function SetupNotice({ reason }: { reason: string }) {
  return (
    <section className="wrap setup">
      <h1>Connect this blog to VOX</h1>
      <p>{reason}</p>
      <ol>
        <li>Sign in at <a href="https://app.vox.bd">app.vox.bd</a> and open <strong>Settings</strong>, then <strong>Public API</strong>.</li>
        <li>Choose your website and create a public key. It starts with <code>be_pub_</code>.</li>
        <li>Set it as <code>VOX_API_KEY</code> in this site's environment variables (or <code>.env.local</code> when running locally), then restart.</li>
      </ol>
      <p>The full guide is at <a href="https://vox.bd/docs">vox.bd/docs</a>.</p>
    </section>
  );
}
