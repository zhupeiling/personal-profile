import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { api, setToken } from "./api";
import "./styles.css";

const routes = {
  mind: "从一个问题开始：模型为什么会学出像是“理解”世界的表征？",
  self: "理性、敏感、不安分。比标签更重要的，是这些矛盾如何同时存在。",
  moon: "按下快门，是为了留下肉眼无法同时看见的一整段变化。"
};

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

function AuthBox({ user, setUser, notice, clearNotice, loginId = "login" }) {
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
      clearNotice();
      setMessage("已登录");
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (user) {
    return <div className="auth-box"><p>当前登录：{user.username}</p><button type="button" onClick={() => { setToken(null); setUser(null); }}>退出登录</button></div>;
  }

  return (
    <form className="auth-box" id={loginId} onSubmit={submit}>
      <div className="auth-tabs">
        <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>登录</button>
        <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>注册</button>
      </div>
      {notice && <p className="auth-notice">{notice}</p>}
      <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email" />
      {mode === "register" && <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username" />}
      <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="password" type="password" />
      <button type="submit">{mode === "login" ? "登录" : "创建账号"}</button>
      {message && <p>{message}</p>}
    </form>
  );
}

function CommentBoard({ user, setUser }) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [authNotice, setAuthNotice] = useState("");

  async function loadComments() {
    try {
      setComments(await api.siteComments());
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  function requestLogin(actionText) {
    setAuthNotice(`请先登录后再${actionText}。`);
    window.setTimeout(() => {
      document.querySelector("#login")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
    return false;
  }

  async function sendComment(event) {
    event.preventDefault();
    if (!user) {
      requestLogin("留言");
      return;
    }
    if (!comment.trim()) {
      return;
    }
    await api.siteComment({ content: comment });
    setComment("");
    await loadComments();
  }

  async function toggleComment(commentId, action, actionText) {
    if (!user) {
      requestLogin(actionText);
      return;
    }
    await action(commentId);
    await loadComments();
  }

  useEffect(() => {
    api.me().then(setUser).catch(() => {});
    loadComments();
  }, []);

  return (
    <section className="blog-section" id="blog">
      <div className="blog-heading">
        <p className="section-no">04 / COMMENT WALL</p>
        <h2>网站留言墙</h2>
        <p>用户只能对这个网站留言，并可以对彼此的留言点赞或点踩。发留言和互动前需要登录。</p>
      </div>
      <div className="blog-grid">
        <aside>
          <AuthBox user={user} setUser={setUser} notice={authNotice} clearNotice={() => setAuthNotice("")} />
          <form className="comment-compose" onSubmit={sendComment}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={user ? "给这个网站留一句话" : "登录后可以留言"}
            />
            <button type="submit">发布留言</button>
          </form>
        </aside>
        <article className="post-reader">
          {error && <p className="error-text">{error}</p>}
          {comments.length ? (
            <div className="comment-wall">
              {comments.map((item) => (
                <section className="site-comment" key={item.id}>
                  <header>
                    <strong>{item.author.username}</strong>
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                  </header>
                  <p>{item.content}</p>
                  <div className="interaction-bar">
                    <button type="button" onClick={() => toggleComment(item.id, api.siteCommentLike, "点赞")}>
                      {item.liked_by_me ? "取消点赞" : "点赞"} · {item.likes_count}
                    </button>
                    <button type="button" onClick={() => toggleComment(item.id, api.siteCommentDislike, "点踩")}>
                      {item.disliked_by_me ? "取消点踩" : "点踩"} · {item.dislikes_count}
                    </button>
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <p className="empty-state">现在还没有留言。登录后可以留下第一条。</p>
          )}
        </article>
      </div>
    </section>
  );
}

function PersonalBlog({ user, setUser }) {
  const [posts, setPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [message, setMessage] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [draft, setDraft] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    pdf_url: "",
    published: true
  });

  function formatDate(value) {
    return new Date(value).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  }

  function makeSlug(title) {
    return title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  async function openPost(post) {
    const fullPost = await api.post(post.slug);
    setActivePost(fullPost);
    setComments(await api.postComments(fullPost.id));
  }

  async function loadPosts() {
    const data = await api.posts();
    setPosts(data);
    if (data.length) {
      const current = activePost ? data.find((post) => post.id === activePost.id) : data[0];
      await openPost(current || data[0]);
    } else {
      setActivePost(null);
      setComments([]);
    }
  }

  function requestLogin(actionText) {
    setAuthNotice(`请先登录后再${actionText}。`);
    window.setTimeout(() => {
      document.querySelector("#blog-login")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  }

  async function submitPost(event) {
    event.preventDefault();
    if (!user?.is_admin) {
      requestLogin("写博客");
      return;
    }

    setMessage("");
    try {
      let pdfUrl = draft.pdf_url;
      if (pdfFile) {
        const uploaded = await api.uploadPdf(pdfFile);
        pdfUrl = uploaded.url;
      }
      const payload = {
        ...draft,
        slug: draft.slug || makeSlug(draft.title) || `post-${Date.now()}`,
        pdf_url: pdfUrl || null
      };
      const created = await api.createPost(payload);
      setDraft({ title: "", slug: "", summary: "", content: "", pdf_url: "", published: true });
      setPdfFile(null);
      setMessage("博客已发布");
      await loadPosts();
      await openPost(created);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function sendPostComment(event) {
    event.preventDefault();
    if (!activePost) {
      return;
    }
    if (!user) {
      requestLogin("评论");
      return;
    }
    if (!comment.trim()) {
      return;
    }
    await api.postComment(activePost.id, { content: comment });
    setComment("");
    setComments(await api.postComments(activePost.id));
    setActivePost(await api.post(activePost.slug));
  }

  async function togglePost(action, actionText) {
    if (!activePost) {
      return;
    }
    if (!user) {
      requestLogin(actionText);
      return;
    }
    await action(activePost.id);
    setActivePost(await api.post(activePost.slug));
  }

  useEffect(() => {
    api.me().then(setUser).catch(() => {});
    loadPosts().catch((error) => setMessage(error.message));
  }, []);

  return (
    <section className="personal-blog-section" id="personal-blog">
      <div className="blog-heading">
        <p className="section-no">05 / PERSONAL BLOG</p>
        <h2>个人博客</h2>
        <p>管理员可以登录后写博客、上传 PDF。每篇文章会显示发布日期，读者登录后可以点赞、点踩和评论。</p>
      </div>

      <div className="personal-blog-grid">
        <aside className="blog-sidebar">
          <AuthBox user={user} setUser={setUser} notice={authNotice} clearNotice={() => setAuthNotice("")} loginId="blog-login" />

          {user?.is_admin && (
            <form className="blog-editor" onSubmit={submitPost}>
              <h3>写一篇博客</h3>
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: draft.slug || makeSlug(e.target.value) })}
                placeholder="标题"
                required
              />
              <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="URL slug" />
              <input value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} placeholder="摘要" />
              <textarea value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} placeholder="正文" required />
              <input type="file" accept="application/pdf,.pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
              <button type="submit">发布博客</button>
              {message && <p className="editor-message">{message}</p>}
            </form>
          )}

          <div className="post-list" aria-label="博客列表">
            {posts.map((post) => (
              <button
                className={`post-card ${activePost?.id === post.id ? "active" : ""}`}
                key={post.id}
                type="button"
                onClick={() => openPost(post).catch((error) => setMessage(error.message))}
              >
                <span>{formatDate(post.created_at)}</span>
                <strong>{post.title}</strong>
                <small>{post.summary || "阅读全文"}</small>
              </button>
            ))}
          </div>
        </aside>

        <article className="blog-reader">
          {activePost ? (
            <>
              <header>
                <p>{formatDate(activePost.created_at)} · {activePost.author.username}</p>
                <h3>{activePost.title}</h3>
                {activePost.summary && <p className="post-summary">{activePost.summary}</p>}
              </header>
              <div className="post-content">{activePost.content}</div>
              {activePost.pdf_url && <a className="pdf-link" href={activePost.pdf_url} target="_blank" rel="noreferrer">打开 PDF</a>}
              <div className="interaction-bar">
                <button type="button" onClick={() => togglePost(api.postLike, "点赞")}>
                  {activePost.liked_by_me ? "取消点赞" : "点赞"} · {activePost.likes_count}
                </button>
                <button type="button" onClick={() => togglePost(api.postDislike, "点踩")}>
                  {activePost.disliked_by_me ? "取消点踩" : "点踩"} · {activePost.dislikes_count}
                </button>
                <span className="post-meta">评论 · {activePost.comments_count}</span>
              </div>

              <form className="comment-compose inline-compose" onSubmit={sendPostComment}>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={user ? "写一条评论" : "登录后可以评论"} />
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
            </>
          ) : (
            <p className="empty-state">博客还没有文章。管理员登录后可以发布第一篇。</p>
          )}
        </article>
      </div>
    </section>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <>
      <div className="noise" aria-hidden="true" />
      <header className="topbar">
        <a className="wordmark" href="#prologue" aria-label="回到首页"><span className="wordmark-cn">朱沛玲</span><span className="wordmark-en">PEILING ZHU</span></a>
        <nav className="topnav"><a href="#choice">About</a><a href="#blog">Comments</a><a href="#personal-blog">Blog</a></nav>
        <span className="chapter-readout"><span className="chapter-index">00</span><span className="chapter-name">全栈博客</span></span>
      </header>
      <main>
        <Hero />
        <Choice />
        <Story />
        <CommentBoard user={user} setUser={setUser} />
        <PersonalBlog user={user} setUser={setUser} />
        <section className="epilogue" id="epilogue">
          <img src="/pictures/血月八连.png" alt="" aria-hidden="true" />
          <div className="epilogue-copy"><p>EPILOGUE · STILL IN PROGRESS</p><h2>答案还没有出现。<br />实验还在运行。</h2><p className="english-line">Brains, models, speech, pretraining,<br />and too many terminal windows.</p></div>
          <footer><span>PEILING ZHU</span><span>ZHEJIANG · {year}</span></footer>
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
