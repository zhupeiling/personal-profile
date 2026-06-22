import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { api, setToken } from "./api";
import "./styles.css";

const routes = {
  mind: "从一个问题开始：模型为什么会学出像是“理解”世界的表征？",
  self: "理性、敏感、不安分。比标签更重要的，是这些矛盾如何同时存在。",
  moon: "按下快门，是为了留下肉眼无法同时看见的一整段变化。"
};

function getPath() {
  return window.location.pathname;
}

function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "auto" });
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

function loginPath(next = window.location.pathname + window.location.search) {
  return `/login?next=${encodeURIComponent(next)}`;
}

function Hero() {
  const [focus, setFocus] = useState({ x: 58, y: 42, active: false });

  function move(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setFocus({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
      active: true
    });
  }

  return (
    <section className="hero chapter" id="prologue">
      <div className="hero-copy">
        <p className="eyebrow">ZHEJIANG UNIVERSITY · NEUROAI</p>
        <h1>朱沛玲<span>Peiling Zhu</span></h1>
        <p className="hero-intro">在模型、大脑和一堆实验日志之间，<br />试着理解智能。</p>
        <div className="identity-line">
          <span>研究者</span><i /><span>建造者</span><i /><span>观测者</span>
        </div>
      </div>

      <div
        className={`portrait-stage ${focus.active ? "engaged" : ""}`}
        style={{ "--x": `${focus.x}%`, "--y": `${focus.y}%` }}
        onPointerMove={move}
        onPointerLeave={() => setFocus((value) => ({ ...value, active: false }))}
      >
        <img className="portrait portrait-blur" src="/pictures/侧脸半身.jpg" alt="" />
        <img className="portrait portrait-soft" src="/pictures/侧脸半身.jpg" alt="" />
        <img className="portrait portrait-clear" src="/pictures/侧脸半身.jpg" alt="朱沛玲的肖像" />
        <div className="focus-ring" aria-hidden="true" />
        <p className="portrait-hint">移动光标，看清一点</p>
      </div>

      <a className="enter-story" href="#choice">
        <span>开始认识我</span><span className="arrow" aria-hidden="true">↓</span>
      </a>
      <p className="vertical-note">TRYING TO UNDERSTAND INTELLIGENCE</p>
    </section>
  );
}

function Choice() {
  const [route, setRoute] = useState("mind");
  return (
    <section className="choice-section chapter" id="choice">
      <div className="section-heading">
        <p className="section-no">01 / THREE WAYS OF SEEING</p>
        <h2>你想先知道哪一面？</h2>
        <p>一个人不是一份按顺序阅读的简历。选择你真正好奇的部分。</p>
      </div>
      <div>
        <div className="route-list" role="tablist" aria-label="选择了解方向">
          {[
            ["mind", "A", "她在研究什么？", "Brains · Models · Speech"],
            ["self", "B", "她是怎样的人？", "Reason · Sensibility · Motion"],
            ["moon", "C", "她为什么拍月亮？", "Observation · Time · Eclipse"]
          ].map(([key, no, title, sub]) => (
            <button
              className={`route ${route === key ? "active" : ""}`}
              key={key}
              type="button"
              onMouseEnter={() => setRoute(key)}
              onClick={() => document.querySelector("#story")?.scrollIntoView({ behavior: "smooth" })}
            >
              <span className="route-no">{no}</span>
              <span className="route-main"><strong>{title}</strong><small>{sub}</small></span>
              <span className="route-arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        <div className="route-preview" aria-live="polite">
          <span className="preview-label">CURRENT ROUTE</span>
          <p>{routes[route]}</p>
        </div>
      </div>
    </section>
  );
}

function Story() {
  const [panel, setPanel] = useState("mind");
  const moons = [
    ["/pictures/食既九连.png", "食既 · 九连"],
    ["/pictures/血月六连.png", "血月 · 六连"],
    ["/pictures/血月八连.png", "血月 · 八连"]
  ];
  const [moon, setMoon] = useState(0);

  return (
    <section className="story-section chapter" id="story">
      <div className="story-shell">
        <aside className="story-nav" aria-label="故事章节">
          <p>SELECTED ROUTE</p>
          {[
            ["mind", "A", "研究"],
            ["self", "B", "自我"],
            ["moon", "C", "月亮"]
          ].map(([key, no, label]) => (
            <button className={`story-dot ${panel === key ? "active" : ""}`} key={key} type="button" onClick={() => setPanel(key)}>
              <span>{no}</span>{label}
            </button>
          ))}
        </aside>
        <div className="story-panels">
          {panel === "mind" && (
            <article className="story-panel active">
              <header className="panel-header"><p>ROUTE A · THE QUESTIONS</p><h2>我想知道，<br />模型究竟学会了什么。</h2></header>
              <div className="panel-body">
                <p className="lead">为什么模型只是预测 token、mask 或下一个声音片段，最后却形成了可以迁移的表征？这些表征与大脑处理声音的方式，又有多少相似？</p>
                <div className="research-grid">
                  {[
                    ["01", "NeuroAI", "把模型与大脑放进同一套可检验的问题里，而不是停留在相似性的想象中。"],
                    ["02", "Speech Models", "围绕 wav2vec 2.0、HuBERT、BEATs、AVES，追踪声音表征如何逐层形成。"],
                    ["03", "Brain Alignment", "比较模型结构、训练目标与数据分布，如何影响它们与听觉皮层活动的对应。"]
                  ].map(([no, title, text]) => <div className="research-item" key={no}><span>{no}</span><h3>{title}</h3><p>{text}</p></div>)}
                </div>
                <blockquote>“把模型、大脑和真实世界智能，放在同一张图里理解。”</blockquote>
              </div>
            </article>
          )}
          {panel === "self" && (
            <article className="story-panel active">
              <header className="panel-header"><p>ROUTE B · THE PERSON</p><h2>理性是一层外壳，<br />不是全部。</h2></header>
              <div className="self-layout">
                <div className="self-statement" aria-hidden="true"><span>01—03</span><p>BETWEEN<br />ANALYSIS<br /><i>AND</i><br />FEELING</p><span className="statement-note">A PERSON IS MORE THAN<br />A COHERENT NARRATIVE.</span></div>
                <div className="trait-list">
                  {["理性地拆解", "不安分地探索", "敏感地感受"].map((title, index) => <div className="trait active" key={title}><span>0{index + 1}</span><strong>{title}</strong><i>+</i></div>)}
                  <p className="trait-copy active">喜欢把混乱的问题变成能记录、复现和继续推进的系统。读论文，搭环境，跑实验，也认真对待每一次失败。</p>
                </div>
              </div>
            </article>
          )}
          {panel === "moon" && (
            <article className="story-panel moon-panel active">
              <header className="panel-header moon-heading"><p>ROUTE C · THE OBSERVER</p><h2>月食不是一个瞬间，<br />而是一段缓慢发生的时间。</h2></header>
              <div className="moon-viewer">
                <figure className="moon-frame"><img src={moons[moon][0]} alt="月食过程照片" /><figcaption><span>0{moon + 1} / 03</span><span>{moons[moon][1]}</span></figcaption></figure>
                <div className="moon-controls"><button type="button" onClick={() => setMoon((moon + 2) % 3)}>←</button><div className="moon-progress"><i style={{ transform: `translateX(${moon * 100}%)` }} /></div><button type="button" onClick={() => setMoon((moon + 1) % 3)}>→</button></div>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

function Topbar({ user }) {
  return (
    <header className="topbar">
      <button className="wordmark" type="button" onClick={() => navigate("/")} aria-label="回到首页"><span className="wordmark-cn">朱沛玲</span><span className="wordmark-en">PEILING ZHU</span></button>
      <nav className="topnav"><a href="/#choice">About</a><button type="button" onClick={() => navigate("/blog")}>Blog</button>{user?.is_admin && <button type="button" onClick={() => navigate("/blog/admin/new")}>Write</button>}</nav>
      <span className="chapter-readout"><span className="chapter-index">00</span><span className="chapter-name">全栈博客</span></span>
    </header>
  );
}

function BlogGateway({ posts }) {
  return (
    <section className="blog-gateway" id="blog-entry">
      <div>
        <p className="section-no">04 / BLOG</p>
        <h2>个人博客</h2>
      </div>
      <div className="gateway-copy">
        <p>这里不做主页留言墙。博客单独进入、单独阅读，只展示我发布的文章。</p>
        <button type="button" onClick={() => navigate("/blog")}>进入博客</button>
        {posts.slice(0, 2).map((post) => (
          <button className="gateway-post" key={post.id} type="button" onClick={() => navigate(`/blog/${post.slug}`)}>
            <span>{formatDate(post.created_at)}</span>
            <strong>{post.title}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function Epilogue() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <section className="epilogue" id="epilogue">
      <img src="/pictures/血月八连.png" alt="" aria-hidden="true" />
      <div className="epilogue-copy"><p>EPILOGUE · STILL IN PROGRESS</p><h2>答案还没有出现。<br />实验还在运行。</h2><p className="english-line">Brains, models, speech, pretraining,<br />and too many terminal windows.</p></div>
      <footer><span>PEILING ZHU</span><span>ZHEJIANG · {year}</span></footer>
    </section>
  );
}

function HomePage({ user }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.posts().then(setPosts).catch(() => setPosts([]));
  }, []);

  return (
    <>
      <Topbar user={user} />
      <main>
        <Hero />
        <Choice />
        <Story />
        <BlogGateway posts={posts} />
        <Epilogue />
      </main>
    </>
  );
}

function AuthBox({ user, setUser }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    try {
      const data = mode === "login" ? await api.login(form) : await api.register(form);
      setToken(data.access_token);
      setUser(data.user);
      setMessage("已登录");
      const next = new URLSearchParams(window.location.search).get("next") || "/blog";
      navigate(next);
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (user) {
    return <div className="auth-box"><p>当前登录：{user.username}</p><button type="button" onClick={() => { setToken(null); setUser(null); }}>退出登录</button></div>;
  }

  return (
    <form className="auth-box" onSubmit={submit}>
      <div className="auth-tabs">
        <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>登录</button>
        <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>注册</button>
      </div>
      <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email" />
      {mode === "register" && <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username" />}
      <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="password" type="password" />
      <button type="submit">{mode === "login" ? "登录" : "创建账号"}</button>
      <a className="github-login" href={`/api/auth/github/start?next=${encodeURIComponent(new URLSearchParams(window.location.search).get("next") || "/blog")}`}>GitHub 登录</a>
      {message && <p>{message}</p>}
    </form>
  );
}

function LoginPage({ user, setUser }) {
  const next = new URLSearchParams(window.location.search).get("next") || "/blog";

  return (
    <>
      <Topbar user={user} />
      <main className="standalone-page auth-page">
        <section className="auth-panel">
          <p className="section-no">LOGIN</p>
          <h1>登录后继续</h1>
          <p>完成登录后会自动回到刚才的页面。</p>
          <AuthBox user={user} setUser={setUser} />
          <button className="text-link" type="button" onClick={() => navigate(next)}>返回</button>
        </section>
      </main>
    </>
  );
}

function BlogListPage({ user }) {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.posts().then(setPosts).catch((error) => setMessage(error.message));
  }, []);

  return (
    <>
      <Topbar user={user} />
      <main className="standalone-page blog-index-page">
        <section className="blog-index-hero">
          <p className="section-no">BLOG</p>
          <h1>个人博客</h1>
          <p>只展示我发布的文章。文章内可以点赞、点踩和评论，未登录时会跳转到登录页再回到原文。</p>
          {user?.is_admin && <button type="button" onClick={() => navigate("/blog/admin/new")}>写新文章</button>}
        </section>
        <section className="blog-index-list">
          {message && <p className="error-text">{message}</p>}
          {posts.length ? posts.map((post) => (
            <button className="blog-index-item" type="button" key={post.id} onClick={() => navigate(`/blog/${post.slug}`)}>
              <span>{formatDate(post.created_at)}</span>
              <h2>{post.title}</h2>
              <p>{post.summary || "阅读全文"}</p>
            </button>
          )) : <p className="empty-state">还没有发布博客。</p>}
        </section>
      </main>
    </>
  );
}

function BlogPostPage({ user }) {
  const slug = decodeURIComponent(getPath().replace(/^\/blog\//, ""));
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  async function loadPost() {
    const fullPost = await api.post(slug);
    setPost(fullPost);
    setComments(await api.postComments(fullPost.id));
  }

  function requireLogin() {
    navigate(loginPath(window.location.pathname));
  }

  async function toggle(action) {
    if (!user) {
      requireLogin();
      return;
    }
    await action(post.id);
    setPost(await api.post(post.slug));
  }

  async function submitComment(event) {
    event.preventDefault();
    if (!user) {
      requireLogin();
      return;
    }
    if (!comment.trim()) {
      return;
    }
    await api.postComment(post.id, { content: comment });
    setComment("");
    await loadPost();
  }

  useEffect(() => {
    loadPost().catch((error) => setMessage(error.message));
  }, [slug]);

  return (
    <>
      <Topbar user={user} />
      <main className="standalone-page blog-post-page">
        <button className="text-link" type="button" onClick={() => navigate("/blog")}>返回博客列表</button>
        {message && <p className="error-text">{message}</p>}
        {post ? (
          <article className="blog-reader single-post-reader">
            <header>
              <p>{formatDate(post.created_at)} · {post.author.username}</p>
              <h1>{post.title}</h1>
              {post.summary && <p className="post-summary">{post.summary}</p>}
            </header>
            <div className="post-content">{post.content}</div>
            {post.pdf_url && <a className="pdf-link" href={post.pdf_url} target="_blank" rel="noreferrer">打开 PDF</a>}
            <div className="interaction-bar">
              <button type="button" onClick={() => toggle(api.postLike)}>{post.liked_by_me ? "取消点赞" : "点赞"} · {post.likes_count}</button>
              <button type="button" onClick={() => toggle(api.postDislike)}>{post.disliked_by_me ? "取消点踩" : "点踩"} · {post.dislikes_count}</button>
              <span className="post-meta">评论 · {post.comments_count}</span>
            </div>
            <form className="comment-compose inline-compose" onSubmit={submitComment}>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="写一条评论" />
              <button type="submit">发布评论</button>
            </form>
            <div className="comment-wall">
              {comments.length ? comments.map((item) => (
                <section className="site-comment" key={item.id}>
                  <header>
                    <strong>{item.author.username}</strong>
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                  </header>
                  <p>{item.content}</p>
                </section>
              )) : <p className="empty-state">这篇文章还没有评论。</p>}
            </div>
          </article>
        ) : !message && <p className="empty-state">正在加载文章。</p>}
      </main>
    </>
  );
}

function NewPostPage({ user, setUser }) {
  const [message, setMessage] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [draft, setDraft] = useState({ title: "", slug: "", summary: "", content: "", pdf_url: "", published: true });

  function makeSlug(title) {
    return title.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  }

  async function submitPost(event) {
    event.preventDefault();
    if (!user) {
      navigate(loginPath("/blog/admin/new"));
      return;
    }
    if (!user.is_admin) {
      setMessage("只有管理员可以写博客。");
      return;
    }
    try {
      let pdfUrl = draft.pdf_url;
      if (pdfFile) {
        const uploaded = await api.uploadPdf(pdfFile);
        pdfUrl = uploaded.url;
      }
      const created = await api.createPost({ ...draft, slug: draft.slug || makeSlug(draft.title) || `post-${Date.now()}`, pdf_url: pdfUrl || null });
      navigate(`/blog/${created.slug}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    if (!user) {
      api.me().then(setUser).catch(() => navigate(loginPath("/blog/admin/new")));
    }
  }, []);

  return (
    <>
      <Topbar user={user} />
      <main className="standalone-page blog-editor-page">
        <section className="blog-editor-shell">
          <p className="section-no">ADMIN</p>
          <h1>写一篇博客</h1>
          <form className="blog-editor" onSubmit={submitPost}>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: draft.slug || makeSlug(e.target.value) })} placeholder="标题" required />
            <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="URL slug" />
            <input value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} placeholder="摘要" />
            <textarea value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} placeholder="正文" required />
            <input type="file" accept="application/pdf,.pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
            <button type="submit">发布博客</button>
            {message && <p className="editor-message">{message}</p>}
          </form>
        </section>
      </main>
    </>
  );
}

function App() {
  const [path, setPath] = useState(getPath());
  const [user, setUser] = useState(null);

  useEffect(() => {
    const onPopState = () => setPath(getPath());
    window.addEventListener("popstate", onPopState);
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setToken(token);
      params.delete("token");
      const cleanQuery = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ""}`);
    }
    api.me().then(setUser).catch(() => {});
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  let page = <HomePage user={user} />;
  if (path === "/blog") {
    page = <BlogListPage user={user} />;
  } else if (path === "/login") {
    page = <LoginPage user={user} setUser={setUser} />;
  } else if (path === "/blog/admin/new") {
    page = <NewPostPage user={user} setUser={setUser} />;
  } else if (path.startsWith("/blog/")) {
    page = <BlogPostPage user={user} />;
  }

  return <><div className="noise" aria-hidden="true" />{page}</>;
}

createRoot(document.getElementById("root")).render(<App />);
