import React, { useState } from "react";
import "./App.css";

// Prompt Templates
const TEMPLATES = [
  {
    id: 1,
    name: "Zero-Shot",
    icon: "⚡",
    desc: "Direct instruction, no examples",
    template: "You are a {role}. {task}.",
    fields: ["role", "task"],
  },
  {
    id: 2,
    name: "Few-Shot",
    icon: "📚",
    desc: "Instruction with examples",
    template:
      "You are a {role}.\n\nExamples:\n{examples}\n\nNow, {task}.",
    fields: ["role", "examples", "task"],
  },
  {
    id: 3,
    name: "Chain-of-Thought",
    icon: "🔗",
    desc: "Step-by-step reasoning",
    template:
      "You are a {role}.\n\nTask: {task}\n\nThink step by step:\n1. ",
    fields: ["role", "task"],
  },
  {
    id: 4,
    name: "Role-Play",
    icon: "🎭",
    desc: "Act as a specific persona",
    template:
      "Act as a {persona}.\n\nContext: {context}\n\n{task}",
    fields: ["persona", "context", "task"],
  },
  {
    id: 5,
    name: "Summarize",
    icon: "📝",
    desc: "Condense information",
    template:
      "Summarize the following in {format}:\n\n{content}\n\nKey points:",
    fields: ["format", "content"],
  },
  {
    id: 6,
    name: "Code Assistant",
    icon: "💻",
    desc: "Generate or fix code",
    template:
      "You are a {language} expert.\n\n{task}\n\nProvide code with comments:",
    fields: ["language", "task"],
  },
];

// Prompt Improvement Tips
const TIPS = [
  "Be specific and clear about what you want",
  "Provide context and constraints",
  "Specify the output format (JSON, table, list)",
  "Use delimiters like ### or ``` for sections",
  "Add 'Let's think step by step' for reasoning tasks",
  "Specify tone: professional, casual, technical",
  "Include do's and don'ts for better control",
];

export default function App() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [fieldValues, setFieldValues] = useState({});
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [refineInput, setRefineInput] = useState("");
  const [refinedPrompt, setRefinedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");
  const [history, setHistory] = useState([]);
  const [charCount, setCharCount] = useState(0);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFieldValues({});
    setGeneratedPrompt("");
  };

  const handleFieldChange = (field, value) => {
    const updated = { ...fieldValues, [field]: value };
    setFieldValues(updated);

    // Auto-generate preview
    let prompt = selectedTemplate.template;
    selectedTemplate.fields.forEach((f) => {
      prompt = prompt.replace(`{${f}}`, updated[f] || `{${f}}`);
    });
    setGeneratedPrompt(prompt);
    setCharCount(prompt.length);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (generatedPrompt && !history.includes(generatedPrompt)) {
      setHistory([generatedPrompt, ...history.slice(0, 9)]);
    }
  };

  const handleRefine = () => {
    if (!refineInput) return;
    const improved = `### REFINED PROMPT ###\n\n${refineInput
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b(do|make|give|tell|show)\b/gi, (m) => m.toUpperCase())}

### FORMAT ###
- Output as structured response
- Use bullet points for clarity
- Include examples where relevant

### CONSTRAINTS ###
- Be concise and precise
- Avoid jargon unless specified
- Respond in a professional tone`;
    setRefinedPrompt(improved);
  };

  const clearAll = () => {
    setSelectedTemplate(null);
    setFieldValues({});
    setGeneratedPrompt("");
    setRefineInput("");
    setRefinedPrompt("");
    setCharCount(0);
  };

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🧠</span>
          <h1>PromptForge</h1>
          <span className="badge">INNOVIAST</span>
        </div>
        <p className="subtitle">Prompt Engineering Utility Platform</p>
      </header>

      {/* TABS */}
      <nav className="tabs">
        {[
          { id: "builder", label: "🏗️ Builder", desc: "Build prompts from templates" },
          { id: "refiner", label: "✨ Refiner", desc: "Improve existing prompts" },
          { id: "history", label: "📜 History", desc: `Saved (${history.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.desc}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT */}
      <main className="main">
        {/* ========== BUILDER TAB ========== */}
        {activeTab === "builder" && (
          <div className="builder">
            {/* Template Grid */}
            <section className="templates-section">
              <h2>📋 Choose a Template</h2>
              <div className="template-grid">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    className={`template-card ${
                      selectedTemplate?.id === t.id ? "selected" : ""
                    }`}
                    onClick={() => handleTemplateSelect(t)}
                  >
                    <span className="t-icon">{t.icon}</span>
                    <span className="t-name">{t.name}</span>
                    <span className="t-desc">{t.desc}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Prompt Builder */}
            {selectedTemplate && (
              <section className="prompt-section">
                <div className="prompt-header">
                  <h2>
                    {selectedTemplate.icon} {selectedTemplate.name} Prompt
                  </h2>
                  <button className="btn-clear" onClick={clearAll}>
                    ✕ Clear
                  </button>
                </div>

                {/* Fields */}
                <div className="fields">
                  {selectedTemplate.fields.map((field) => (
                    <div key={field} className="field-group">
                      <label>{field.toUpperCase()}</label>
                      {field === "examples" || field === "content" || field === "context" ? (
                        <textarea
                          placeholder={`Enter ${field}...`}
                          rows={3}
                          value={fieldValues[field] || ""}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={`Enter ${field}...`}
                          value={fieldValues[field] || ""}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Generated Prompt */}
                <div className="output-section">
                  <div className="output-header">
                    <h3>📄 Generated Prompt</h3>
                    <span className="char-count">{charCount} chars</span>
                  </div>
                  <textarea
                    className="output-area"
                    value={generatedPrompt}
                    readOnly
                    placeholder="Your prompt will appear here..."
                    rows={6}
                  />
                  <div className="output-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleCopy(generatedPrompt)}
                      disabled={!generatedPrompt}
                    >
                      {copied ? "✅ Copied!" : "📋 Copy"}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleSave}
                      disabled={!generatedPrompt}
                    >
                      💾 Save
                    </button>
                  </div>
                </div>
              </section>
            )}

            {!selectedTemplate && (
              <div className="empty-state">
                <span className="empty-icon">👆</span>
                <p>Select a template above to start building your prompt!</p>
              </div>
            )}
          </div>
        )}

        {/* ========== REFINER TAB ========== */}
        {activeTab === "refiner" && (
          <div className="refiner">
            <section className="tips-section">
              <h2>💡 Prompt Engineering Tips</h2>
              <div className="tips-grid">
                {TIPS.map((tip, i) => (
                  <div key={i} className="tip-card">
                    <span className="tip-num">0{i + 1}</span>
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="refine-section">
              <h2>✨ Refine Your Prompt</h2>
              <textarea
                className="refine-input"
                placeholder="Paste your raw prompt here..."
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                rows={5}
              />
              <div className="refine-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleRefine}
                  disabled={!refineInput}
                >
                  🔄 Refine Prompt
                </button>
                <button className="btn btn-secondary" onClick={clearAll}>
                  🗑️ Clear
                </button>
              </div>
              {refinedPrompt && (
                <div className="output-section">
                  <div className="output-header">
                    <h3>📄 Refined Prompt</h3>
                  </div>
                  <textarea
                    className="output-area"
                    value={refinedPrompt}
                    readOnly
                    rows={10}
                  />
                  <div className="output-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleCopy(refinedPrompt)}
                    >
                      {copied ? "✅ Copied!" : "📋 Copy"}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setGeneratedPrompt(refinedPrompt);
                        handleSave();
                      }}
                    >
                      💾 Save to History
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ========== HISTORY TAB ========== */}
        {activeTab === "history" && (
          <div className="history">
            <h2>📜 Prompt History</h2>
            {history.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>No prompts saved yet. Build and save some prompts!</p>
              </div>
            ) : (
              <div className="history-list">
                {history.map((prompt, i) => (
                  <div key={i} className="history-card">
                    <span className="h-num">#{i + 1}</span>
                    <pre className="h-content">{prompt}</pre>
                    <div className="h-actions">
                      <button
                        className="btn-small"
                        onClick={() => handleCopy(prompt)}
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          🧠 PromptForge v1.0 | Built for INNOVIAST Week 2 |{" "}
          <span className="footer-highlight">Prompt Engineering Studio</span>
        </p>
      </footer>
    </div>
  );
}
